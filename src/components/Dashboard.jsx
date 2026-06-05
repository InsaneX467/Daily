import React from 'react';
import { useGame } from '../context/GameContext';
import { JOURNEY_MILESTONES } from '../context/GameContext';
import { Shield, Zap, Coins, Flame, Trophy, Swords, Clock, ArrowRight, CalendarDays, HelpCircle, Info, Target, CheckCircle, RotateCcw } from 'lucide-react';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const formatDate = () => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

// Journey Map Component
function HeroJourneyMap({ level }) {
  // Calculate fill percentage based on which milestones are completed
  const lastMilestoneIdx = JOURNEY_MILESTONES.length - 1;
  let currentIdx = 0;
  for (let i = lastMilestoneIdx; i >= 0; i--) {
    if (level >= JOURNEY_MILESTONES[i].level) { currentIdx = i; break; }
  }
  // Interpolate between milestones for smooth progress
  const nextIdx = Math.min(currentIdx + 1, lastMilestoneIdx);
  const currentMilestone = JOURNEY_MILESTONES[currentIdx];
  const nextMilestone = JOURNEY_MILESTONES[nextIdx];
  let progressBetween = 0;
  if (currentIdx < lastMilestoneIdx) {
    const range = nextMilestone.level - currentMilestone.level;
    const progress = level - currentMilestone.level;
    progressBetween = Math.min(progress / range, 1);
  } else {
    progressBetween = 1;
  }
  const fillPercent = ((currentIdx + progressBetween) / lastMilestoneIdx) * 100;

  return (
    <div className="glass-panel" style={{ padding: '16px 12px 8px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
          🗺️ Hero Journey
        </h3>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: "'JetBrains Mono',monospace" }}>
          Lv.{level}
        </span>
      </div>
      <div className="journey-map-container">
        <div className="journey-map">
          <div className="journey-line">
            <div className="journey-line-fill" style={{ width: `${Math.min(fillPercent, 100)}%` }} />
          </div>
          {JOURNEY_MILESTONES.map((m, i) => {
            const status = level >= m.level
              ? (i === currentIdx && currentIdx < lastMilestoneIdx ? 'current' : 'completed')
              : 'locked';
            // If player is past ALL milestones, last one is "current"
            const actualStatus = (level >= JOURNEY_MILESTONES[lastMilestoneIdx].level && i === lastMilestoneIdx) ? 'current'
              : (level >= m.level && i < currentIdx) ? 'completed'
                : (i === currentIdx && level >= m.level) ? 'current'
                  : status;
            return (
              <div key={m.level} className={`journey-node ${actualStatus}`} title={m.desc}>
                <div className="journey-node-circle">
                  {actualStatus === 'completed' ? '✓' : m.icon}
                </div>
                <div className="journey-node-label">{m.label}</div>
                <div className="journey-node-level">Lv.{m.level}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ onNavigate }) {
  const { player, heroName, title, classData, xpNeeded, xpPercent, quests, skills, achievements, trainedTodayCount, dailyChallenges, resetAllData, powerLevel, comboCount, isComboActive } = useGame();
  const activeQuests = quests.filter(q => q.status === 'active').slice(0, 4);
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const hpPercent = (player.hp / player.maxHp) * 100;
  const manaPercent = (player.mana / player.maxMana) * 100;
  const todayCompleted = quests.filter(q => q.status === 'completed' && q.completedAt && new Date(q.completedAt).toDateString() === new Date().toDateString()).length;
  const challengesDone = dailyChallenges.filter(c => c.completed).length;

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Greeting */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{formatDate()}</p>
        <h1>{getGreeting()}, {heroName || 'Hero'} 👋</h1>
        <p>You're a <span className="class-badge" style={{ color: classData.color, borderColor: `${classData.color}40`, background: `${classData.color}15` }}>{classData.icon} {title}</span> at <strong style={{ color: 'var(--accent-purple)' }}>Level {player.level}</strong>. Keep pushing!</p>
      </div>

      {/* Power Level + Combo row */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch' }}>
        <div className="power-level-badge" style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="power-level-label">Power Level</span>
            <span className="power-level-number">{powerLevel}</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
            <span className="power-level-title" style={{ color: classData.color }}>{classData.icon} {title}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Level × Quests × Skills × Focus</span>
          </div>
        </div>
        {isComboActive && (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="combo-badge">
              🔥 x{comboCount} COMBO
            </span>
          </div>
        )}
      </div>

      {/* Hero Journey Map */}
      <HeroJourneyMap level={player.level} />

      {/* Quick action hint for new users */}
      {player.totalQuests === 0 && (
        <div className="hint-box animate-scale">
          <span className="hint-icon">💡</span>
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Getting Started:</strong> Head to the <strong>Quest Log</strong> to add your first task, or visit the <strong>Skill Tree</strong> to train a habit. Completing tasks earns XP and Gold — level up to unlock your potential!
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate?.('quests')}><Swords size={14} /> Add First Quest</button>
              <button className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('skills')}>Train a Skill →</button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Challenges */}
      {dailyChallenges.length > 0 && (
        <div className="glass-panel" style={{ border: '1px solid rgba(251,191,36,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Target size={18} color="var(--accent-gold)" /> Daily Challenges
            </h3>
            <span className="stat-chip gold" style={{ fontSize: 12 }}>{challengesDone}/{dailyChallenges.length} done</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dailyChallenges.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: c.completed ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.02)', borderRadius: 10, border: c.completed ? '1px solid rgba(16,185,129,0.2)' : '1px solid var(--glass-border)', transition: 'all 0.3s' }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>{c.completed ? <CheckCircle size={20} color="var(--success)" /> : <span>{c.icon}</span>}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, textDecoration: c.completed ? 'line-through' : 'none', opacity: c.completed ? 0.6 : 1 }}>{c.title}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                    {!c.completed && (
                      <div className="progress-track thin" style={{ width: 80 }}>
                        <div className="progress-fill gold" style={{ width: `${(c.progress / c.target) * 100}%` }} />
                      </div>
                    )}
                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.completed ? 'Completed!' : `${c.progress}/${c.target}`}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <span className="stat-chip xp" style={{ fontSize: 10, padding: '2px 6px' }}>+{c.xp} XP</span>
                  <span className="stat-chip gold" style={{ fontSize: 10, padding: '2px 6px' }}>+{c.gold} G</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top stat cards */}
      <div className="grid-4">
        {[
          { icon: <Zap size={20} color="var(--xp-blue)" />, value: player.level, label: 'Level', sublabel: `${player.xp}/${xpNeeded} XP`, bg: 'var(--xp-blue-dim)' },
          { icon: <Coins size={20} color="var(--accent-gold)" />, value: player.gold, label: 'Gold', sublabel: 'Rewards Shop', bg: 'var(--accent-gold-dim)' },
          { icon: <Flame size={20} color="#f97316" />, value: <>{player.streakCount}{player.streakCount >= 3 && <span className="fire-icon" style={{ marginLeft: 4 }}>🔥</span>}</>, label: 'Streak', sublabel: player.streakCount > 0 ? `×${(1 + player.streakCount * 0.1).toFixed(1)} bonus` : 'Do tasks daily', bg: 'rgba(249,115,22,0.15)' },
          { icon: <Trophy size={20} color="var(--success)" />, value: todayCompleted, label: 'Done', sublabel: todayCompleted > 0 ? 'Great work!' : 'No tasks yet', bg: 'var(--success-dim)' },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{s.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.sublabel}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        {/* Player Status */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={18} color="var(--accent-cyan)" /> Player Status
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Your character stats. XP grows from completing tasks and training skills.</p>
          </div>
          {[
            { label: 'XP', value: `${player.xp} / ${xpNeeded}`, pct: xpPercent, cls: 'xp', hint: 'Complete quests & train skills' },
            { label: 'HP', value: `${player.hp} / ${player.maxHp}`, pct: hpPercent, cls: 'hp', hint: 'Lost by fleeing Focus sessions' },
            { label: 'Mana', value: `${player.mana} / ${player.maxMana}`, pct: manaPercent, cls: 'mana', hint: 'Increases as you level up' },
          ].map((bar, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 13 }}>
                <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  {bar.label}
                  <span title={bar.hint} style={{ cursor: 'help', opacity: 0.5 }}><HelpCircle size={11} /></span>
                </span>
                <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600, fontSize: 11 }}>{bar.value}</span>
              </div>
              <div className="progress-track"><div className={`progress-fill ${bar.cls}`} style={{ width: `${bar.pct}%` }} /></div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
            <span className="stat-chip streak" style={{ fontSize: 11 }}><Flame size={12} /> ×{(1 + player.streakCount * 0.1).toFixed(1)} XP</span>
            <span className="stat-chip xp" style={{ fontSize: 11 }}><Clock size={12} /> {player.totalFocus} Focus</span>
          </div>
        </div>

        {/* Active quests with CTA */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <div>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Swords size={18} color="var(--accent-gold)" /> Active Quests
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Complete tasks to earn XP & Gold.</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('quests')}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          {activeQuests.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🗺️</div>
              <div className="empty-state-text">No active quests yet.<br />Add tasks to earn XP and Gold!</div>
              <button className="btn btn-primary btn-sm" onClick={() => onNavigate?.('quests')}>
                <Swords size={14} /> Go to Quest Log
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {activeQuests.map(q => (
                <div key={q.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid var(--glass-border)', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <span className={`rank-badge rank-${q.difficulty === 'easy' ? 'D' : q.difficulty === 'medium' ? 'C' : q.difficulty === 'hard' ? 'B' : q.difficulty === 'epic' ? 'A' : 'S'}`}>
                      {q.difficulty === 'easy' ? 'D' : q.difficulty === 'medium' ? 'C' : q.difficulty === 'hard' ? 'B' : q.difficulty === 'epic' ? 'A' : 'S'}
                    </span>
                    <span style={{ fontWeight: 500, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.title}</span>
                  </div>
                  <span className="stat-chip xp" style={{ fontSize: 10, flexShrink: 0 }}>+{q.xpReward}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skills overview */}
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
          <h3>🎯 Skills ({trainedTodayCount}/{skills.length} trained)</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => onNavigate?.('skills')}>
            Train <ArrowRight size={14} />
          </button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>Daily habits you're building. Click "Train" to practice and earn XP.</p>
        <div className="grid-4">
          {skills.slice(0, 4).map(skill => (
            <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--glass-border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${skill.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {skill.icon === 'dumbbell' ? '💪' : skill.icon === 'book-open' ? '📖' : skill.icon === 'palette' ? '🎨' : skill.icon === 'shield' ? '🛡️' : skill.icon === 'code' ? '💻' : skill.icon === 'heart' ? '❤️' : skill.icon === 'music' ? '🎵' : skill.icon === 'globe' ? '🌍' : '⭐'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{skill.name}</span>
                  {skill.trainedToday && <span className="trained-badge" style={{ fontSize: 9, padding: '1px 6px' }}>✓</span>}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Lv.{skill.level}</div>
                <div className="progress-track thin" style={{ marginTop: 3 }}>
                  <div className="progress-fill" style={{ width: `${(skill.xp / (skill.level * 100)) * 100}%`, background: skill.color, boxShadow: `0 0 6px ${skill.color}60` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions row */}
      <div className="grid-4">
        <div className="glass-panel glass-panel-interactive" onClick={() => onNavigate?.('arena')} style={{ cursor: 'pointer', textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>⚔️</div>
          <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 13 }}>Focus Arena</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Timed session</div>
        </div>
        <div className="glass-panel glass-panel-interactive" onClick={() => onNavigate?.('schedule')} style={{ cursor: 'pointer', textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📅</div>
          <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 13 }}>Schedule</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Plan by hour</div>
        </div>
        <div className="glass-panel glass-panel-interactive" onClick={() => onNavigate?.('stats')} style={{ cursor: 'pointer', textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>📊</div>
          <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 13 }}>Weekly Stats</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Your progress</div>
        </div>
        <div className="glass-panel glass-panel-interactive" onClick={() => onNavigate?.('achievements')} style={{ cursor: 'pointer', textAlign: 'center', padding: 14 }}>
          <div style={{ fontSize: 24, marginBottom: 4 }}>🏅</div>
          <div style={{ fontWeight: 700, marginBottom: 2, fontSize: 13 }}>Achievements</div>
          <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{unlockedCount}/{achievements.length}</div>
        </div>
      </div>

      {/* Mobile-only: Reset button (sidebar has it on desktop) */}
      <div className="mobile-reset-section" style={{ marginTop: 8, textAlign: 'center', paddingTop: 16, borderTop: '1px solid var(--glass-border)' }}>
        <button className="btn btn-ghost btn-sm" onClick={resetAllData}
          style={{ color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)', fontSize: 12, gap: 6 }}>
          <RotateCcw size={13} /> Reset All Data
        </button>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>LifeQuest v2.0 — Level up your life</p>
      </div>
    </div>
  );
}
