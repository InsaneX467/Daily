import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Coins, Plus, ShoppingBag, Trash2, Info, Sparkles, Crown, Star } from 'lucide-react';

const DEFAULT_ITEMS = [
  // Cheap treats (50-100 Gold)
  { id:1, name:'Guilt-Free Scroll', cost:50, icon:'📱', desc:'15 min of social media with zero guilt.', tier:'common' },
  { id:2, name:'Fancy Coffee', cost:60, icon:'☕', desc:'Treat yourself to that overpriced latte.', tier:'common' },
  { id:3, name:'Snack Attack', cost:50, icon:'🍫', desc:'Buy your favorite snack. You earned it.', tier:'common' },
  { id:4, name:'YouTube Binge', cost:75, icon:'▶️', desc:'30 min of guilt-free YouTube watching.', tier:'common' },
  // Mid-tier rewards (100-300 Gold)
  { id:5, name:'1 Hour Gaming', cost:150, icon:'🎮', desc:'Play your favorite game — no guilt attached.', tier:'uncommon' },
  { id:6, name:'Bubble Tea Run', cost:100, icon:'🧋', desc:'Go grab that boba you\'ve been craving.', tier:'uncommon' },
  { id:7, name:'Music Upgrade', cost:120, icon:'🎵', desc:'Buy a new song/album or upgrade playlist.', tier:'uncommon' },
  { id:8, name:'Extended Break', cost:100, icon:'😌', desc:'Take an extra 30-min break from everything.', tier:'uncommon' },
  { id:9, name:'Anime/Series Episode', cost:130, icon:'📺', desc:'Watch an episode of whatever you want.', tier:'uncommon' },
  { id:10, name:'New Wallpaper/Theme', cost:80, icon:'🎨', desc:'Spend time customizing your setup.', tier:'uncommon' },
  // Premium rewards (300-600 Gold)
  { id:11, name:'Movie Night', cost:350, icon:'🍿', desc:'Full movie session — snacks included.', tier:'rare' },
  { id:12, name:'Takeout Dinner', cost:400, icon:'🍕', desc:'Order from your favorite restaurant.', tier:'rare' },
  { id:13, name:'Sleep In', cost:500, icon:'😴', desc:'Sleep an extra hour tomorrow. Sweet dreams.', tier:'rare' },
  { id:14, name:'Shopping Spree', cost:600, icon:'🛍️', desc:'Buy something small you\'ve been eyeing.', tier:'rare' },
  { id:15, name:'New Book/Manga', cost:300, icon:'📚', desc:'Get that book or manga you\'ve wanted.', tier:'rare' },
  // Legendary rewards (800+ Gold)
  { id:16, name:'Full Day Off', cost:1000, icon:'🏖️', desc:'A whole day of doing absolutely nothing.', tier:'legendary' },
  { id:17, name:'Concert/Event Ticket', cost:1500, icon:'🎫', desc:'Treat yourself to a live event.', tier:'legendary' },
  { id:18, name:'New Game Purchase', cost:2000, icon:'🕹️', desc:'Buy that game you\'ve been waiting for.', tier:'legendary' },
  { id:19, name:'Spa Day', cost:1200, icon:'💆', desc:'Full relaxation mode activated.', tier:'legendary' },
];

const TIER_STYLES = {
  common:    { label:'Common', color:'#9ca3af', bg:'rgba(156,163,175,0.08)', border:'rgba(156,163,175,0.15)' },
  uncommon:  { label:'Uncommon', color:'#22c55e', bg:'rgba(34,197,94,0.08)', border:'rgba(34,197,94,0.15)' },
  rare:      { label:'Rare', color:'#3b82f6', bg:'rgba(59,130,246,0.08)', border:'rgba(59,130,246,0.15)' },
  legendary: { label:'Legendary', color:'#fbbf24', bg:'rgba(251,191,36,0.08)', border:'rgba(251,191,36,0.15)' },
};

export default function RewardsShop() {
  const { player, spendGold, addToast } = useGame();
  const [items, setItems] = useState(() => {
    try {
      const s = localStorage.getItem('lq_shop');
      if (s) {
        const parsed = JSON.parse(s);
        // If old format (no tier), migrate to new items
        if (parsed.length > 0 && !parsed[0].tier) return DEFAULT_ITEMS;
        return parsed;
      }
      return DEFAULT_ITEMS;
    }
    catch { return DEFAULT_ITEMS; }
  });
  const [newName, setNewName] = useState('');
  const [newCost, setNewCost] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [tierFilter, setTierFilter] = useState('all');

  // Sync items when shop is reset in localStorage (e.g. Reset All Data)
  React.useEffect(() => {
    const s = localStorage.getItem('lq_shop');
    if (!s) {
      setItems(DEFAULT_ITEMS);
    }
  }, [player]);

  const saveItems = (list) => { setItems(list); localStorage.setItem('lq_shop', JSON.stringify(list)); };

  const handleBuy = (item) => {
    if (spendGold(item.cost)) {
      addToast({ type:'reward', icon: item.icon, title:'🎉 Reward Claimed!', desc:`Enjoy your ${item.name}!` });
    } else {
      addToast({ type:'achievement', icon:'💸', title:'Not Enough Gold', desc:`Need ${item.cost - player.gold} more gold. Keep grinding!` });
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newCost) return;
    const cost = parseInt(newCost);
    const tier = cost >= 800 ? 'legendary' : cost >= 300 ? 'rare' : cost >= 100 ? 'uncommon' : 'common';
    const updated = [...items, { id:Date.now(), name:newName.trim(), cost, icon:'🎁', desc:'Custom reward you defined.', tier }];
    saveItems(updated);
    setNewName(''); setNewCost(''); setShowAdd(false);
  };

  const handleRemove = (id) => saveItems(items.filter(i => i.id !== id));

  const filtered = tierFilter === 'all' ? items : items.filter(i => i.tier === tierFilter);

  return (
    <div className="animate-in" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="page-header">
        <div>
          <h1>🏪 Rewards Shop</h1>
          <p>You grind, you earn, you <strong>treat yourself</strong>. Spend Gold on real-life rewards!</p>
        </div>
        <div className="glass-panel" style={{ display:'flex', alignItems:'center', gap:10, padding:'12px 22px', border:'1px solid rgba(251,191,36,0.2)' }}>
          <Coins size={26} color="var(--accent-gold)" />
          <div>
            <div style={{ fontSize:24, fontWeight:800, color:'var(--accent-gold)' }}>{player.gold}</div>
            <div style={{ fontSize:11, color:'var(--text-secondary)' }}>Gold Balance</div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="glass-panel" style={{ padding:'14px 20px', display:'flex', alignItems:'flex-start', gap:10 }}>
        <Info size={16} color="var(--accent-cyan)" style={{ flexShrink:0, marginTop:2 }} />
        <div style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>
          <strong style={{ color:'var(--text-primary)' }}>How it works:</strong> These are rewards <em>you</em> give yourself for being productive. "Buying" a reward deducts Gold — think of it as permission to enjoy something guilt-free. Add your own custom rewards too!
        </div>
      </div>

      {/* Tier filter + Add button */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? 'Cancel' : <><Plus size={14} /> Add Custom Reward</>}
        </button>
        <div style={{ borderLeft:'1px solid var(--glass-border)', height:20, margin:'0 4px' }} />
        <span style={{ fontSize:12, color:'var(--text-secondary)' }}>Filter:</span>
        <button className={`btn btn-sm ${tierFilter === 'all' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTierFilter('all')} style={{ fontSize:12 }}>All</button>
        {Object.entries(TIER_STYLES).map(([key, style]) => (
          <button key={key} className={`btn btn-sm ${tierFilter === key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTierFilter(key)} style={{ fontSize:12, color: tierFilter === key ? undefined : style.color }}>
            {key === 'legendary' && <Crown size={12} />}
            {key === 'rare' && <Star size={12} />}
            {key === 'uncommon' && <Sparkles size={12} />}
            {style.label}
          </button>
        ))}
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-panel animate-scale" style={{ display:'flex', gap:12, alignItems:'flex-end', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:180 }}>
            <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Reward Name</label>
            <input className="input" placeholder="e.g. Bubble Tea Run" value={newName} onChange={e => setNewName(e.target.value)} />
          </div>
          <div style={{ width:120 }}>
            <label style={{ fontSize:12, color:'var(--text-secondary)', display:'block', marginBottom:4 }}>Gold Cost</label>
            <input className="input" type="number" placeholder="100" min="1" value={newCost} onChange={e => setNewCost(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Add</button>
        </form>
      )}

      <div className="grid-auto">
        {filtered.map(item => {
          const canAfford = player.gold >= item.cost;
          const tier = TIER_STYLES[item.tier || 'common'];
          return (
            <div key={item.id} className="glass-panel glass-panel-interactive shop-item"
              style={{ borderColor: tier.border, position:'relative', overflow:'hidden' }}>
              {/* Tier ribbon */}
              {item.tier && item.tier !== 'common' && (
                <div style={{
                  position:'absolute', top:8, right:-28, transform:'rotate(45deg)', padding:'2px 32px',
                  fontSize:9, fontWeight:800, letterSpacing:1, textTransform:'uppercase',
                  background: tier.color, color:'#000', zIndex:1,
                }}>
                  {tier.label}
                </div>
              )}
              {!canAfford && (
                <div className="shop-item-overlay">
                  <span className="stat-chip hp" style={{ fontSize:13 }}>🔒 Need {item.cost - player.gold} more Gold</span>
                </div>
              )}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div className="shop-item-icon" style={{ background: tier.bg, border:`1px solid ${tier.border}` }}>{item.icon}</div>
                <button onClick={() => handleRemove(item.id)} className="btn btn-ghost btn-sm" style={{ color:'var(--text-muted)', padding:4 }} title="Remove this reward">
                  <Trash2 size={13} />
                </button>
              </div>
              <div>
                <h3 style={{ fontSize:15, marginBottom:4 }}>{item.name}</h3>
                <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.5 }}>{item.desc}</p>
              </div>
              <button className={`btn btn-block ${canAfford ? 'btn-primary' : 'btn-ghost'}`} onClick={() => handleBuy(item)} disabled={!canAfford}
                style={{ display:'flex', justifyContent:'space-between', marginTop:'auto' }}
                title={canAfford ? `Spend ${item.cost} Gold` : `Need ${item.cost - player.gold} more Gold`}>
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><ShoppingBag size={14} /> {canAfford ? 'Claim Reward' : 'Locked'}</span>
                <span style={{ display:'flex', alignItems:'center', gap:4, color: canAfford ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight:800 }}>
                  {item.cost} <Coins size={13} />
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
