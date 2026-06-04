import React, { useState, useMemo } from 'react';
import { useGame } from './context/GameContext';
import Dashboard from './components/Dashboard';
import QuestLog from './components/QuestLog';
import SkillTree from './components/SkillTree';
import FocusArena from './components/FocusArena';
import RewardsShop from './components/RewardsShop';
import DailySchedule from './components/DailySchedule';
import Achievements from './components/Achievements';
import WeeklyStats from './components/WeeklyStats';
import { LayoutDashboard, Scroll, BrainCircuit, Timer, Store, CalendarDays, Medal, RotateCcw, BarChart3 } from 'lucide-react';

const NAV = [
  { section: 'COMMAND CENTER', items: [
    { id:'dashboard', label:'Dashboard', icon: LayoutDashboard, desc:'Overview of your progress' },
    { id:'schedule', label:'Daily Schedule', icon: CalendarDays, desc:'Plan your day hour by hour' },
    { id:'stats', label:'Weekly Stats', icon: BarChart3, desc:'Charts & progress trends' },
  ]},
  { section: 'ADVENTURE', items: [
    { id:'quests', label:'Quest Log', icon: Scroll, desc:'Your to-do list as quests' },
    { id:'skills', label:'Skill Tree', icon: BrainCircuit, desc:'Daily habits to train' },
    { id:'arena', label:'Focus Arena', icon: Timer, desc:'Timed focus sessions' },
  ]},
  { section: 'REWARDS', items: [
    { id:'shop', label:'Rewards Shop', icon: Store, desc:'Spend Gold on treats' },
    { id:'achievements', label:'Achievements', icon: Medal, desc:'Milestones & badges' },
  ]},
];

// Mobile bottom nav — all key tabs
const MOBILE_NAV = [
  { id:'dashboard', label:'Home', icon: LayoutDashboard },
  { id:'quests', label:'Quests', icon: Scroll },
  { id:'schedule', label:'Schedule', icon: CalendarDays },
  { id:'skills', label:'Skills', icon: BrainCircuit },
  { id:'arena', label:'Focus', icon: Timer },
  { id:'shop', label:'Shop', icon: Store },
];

function Particles() {
  const particles = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      animDuration: `${8 + Math.random() * 15}s`,
      animDelay: `${Math.random() * 10}s`,
      size: `${1 + Math.random() * 2}px`,
      opacity: 0.12 + Math.random() * 0.15,
    }))
  , []);
  return (
    <div className="particles">
      {particles.map(p => (
        <div key={p.id} className="particle" style={{ left:p.left, width:p.size, height:p.size, opacity:p.opacity, animationDuration:p.animDuration, animationDelay:p.animDelay }} />
      ))}
    </div>
  );
}

function Confetti({ show }) {
  const pieces = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      color: ['#fbbf24','#a855f7','#3b82f6','#22c55e','#ef4444','#ec4899','#06b6d4'][Math.floor(Math.random() * 7)],
      delay: `${Math.random() * 0.5}s`,
      duration: `${1.5 + Math.random() * 1.5}s`,
      size: 6 + Math.random() * 6,
      rotation: Math.random() * 360,
    }))
  , [show]);

  if (!show) return null;
  return (
    <div className="confetti-container">
      {pieces.map(p => (
        <div key={p.id} className="confetti-piece" style={{
          left: p.left,
          width: p.size,
          height: p.size * 0.4,
          background: p.color,
          animationDelay: p.delay,
          animationDuration: p.duration,
          transform: `rotate(${p.rotation}deg)`,
        }} />
      ))}
    </div>
  );
}

function OnboardingModal({ onSave }) {
  const [name, setName] = useState('');
  return (
    <div className="modal-overlay">
      <div className="modal-content animate-scale" style={{ maxWidth:500, textAlign:'center' }}>
        <div style={{ fontSize:48, marginBottom:12 }}>⚔️</div>
        <h1 style={{ fontSize:24, marginBottom:6 }}>Welcome to LifeQuest</h1>
        <p style={{ color:'var(--text-secondary)', marginBottom:20, fontSize:14, lineHeight:1.7 }}>
          Turn your daily tasks into epic quests.<br />
          Build habits, earn XP, and level up your real life.
        </p>

        {/* Mini feature tour */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:8, marginBottom:24, textAlign:'center' }}>
          {[
            { icon:'📝', title:'Add Quests', desc:'Turn your tasks into quests with XP & Gold rewards' },
            { icon:'📈', title:'Level Up', desc:'Earn XP to level up and unlock new titles' },
            { icon:'🎁', title:'Earn Rewards', desc:'Spend Gold on real treats you define yourself' },
          ].map(f => (
            <div key={f.title} style={{ padding:'12px 8px', background:'rgba(255,255,255,0.03)', borderRadius:10, border:'1px solid var(--glass-border)' }}>
              <div style={{ fontSize:24, marginBottom:4 }}>{f.icon}</div>
              <div style={{ fontWeight:700, fontSize:12, marginBottom:4 }}>{f.title}</div>
              <div style={{ fontSize:10, color:'var(--text-muted)', lineHeight:1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign:'left', marginBottom:20 }}>
          <label style={{ fontSize:13, color:'var(--text-secondary)', display:'block', marginBottom:6, fontWeight:500 }}>What should we call you, hero?</label>
          <input className="input" placeholder="Enter your hero name..." value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onSave(name.trim()); }}
            style={{ fontSize:16, padding:'12px 16px' }} autoFocus />
        </div>
        <button className="btn btn-primary btn-block btn-lg" onClick={() => onSave(name.trim() || 'Hero')} style={{ marginBottom:12 }}>
          Begin Your Adventure →
        </button>
        <p style={{ fontSize:12, color:'var(--text-muted)' }}>You can change your name later. Reset progress anytime from the sidebar.</p>
      </div>
    </div>
  );
}

function ConfirmDialog({ dialog, onClose }) {
  if (!dialog) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-scale" onClick={e => e.stopPropagation()} style={{ maxWidth:380, textAlign:'center' }}>
        <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
        <p style={{ fontSize:15, marginBottom:24, lineHeight:1.6 }}>{dialog.message}</p>
        <div style={{ display:'flex', gap:12 }}>
          <button className="btn btn-ghost btn-block" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger btn-block" onClick={dialog.onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const { player, heroName, title, xpPercent, toasts, floatingXps, confirmDialog, closeConfirm,
    showOnboarding, saveHeroName, activeQuestCount, trainedTodayCount, skills, resetAllData, showConfetti } = useGame();
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={setActiveTab} />;
      case 'schedule': return <DailySchedule />;
      case 'stats': return <WeeklyStats />;
      case 'quests': return <QuestLog />;
      case 'skills': return <SkillTree />;
      case 'arena': return <FocusArena />;
      case 'shop': return <RewardsShop />;
      case 'achievements': return <Achievements />;
      default: return <Dashboard onNavigate={setActiveTab} />;
    }
  };

  const getBadge = (item) => {
    if (item.id === 'quests' && activeQuestCount > 0) return activeQuestCount;
    if (item.id === 'skills') {
      const untrained = skills.length - trainedTodayCount;
      if (untrained > 0) return untrained;
    }
    return null;
  };

  return (
    <>
      <Particles />
      <Confetti show={showConfetti} />
      {showOnboarding && <OnboardingModal onSave={saveHeroName} />}
      <ConfirmDialog dialog={confirmDialog} onClose={closeConfirm} />

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div className="toast-icon">{t.icon}</div>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              <div className="toast-desc">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating XP */}
      {floatingXps.map(f => (
        <div key={f.id} className="floating-xp" style={{ left:f.x, top:f.y, color:f.color }}>{f.text}</div>
      ))}

      <div className="app-shell">
        {/* Mobile sticky header with player info */}
        <div className="mobile-header">
          <div className="level-orb">{player.level}</div>
          <div className="player-info">
            <div className="player-name">{heroName || 'Hero'}</div>
            <div className="player-title">{title}</div>
          </div>
          <div className="mobile-stats">
            <span className="stat-chip gold">💰 {player.gold}</span>
            <span className="stat-chip streak">🔥 {player.streakCount}</span>
          </div>
        </div>

        {/* Desktop sidebar */}
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">⚔️</span>
            <h2>LifeQuest</h2>
          </div>

          <div className="sidebar-player">
            <div className="level-orb">{player.level}</div>
            <div className="player-info">
              <div className="player-name">{heroName || 'Hero'}</div>
              <div className="player-title">{title}</div>
              <div className="sidebar-xp-bar">
                <div className="sidebar-xp-fill" style={{ width:`${xpPercent}%` }} />
              </div>
            </div>
          </div>

          {/* Quick stats under player */}
          <div style={{ display:'flex', gap:6, padding:'0 4px', marginBottom:4 }}>
            <div className="stat-chip gold" style={{ flex:1, justifyContent:'center', fontSize:12, padding:'4px 8px' }} title="Gold earned from completing quests and focus sessions">
              💰 {player.gold} Gold
            </div>
            <div className="stat-chip streak" style={{ flex:1, justifyContent:'center', fontSize:12, padding:'4px 8px' }} title="Consecutive days with completed tasks">
              🔥 {player.streakCount}d Streak
            </div>
          </div>

          {NAV.map(group => (
            <div className="nav-section" key={group.section}>
              <div className="nav-label">{group.section}</div>
              {group.items.map(item => {
                const badge = getBadge(item);
                return (
                  <div key={item.id} className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(item.id)} title={item.desc}>
                    <item.icon size={18} />
                    <div style={{ flex:1, display:'flex', flexDirection:'column' }}>
                      <span>{item.label}</span>
                      {activeTab !== item.id && <span style={{ fontSize:10, color:'var(--text-muted)', marginTop:1 }}>{item.desc}</span>}
                    </div>
                    {badge !== null && (
                      <span className="nav-badge">{badge}</span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          <div style={{ marginTop:'auto', padding:'12px', borderTop:'1px solid var(--glass-border)', display:'flex', flexDirection:'column', gap:10, alignItems:'center' }}>
            <button className="btn btn-ghost btn-sm" onClick={resetAllData}
              style={{ width:'100%', color:'var(--danger)', borderColor:'rgba(239,68,68,0.2)', fontSize:12, gap:6 }}>
              <RotateCcw size={13} /> Reset All Data
            </button>
            <span style={{ fontSize:11, color:'var(--text-muted)' }}>LifeQuest v2.0 — Level up your life</span>
          </div>
        </aside>

        <main className="main-area">
          {renderContent()}
        </main>

        {/* Mobile bottom navigation */}
        <nav className="mobile-nav">
          {MOBILE_NAV.map(item => {
            const badge = getBadge(item);
            return (
              <button key={item.id} className={`mobile-nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}>
                <item.icon size={20} />
                <span>{item.label}</span>
                {badge !== null && badge > 0 && (
                  <span className="mobile-nav-badge">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default App;
