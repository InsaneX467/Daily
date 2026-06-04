import React from 'react';
import { useGame } from '../context/GameContext';
import { TrendingUp, Calendar, Flame, Target, BarChart3 } from 'lucide-react';

const getLast7Days = () => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${year}-${month}-${day}`);
  }
  return days;
};

const dayLabel = (dateKey) => {
  const d = new Date(dateKey + 'T12:00:00');
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(dateKey + 'T12:00:00');
  target.setHours(0,0,0,0);
  const diff = Math.round((today - target) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yday';
  return d.toLocaleDateString('en-US', { weekday:'short' });
};

export default function WeeklyStats() {
  const { history, player, quests, skills } = useGame();
  const last7 = getLast7Days();

  const historyMap = {};
  history.forEach(h => { historyMap[h.date] = h; });

  const data = last7.map(date => ({
    date,
    label: dayLabel(date),
    quests: historyMap[date]?.quests || 0,
    skills: historyMap[date]?.skills || 0,
    streak: historyMap[date]?.streak || 0,
  }));

  const maxQuests = Math.max(...data.map(d => d.quests), 1);
  const maxSkills = Math.max(...data.map(d => d.skills), 1);
  const totalQuests7d = data.reduce((s, d) => s + d.quests, 0);
  const totalSkills7d = data.reduce((s, d) => s + d.skills, 0);
  const activeDays = data.filter(d => d.quests > 0 || d.skills > 0).length;
  const totalCompleted = quests.filter(q => q.status === 'completed').length;

  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="page-header">
        <h1>📊 Weekly Stats</h1>
        <p>Your productivity over the last 7 days. Track patterns and stay consistent!</p>
      </div>

      {/* Summary cards */}
      <div className="grid-4">
        {[
          { icon:<TrendingUp size={20} color="var(--xp-blue)" />, value:totalQuests7d, label:'Quests (7d)', bg:'var(--xp-blue-dim)' },
          { icon:<Target size={20} color="var(--accent-purple)" />, value:totalSkills7d, label:'Skills Trained (7d)', bg:'var(--accent-purple-dim)' },
          { icon:<Calendar size={20} color="var(--success)" />, value:`${activeDays}/7`, label:'Active Days', bg:'var(--success-dim)' },
          { icon:<Flame size={20} color="#f97316" />, value:player.streakCount, label:'Current Streak', bg:'rgba(249,115,22,0.15)' },
        ].map((s, i) => (
          <div key={i} className="glass-panel" style={{ display:'flex', alignItems:'center', gap:12, padding:16 }}>
            <div style={{ width:40, height:40, borderRadius:10, background:s.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>{s.icon}</div>
            <div>
              <div style={{ fontSize:20, fontWeight:800 }}>{s.value}</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quests bar chart */}
      <div className="glass-panel">
        <h3 style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
          <BarChart3 size={18} color="var(--xp-blue)" /> Quests Completed Per Day
        </h3>
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:140, padding:'0 4px' }}>
          {data.map((d, i) => (
            <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12, fontWeight:700, color: d.quests > 0 ? 'var(--xp-blue)' : 'var(--text-muted)' }}>{d.quests}</span>
              <div style={{ width:'100%', maxWidth:40, borderRadius:'6px 6px 0 0', transition:'height 0.5s ease', height: d.quests > 0 ? `${(d.quests / maxQuests) * 100}px` : '4px',
                background: d.quests > 0 ? 'linear-gradient(180deg, var(--xp-blue), rgba(59,130,246,0.3))' : 'rgba(255,255,255,0.04)',
                boxShadow: d.quests > 0 ? '0 0 12px rgba(59,130,246,0.3)' : 'none' }} />
              <span style={{ fontSize:11, color: d.label === 'Today' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: d.label === 'Today' ? 700 : 400 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Skills training chart */}
      <div className="glass-panel">
        <h3 style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20 }}>
          <Target size={18} color="var(--accent-purple)" /> Skills Trained Per Day
        </h3>
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:140, padding:'0 4px' }}>
          {data.map((d, i) => (
            <div key={d.date} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:12, fontWeight:700, color: d.skills > 0 ? 'var(--accent-purple)' : 'var(--text-muted)' }}>{d.skills}</span>
              <div style={{ width:'100%', maxWidth:40, borderRadius:'6px 6px 0 0', transition:'height 0.5s ease', height: d.skills > 0 ? `${(d.skills / maxSkills) * 100}px` : '4px',
                background: d.skills > 0 ? 'linear-gradient(180deg, var(--accent-purple), rgba(168,85,247,0.3))' : 'rgba(255,255,255,0.04)',
                boxShadow: d.skills > 0 ? '0 0 12px rgba(168,85,247,0.3)' : 'none' }} />
              <span style={{ fontSize:11, color: d.label === 'Today' ? 'var(--accent-cyan)' : 'var(--text-muted)', fontWeight: d.label === 'Today' ? 700 : 400 }}>{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All-time stats */}
      <div className="glass-panel">
        <h3 style={{ marginBottom:16 }}>🏆 All-Time Stats</h3>
        <div className="grid-3">
          {[
            { label:'Total Quests Completed', value:totalCompleted },
            { label:'Total Focus Sessions', value:player.totalFocus },
            { label:'Current Level', value:player.level },
            { label:'Highest Streak', value:`${player.streakCount} days` },
            { label:'Skills Created', value:skills.length },
            { label:'Gold Earned (lifetime)', value:`${player.gold}+` },
          ].map((s, i) => (
            <div key={i} style={{ padding:'12px 16px', background:'rgba(255,255,255,0.02)', borderRadius:10, border:'1px solid var(--glass-border)' }}>
              <div style={{ fontSize:20, fontWeight:800, marginBottom:2 }}>{s.value}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
