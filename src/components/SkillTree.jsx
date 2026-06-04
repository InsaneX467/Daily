import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Zap, Plus, X, CheckCircle } from 'lucide-react';

const ICON_OPTIONS = [
  { value:'dumbbell', emoji:'💪', label:'Fitness' },
  { value:'book-open', emoji:'📖', label:'Reading' },
  { value:'palette', emoji:'🎨', label:'Creative' },
  { value:'shield', emoji:'🛡️', label:'Discipline' },
  { value:'code', emoji:'💻', label:'Coding' },
  { value:'heart', emoji:'❤️', label:'Health' },
  { value:'music', emoji:'🎵', label:'Music' },
  { value:'globe', emoji:'🌍', label:'Languages' },
];

const COLOR_OPTIONS = ['#ef4444','#f97316','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#a855f7','#ec4899'];
const getEmoji = (icon) => ICON_OPTIONS.find(i => i.value === icon)?.emoji || '⭐';

export default function SkillTree() {
  const { skills, trainSkill, addSkill, removeSkill, trainedTodayCount } = useGame();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('dumbbell');
  const [newColor, setNewColor] = useState('#3b82f6');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    addSkill({ name: newName.trim(), icon: newIcon, color: newColor });
    setNewName(''); setShowAdd(false);
  };

  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>🌳 Skill Tree</h1>
          <p>Build daily habits! Unlike quests (one-time tasks), skills are <strong>recurring habits</strong> you train every day. Each train gives <strong>+25 Skill XP</strong> and <strong>+10 Player XP</strong>.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? <><X size={16} /> Cancel</> : <><Plus size={16} /> Add Skill</>}
        </button>
      </div>

      {/* Daily progress */}
      <div className="glass-panel" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:16 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <span style={{ fontSize:24 }}>📊</span>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontWeight:700, fontSize:15 }}>Daily Training Progress</span>
              {trainedTodayCount === skills.length && skills.length > 0 && (
                <span className="trained-badge" style={{ fontSize:11, padding:'2px 8px' }}>🎉 All Done!</span>
              )}
            </div>
            <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{trainedTodayCount} of {skills.length} skills trained today</div>
          </div>
        </div>
        <div className="progress-track" style={{ width:200 }}>
          <div className="progress-fill success" style={{ width: skills.length > 0 ? `${(trainedTodayCount / skills.length) * 100}%` : '0%' }} />
        </div>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-panel animate-scale" style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <h3>Create New Skill</h3>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:-8 }}>Create a habit you want to build. Train it daily to see it grow!</p>
          <input className="input" placeholder="Skill name (e.g. Meditation, Running, Study)" value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
          <div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:8, fontWeight:500 }}>Choose Icon</div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              {ICON_OPTIONS.map(opt => (
                <button type="button" key={opt.value} onClick={() => setNewIcon(opt.value)}
                  title={opt.label}
                  style={{ width:48, height:48, borderRadius:10, border: newIcon === opt.value ? '2px solid var(--accent-purple)' : '1px solid var(--glass-border)',
                    background: newIcon === opt.value ? 'var(--accent-purple-dim)' : 'var(--bg-tertiary)',
                    fontSize:22, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s',
                    flexDirection:'column' }}>
                  {opt.emoji}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize:12, color:'var(--text-secondary)', marginBottom:8, fontWeight:500 }}>Choose Color</div>
            <div style={{ display:'flex', gap:8 }}>
              {COLOR_OPTIONS.map(c => (
                <button type="button" key={c} onClick={() => setNewColor(c)}
                  style={{ width:32, height:32, borderRadius:'50%', background:c, border: newColor === c ? '3px solid white' : '2px solid transparent',
                    cursor:'pointer', transition:'all 0.2s', boxShadow: newColor === c ? `0 0 12px ${c}` : 'none' }} />
              ))}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-block">✨ Create Skill</button>
        </form>
      )}

      {skills.length === 0 ? (
        <div className="glass-panel empty-state">
          <div className="empty-state-icon">🌱</div>
          <div className="empty-state-text">No skills yet. Create your first habit skill to start leveling up!</div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Create Your First Skill</button>
        </div>
      ) : (
        <div className="grid-auto">
          {skills.map(skill => {
            const xpPercent = (skill.xp / (skill.level * 100)) * 100;
            return (
              <div key={skill.id} className="glass-panel glass-panel-interactive skill-card">
                <div className="skill-header">
                  <div className="circular-progress" style={{ width:64, height:64 }}>
                    <svg width={64} height={64}>
                      <circle cx={32} cy={32} r={26} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
                      <circle cx={32} cy={32} r={26} fill="none" stroke={skill.color} strokeWidth={5}
                        strokeDasharray={`${(xpPercent / 100) * (2 * Math.PI * 26)} ${2 * Math.PI * 26}`}
                        strokeLinecap="round" style={{ transition:'stroke-dasharray 0.6s ease', filter:`drop-shadow(0 0 4px ${skill.color})` }} />
                    </svg>
                    <div className="circular-progress-label" style={{ fontSize:22 }}>{getEmoji(skill.icon)}</div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span style={{ fontWeight:700, fontSize:16 }}>{skill.name}</span>
                      {skill.trainedToday && <span className="trained-badge"><CheckCircle size={10} /> Today</span>}
                    </div>
                    <div style={{ fontSize:13, color:skill.color, fontWeight:600 }}>Level {skill.level}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{skill.xp} / {skill.level * 100} XP to next level</div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeSkill(skill.id)} style={{ color:'var(--text-muted)', padding:6 }} title="Remove skill">
                    <X size={14} />
                  </button>
                </div>

                <div className="progress-track thin">
                  <div className="progress-fill" style={{ width:`${xpPercent}%`, background:skill.color, boxShadow:`0 0 6px ${skill.color}60` }} />
                </div>

                <button className="btn btn-block" onClick={() => trainSkill(skill.id)}
                  style={{ background:`${skill.color}15`, border:`1px solid ${skill.color}30`, color:skill.color, fontWeight:700 }}>
                  <Zap size={15} /> Train (+25 XP)
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
