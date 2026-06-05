import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Info, Crown, Star, Sparkles, Filter } from 'lucide-react';

const TIER_STYLES = {
  common:    { label:'Common', color:'#9ca3af', bg:'rgba(156,163,175,0.08)', glow:'none' },
  uncommon:  { label:'Uncommon', color:'#22c55e', bg:'rgba(34,197,94,0.08)', glow:'0 0 12px rgba(34,197,94,0.2)' },
  rare:      { label:'Rare', color:'#3b82f6', bg:'rgba(59,130,246,0.08)', glow:'0 0 16px rgba(59,130,246,0.25)' },
  legendary: { label:'Legendary', color:'#fbbf24', bg:'rgba(251,191,36,0.08)', glow:'0 0 20px rgba(251,191,36,0.3)' },
};

export default function Achievements() {
  const { achievements, player } = useGame();
  const [tierFilter, setTierFilter] = useState('all');
  const unlocked = achievements.filter(a => a.unlocked).length;

  const filtered = tierFilter === 'all' ? achievements : achievements.filter(a => a.tier === tierFilter);

  // Helper to show progress toward each achievement
  const getProgress = (a) => {
    if (a.unlocked) return null;
    const c = a.condition;
    if (c === 'quests_1') return { cur: Math.min(player.totalQuests, 1), max: 1 };
    if (c === 'quests_10') return { cur: Math.min(player.totalQuests, 10), max: 10 };
    if (c === 'quests_25') return { cur: Math.min(player.totalQuests, 25), max: 25 };
    if (c === 'quests_50') return { cur: Math.min(player.totalQuests, 50), max: 50 };
    if (c === 'quests_100') return { cur: Math.min(player.totalQuests, 100), max: 100 };
    if (c === 'streak_3') return { cur: Math.min(player.streakCount, 3), max: 3 };
    if (c === 'streak_7') return { cur: Math.min(player.streakCount, 7), max: 7 };
    if (c === 'streak_14') return { cur: Math.min(player.streakCount, 14), max: 14 };
    if (c === 'streak_30') return { cur: Math.min(player.streakCount, 30), max: 30 };
    if (c === 'level_5') return { cur: Math.min(player.level, 5), max: 5 };
    if (c === 'level_10') return { cur: Math.min(player.level, 10), max: 10 };
    if (c === 'level_25') return { cur: Math.min(player.level, 25), max: 25 };
    if (c === 'level_50') return { cur: Math.min(player.level, 50), max: 50 };
    if (c === 'focus_1') return { cur: Math.min(player.totalFocus, 1), max: 1 };
    if (c === 'focus_5') return { cur: Math.min(player.totalFocus, 5), max: 5 };
    if (c === 'focus_10') return { cur: Math.min(player.totalFocus, 10), max: 10 };
    if (c === 'focus_25') return { cur: Math.min(player.totalFocus, 25), max: 25 };
    if (c === 'gold_500') return { cur: Math.min(player.gold, 500), max: 500 };
    if (c === 'gold_1000') return { cur: Math.min(player.gold, 1000), max: 1000 };
    if (c === 'gold_5000') return { cur: Math.min(player.gold, 5000), max: 5000 };
    if (c === 'skill_5') return null;
    if (c === 'skill_10') return null;
    return null;
  };

  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="page-header">
        <h1>🏅 Achievements</h1>
        <p>Badges of honor for the grind. {unlocked} of {achievements.length} unlocked — keep collecting!</p>
      </div>

      {/* How achievements work */}
      <div className="glass-panel" style={{ padding:'14px 20px', display:'flex', alignItems:'flex-start', gap:10 }}>
        <Info size={16} color="var(--accent-cyan)" style={{ flexShrink:0, marginTop:2 }} />
        <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>
          <strong style={{ color:'var(--text-primary)' }}>How it works:</strong> Achievements unlock automatically when you hit milestones. They come in 4 tiers — <span style={{ color:TIER_STYLES.common.color }}>Common</span>, <span style={{ color:TIER_STYLES.uncommon.color }}>Uncommon</span>, <span style={{ color:TIER_STYLES.rare.color }}>Rare</span>, and <span style={{ color:TIER_STYLES.legendary.color, fontWeight:700 }}>✨ Legendary</span>. Unlock Legendary ones to prove you're built different.
        </div>
      </div>

      {/* Progress bar */}
      <div className="glass-panel" style={{ marginBottom:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <span style={{ fontWeight:600 }}>Overall Progress</span>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:14, color:'var(--accent-gold)' }}>
            {unlocked}/{achievements.length} ({Math.round((unlocked / achievements.length) * 100)}%)
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill gold" style={{ width:`${(unlocked / achievements.length) * 100}%` }} />
        </div>
      </div>

      {/* Tier filter */}
      <div className="filter-scroll-row">
        <Filter size={14} color="var(--text-muted)" />
        <button className={`btn btn-sm ${tierFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTierFilter('all')} style={{ fontSize:12 }}>
          All ({achievements.length})
        </button>
        {Object.entries(TIER_STYLES).map(([key, style]) => {
          const count = achievements.filter(a => a.tier === key).length;
          const unlockedInTier = achievements.filter(a => a.tier === key && a.unlocked).length;
          return (
            <button key={key} className={`btn btn-sm ${tierFilter === key ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setTierFilter(key)} style={{ fontSize:12, color: tierFilter === key ? undefined : style.color }}>
              {key === 'legendary' && <Crown size={12} />}
              {key === 'rare' && <Star size={12} />}
              {key === 'uncommon' && <Sparkles size={12} />}
              {style.label} ({unlockedInTier}/{count})
            </button>
          );
        })}
      </div>

      <div className="grid-auto">
        {filtered.map(a => {
          const progress = getProgress(a);
          const tier = TIER_STYLES[a.tier || 'common'];
          const pct = progress ? (progress.cur / progress.max) * 100 : 0;
          return (
            <div key={a.id} className={`glass-panel achievement-card ${a.unlocked ? 'unlocked' : 'locked'}`}
              style={{
                borderColor: a.unlocked ? `${tier.color}40` : undefined,
                boxShadow: a.unlocked ? tier.glow : undefined,
                position:'relative', overflow:'hidden',
              }}>
              {/* Tier tag */}
              <div style={{
                position:'absolute', top:8, right:10,
                fontSize:9, fontWeight:800, letterSpacing:0.5, textTransform:'uppercase',
                color: tier.color, background: tier.bg, padding:'2px 8px', borderRadius:99,
                border:`1px solid ${tier.color}30`,
              }}>
                {tier.label}
              </div>
              <div className="achievement-icon" style={{ filter: a.unlocked ? 'none' : 'grayscale(0.8)', fontSize:36 }}>{a.icon}</div>
              <div className="achievement-name" style={{ color: a.unlocked ? tier.color : 'var(--text-primary)' }}>{a.name}</div>
              <div className="achievement-desc" style={{ lineHeight:1.5 }}>{a.desc}</div>
              {a.unlocked ? (
                <span className="stat-chip" style={{ background:tier.bg, color:tier.color, fontSize:11, marginTop:6, border:`1px solid ${tier.color}30` }}>✅ Unlocked!</span>
              ) : (
                <div style={{ width:'100%', marginTop:6 }}>
                  {progress ? (
                    <div>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-muted)', marginBottom:3 }}>
                        <span>Progress</span>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace" }}>{progress.cur}/{progress.max}</span>
                      </div>
                      <div className="progress-track thin">
                        <div className="progress-fill" style={{ width:`${pct}%`, background:tier.color, boxShadow:`0 0 6px ${tier.color}40` }} />
                      </div>
                    </div>
                  ) : (
                    <span className="stat-chip" style={{ background:'rgba(255,255,255,0.04)', color:'var(--text-muted)', fontSize:11 }}>🔒 Locked</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
