import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Play, Square, Swords, AlertTriangle, Clock, Shield, Zap, Coins, Trophy, Heart, Flame, Skull, ChevronRight } from 'lucide-react';

const DURATIONS = [
  { label:'15 min', value:15, desc:'Quick Sprint', icon:'⚡', color:'#22c55e', threat:'Low' },
  { label:'25 min', value:25, desc:'Standard Focus', icon:'🎯', color:'#3b82f6', threat:'Medium' },
  { label:'45 min', value:45, desc:'Deep Session', icon:'🔥', color:'#a855f7', threat:'High' },
  { label:'60 min', value:60, desc:'Marathon', icon:'💀', color:'#fbbf24', threat:'Extreme' },
];

const BOSS_PHASES = [
  { threshold:75, name:'FULL POWER', emoji:'😈', color:'#ef4444', aura:'rgba(239,68,68,0.15)' },
  { threshold:50, name:'WEAKENING', emoji:'😠', color:'#f97316', aura:'rgba(249,115,22,0.12)' },
  { threshold:25, name:'DESPERATE', emoji:'😰', color:'#fbbf24', aura:'rgba(251,191,36,0.10)' },
  { threshold:0,  name:'DEFEATED',  emoji:'💀', color:'#22c55e', aura:'rgba(34,197,94,0.10)' },
];

const getBossPhase = (hp) => BOSS_PHASES.find(p => hp >= p.threshold) || BOSS_PHASES[3];

// Battle cry messages — much more intense
const BATTLE_CRIES = [
  { min:0, max:5, msgs:["⚔️ DRAW YOUR WEAPON!", "The Demon awakens...", "Brace yourself, warrior!"] },
  { min:5, max:15, msgs:["💪 Landing blows!", "Keep the pressure up!", "You're doing damage!"] },
  { min:15, max:30, msgs:["🔥 The demon is bleeding!", "DON'T LET UP!", "Your focus is a blade — SWING IT!"] },
  { min:30, max:50, msgs:["⚡ CRITICAL ZONE!", "You're DESTROYING it!", "The demon SCREAMS in pain!"] },
  { min:50, max:75, msgs:["🔥🔥 PAST HALFWAY!", "It's STAGGERING! Push harder!", "Victory is WITHIN REACH!"] },
  { min:75, max:90, msgs:["💀 THE DEMON IS ON ITS KNEES!", "SHOW NO MERCY!", "ALMOST THERE — FINISH IT!"] },
  { min:90, max:100, msgs:["⚔️ EXECUTE!! FINAL BLOW!!", "ONE MORE PUSH!!", "🏆 VICTORY IS YOURS!!"] },
];

const getBattleCry = (pct) => {
  const group = BATTLE_CRIES.find(g => pct >= g.min && pct < g.max) || BATTLE_CRIES[BATTLE_CRIES.length - 1];
  return group.msgs[Math.floor(Math.random() * group.msgs.length)];
};

export default function FocusArena() {
  const { completeFocus, takeDamage, player } = useGame();
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isActive, setIsActive] = useState(false);
  const [bossHp, setBossHp] = useState(100);
  const [victory, setVictory] = useState(false);
  const [shakeKey, setShakeKey] = useState(0);
  const [critFlash, setCritFlash] = useState(false);
  const [battleLog, setBattleLog] = useState([]);
  const [critCount, setCritCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [battleCry, setBattleCry] = useState('');
  const totalSeconds = useRef(duration * 60);
  const lastHpRef = useRef(100);
  const logRef = useRef(null);
  const battleStartTime = useRef(0);

  // Add battle log entry
  const addLog = useCallback((msg, type = 'normal') => {
    const time = new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' });
    setBattleLog(prev => [...prev.slice(-20), { msg, type, time, id: Date.now() + Math.random() }]);
  }, []);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(duration * 60);
      totalSeconds.current = duration * 60;
      setBossHp(100);
      lastHpRef.current = 100;
      setBattleLog([]);
      setCritCount(0);
      setHitCount(0);
    }
  }, [duration, isActive]);

  // Scroll battle log to bottom
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLog]);

  // Main battle tick
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
            addLog('💀 THE DISTRACTION DEMON HAS BEEN SLAIN!', 'legendary');
          }, 0);
          return 0;
        }
        const elapsed = totalSeconds.current - next;
        const newHp = Math.max(0, 100 - (elapsed / totalSeconds.current) * 100);

        // Calculate damage dealt this tick
        const dmgThisTick = lastHpRef.current - newHp;

        // Critical hit chance (8% per tick)
        const isCrit = Math.random() < 0.08 && elapsed > 5;

        setTimeout(() => {
          setBossHp(newHp);
          setHitCount(h => h + 1);

          if (isCrit) {
            setCritFlash(true);
            setCritCount(c => c + 1);
            setTimeout(() => setCritFlash(false), 400);
            addLog(`⚡ CRITICAL HIT! ${dmgThisTick.toFixed(1)}% bonus damage!`, 'crit');
          }

          // Shake on every 10% HP lost
          if (Math.floor(lastHpRef.current / 10) !== Math.floor(newHp / 10)) {
            setShakeKey(k => k + 1);
            const phase = getBossPhase(newHp);
            addLog(`${phase.emoji} Boss HP dropped below ${Math.ceil(newHp / 10) * 10}% — ${phase.name}`, 'phase');
          }

          // Update battle cry every 15 seconds
          if (elapsed % 15 === 0) {
            const pct = (elapsed / totalSeconds.current) * 100;
            setBattleCry(getBattleCry(pct));
          }

          lastHpRef.current = newHp;
        }, 0);
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, duration, completeFocus, addLog]);

  const handleStart = () => {
    setVictory(false);
    setIsActive(true);
    battleStartTime.current = Date.now();
    setBattleCry(getBattleCry(0));
    addLog('⚔️ Battle begins! The Distraction Demon appears!', 'phase');
    addLog(`You have ${duration} minutes to defeat it. Stay focused!`, 'normal');
  };
  const handleFlee = () => {
    setIsActive(false);
    takeDamage(15);
    setBossHp(100);
    setTimeLeft(duration * 60);
    addLog('🏃 You fled the battle! Lost 15 HP...', 'damage');
  };
  const handleReset = () => { setVictory(false); setBossHp(100); setTimeLeft(duration * 60); setBattleLog([]); };
  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const progressPercent = ((totalSeconds.current - timeLeft) / totalSeconds.current) * 100;
  const selectedDur = DURATIONS.find(d => d.value === duration);
  const phase = getBossPhase(bossHp);
  const xpReward = Math.round(duration * 6);
  const goldReward = Math.round(duration * 2);
  const elapsedSeconds = totalSeconds.current - timeLeft;
  const dpm = elapsedSeconds > 0 ? ((100 - bossHp) / (elapsedSeconds / 60)).toFixed(1) : '0.0';

  // Intensity factor (0-1) based on progress
  const intensity = progressPercent / 100;
  // Boss rage when below 25%
  const isRaging = isActive && bossHp <= 25 && bossHp > 0;

  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:16, alignItems:'center', position:'relative' }}>

      {/* Battle vignette overlay when active */}
      {isActive && (
        <div style={{
          position:'fixed', inset:0, pointerEvents:'none', zIndex:0,
          background: `radial-gradient(ellipse at center, transparent 50%, ${phase.aura} 100%)`,
          transition:'background 1s',
          animation: isRaging ? 'arenaVignettePulse 1.5s ease-in-out infinite' : undefined,
        }} />
      )}

      {/* Critical hit flash */}
      {critFlash && (
        <div style={{
          position:'fixed', inset:0, pointerEvents:'none', zIndex:1,
          background:'rgba(251,191,36,0.08)',
          animation:'critFlashAnim 0.4s ease-out forwards',
        }} />
      )}

      {/* Header */}
      <div className="page-header" style={{ width:'100%', textAlign:'left', zIndex:2 }}>
        <h1>⚔️ Focus Arena</h1>
        <p>Battle the Distraction Demon! Stay focused to defeat it and earn rewards.</p>
      </div>

      {/* Stats bar */}
      <div style={{ display:'flex', gap:8, width:'100%', maxWidth:600, flexWrap:'wrap', zIndex:2 }}>
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
        <div className="hint-box" style={{ width:'100%', maxWidth:600, zIndex:2 }}>
          <span className="hint-icon">💡</span>
          <div>
            <strong style={{ color:'var(--text-primary)' }}>How it works:</strong><br />
            1. Pick a session length below<br />
            2. Click <strong>Enter Battle</strong> to start the countdown<br />
            3. Stay focused — the boss takes damage as time passes<br />
            4. Complete the session → earn XP & Gold! Fleeing costs 15 HP.<br />
            <span style={{ color:'var(--accent-gold)', fontSize:12 }}>⚡ Watch for CRITICAL HITS — random bursts of extra damage!</span>
          </div>
        </div>
      )}

      {/* Duration selector */}
      {!isActive && !victory && (
        <div className="duration-grid" style={{ zIndex:2 }}>
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
              <div style={{ fontSize:9, marginTop:4, padding:'2px 8px', borderRadius:99, background:`${d.color}15`, display:'inline-block', fontWeight:700 }}>
                ☠️ {d.threat} Threat
              </div>
              <div style={{ fontSize:10, marginTop:4, opacity:0.5 }}>+{Math.round(d.value * 6)} XP • +{Math.round(d.value * 2)} Gold</div>
            </button>
          ))}
        </div>
      )}

      {/* Main arena card */}
      <div className="glass-panel arena-mobile-card" style={{
        width:'100%', maxWidth:600, zIndex:2,
        display:'flex', flexDirection:'column', alignItems:'center', gap:20,
        padding:'32px 24px',
        border: isActive ? `1px solid ${phase.color}40` : '1px solid var(--glass-border)',
        boxShadow: isActive
          ? `0 0 60px ${phase.aura}, inset 0 0 30px ${phase.aura}`
          : undefined,
        transition:'all 0.5s',
        background: isActive
          ? `linear-gradient(180deg, rgba(17,24,39,0.9), rgba(17,24,39,0.95))`
          : undefined,
      }}>
        {victory ? (
          /* ===== VICTORY SCREEN ===== */
          <div className="animate-scale" style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:16, width:'100%' }}>
            <div style={{ fontSize:72, filter:'drop-shadow(0 0 30px rgba(251,191,36,0.6))', animation:'victoryBounce 0.6s ease-out' }}>🏆</div>
            <h2 style={{ color:'var(--accent-gold)', fontSize:26, fontWeight:900, textShadow:'0 0 20px rgba(251,191,36,0.3)' }}>VICTORY!</h2>
            <p style={{ color:'var(--text-secondary)', maxWidth:320, fontSize:14, lineHeight:1.6 }}>
              The Distraction Demon has been vanquished!<br />
              <span style={{ fontSize:12, opacity:0.7 }}>You stayed focused for {duration} minutes straight.</span>
            </p>

            {/* Battle Stats */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:8, width:'100%', maxWidth:320, marginTop:4 }}>
              {[
                { label:'Total Hits', value:hitCount, icon:'⚔️', color:'var(--text-primary)' },
                { label:'Critical Hits', value:critCount, icon:'⚡', color:'var(--accent-gold)' },
                { label:'Damage/Min', value:`${dpm}%`, icon:'💀', color:'var(--danger)' },
                { label:'Duration', value:`${duration}m`, icon:'⏱️', color:'var(--accent-cyan)' },
              ].map((stat, i) => (
                <div key={i} style={{ padding:'10px 12px', background:'rgba(255,255,255,0.03)', borderRadius:10, border:'1px solid var(--glass-border)', textAlign:'center' }}>
                  <div style={{ fontSize:16 }}>{stat.icon}</div>
                  <div style={{ fontSize:18, fontWeight:800, color:stat.color, fontFamily:"'JetBrains Mono',monospace" }}>{stat.value}</div>
                  <div style={{ fontSize:10, color:'var(--text-muted)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Rewards */}
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
            {/* Boss info — more dramatic */}
            <div style={{ display:'flex', alignItems:'center', gap:14, width:'100%' }}>
              <div key={shakeKey} style={{
                width:64, height:64, borderRadius:16,
                background: isActive ? `${phase.color}15` : 'rgba(255,255,255,0.03)',
                border: `2px solid ${isActive ? phase.color : 'var(--glass-border)'}`,
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:32,
                animation: shakeKey > 0 && isActive ? 'shake 0.3s ease' : (isRaging ? 'bossRage 0.5s ease-in-out infinite' : undefined),
                transition:'all 0.3s',
                boxShadow: isActive ? `0 0 24px ${phase.color}30` : 'none',
              }}>
                {isActive ? phase.emoji : '😈'}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                  <div>
                    <div style={{ fontWeight:900, fontSize:15, color: isActive ? phase.color : 'var(--text-primary)', display:'flex', alignItems:'center', gap:6 }}>
                      Distraction Demon
                      {isRaging && <span style={{ fontSize:10, padding:'1px 6px', borderRadius:99, background:'rgba(239,68,68,0.2)', color:'#ef4444', fontWeight:800, animation:'comboPulse 0.8s ease-in-out infinite' }}>ENRAGED!</span>}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                      {isActive ? phase.name : `${selectedDur?.desc} — ${selectedDur?.threat} Threat`}
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:16, fontWeight:900, color: isActive ? phase.color : 'var(--text-muted)' }}>
                      {Math.ceil(bossHp)}%
                    </div>
                    <div style={{ fontSize:9, color:'var(--text-muted)' }}>HP</div>
                  </div>
                </div>
                {/* Boss HP bar — thicker, more dramatic */}
                <div className="progress-track" style={{ height:12, borderRadius:6 }}>
                  <div style={{
                    height:'100%', borderRadius:6,
                    width:`${bossHp}%`,
                    background: bossHp > 50 ? 'linear-gradient(90deg, #ef4444, #f97316)' : bossHp > 25 ? 'linear-gradient(90deg, #f97316, #fbbf24)' : 'linear-gradient(90deg, #fbbf24, #22c55e)',
                    transition:'width 1s linear, background 0.5s',
                    boxShadow: `0 0 12px ${phase.color}50`,
                    animation: isRaging ? 'hpBarPulse 0.8s ease-in-out infinite' : undefined,
                  }} />
                </div>
                {/* DPS + Hits counter */}
                {isActive && (
                  <div style={{ display:'flex', gap:8, marginTop:6, flexWrap:'wrap' }}>
                    <span style={{ fontSize:10, color:'var(--text-muted)', fontFamily:"'JetBrains Mono',monospace" }}>
                      ⚔️ {hitCount} hits
                    </span>
                    <span style={{ fontSize:10, color:'var(--accent-gold)', fontFamily:"'JetBrains Mono',monospace" }}>
                      ⚡ {critCount} crits
                    </span>
                    <span style={{ fontSize:10, color:'var(--accent-purple)', fontFamily:"'JetBrains Mono',monospace" }}>
                      💀 {dpm}%/min DPS
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Circular timer — more intense */}
            <div style={{ position:'relative', width:210, height:210 }}>
              {/* Outer glow ring */}
              {isActive && (
                <div style={{
                  position:'absolute', inset:-8,
                  borderRadius:'50%',
                  background:`radial-gradient(circle, transparent 60%, ${phase.color}10 100%)`,
                  animation: isRaging ? 'journeyPulse 1s ease-in-out infinite' : 'orbPulse 3s ease-in-out infinite',
                }} />
              )}
              <svg width={210} height={210} style={{ transform:'rotate(-90deg)', position:'relative', zIndex:1 }}>
                {/* Background ring */}
                <circle cx={105} cy={105} r={92} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={6} />
                {/* Progress ring */}
                <circle cx={105} cy={105} r={92} fill="none"
                  stroke={isActive ? phase.color : 'var(--bg-tertiary)'}
                  strokeWidth={6} strokeLinecap="round"
                  strokeDasharray={`${(progressPercent / 100) * (2 * Math.PI * 92)} ${2 * Math.PI * 92}`}
                  style={{
                    transition:'stroke-dasharray 1s linear, stroke 0.5s',
                    filter: isActive ? `drop-shadow(0 0 12px ${phase.color}80)` : 'none',
                  }} />
                {/* Inner subtle ring */}
                {isActive && (
                  <circle cx={105} cy={105} r={78} fill="none" stroke={`${phase.color}15`} strokeWidth={2} />
                )}
              </svg>
              <div style={{
                position:'absolute', inset:0, zIndex:2,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              }}>
                <div style={{
                  fontSize:42, fontWeight:900, fontFamily:"'JetBrains Mono',monospace",
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  textShadow: isActive ? `0 0 30px ${phase.color}60` : 'none',
                  letterSpacing:2,
                  animation: isRaging ? 'timerPulse 0.8s ease-in-out infinite' : undefined,
                }}>
                  {formatTime(timeLeft)}
                </div>
                {isActive && (
                  <div style={{ fontSize:10, color:phase.color, marginTop:2, fontWeight:700, opacity:0.8 }}>
                    {Math.round(progressPercent)}% complete
                  </div>
                )}
              </div>
            </div>

            {/* Battle cry message */}
            {isActive && battleCry && (
              <div style={{
                fontSize:13, fontWeight:700, color:phase.color,
                textAlign:'center', maxWidth:300,
                textShadow:`0 0 12px ${phase.color}40`,
                animation:'fadeIn 0.3s ease-out',
                lineHeight:1.4,
              }}>
                {battleCry}
              </div>
            )}

            {/* Reward preview (before start) */}
            {!isActive && !victory && (
              <div style={{ display:'flex', gap:16, alignItems:'center' }}>
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
                <button className="btn btn-primary btn-lg btn-block" onClick={handleStart}
                  style={{ gap:10, fontSize:16, padding:'14px 24px', boxShadow:'0 0 30px rgba(168,85,247,0.3)' }}>
                  <Swords size={22} /> Enter Battle
                </button>
              ) : (
                <>
                  <button className="btn btn-danger btn-block" onClick={handleFlee} style={{ gap:8, padding:'12px 20px' }}>
                    <Square size={18} /> Flee Battle
                  </button>
                  <div style={{ display:'flex', alignItems:'center', gap:8, color:'var(--warning)', fontSize:11, textAlign:'center' }}>
                    <AlertTriangle size={14} style={{ flexShrink:0 }} /> Fleeing costs 15 HP — stay strong!
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
                      background: reached ? `${phase.color}15` : 'rgba(255,255,255,0.02)',
                      color: reached ? phase.color : 'var(--text-muted)',
                      border: reached ? `1px solid ${phase.color}30` : '1px solid var(--glass-border)',
                      transition:'all 0.3s',
                    }}>
                      {reached ? '✓' : ''} {milestone}%
                    </div>
                  );
                })}
              </div>
            )}

            {/* Battle Log — live combat feed */}
            {isActive && battleLog.length > 0 && (
              <div style={{ width:'100%', marginTop:4 }}>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:6, display:'flex', alignItems:'center', gap:4, fontWeight:700 }}>
                  <Scroll size={12} /> BATTLE LOG
                </div>
                <div ref={logRef} style={{
                  maxHeight:120, overflowY:'auto', display:'flex', flexDirection:'column', gap:3,
                  padding:'8px 10px', background:'rgba(0,0,0,0.3)', borderRadius:8,
                  border:'1px solid var(--glass-border)', fontSize:11,
                  fontFamily:"'JetBrains Mono',monospace",
                  scrollbarWidth:'thin',
                }}>
                  {battleLog.map(entry => (
                    <div key={entry.id} style={{
                      color: entry.type === 'crit' ? 'var(--accent-gold)' :
                             entry.type === 'phase' ? phase.color :
                             entry.type === 'damage' ? 'var(--danger)' :
                             entry.type === 'legendary' ? 'var(--accent-gold)' :
                             'var(--text-secondary)',
                      fontWeight: entry.type === 'crit' || entry.type === 'legendary' ? 700 : 400,
                      animation: entry.type === 'crit' ? 'fadeIn 0.3s ease-out' : undefined,
                      display:'flex', gap:6,
                    }}>
                      <span style={{ color:'var(--text-muted)', flexShrink:0, fontSize:9 }}>{entry.time}</span>
                      <span>{entry.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Inline Scroll icon since lucide might not have it
function Scroll({ size = 16 }) {
  return <span style={{ fontSize:size, lineHeight:1 }}>📜</span>;
}
