import React from 'react';
import { useGame } from '../context/GameContext';
import { Shield, Zap, Coins, Flame, Trophy, Swords, Clock, ArrowRight, CalendarDays, HelpCircle, Info, Target, CheckCircle } from 'lucide-react';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () => new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' });

export default function Dashboard({ onNavigate }) {
  const { player, heroName, title, xpNeeded, xpPercent, quests, skills, achievements, trainedTodayCount, dailyChallenges } = useGame();
  const activeQuests = quests.filter(q => q.status === 'active').slice(0, 4);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const hpPercent = (player.hp / player.maxHp) * 100;
  const manaPercent = (player.mana / player.maxMana) * 100;
  const todayCompleted = quests.filter(q => q.status === 'completed' && q.completedAt && new Date(q.completedAt).toDateString() === new Date().toDateString()).length;
  const challengesDone = dailyChallenges.filter(c => c.completed).length;

  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:24 }}>
      {/* Greeting */}
      <div className="page-header" style={{ marginBottom:0 }}>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginBottom:4 }}>{formatDate()}</p>
        <h1 style={{ fontSize:26 }}>{getGreeting()}, {heroName || 'Hero'} 👋</h1>
        <p>You're a <strong style={{ color:'var(--accent-purple)' }}>Level {player.level} {title}</strong>. Keep pushing forward!</p>
      </div>

      {/* Quick action hint for new users */}
      {player.totalQuests === 0 && (
        <div className="hint-box animate-scale">
          <span className="hint-icon">💡</span>
          <div>
            <strong style={{ color:'var(--text-primary)' }}>Getting Started:</strong> Head to the <strong>Quest Log</strong> to add your first task, or visit the <strong>Skill Tree</strong> to train a habit. Completing tasks earns XP and Gold — level up to unlock your potential!
            <div style={{ marginTop:10, display:'flex', gap:8 }}>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate?.('quests')}><Swords size={14} /> Add First Quest</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('skills')}>Train a Skill →</button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Challenges */}
      {dailyChallenges.length > 0 && (
        <div className="glass-panel" style={{ border:'1px solid rgba(251,191,36,0.2)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Target size={18} color="var(--accent-gold)" /> Daily Challenges
              <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>— Bonus objectives that refresh each day</span>
            </h3>
            <span className="stat-chip gold" style={{ fontSize:12 }}>{challengesDone}/{dailyChallenges.length} done</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {dailyChallenges.map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background: c.completed ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', borderRadius:10, border: c.completed ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--glass-border)', transition:'all 0.3s' }}>
                <div style={{ fontSize:22 }}>{c.completed ? <CheckCircle size={22} color="var(--success)" /> : <span>{c.icon}</span>}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14, textDecoration: c.completed ? 'line-through' : 'none', opacity: c.completed ? 0.6 : 1 }}>{c.title}</div>
                  <div style={{ display:'flex', gap:8, marginTop:4, alignItems:'center' }}>
                    {!c.completed && (
                      <div className="progress-track thin" style={{ width:100 }}>
                        <div className="progress-fill gold" style={{ width:`${(c.progress / c.target) * 100}%` }} />
                      </div>
                    )}
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>{c.completed ? 'Completed!' : `${c.progress}/${c.target}`}</span>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <span className="stat-chip xp" style={{ fontSize:10, padding:'2px 6px' }}>+{c.xp} XP</span>
                  <span className="stat-chip gold" style={{ fontSize:10, padding:'2px 6px' }}>+{c.gold} Gold</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top stat cards — with descriptions */}
      <div className="grid-4">
        {[
          { icon:<Zap size={22} color="var(--xp-blue)" />, value:player.level, label:'Level', sublabel:`${player.xp}/${xpNeeded} XP to next`, bg:'var(--xp-blue-dim)' },
          { icon:<Coins size={22} color="var(--accent-gold)" />, value:player.gold, label:'Gold', sublabel:'Spend in Rewards Shop', bg:'var(--accent-gold-dim)' },
          { icon:<Flame size={22} color="#f97316" />, value: <>{player.streakCount}{player.streakCount >= 3 && <span className="fire-icon" style={{ marginLeft:4 }}>🔥</span>}</>, label:'Day Streak', sublabel: player.streakCount > 0 ? `×${(1 + player.streakCount * 0.1).toFixed(1)} XP bonus` : 'Complete tasks daily', bg:'rgba(249,115,22,0.15)' },
          { icon:<Trophy size={22} color="var(--success)" />, value:todayCompleted, label:'Done Today', sublabel: todayCompleted > 0 ? 'Great progress!' : 'No tasks done yet', bg:'var(--success-dim)' },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ display:'flex', alignItems:'center', gap:14, padding:18 }}>
            <div style={{ width:44, height:44, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:22, fontWeight:800 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-secondary)' }}>{s.label}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>{s.sublabel}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Player Status */}
        <div className="glass-panel" style={{ display:'flex', flexDirection:'column', gap:18 }}>
          <div>
            <h3 style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Shield size={18} color="var(--accent-cyan)" /> Player Status
            </h3>
            <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>Your character stats. XP grows from completing tasks and training skills.</p>
          </div>
          {[
            { label:'Experience', value:`${player.xp} / ${xpNeeded}`, pct:xpPercent, cls:'xp', hint:'Complete quests & train skills to fill this' },
            { label:'Health Points', value:`${player.hp} / ${player.maxHp}`, pct:hpPercent, cls:'hp', hint:'Lost by fleeing Focus Arena sessions' },
            { label:'Mana', value:`${player.mana} / ${player.maxMana}`, pct:manaPercent, cls:'mana', hint:'Increases as you level up' },
          ].map((bar, i) => (
            <div key={i}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5, fontSize:13 }}>
                <span style={{ color:'var(--text-secondary)', display:'flex', alignItems:'center', gap:4 }}>
                  {bar.label}
                  <span title={bar.hint} style={{ cursor:'help', opacity:0.5 }}><HelpCircle size={11} /></span>
                </span>
                <span style={{ fontFamily:"'JetBrains Mono',monospace", fontWeight:600, fontSize:12 }}>{bar.value}</span>
              </div>
              <div className="progress-track"><div className={`progress-fill ${bar.cls}`} style={{ width:`${bar.pct}%` }} /></div>
            </div>
          ))}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:2 }}>
            <span className="stat-chip streak" style={{ fontSize:12 }}><Flame size={12} /> ×{(1 + player.streakCount * 0.1).toFixed(1)} XP Bonus</span>
            <span className="stat-chip xp" style={{ fontSize:12 }}><Clock size={12} /> {player.totalFocus} Focus Sessions</span>
          </div>
        </div>

        {/* Active quests with CTA */}
        <div className="glass-panel" style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <h3 style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Swords size={18} color="var(--accent-gold)" /> Active Quests
              </h3>
              <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:4 }}>Your current tasks. Complete them to earn XP & Gold.</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('quests')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {activeQuests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🗺️</div>
              <div className="empty-state-text">No active quests yet.<br/>Add tasks to earn XP and Gold!</div>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate?.('quests')}>
                <Swords size={14} /> Go to Quest Log
              </button>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {activeQuests.map(q => (
                <div key={q.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:8, border:'1px solid var(--glass-border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <span className={`rank-badge rank-${q.difficulty === 'easy' ? 'D' : q.difficulty === 'medium' ? 'C' : q.difficulty === 'hard' ? 'B' : q.difficulty === 'epic' ? 'A' : 'S'}`}>
                      {q.difficulty === 'easy' ? 'D' : q.difficulty === 'medium' ? 'C' : q.difficulty === 'hard' ? 'B' : q.difficulty === 'epic' ? 'A' : 'S'}
                    </span>
                    <span style={{ fontWeight:500, fontSize:14 }}>{q.title}</span>
                  </div>
                  <span className="stat-chip xp" style={{ fontSize:11 }}>+{q.xpReward} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skills overview */}
      <div className="glass-panel">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
          <h3>🎯 Skills ({trainedTodayCount}/{skills.length} trained today)</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('skills')}>
            Train Skills <ArrowRight size={14} />
          </button>
        </div>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16 }}>Daily habits you're building. Click "Train Skills" to practice and earn XP.</p>
        <div className="grid-4">
          {skills.slice(0, 4).map(skill => (
            <div key={skill.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10, border:'1px solid var(--glass-border)' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:`${skill.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                {skill.icon === 'dumbbell' ? '💪' : skill.icon === 'book-open' ? '📖' : skill.icon === 'palette' ? '🎨' : skill.icon === 'shield' ? '🛡️' : skill.icon === 'code' ? '💻' : skill.icon === 'heart' ? '❤️' : skill.icon === 'music' ? '🎵' : skill.icon === 'globe' ? '🌍' : '⭐'}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ fontSize:13, fontWeight:600 }}>{skill.name}</span>
                  {skill.trainedToday && <span className="trained-badge">✓</span>}
                </div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Lv.{skill.level}</div>
                <div className="progress-track thin" style={{ marginTop:4 }}>
                  <div className="progress-fill" style={{ width:`${(skill.xp / (skill.level * 100)) * 100}%`, background:skill.color, boxShadow:`0 0 6px ${skill.color}60` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid-4">
        <div className="glass-panel glass-panel-interactive" onClick={() => onNavigate?.('arena')} style={{ cursor:'pointer', textAlign:'center', padding:18 }}>
          <div style={{ fontSize:28, marginBottom:6 }}>⚔️</div>
          <div style={{ fontWeight:700, marginBottom:3, fontSize:14 }}>Focus Arena</div>
          <div style={{ fontSize:11, color:'var(--text-secondary)' }}>Timed focus session</div>
        </div>
        <div className="glass-panel glass-panel-interactive" onClick={() => onNavigate?.('schedule')} style={{ cursor:'pointer', textAlign:'center', padding:18 }}>
          <div style={{ fontSize:28, marginBottom:6 }}>📅</div>
          <div style={{ fontWeight:700, marginBottom:3, fontSize:14 }}>Schedule</div>
          <div style={{ fontSize:11, color:'var(--text-secondary)' }}>Plan by the hour</div>
        </div>
        <div className="glass-panel glass-panel-interactive" onClick={() => onNavigate?.('stats')} style={{ cursor:'pointer', textAlign:'center', padding:18 }}>
          <div style={{ fontSize:28, marginBottom:6 }}>📊</div>
          <div style={{ fontWeight:700, marginBottom:3, fontSize:14 }}>Weekly Stats</div>
          <div style={{ fontSize:11, color:'var(--text-secondary)' }}>View your progress</div>
        </div>
        <div className="glass-panel glass-panel-interactive" onClick={() => onNavigate?.('achievements')} style={{ cursor:'pointer', textAlign:'center', padding:18 }}>
          <div style={{ fontSize:28, marginBottom:6 }}>🏅</div>
          <div style={{ fontWeight:700, marginBottom:3, fontSize:14 }}>Achievements</div>
          <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{unlockedCount}/{achievements.length} unlocked</div>
        </div>
      </div>
    </div>
  );
}
