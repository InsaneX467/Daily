import React, { useState } from 'react';
import { useGame, CATEGORIES } from '../context/GameContext';
import { Plus, CheckCircle, Trash2, Info, RefreshCw, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const DIFF_CONFIG = {
  easy:      { label:'Easy',      rank:'D', mult:1, color:'#9ca3af', desc:'Quick tasks (5-15 min)', example:'e.g. Drink water, reply to an email' },
  medium:    { label:'Medium',    rank:'C', mult:2, color:'#22c55e', desc:'Standard tasks (15-45 min)', example:'e.g. Read a chapter, clean your room' },
  hard:      { label:'Hard',      rank:'B', mult:3, color:'#3b82f6', desc:'Challenging tasks (45-90 min)', example:'e.g. Complete a homework set, gym session' },
  epic:      { label:'Epic',      rank:'A', mult:5, color:'#a855f7', desc:'Major tasks (90+ min)', example:'e.g. Write an essay, deep study session' },
  legendary: { label:'Legendary', rank:'S', mult:8, color:'#fbbf24', desc:'Massive achievements', example:'e.g. Finish a project, ace an exam' },
};

const QUEST_TEMPLATES = [
  // ===== Health & Fitness =====
  { title:'Drink 8 glasses of water', difficulty:'easy', category:'health', recurring:'daily', icon:'💧' },
  { title:'Go for a 15-min walk', difficulty:'easy', category:'health', recurring:'daily', icon:'🚶' },
  { title:'Do 10 minutes of stretching', difficulty:'easy', category:'health', recurring:'daily', icon:'🧘' },
  { title:'Eat a healthy meal', difficulty:'easy', category:'health', recurring:'daily', icon:'🥗' },
  { title:'Take vitamins/supplements', difficulty:'easy', category:'health', recurring:'daily', icon:'💊' },
  { title:'No sugary drinks today', difficulty:'medium', category:'health', recurring:'daily', icon:'🥤' },
  { title:'Sleep before 11 PM', difficulty:'medium', category:'health', recurring:'daily', icon:'😴' },
  { title:'No junk food today', difficulty:'medium', category:'health', recurring:'daily', icon:'🚫' },
  { title:'Cook a healthy lunch', difficulty:'medium', category:'health', icon:'🥘' },
  { title:'Do 50 push-ups', difficulty:'medium', category:'health', icon:'💪' },
  { title:'30-minute workout', difficulty:'hard', category:'health', recurring:'daily', icon:'🏋️' },
  { title:'Go to the gym', difficulty:'hard', category:'health', icon:'🏟️' },
  { title:'Run 5km', difficulty:'epic', category:'health', icon:'🏃' },
  { title:'Complete a full yoga session', difficulty:'epic', category:'health', icon:'🧘‍♀️' },
  { title:'Run a 10km race', difficulty:'legendary', category:'health', icon:'🏅' },
  { title:'30-day no junk food streak', difficulty:'legendary', category:'health', icon:'👑' },

  // ===== Study & Learning =====
  { title:'Review flashcards (15 min)', difficulty:'easy', category:'study', recurring:'daily', icon:'🃏' },
  { title:'Watch an educational video', difficulty:'easy', category:'study', icon:'🎥' },
  { title:'Read 10 pages of a textbook', difficulty:'easy', category:'study', icon:'📄' },
  { title:'Organize study notes', difficulty:'easy', category:'study', icon:'🗃️' },
  { title:'Read for 30 minutes', difficulty:'medium', category:'study', recurring:'daily', icon:'📚' },
  { title:'Practice a new language (20 min)', difficulty:'medium', category:'study', recurring:'daily', icon:'🌍' },
  { title:'Write notes from today\'s class', difficulty:'medium', category:'study', icon:'📝' },
  { title:'Solve 5 practice problems', difficulty:'medium', category:'study', icon:'🧮' },
  { title:'Summarize a chapter', difficulty:'medium', category:'study', icon:'📑' },
  { title:'Study for 1 hour', difficulty:'hard', category:'study', icon:'📖' },
  { title:'Complete homework assignment', difficulty:'hard', category:'study', icon:'✏️' },
  { title:'Teach a concept to someone', difficulty:'hard', category:'study', icon:'🧑‍🏫' },
  { title:'Finish a full study session (2+ hrs)', difficulty:'epic', category:'study', icon:'🎓' },
  { title:'Complete an online course module', difficulty:'epic', category:'study', icon:'💻' },
  { title:'Finish an entire online course', difficulty:'legendary', category:'study', icon:'🏆' },
  { title:'Score 90%+ on a major exam', difficulty:'legendary', category:'study', icon:'💎' },

  // ===== Work & Productivity =====
  { title:'Clear email inbox', difficulty:'easy', category:'work', icon:'📧' },
  { title:'Plan tomorrow\'s tasks', difficulty:'easy', category:'work', recurring:'daily', icon:'📋' },
  { title:'Update your to-do list', difficulty:'easy', category:'work', recurring:'daily', icon:'✅' },
  { title:'Reply to all pending messages', difficulty:'easy', category:'work', icon:'💬' },
  { title:'No social media for 2 hours', difficulty:'medium', category:'work', recurring:'daily', icon:'📵' },
  { title:'Attend all meetings on time', difficulty:'medium', category:'work', recurring:'daily', icon:'🕐' },
  { title:'Organize desk/workspace', difficulty:'medium', category:'work', icon:'🗂️' },
  { title:'Deep work block (1 hour)', difficulty:'medium', category:'work', icon:'⏱️' },
  { title:'Finish top 3 priority tasks', difficulty:'hard', category:'work', recurring:'daily', icon:'🎯' },
  { title:'Write a report or documentation', difficulty:'hard', category:'work', icon:'📊' },
  { title:'Give a presentation', difficulty:'hard', category:'work', icon:'🎤' },
  { title:'Complete a project milestone', difficulty:'epic', category:'work', icon:'🚀' },
  { title:'Automate a repetitive task', difficulty:'epic', category:'work', icon:'⚙️' },
  { title:'Ship a complete project from start to finish', difficulty:'legendary', category:'work', icon:'🌟' },
  { title:'Get a promotion or major recognition', difficulty:'legendary', category:'work', icon:'👑' },

  // ===== Personal & Self-care =====
  { title:'Meditate for 10 minutes', difficulty:'easy', category:'personal', recurring:'daily', icon:'🧠' },
  { title:'Journal for 15 minutes', difficulty:'easy', category:'personal', recurring:'daily', icon:'✍️' },
  { title:'Gratitude list (3 things)', difficulty:'easy', category:'personal', recurring:'daily', icon:'🙏' },
  { title:'Make your bed', difficulty:'easy', category:'personal', recurring:'daily', icon:'🛏️' },
  { title:'Call a friend or family member', difficulty:'easy', category:'personal', icon:'📞' },
  { title:'Listen to a podcast', difficulty:'easy', category:'personal', icon:'🎧' },
  { title:'Clean your room', difficulty:'medium', category:'personal', icon:'🧹' },
  { title:'Do laundry', difficulty:'medium', category:'personal', icon:'👕' },
  { title:'Practice a hobby for 30 min', difficulty:'medium', category:'personal', icon:'🎨' },
  { title:'Digital detox for 1 hour', difficulty:'medium', category:'personal', icon:'🔌' },
  { title:'Declutter one area of your home', difficulty:'medium', category:'personal', icon:'📦' },
  { title:'No porn today', difficulty:'medium', category:'personal', recurring:'daily', icon:'🛡️' },
  { title:'No masturbation today', difficulty:'hard', category:'personal', recurring:'daily', icon:'⚔️' },
  { title:'Cold shower', difficulty:'medium', category:'personal', recurring:'daily', icon:'🚿' },
  { title:'No screen time 1hr before bed', difficulty:'medium', category:'personal', recurring:'daily', icon:'📴' },
  { title:'Cook a meal from scratch', difficulty:'hard', category:'personal', icon:'🍳' },
  { title:'Plan and budget for the month', difficulty:'hard', category:'personal', icon:'💰' },
  { title:'Deep clean the entire house', difficulty:'epic', category:'personal', icon:'✨' },
  { title:'7-day NoFap streak', difficulty:'epic', category:'personal', icon:'🔥' },
  { title:'Build a new daily routine and stick to it for a week', difficulty:'legendary', category:'personal', icon:'⚔️' },
  { title:'30-day NoFap challenge', difficulty:'legendary', category:'personal', icon:'👑' },
  { title:'Complete a 30-day self-improvement challenge', difficulty:'legendary', category:'personal', icon:'🔥' },
];

export default function QuestLog() {
  const { quests, addQuest, completeQuest, deleteQuest } = useGame();
  const [title, setTitle] = useState('');
  const [diff, setDiff] = useState('easy');
  const [category, setCategory] = useState('other');
  const [recurring, setRecurring] = useState('none');
  const [filter, setFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateCat, setTemplateCat] = useState('all');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const cfg = DIFF_CONFIG[diff];
    addQuest({
      title: title.trim(),
      difficulty: diff,
      category,
      recurring: recurring === 'none' ? undefined : recurring,
      xpReward: 20 * cfg.mult,
      goldReward: 10 * cfg.mult,
    });
    setTitle('');
  };

  const handleQuickAdd = (template) => {
    const cfg = DIFF_CONFIG[template.difficulty];
    addQuest({
      title: template.title,
      difficulty: template.difficulty,
      category: template.category,
      recurring: template.recurring || undefined,
      xpReward: 20 * cfg.mult,
      goldReward: 10 * cfg.mult,
    });
  };

  const active = quests.filter(q => q.status === 'active');
  const completed = quests.filter(q => q.status === 'completed');
  let shown = filter === 'all' ? active : active.filter(q => q.difficulty === filter);
  if (catFilter !== 'all') shown = shown.filter(q => (q.category || 'other') === catFilter);
  const selectedCfg = DIFF_CONFIG[diff];
  const selectedCat = CATEGORIES.find(c => c.id === category);
  const filteredTemplates = templateCat === 'all' ? QUEST_TEMPLATES : QUEST_TEMPLATES.filter(t => t.category === templateCat);
  const activeQuestTitles = new Set(active.map(q => q.title));

  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="page-header">
        <div>
          <h1>📜 Quest Log</h1>
          <p>Your to-do list, gamified! Add tasks as "quests" and earn XP & Gold.</p>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <span className="stat-chip xp" style={{ fontSize:12 }}>⚔️ {active.length} Active</span>
          <span className="stat-chip gold" style={{ fontSize:12 }}>✅ {completed.length} Done</span>
        </div>
      </div>

      {/* Add quest form */}
      <form onSubmit={handleAdd} className="glass-panel" style={{ display:'flex', flexDirection:'column', gap:12 }}>
        <h3>➕ New Quest</h3>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:-6 }}>Type what you need to do, pick a difficulty, then add it.</p>
        <input className="input" placeholder="What do you need to do?" value={title} onChange={e => setTitle(e.target.value)} />
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <select className="input" style={{ flex:1, minWidth:140 }} value={diff} onChange={e => setDiff(e.target.value)}>
            {Object.entries(DIFF_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label} ({v.rank}) ×{v.mult}</option>
            ))}
          </select>
          <button type="submit" className="btn btn-primary" style={{ flex:'0 0 auto' }}><Plus size={16} /> Add</button>
        </div>
        {/* Category and recurring row */}
        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Category:</span>
            <div style={{ display:'flex', gap:4 }}>
              {CATEGORIES.map(cat => (
                <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                  style={{
                    padding:'4px 10px', borderRadius:99, fontSize:12, fontWeight:600,
                    background: category === cat.id ? `${cat.color}20` : 'rgba(255,255,255,0.03)',
                    border: category === cat.id ? `1px solid ${cat.color}40` : '1px solid var(--glass-border)',
                    color: category === cat.id ? cat.color : 'var(--text-muted)',
                    cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', gap:4,
                  }}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Repeat:</span>
            <select className="input" style={{ width:120, padding:'4px 8px', fontSize:12 }} value={recurring} onChange={e => setRecurring(e.target.value)}>
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
        {/* Reward preview */}
        <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:12, color:'var(--text-secondary)', flexWrap:'wrap' }}>
          <span>Earn:</span>
          <span className="stat-chip xp" style={{ fontSize:10, padding:'2px 6px' }}>+{20 * selectedCfg.mult} XP</span>
          <span className="stat-chip gold" style={{ fontSize:10, padding:'2px 6px' }}>+{10 * selectedCfg.mult} Gold</span>
          {recurring !== 'none' && <span className="stat-chip streak" style={{ fontSize:10, padding:'2px 6px' }}><RefreshCw size={10} /> {recurring === 'daily' ? 'Daily' : 'Weekly'}</span>}
        </div>
      </form>

      {/* Quick Add Templates */}
      <div className="glass-panel" style={{ border:'1px solid rgba(168,85,247,0.15)' }}>
        <button onClick={() => setShowTemplates(!showTemplates)}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', background:'none', border:'none', color:'var(--text-primary)', cursor:'pointer', fontFamily:'inherit', padding:0 }}>
          <h3 style={{ display:'flex', alignItems:'center', gap:8, fontSize:15 }}>
            <Sparkles size={18} color="var(--accent-purple)" /> Quick Add — Pre-made Quests
            <span style={{ fontSize:12, color:'var(--text-muted)', fontWeight:400 }}>({QUEST_TEMPLATES.length} templates)</span>
          </h3>
          {showTemplates ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
        </button>
        {showTemplates && (
          <div style={{ marginTop:16, display:'flex', flexDirection:'column', gap:14 }}>
            <p style={{ fontSize:12, color:'var(--text-muted)' }}>Click any quest below to instantly add it. Already-added quests are dimmed.</p>
            {/* Category tabs */}
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              <button className={`btn btn-sm ${templateCat === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTemplateCat('all')} style={{ fontSize:12 }}>All</button>
              {CATEGORIES.filter(c => c.id !== 'other').map(cat => (
                <button key={cat.id} className={`btn btn-sm ${templateCat === cat.id ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTemplateCat(cat.id)} style={{ fontSize:12 }}>
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
            {/* Template grid */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:8 }}>
              {filteredTemplates.map((t, i) => {
                const cfg = DIFF_CONFIG[t.difficulty];
                const cat = CATEGORIES.find(c => c.id === t.category);
                const alreadyAdded = activeQuestTitles.has(t.title);
                return (
                  <button key={i} onClick={() => !alreadyAdded && handleQuickAdd(t)}
                    disabled={alreadyAdded}
                    style={{
                      display:'flex', alignItems:'center', gap:10, padding:'10px 14px',
                      background: alreadyAdded ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                      border: alreadyAdded ? '1px solid rgba(255,255,255,0.03)' : '1px solid var(--glass-border)',
                      borderRadius:10, cursor: alreadyAdded ? 'default' : 'pointer',
                      opacity: alreadyAdded ? 0.4 : 1,
                      transition:'all 0.2s', textAlign:'left', fontFamily:'inherit', color:'var(--text-primary)',
                    }}
                    onMouseOver={e => { if (!alreadyAdded) { e.currentTarget.style.borderColor = `${cfg.color}50`; e.currentTarget.style.background = `${cfg.color}08`; }}}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--glass-border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
                    title={alreadyAdded ? 'Already in your active quests' : `Click to add: ${t.title}`}>
                    <span style={{ fontSize:20, flexShrink:0 }}>{t.icon}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:600, fontSize:13, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{t.title}</div>
                      <div style={{ display:'flex', gap:6, marginTop:3, alignItems:'center' }}>
                        <span className={`rank-badge rank-${cfg.rank}`} style={{ width:16, height:16, fontSize:8 }}>{cfg.rank}</span>
                        <span style={{ fontSize:10, color:cat?.color }}>{cat?.icon} {cat?.label}</span>
                        {t.recurring && <span style={{ fontSize:10, color:'var(--text-muted)', display:'flex', alignItems:'center', gap:2 }}><RefreshCw size={8} /> {t.recurring}</span>}
                      </div>
                    </div>
                    {alreadyAdded ? (
                      <CheckCircle size={16} color="var(--success)" style={{ flexShrink:0 }} />
                    ) : (
                      <Plus size={16} color="var(--accent-purple)" style={{ flexShrink:0 }} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Rank:</span>
        <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter('all')} style={{ fontSize:12 }}>All</button>
        {Object.entries(DIFF_CONFIG).map(([k, v]) => {
          const count = active.filter(q => q.difficulty === k).length;
          return (
            <button key={k} className={`btn btn-sm ${filter === k ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(k)} style={{ fontSize:12 }}>
              <span className={`rank-badge rank-${v.rank}`} style={{ width:16, height:16, fontSize:8 }}>{v.rank}</span>
              {v.label}{count > 0 ? ` (${count})` : ''}
            </button>
          );
        })}
      </div>
      {/* Category filter */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:13, color:'var(--text-secondary)', marginRight:4 }}>Category:</span>
        <button className={`btn btn-sm ${catFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCatFilter('all')} style={{ fontSize:12 }}>All</button>
        {CATEGORIES.map(cat => {
          const count = active.filter(q => (q.category || 'other') === cat.id).length;
          return (
            <button key={cat.id} className={`btn btn-sm ${catFilter === cat.id ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setCatFilter(cat.id)} style={{ fontSize:12 }}>
              {cat.icon} {cat.label} {count > 0 && `(${count})`}
            </button>
          );
        })}
      </div>

      <div className="grid-2">
        {/* Active */}
        <div className="glass-panel" style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <h3 style={{ color:'var(--accent-gold)', borderBottom:'1px solid var(--glass-border)', paddingBottom:10 }}>
              ⚔️ Active Quests ({shown.length})
            </h3>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>Click "Done" to complete a quest and earn its rewards.</p>
          </div>
          {shown.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{filter !== 'all' || catFilter !== 'all' ? '🔍' : '📝'}</div>
              <div className="empty-state-text">
                {filter !== 'all' || catFilter !== 'all' ? 'No matching quests.' : 'Your quest board is empty!'}
                <br />{filter === 'all' && catFilter === 'all' && 'Add a task above to start earning XP.'}
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {shown.map(q => {
                const cfg = DIFF_CONFIG[q.difficulty] || DIFF_CONFIG.easy;
                const cat = CATEGORIES.find(c => c.id === (q.category || 'other')) || CATEGORIES[4];
                return (
                  <div key={q.id} className="quest-card">
                    <span className={`rank-badge rank-${cfg.rank}`} title={`${cfg.label} difficulty — ×${cfg.mult} rewards`}>{cfg.rank}</span>
                    <div className="quest-info">
                      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                        <div className="quest-title">{q.title}</div>
                        {q.recurring && <span title={`Repeats ${q.recurring}`} style={{ fontSize:12, opacity:0.6 }}><RefreshCw size={12} /></span>}
                      </div>
                      <div className="quest-rewards">
                        <span style={{ fontSize:11, padding:'2px 8px', borderRadius:99, background:`${cat.color}15`, color:cat.color, fontWeight:600 }}>{cat.icon} {cat.label}</span>
                        <span style={{ fontSize:12, color:'var(--xp-blue)', fontWeight:600 }}>+{q.xpReward} XP</span>
                        <span style={{ fontSize:12, color:'var(--accent-gold)', fontWeight:600 }}>+{q.goldReward} Gold</span>
                      </div>
                    </div>
                    <div className="quest-actions">
                      <button className="btn btn-success btn-sm" onClick={() => completeQuest(q.id)} title="Mark as complete and earn rewards">
                        <CheckCircle size={15} /> Done
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => deleteQuest(q.id)} title="Delete quest without earning rewards" style={{ color:'var(--danger)' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed */}
        <div className="glass-panel" style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <h3 style={{ color:'var(--success)', borderBottom:'1px solid var(--glass-border)', paddingBottom:10 }}>
              ✅ Completed ({completed.length})
            </h3>
            <p style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>Quests you've finished. Rewards have already been collected.</p>
          </div>
          <div style={{ maxHeight:450, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
            {completed.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🏁</div>
                <div className="empty-state-text">Completed quests appear here.<br/>Finish a quest to see it!</div>
              </div>
            ) : (
              completed.slice().reverse().map(q => {
                const cat = CATEGORIES.find(c => c.id === (q.category || 'other')) || CATEGORIES[4];
                return (
                  <div key={q.id} className="quest-card completed">
                    <CheckCircle size={18} color="var(--success)" />
                    <div style={{ flex:1, display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:14 }}>{q.title}</span>
                      {q.recurring && <RefreshCw size={11} style={{ opacity:0.5 }} />}
                    </div>
                    <span style={{ fontSize:10, padding:'2px 6px', borderRadius:99, background:`${cat.color}10`, color:cat.color }}>{cat.icon}</span>
                    <button className="btn btn-ghost btn-sm" onClick={() => deleteQuest(q.id)} style={{ color:'var(--text-muted)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
