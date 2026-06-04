import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Play, Square, Swords, AlertTriangle, Clock, Shield, Zap, Coins, Trophy, Heart, Flame } from 'lucide-react';

const DURATIONS = [
  { label:'15 min', value:15, desc:'Quick Sprint', icon:'⚡', color:'#22c55e' },
  { label:'25 min', value:25, desc:'Standard Focus', icon:'🎯', color:'#3b82f6' },
  { label:'45 min', value:45, desc:'Deep Session', icon:'🔥', color:'#a855f7' },
  { label:'60 min', value:60, desc:'Marathon', icon:'💀', color:'#fbbf24' },
];

const BOSS_PHASES = [
  { threshold:75, name:'Full Power', emoji:'😈', color:'var(--danger)' },
  { threshold:50, name:'Weakening', emoji:'😠', color:'#f97316' },
  { threshold:25, name:'Desperate', emoji:'😰', color:'#fbbf24' },
  { threshold:0, name:'Defeated', emoji:'💀', color:'var(--success)' },
];

const getBossPhase = (hp) => BOSS_PHASES.find(p => hp >= p.threshold) || BOSS_PHASES[3];

export default function FocusArena() {
  const { completeFocus, takeDamage, player } = useGame();
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [victory, setVictory] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const totalSeconds = useRef(duration * 60);
  const lastHpRef = useRef(100);

  useEffect(() => {
    if (!isActive) { setTimeLeft(duration * 60); totalSeconds.current = duration * 60; setBossHp(100); lastHpRef.current = 100; }
  }, [duration, isActive]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        if (next <= 0) {
          setTimeout(() => {
            setIsActive(false);
            setVictory(true);
            completeFocus(duration);
          }, 0);
          return 0;
        }
        const elapsed = totalSeconds.current - next;
        const newHp = Math.max(0, 100 - (elapsed / totalSeconds.current) * 100);
        setTimeout(() => {
          setBossHp(newHp);
          if (Math.floor(lastHpRef.current / 10) !== Math.floor(newHp / 10)) {
            setShakeKey(k => k + 1);
          }
          lastHpRef.current = newHp;
        }, 0);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, duration, completeFocus]);

  const handleStart = () => { setVictory(false); setIsActive(true); };
  const handleFlee = () => { setIsActive(false); takeDamage(15); setBossHp(100); setTimeLeft(duration * 60); };
  const handleReset = () => { setVictory(false); setBossHp(100); setTimeLeft(duration * 60); };
  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const progressPercent = ((totalSeconds.current - timeLeft) / totalSeconds.current) * 100;
  const circumference = 2 * Math.PI * 110;
  const selectedDur = DURATIONS.find(d => d.value === duration);
  const phase = getBossPhase(bossHp);
  const xpReward = Math.round(duration * 6);
  const goldReward = Math.round(duration * 2);

  // Motivational messages that change based on progress
  const getMessage = () => {
    if (progressPercent < 10) return "The battle begins... stay strong! 💪";
    if (progressPercent < 25) return "You're warming up. Keep pushing!";
    if (progressPercent < 50) return "The demon is weakening! Don't stop!";
    if (progressPercent < 75) return "Past halfway! Victory is within reach! 🔥";
    if (progressPercent < 90) return "Almost there! The demon is on its knees!";
    return "FINISH HIM! Just a bit more! ⚔️";
  };

  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:16, alignItems:'center' }}>
      {/* Header */}
      <div className="page-header" style={{ width:'100%', textAlign:'left' }}>
        <h1>⚔️ Focus Arena</h1>
        <p>Battle the Distraction Demon! Stay focused for the full duration to defeat it and earn rewards.</p>
      </div>

      {/* Stats bar */}
      <div style={{ display:'flex', gap:8, width:'100%', maxWidth:600, flexWrap:'wrap' }}>
        <div className="stat-chip xp" style={{ flex:1, justifyContent:'center', padding:'8px 12px' }}>
          <Clock size={14} /> {player.totalFocus} sessions
        </div>
        <div className="stat-chip hp" style={{ flex:1, justifyContent:'center', padding:'8px 12px' }}>
          <Heart size={14} /> {player.hp}/{player.maxHp} HP
        </div>
        <div className="stat-chip streak" style={{ flex:1, justifyContent:'center', padding:'8px 12px' }}>
          <Flame size={14} /> {player.streakCount}d streak
        </div>
      </div>

      {/* How it works - first timers */}
      {player.totalFocus === 0 && !isActive && (
        <div className="hint-box" style={{ width:'100%', maxWidth:600 }}>
          <span className="hint-icon">💡</span>
          <div>
            <strong style={{ color:'var(--text-primary)' }}>How it works:</strong><br />
            1. Pick a session length below<br />
            2. Click <strong>Enter Battle</strong> to start the countdown<br />
            3. Stay focused — the boss takes damage as time passes<br />
            4. Complete the session → earn XP & Gold! Fleeing costs 15 HP.
          </div>
        </div>
      )}

      {/* Duration selector */}
      {!isActive && !victory && (
        <div className="duration-grid">
          {DURATIONS.map(d => (
            <button key={d.value}
              onClick={() => setDuration(d.value)}
              style={{
                padding:'16px 12px', borderRadius:12, cursor:'pointer', textAlign:'center',
                background: duration === d.value ? `${d.color}15` : 'rgba(255,255,255,0.02)',
                border: duration === d.value ? `2px solid ${d.color}` : '1px solid var(--glass-border)',
                color: duration === d.value ? d.color : 'var(--text-secondary)',
                transition:'all 0.2s', fontFamily:'inherit',
              }}>
              <div style={{ fontSize:24, marginBottom:4 }}>{d.icon}</div>
              <div style={{ fontWeight:800, fontSize:16 }}>{d.label}</div>
              <div style={{ fontSize:11, opacity:0.7, marginTop:2 }}>{d.desc}</div>
              <div style={{ fontSize:10, marginTop:6, opacity:0.5 }}>+{Math.round(d.value * 6)} XP • +{Math.round(d.value * 2)} Gold</div>
            </button>
          ))}
        </div>
      )}

      {/* Main arena card */}
      <div className="glass-panel" style={{
        width:'100%', maxWidth:600,
        display:'flex', flexDirection:'column', alignItems:'center', gap:24,
        padding:'36px 28px',
        border: isActive ? '1px solid rgba(168,85,247,0.3)' : '1px solid var(--glass-border)',
        boxShadow: isActive ? '0 0 40px rgba(168,85,247,0.1), inset 0 0 40px rgba(168,85,247,0.03)' : undefined,
        transition:'all 0.5s',
      }}>
        {victory ? (
          /* ===== VICTORY SCREEN ===== */
          <div className="animate-scale" style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:16 }}>
            <div style={{ fontSize:80, filter:'drop-shadow(0 0 20px rgba(251,191,36,0.5))' }}>🏆</div>
            <h2 style={{ color:'var(--accent-gold)', fontSize:28, fontWeight:900 }}>VICTORY!</h2>
            <p style={{ color:'var(--text-secondary)', maxWidth:320, fontSize:15, lineHeight:1.6 }}>
              The Distraction Demon has been vanquished!<br />
              <span style={{ fontSize:13, opacity:0.7 }}>You stayed focused for {duration} minutes straight.</span>
            </p>
            <div style={{ display:'flex', gap:16, marginTop:4 }}>
              <div style={{ textAlign:'center', padding:'12px 20px', background:'var(--xp-blue-dim)', borderRadius:12, border:'1px solid rgba(59,130,246,0.2)' }}>
                <Zap size={20} color="var(--xp-blue)" />
                <div style={{ fontSize:22, fontWeight:800, color:'var(--xp-blue)', marginTop:4 }}>+{xpReward}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>XP Earned</div>
              </div>
              <div style={{ textAlign:'center', padding:'12px 20px', background:'var(--accent-gold-dim)', borderRadius:12, border:'1px solid rgba(251,191,36,0.2)' }}>
                <Coins size={20} color="var(--accent-gold)" />
                <div style={{ fontSize:22, fontWeight:800, color:'var(--accent-gold)', marginTop:4 }}>+{goldReward}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Gold Earned</div>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" onClick={handleReset} style={{ marginTop:8, gap:8 }}>
              <Swords size={18} /> Fight Again
            </button>
          </div>
        ) : (
          /* ===== BATTLE SCREEN ===== */
          <>
            {/* Boss info */}
            <div style={{ display:'flex', alignItems:'center', gap:16, width:'100%' }}>
              <div key={shakeKey} style={{
                width:64, height:64, borderRadius:16,
                background: isActive ? `${phase.color}15` : 'rgba(255,255,255,0.03)',
                border: `2px solid ${isActive ? phase.color : 'var(--glass-border)'}`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
                animation: shakeKey > 0 && isActive ? 'shake 0.3s ease' : undefined,
                transition:'all 0.3s',
              }}>
                {isActive ? phase.emoji : '😈'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:16, color: isActive ? phase.color : 'var(--text-primary)' }}>
                      Distraction Demon
                    </div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                      {isActive ? phase.name : `${selectedDur?.desc} Challenge`}
                    </div>
                  </div>
                  <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, fontWeight:700, color: isActive ? phase.color : 'var(--text-muted)' }}>
                    {Math.ceil(bossHp)}%
                  </div>
                </div>
                <div className="progress-track" style={{ height:10 }}>
                  <div style={{
                    height:'100%', borderRadius:99,
                    width:`${bossHp}%`,
                    background: bossHp > 50 ? 'linear-gradient(90deg, #ef4444, #f97316)' : bossHp > 25 ? 'linear-gradient(90deg, #f97316, #fbbf24)' : 'linear-gradient(90deg, #fbbf24, #22c55e)',
                    transition:'width 1s linear, background 0.5s',
                    boxShadow: `0 0 8px ${phase.color}40`,
                  }} />
                </div>
              </div>
            </div>

            {/* Circular timer */}
            <div style={{ position:'relative', width:200, height:200 }}>
              <svg width={200} height={200} style={{ transform:'rotate(-90deg)' }}>
                <circle cx={100} cy={100} r={90} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={5} />
                <circle cx={100} cy={100} r={90} fill="none"
                  stroke={isActive ? 'var(--accent-purple)' : 'var(--bg-tertiary)'}
                  strokeWidth={5} strokeLinecap="round"
                  strokeDasharray={`${(progressPercent / 100) * (2 * Math.PI * 90)} ${2 * Math.PI * 90}`}
                  style={{
                    transition:'stroke-dasharray 1s linear',
                    filter: isActive ? 'drop-shadow(0 0 10px rgba(168,85,247,0.6))' : 'none',
                  }} />
              </svg>
              <div style={{
                position:'absolute', inset:0,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              }}>
                <div style={{
                  fontSize:40, fontWeight:900, fontFamily:"'JetBrains Mono',monospace",
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textShadow: isActive ? '0 0 24px rgba(168,85,247,0.5)' : 'none',
                  letterSpacing:2,
                }}>
                  {formatTime(timeLeft)}
                </div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:4, maxWidth:160, textAlign:'center' }}>
                  {isActive ? getMessage() : `${duration} min session`}
                </div>
              </div>
            </div>

            {/* Reward preview (before start) */}
            {!isActive && !victory && (
              <div style={{ display:'flex', gap:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, color:'var(--xp-blue)', fontWeight:600 }}>
                  <Zap size={16} /> +{xpReward} XP
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:14, color:'var(--accent-gold)', fontWeight:600 }}>
                  <Coins size={16} /> +{goldReward} Gold
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display:'flex', gap:16, flexDirection:'column', alignItems:'center', width:'100%', maxWidth:280 }}>
              {!isActive ? (
                <button className="btn btn-primary btn-lg btn-block" onClick={handleStart} style={{ gap:10, fontSize:16, padding:'14px 24px' }}>
                  <Play size={22} /> Enter Battle
                </button>
              ) : (
                <>
                  <button className="btn btn-danger btn-block" onClick={handleFlee} style={{ gap:8, padding:'12px 20px' }}>
                    <Square size={18} /> Flee Battle
                  </button>
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--warning)', fontSize:12, textAlign:'center' }}>
                    <AlertTriangle size={14} /> Fleeing costs 15 HP — stay strong, you've got this!
                  </div>
                </>
              )}
            </div>

            {/* Progress milestones during battle */}
            {isActive && (
              <div style={{ display:'flex', gap:6, width:'100%', maxWidth:400 }}>
                {[25, 50, 75, 100].map(milestone => {
                  const reached = progressPercent >= milestone;
                  return (
                    <div key={milestone} style={{
                      flex:1, padding:'6px 0', textAlign:'center', borderRadius:8, fontSize:11, fontWeight:700,
                      background: reached ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.02)',
                      color: reached ? 'var(--accent-purple)' : 'var(--text-muted)',
                      border: reached ? '1px solid rgba(168,85,247,0.3)' : '1px solid var(--glass-border)',
                      transition:'all 0.3s',
                    }}>
                      {reached ? '✓' : ''} {milestone}%
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
