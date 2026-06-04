import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Plus, Trash2, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const COLORS = ['#a855f7','#3b82f6','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899','#8b5cf6'];
const TEMPLATES = [
  { label: 'Morning Routine', icon: '🌅', color: '#a855f7' },
  { label: 'Study Block', icon: '📚', color: '#3b82f6' },
  { label: 'Work / Project', icon: '💻', color: '#3b82f6' },
  { label: 'Lunch Break', icon: '🥪', color: '#06b6d4' },
  { label: 'Gym / Workout', icon: '💪', color: '#22c55e' },
  { label: 'Chores / Cleaning', icon: '🧹', color: '#f59e0b' },
  { label: 'Dinner / Rest', icon: '🥗', color: '#ec4899' },
  { label: 'Wind Down / Sleep', icon: '🌙', color: '#8b5cf6' },
];
const formatHour = (h) => { if (h === 0 || h === 24) return '12 AM'; if (h === 12) return '12 PM'; return h < 12 ? `${h} AM` : `${h - 12} PM`; };

const toDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const todayKey = () => toDateKey(new Date());

const formatSelectedDate = (dateKey) => {
  const d = new Date(dateKey + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
};

const getRelativeLabel = (dateKey) => {
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(dateKey + 'T12:00:00');
  target.setHours(0,0,0,0);
  const diff = Math.round((target - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === -1) return 'Yesterday';
  if (diff === 1) return 'Tomorrow';
  return null;
};

export default function DailySchedule() {
  const { schedule, addScheduleItem, removeScheduleItem, clearSchedule, selectedDate, setSelectedDate } = useGame();
  const [editHour, setEditHour] = useState(null);
  const [label, setLabel] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const currentRef = useRef(null);
  const currentHour = new Date().getHours();
  const filledCount = Object.keys(schedule).length;
  const isToday = selectedDate === todayKey();
  const relativeLabel = getRelativeLabel(selectedDate);

  const navigateDate = (offset) => {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + offset);
    setSelectedDate(toDateKey(d));
    setEditHour(null);
  };

  const goToToday = () => {
    setSelectedDate(todayKey());
    setEditHour(null);
  };

  // Auto-scroll to current hour on mount or date change
  useEffect(() => {
    if (isToday && currentRef.current) {
      currentRef.current.scrollIntoView({ behavior:'smooth', block:'center' });
    }
  }, [isToday]);

  const handleAdd = (hour) => {
    if (!label.trim()) return;
    addScheduleItem(hour, { label: label.trim(), color });
    setLabel(''); setEditHour(null);
  };

  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:24 }}>
      <div className="page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <h1>📅 Daily Schedule</h1>
          <p>{filledCount} activities planned</p>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {!isToday && (
            <button className="btn btn-ghost btn-sm" onClick={goToToday}>
              <CalendarDays size={14} /> Today
            </button>
          )}
          <button className="btn btn-ghost btn-sm" onClick={clearSchedule}><Trash2 size={14} /> Clear Day</button>
        </div>
      </div>

      {/* Date Navigator */}
      <div className="glass-panel" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:20, padding:'14px 24px' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigateDate(-1)} style={{ padding:6 }}>
          <ChevronLeft size={20} />
        </button>
        <div style={{ textAlign:'center', minWidth:240 }}>
          <div style={{ fontSize:17, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {formatSelectedDate(selectedDate)}
            {relativeLabel && (
              <span style={{
                fontSize:11, fontWeight:600, padding:'3px 10px', borderRadius:99,
                background: isToday ? 'var(--accent-cyan-dim)' : 'var(--accent-purple-dim)',
                color: isToday ? 'var(--accent-cyan)' : 'var(--accent-purple)',
              }}>
                {relativeLabel}
              </span>
            )}
          </div>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={() => navigateDate(1)} style={{ padding:6 }}>
          <ChevronRight size={20} />
        </button>
      </div>

      {filledCount === 0 && (
        <div className="hint-box">
          <span className="hint-icon">💡</span>
          <div>
            <strong style={{ color:'var(--text-primary)' }}>Plan your day:</strong> Click on any empty time slot to add an activity. 
            Color-code your blocks to visualize work, breaks, exercise, and more.
            {isToday && ' The current hour is highlighted in cyan.'}
            {' '}Use the arrows above to navigate between dates — your schedule is saved for each day.
          </div>
        </div>
      )}

      <div className="glass-panel" style={{ display:'flex', flexDirection:'column', gap:0 }}>
        {HOURS.map(hour => {
          const item = schedule[hour];
          const isCurrent = isToday && hour === currentHour;
          const isPast = isToday && hour < currentHour;

          return (
            <div key={hour} className="schedule-row" ref={isCurrent ? currentRef : null}
              style={{ opacity: isPast && !isCurrent ? 0.5 : 1 }}>
              <div className="schedule-time" style={{ color: isCurrent ? 'var(--accent-cyan)' : undefined, fontWeight: isCurrent ? 700 : 400 }}>
                {formatHour(hour)}
              </div>

              {editHour === hour ? (
                <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', width:'100%' }}>
                    <input className="input" style={{ flex:1, minWidth:150 }} placeholder="What are you doing? (e.g. Gym, Study)" value={label}
                      onChange={e => setLabel(e.target.value)} autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleAdd(hour); if (e.key === 'Escape') setEditHour(null); }} />
                    <div style={{ display:'flex', gap:4 }}>
                      {COLORS.map(c => (
                        <button key={c} type="button" onClick={() => setColor(c)}
                          style={{ width:22, height:22, borderRadius:'50%', background:c, border: color === c ? '2px solid white' : '1px solid transparent', cursor:'pointer', transition:'all 0.15s' }} />
                      ))}
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleAdd(hour)}>Add</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditHour(null)}>✕</button>
                  </div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}>
                    <span style={{ fontSize:11, color:'var(--text-muted)' }}>Quick Templates:</span>
                    {TEMPLATES.map(t => (
                      <button key={t.label} type="button"
                        onClick={() => { setLabel(`${t.icon} ${t.label}`); setColor(t.color); }}
                        style={{
                          padding:'3px 8px', borderRadius:6, fontSize:11, fontWeight:600,
                          background:'rgba(255,255,255,0.03)', border:'1px solid var(--glass-border)',
                          color:'var(--text-secondary)', cursor:'pointer', transition:'all 0.15s'
                        }}
                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : item ? (
                <div className={`schedule-slot filled ${isCurrent ? 'current' : ''}`}
                  style={{ background:`${item.color}10`, borderColor:`${item.color}30` }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:item.color, boxShadow:`0 0 6px ${item.color}` }} />
                    <span style={{ fontWeight:600, fontSize:14 }}>{item.label}</span>
                    {isCurrent && <span className="trained-badge" style={{ background:'var(--accent-cyan-dim)', color:'var(--accent-cyan)' }}>NOW</span>}
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={() => removeScheduleItem(hour)} style={{ padding:4, color:'var(--text-muted)' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ) : (
                <div className={`schedule-slot empty ${isCurrent ? 'current' : ''}`}
                  onClick={() => { setEditHour(hour); setLabel(''); }}>
                  <span style={{ fontSize:13, color:'var(--text-muted)' }}>
                    {isCurrent ? '⚡ Current hour — click to add' : 'Click to add'}
                  </span>
                  <Plus size={15} color="var(--text-muted)" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
