import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const GameContext = createContext();
export const useGame = () => useContext(GameContext);

const CLASS_DATA = [
  { title:'Novice',     icon:'🌱', color:'#9ca3af', minLevel:1 },
  { title:'Apprentice', icon:'📘', color:'#22c55e', minLevel:4 },
  { title:'Warrior',    icon:'⚔️', color:'#3b82f6', minLevel:7 },
  { title:'Knight',     icon:'🛡️', color:'#06b6d4', minLevel:10 },
  { title:'Champion',   icon:'🏆', color:'#a855f7', minLevel:13 },
  { title:'Hero',       icon:'🦸', color:'#ec4899', minLevel:16 },
  { title:'Legend',     icon:'🌟', color:'#f59e0b', minLevel:19 },
  { title:'Mythic',     icon:'👑', color:'#fbbf24', minLevel:22 },
];
const getTitle = (level) => CLASS_DATA[Math.min(Math.floor((level - 1) / 3), CLASS_DATA.length - 1)].title;
const getClassData = (level) => CLASS_DATA[Math.min(Math.floor((level - 1) / 3), CLASS_DATA.length - 1)];
const xpForLevel = (level) => level * 120;

// Journey milestones for the progress map
const JOURNEY_MILESTONES = [
  { level:1,  label:'Begin',       icon:'🌱', desc:'Your adventure starts here' },
  { level:5,  label:'Proven',      icon:'⚔️', desc:'No longer a beginner' },
  { level:10, label:'Veteran',     icon:'🛡️', desc:'Battle-hardened adventurer' },
  { level:15, label:'Elite',       icon:'🔥', desc:'Among the top ranks' },
  { level:25, label:'Legendary',   icon:'🌟', desc:'Your name echoes in halls' },
  { level:50, label:'Ascended',    icon:'👑', desc:'Transcended mortal limits' },
];

// Combo thresholds
const COMBO_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const getComboBonus = (combo) => {
  if (combo >= 5) return 0.30;
  if (combo >= 3) return 0.20;
  if (combo >= 2) return 0.10;
  return 0;
};

// Lucky drop system
const rollLuckyDrop = () => {
  if (Math.random() > 0.15) return null; // 15% chance
  const roll = Math.random();
  if (roll < 0.60) return { tier:'common',    gold: 5 + Math.floor(Math.random() * 11), xp: 0, label:'a few coins' };
  if (roll < 0.90) return { tier:'rare',      gold: 20 + Math.floor(Math.random() * 31), xp: 15 + Math.floor(Math.random() * 20), label:'rare loot' };
  return               { tier:'legendary', gold: 50 + Math.floor(Math.random() * 51), xp: 40 + Math.floor(Math.random() * 30), label:'LEGENDARY loot' };
};
const today = () => new Date().toDateString();
const toDateKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const todayKey = () => toDateKey(new Date());

const CATEGORIES = [
  { id:'work', label:'Work', color:'#3b82f6', icon:'💼' },
  { id:'health', label:'Health', color:'#22c55e', icon:'💪' },
  { id:'personal', label:'Personal', color:'#a855f7', icon:'🏠' },
  { id:'study', label:'Study', color:'#f59e0b', icon:'📚' },
  { id:'other', label:'Other', color:'#6b7280', icon:'📌' },
];

const DEFAULT_ACHIEVEMENTS = [
  // === Quest Milestones ===
  { id:'first_quest', name:'Baby\'s First Quest', desc:'Complete your very first quest. Everyone starts somewhere!', icon:'🗡️', unlocked:false, condition:'quests_1', tier:'common' },
  { id:'quest_10', name:'Getting Dangerous', desc:'10 quests slain. You\'re starting to become a threat.', icon:'⚔️', unlocked:false, condition:'quests_10', tier:'uncommon' },
  { id:'quest_25', name:'Quest Devourer', desc:'25 quests obliterated. They fear you now.', icon:'🐉', unlocked:false, condition:'quests_25', tier:'rare' },
  { id:'quest_50', name:'The Completionist', desc:'50 quests done. You\'re built different.', icon:'🏆', unlocked:false, condition:'quests_50', tier:'rare' },
  { id:'quest_100', name:'Centurion', desc:'100 quests completed. Absolute legend.', icon:'💀', unlocked:false, condition:'quests_100', tier:'legendary' },
  // === Streak Badges ===
  { id:'streak_3', name:'Warming Up', desc:'3-day streak! Consistency is starting to click.', icon:'🔥', unlocked:false, condition:'streak_3', tier:'common' },
  { id:'streak_7', name:'Week Warrior', desc:'7-day streak! A whole week of grinding. Respect.', icon:'💫', unlocked:false, condition:'streak_7', tier:'uncommon' },
  { id:'streak_14', name:'Two-Week Terror', desc:'14-day streak! You can\'t be stopped.', icon:'⚡', unlocked:false, condition:'streak_14', tier:'rare' },
  { id:'streak_30', name:'Iron Will', desc:'30-DAY STREAK. You are genuinely built different.', icon:'🌟', unlocked:false, condition:'streak_30', tier:'legendary' },
  // === Level Milestones ===
  { id:'level_5', name:'Not a Noob Anymore', desc:'Level 5 — you\'ve proven you\'re serious.', icon:'⭐', unlocked:false, condition:'level_5', tier:'common' },
  { id:'level_10', name:'Double Digits', desc:'Level 10! Real ones know the grind it took.', icon:'💎', unlocked:false, condition:'level_10', tier:'uncommon' },
  { id:'level_25', name:'Quarter Century', desc:'Level 25. You\'ve transcended mortal productivity.', icon:'👑', unlocked:false, condition:'level_25', tier:'rare' },
  { id:'level_50', name:'The Ascended', desc:'Level 50?! Touch grass... actually, you earned indoor time.', icon:'🦅', unlocked:false, condition:'level_50', tier:'legendary' },
  // === Focus Arena ===
  { id:'focus_1', name:'First Blood', desc:'Won your first battle against the Distraction Demon.', icon:'🧠', unlocked:false, condition:'focus_1', tier:'common' },
  { id:'focus_5', name:'Zen Mode', desc:'5 focus sessions. Your attention span is leveling up.', icon:'🧘', unlocked:false, condition:'focus_5', tier:'uncommon' },
  { id:'focus_10', name:'Laser Focus', desc:'10 sessions of pure concentration. Unstoppable.', icon:'🔬', unlocked:false, condition:'focus_10', tier:'rare' },
  { id:'focus_25', name:'Time Lord', desc:'25 focus sessions. You bend time to your will.', icon:'⏳', unlocked:false, condition:'focus_25', tier:'legendary' },
  // === Gold Milestones ===
  { id:'gold_500', name:'Bread Winner', desc:'500 Gold stacked. The bag is getting heavy.', icon:'💰', unlocked:false, condition:'gold_500', tier:'uncommon' },
  { id:'gold_1000', name:'Rich Kid', desc:'1,000 Gold! Time to splurge in the shop.', icon:'💎', unlocked:false, condition:'gold_1000', tier:'rare' },
  { id:'gold_5000', name:'Dragon\'s Hoard', desc:'5,000 Gold accumulated. You\'re basically Scrooge McDuck.', icon:'🐲', unlocked:false, condition:'gold_5000', tier:'legendary' },
  // === Skill Mastery ===
  { id:'skill_5', name:'Habit Forged', desc:'Any skill at level 5. A real habit has been born.', icon:'🎯', unlocked:false, condition:'skill_5', tier:'uncommon' },
  { id:'skill_10', name:'Grand Master', desc:'Any skill at level 10. You\'ve achieved true mastery.', icon:'🏅', unlocked:false, condition:'skill_10', tier:'legendary' },
  // === Special ===
  { id:'night_owl', name:'Night Owl', desc:'Complete a quest after midnight. We don\'t sleep here.', icon:'🦉', unlocked:false, condition:'night_owl', tier:'rare' },
  { id:'early_bird', name:'Early Bird', desc:'Complete a quest before 7 AM. Rise and grind.', icon:'🐦', unlocked:false, condition:'early_bird', tier:'rare' },
];

const DEFAULT_SKILLS = [
  { id:'s1', name:'Fitness', level:1, xp:0, icon:'dumbbell', color:'#ef4444', trainedToday:false, lastTrainDate:null },
  { id:'s2', name:'Intelligence', level:1, xp:0, icon:'book-open', color:'#3b82f6', trainedToday:false, lastTrainDate:null },
  { id:'s3', name:'Creativity', level:1, xp:0, icon:'palette', color:'#a855f7', trainedToday:false, lastTrainDate:null },
  { id:'s4', name:'Discipline', level:1, xp:0, icon:'shield', color:'#f59e0b', trainedToday:false, lastTrainDate:null },
];

const DEFAULT_PLAYER = {
  level:1, xp:0, gold:0, hp:100, maxHp:100, mana:50, maxMana:50,
  streakCount:0, lastActiveDate:null, totalQuests:0, totalFocus:0
};

const load = (key, fallback) => {
  try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback; }
  catch { return fallback; }
};

// Generate daily challenges based on current state
const generateDailyChallenges = (player, quests, skills) => {
  const t = todayKey();
  const saved = load('lq_dailyChallenges', null);
  if (saved && saved.date === t) return saved.challenges;

  const activeCount = quests.filter(q => q.status === 'active').length;
  const pool = [
    { id:'dc_quests3', title:'Complete 3 quests today', icon:'⚔️', target:3, type:'quests_today', xp:60, gold:30 },
    { id:'dc_quests5', title:'Complete 5 quests today', icon:'🗡️', target:5, type:'quests_today', xp:120, gold:60 },
    { id:'dc_train_all', title:'Train all your skills', icon:'🎯', target:skills.length, type:'skills_trained', xp:80, gold:40 },
    { id:'dc_focus1', title:'Complete a focus session', icon:'🧠', target:1, type:'focus_today', xp:50, gold:25 },
    { id:'dc_add3', title:'Add 3 new quests', icon:'📜', target:3, type:'quests_added', xp:30, gold:15 },
  ];

  // Pick 3 random challenges
  const shuffled = pool.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, 3).map(c => ({ ...c, completed: false, progress: 0 }));
  const data = { date: t, challenges: selected };
  localStorage.setItem('lq_dailyChallenges', JSON.stringify(data));
  return selected;
};

export { CATEGORIES, CLASS_DATA, JOURNEY_MILESTONES };

export const GameProvider = ({ children }) => {
  const [heroName, setHeroName] = useState(() => load('lq_heroName', ''));
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('lq_heroName'));
  const [player, setPlayer] = useState(() => load('lq_player', DEFAULT_PLAYER));
  const [quests, setQuests] = useState(() => load('lq_quests', []));
  const [skills, setSkills] = useState(() => {
    const saved = load('lq_skills', DEFAULT_SKILLS);
    const t = today();
    return saved.map(s => s.lastTrainDate !== t ? { ...s, trainedToday: false } : s);
  });
  const [achievements, setAchievements] = useState(() => {
    const saved = load('lq_achievements', null);
    if (!saved) return DEFAULT_ACHIEVEMENTS;
    // Merge: keep unlocked status from saved, but always use tier/desc/name from defaults
    // Also add any new achievements that weren't in the old save
    const savedMap = {};
    saved.forEach(a => { savedMap[a.id] = a; });
    return DEFAULT_ACHIEVEMENTS.map(def => ({
      ...def,
      unlocked: savedMap[def.id]?.unlocked || false,
    }));
  });
  const [allSchedules, setAllSchedules] = useState(() => {
    const saved = load('lq_schedules', null);
    if (saved) return saved;
    const oldSchedule = load('lq_schedule', null);
    if (oldSchedule && Object.keys(oldSchedule).length > 0) {
      const migrated = { [todayKey()]: oldSchedule };
      localStorage.removeItem('lq_schedule');
      return migrated;
    }
    return {};
  });
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const schedule = allSchedules[selectedDate] || {};
  const [toasts, setToasts] = useState([]);
  const [floatingXps, setFloatingXps] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [dailyChallenges, setDailyChallenges] = useState(() => generateDailyChallenges(player, quests, skills));
  const [history, setHistory] = useState(() => load('lq_history', []));
  const [showConfetti, setShowConfetti] = useState(false);
  const [comboCount, setComboCount] = useState(() => load('lq_combo', { count: 0, lastTime: 0 }));

  // Persist
  useEffect(() => { localStorage.setItem('lq_player', JSON.stringify(player)); }, [player]);
  useEffect(() => { localStorage.setItem('lq_quests', JSON.stringify(quests)); }, [quests]);
  useEffect(() => { localStorage.setItem('lq_skills', JSON.stringify(skills)); }, [skills]);
  useEffect(() => { localStorage.setItem('lq_achievements', JSON.stringify(achievements)); }, [achievements]);
  useEffect(() => { localStorage.setItem('lq_schedules', JSON.stringify(allSchedules)); }, [allSchedules]);
  useEffect(() => { localStorage.setItem('lq_heroName', JSON.stringify(heroName)); }, [heroName]);
  useEffect(() => { localStorage.setItem('lq_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('lq_combo', JSON.stringify(comboCount)); }, [comboCount]);

  // Record daily history
  useEffect(() => {
    const t = todayKey();
    const todayCompleted = quests.filter(q => q.status === 'completed' && q.completedAt && toDateKey(new Date(q.completedAt)) === t).length;
    const todayTrained = skills.filter(s => s.trainedToday).length;
    setHistory(prev => {
      const existing = prev.find(h => h.date === t);
      const entry = { date: t, quests: todayCompleted, skills: todayTrained, xp: player.xp, level: player.level, streak: player.streakCount };
      if (existing) {
        return prev.map(h => h.date === t ? entry : h);
      }
      return [...prev.slice(-29), entry]; // Keep last 30 days
    });
  }, [quests, skills, player.xp, player.level, player.streakCount]);

  // Spawn recurring quests on load
  useEffect(() => {
    const t = todayKey();
    const lastRecurCheck = load('lq_lastRecurCheck', null);
    if (lastRecurCheck === t) return;

    const recurring = quests.filter(q => q.recurring && (q.status === 'completed' || q.status === 'active'));
    let added = false;
    recurring.forEach(q => {
      if (q.status !== 'completed') return;
      const completedDate = q.completedAt ? toDateKey(new Date(q.completedAt)) : null;
      const shouldSpawn = q.recurring === 'daily' || (q.recurring === 'weekly' && completedDate && (() => {
        const d = new Date(completedDate);
        const daysSince = Math.floor((new Date(t) - d) / 86400000);
        return daysSince >= 7;
      })());
      if (shouldSpawn) {
        const newQuest = {
          ...q,
          id: Date.now().toString() + Math.random().toString(36).slice(2),
          status: 'active',
          createdAt: new Date().toISOString(),
          completedAt: undefined,
        };
        setQuests(prev => [...prev, newQuest]);
        added = true;
      }
    });
    if (added) {
      addToast({ type:'reward', icon:'🔁', title:'Recurring Quests', desc:'Your recurring quests have been refreshed!' });
    }
    localStorage.setItem('lq_lastRecurCheck', JSON.stringify(t));
  }, []);

  const saveHeroName = useCallback((name) => {
    setHeroName(name);
    setShowOnboarding(false);
    setDailyChallenges(generateDailyChallenges(DEFAULT_PLAYER, [], DEFAULT_SKILLS));
  }, []);

  // Confirm dialog
  const showConfirm = useCallback((message, onConfirm) => {
    setConfirmDialog({ message, onConfirm });
  }, []);
  const closeConfirm = useCallback(() => setConfirmDialog(null), []);

  // Toast system
  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // Confetti trigger
  const triggerConfetti = useCallback(() => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);
  }, []);

  // Floating XP
  const showFloatingXp = useCallback((text, color = '#3b82f6') => {
    const id = Date.now() + Math.random();
    const x = 300 + Math.random() * 300;
    const y = 150 + Math.random() * 200;
    setFloatingXps(prev => [...prev, { id, text, color, x, y }]);
    setTimeout(() => setFloatingXps(prev => prev.filter(f => f.id !== id)), 1300);
  }, []);
  // Game actions
  const gainXp = useCallback((amount) => {
    const streakMultiplier = 1 + (player.streakCount * 0.1);
    const boosted = Math.round(amount * streakMultiplier);
    showFloatingXp(`+${boosted} XP`);
    setPlayer(prev => {
      let newXp = prev.xp + boosted;
      let newLevel = prev.level;
      let newMaxHp = prev.maxHp, newMaxMana = prev.maxMana;
      let hp = prev.hp, mana = prev.mana;
      let leveledUp = false;
      while (newXp >= xpForLevel(newLevel)) {
        newXp -= xpForLevel(newLevel);
        newLevel++;
        newMaxHp += 10; newMaxMana += 5;
        hp = newMaxHp; mana = newMaxMana;
        leveledUp = true;
      }
      if (leveledUp) {
        const lvl = newLevel;
        setTimeout(() => {
          addToast({ type:'levelup', icon:'⬆️', title:`Level Up! Level ${lvl}`, desc:`You are now a ${getTitle(lvl)}!` });
          triggerConfetti();
        }, 0);
      }
      return { ...prev, xp:newXp, level:newLevel, hp, mana, maxHp:newMaxHp, maxMana:newMaxMana };
    });
  }, [player.streakCount, showFloatingXp, addToast, triggerConfetti]);

  const gainGold = useCallback((amount) => {
    if (amount > 0) showFloatingXp(`+${amount} Gold`, '#fbbf24');
    setPlayer(prev => ({ ...prev, gold: Math.max(0, prev.gold + amount) }));
  }, [showFloatingXp]);

  const spendGold = useCallback((amount) => {
    if (player.gold < amount) return false;
    setPlayer(prev => ({ ...prev, gold: prev.gold - amount }));
    return true;
  }, [player.gold]);

  const takeDamage = useCallback((amount) => {
    showFloatingXp(`-${amount} HP`, '#ef4444');
    setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - amount) }));
  }, [showFloatingXp]);

  // Update daily challenges progress
  const updateChallengeProgress = useCallback((type, value) => {
    setDailyChallenges(prev => {
      let challengeCompleted = null;
      const next = prev.map(c => {
        if (c.type !== type || c.completed) return c;
        const newProgress = Math.min(value, c.target);
        if (newProgress >= c.target && !c.completed) {
          challengeCompleted = c;
          return { ...c, progress: newProgress, completed: true };
        }
        return { ...c, progress: newProgress };
      });

      if (challengeCompleted) {
        const c = challengeCompleted;
        const savedData = { date: todayKey(), challenges: next };
        localStorage.setItem('lq_dailyChallenges', JSON.stringify(savedData));
        setTimeout(() => {
          addToast({ type:'achievement', icon:'🏆', title:'Challenge Complete!', desc: c.title });
          gainXp(c.xp);
          gainGold(c.gold);
        }, 0);
        return next;
      }

      const progressChanged = prev.some((c, idx) => c.type === type && c.progress !== next[idx].progress);
      if (progressChanged) {
        const savedData = { date: todayKey(), challenges: next };
        localStorage.setItem('lq_dailyChallenges', JSON.stringify(savedData));
        return next;
      }

      return prev;
    });
  }, [addToast, gainXp, gainGold]);

  // Check achievements
  const checkAchievements = useCallback((p, q, s) => {
    const completedCount = q.filter(x => x.status === 'completed').length;
    const maxSkillLevel = Math.max(...s.map(x => x.level), 0);
    const hour = new Date().getHours();
    const checks = {
      quests_1: completedCount >= 1, quests_10: completedCount >= 10,
      quests_25: completedCount >= 25, quests_50: completedCount >= 50, quests_100: completedCount >= 100,
      streak_3: p.streakCount >= 3, streak_7: p.streakCount >= 7,
      streak_14: p.streakCount >= 14, streak_30: p.streakCount >= 30,
      level_5: p.level >= 5, level_10: p.level >= 10, level_25: p.level >= 25, level_50: p.level >= 50,
      focus_1: p.totalFocus >= 1, focus_5: p.totalFocus >= 5,
      focus_10: p.totalFocus >= 10, focus_25: p.totalFocus >= 25,
      gold_500: p.gold >= 500, gold_1000: p.gold >= 1000, gold_5000: p.gold >= 5000,
      skill_5: maxSkillLevel >= 5, skill_10: maxSkillLevel >= 10,
      night_owl: completedCount > 0 && (hour >= 0 && hour < 5),
      early_bird: completedCount > 0 && (hour >= 5 && hour < 7),
    };
    setAchievements(prev => {
      let changed = false;
      const next = prev.map(a => {
        if (!a.unlocked && checks[a.condition]) {
          changed = true;
          addToast({ type:'achievement', icon: a.icon, title:'🏆 Achievement Unlocked!', desc: a.name });
          triggerConfetti();
          return { ...a, unlocked: true };
        }
        return a;
      });
      return changed ? next : prev;
    });
  }, [addToast, triggerConfetti]);

  // Auto-check achievements when state changes
  useEffect(() => {
    if (heroName) {
      checkAchievements(player, quests, skills);
    }
  }, [player, quests, skills, heroName, checkAchievements]);

  // Streak check on load
  useEffect(() => {
    const t = today();
    if (player.lastActiveDate && player.lastActiveDate !== t) {
      const last = new Date(player.lastActiveDate);
      const diff = Math.floor((new Date(t) - last) / 86400000);
      if (diff > 1) {
        setPlayer(prev => ({ ...prev, streakCount: 0, lastActiveDate: t }));
      }
    }
  }, []);
  const addQuest = useCallback((quest) => {
    const newQuest = { ...quest, id: Date.now().toString(), status:'active', createdAt: new Date().toISOString() };
    setQuests(prev => [...prev, newQuest]);
    addToast({ type:'reward', icon:'📜', title:'New Quest Added!', desc: quest.title });
    const todayAdded = quests.filter(q => q.createdAt && toDateKey(new Date(q.createdAt)) === todayKey()).length + 1;
    updateChallengeProgress('quests_added', todayAdded);
  }, [quests, addToast, updateChallengeProgress]);

  const completeQuest = useCallback((id) => {
    const quest = quests.find(q => q.id === id);
    if (!quest || quest.status === 'completed') return;

    const completedAt = new Date().toISOString();
    const now = Date.now();

    setQuests(prev => prev.map(q => q.id === id ? { ...q, status:'completed', completedAt } : q));

    // --- Combo system ---
    const timeSinceLast = now - comboCount.lastTime;
    const newComboCount = (timeSinceLast <= COMBO_WINDOW_MS && comboCount.count > 0) ? comboCount.count + 1 : 1;
    setComboCount({ count: newComboCount, lastTime: now });

    if (newComboCount >= 3) {
      addToast({
        type: 'achievement',
        icon: '🔥',
        title: `x${newComboCount} COMBO!`,
        desc: newComboCount >= 5 ? 'COMBO MASTER! +30% bonus XP!' : `+${Math.round(getComboBonus(newComboCount) * 100)}% bonus XP!`
      });
    }

    // --- Base rewards with combo bonus ---
    const baseXp = quest.xpReward || 20;
    const comboBonus = getComboBonus(newComboCount);
    const comboXp = Math.round(baseXp * comboBonus);
    gainXp(baseXp + comboXp);
    gainGold(quest.goldReward || 10);

    // --- Lucky drop ---
    const drop = rollLuckyDrop();
    if (drop) {
      setTimeout(() => {
        if (drop.xp > 0) gainXp(drop.xp);
        gainGold(drop.gold);
        const tierEmoji = drop.tier === 'legendary' ? '💎' : drop.tier === 'rare' ? '✨' : '🪙';
        addToast({ type: drop.tier === 'legendary' ? 'levelup' : 'reward', icon: tierEmoji, title: `Lucky Drop! ${drop.tier === 'legendary' ? '🎉' : ''}`, desc: `You found ${drop.label}! +${drop.gold} Gold${drop.xp > 0 ? ` +${drop.xp} XP` : ''}` });
        if (drop.tier === 'legendary') triggerConfetti();
      }, 600);
    }

    const t = today();
    setPlayer(p => {
      const newTotal = p.totalQuests + 1;
      const newStreak = p.lastActiveDate === t ? p.streakCount : (p.streakCount + 1);
      const updated = { ...p, totalQuests: newTotal, streakCount: newStreak, lastActiveDate: t };
      const updatedQuests = quests.map(q2 => q2.id === id ? { ...q2, status:'completed', completedAt } : q2);
      setTimeout(() => {
        const todayDone = updatedQuests.filter(q2 => q2.status === 'completed' && q2.completedAt && new Date(q2.completedAt).toDateString() === new Date().toDateString()).length;
        updateChallengeProgress('quests_today', todayDone);
      }, 50);
      return updated;
    });
  }, [quests, gainXp, gainGold, skills, updateChallengeProgress, addToast, triggerConfetti, comboCount]);

  const deleteQuest = useCallback((id) => {
    showConfirm('Delete this quest? This cannot be undone.', () => {
      setQuests(prev => prev.filter(q => q.id !== id));
      closeConfirm();
    });
  }, [showConfirm, closeConfirm]);

  const trainSkill = useCallback((id) => {
    const skillToTrain = skills.find(s => s.id === id);
    if (!skillToTrain) return;

    let levelUpMessage = null;
    let newLevel = skillToTrain.level;
    let newXp = skillToTrain.xp + 25;
    while (newXp >= newLevel * 100) {
      newXp -= newLevel * 100;
      newLevel++;
      levelUpMessage = `${skillToTrain.name} reached level ${newLevel}!`;
    }

    if (levelUpMessage) {
      addToast({ type:'achievement', icon:'🎯', title:'Skill Level Up!', desc: levelUpMessage });
    }

    const t = today();
    setSkills(prev => prev.map(skill => {
      if (skill.id !== id) return skill;
      return { ...skill, xp: newXp, level: newLevel, trainedToday: true, lastTrainDate: t };
    }));

    gainXp(10);
    const updatedSkills = skills.map(skill => {
      if (skill.id !== id) return skill;
      return { ...skill, xp: newXp, level: newLevel, trainedToday: true, lastTrainDate: t };
    });
    const trainedCount = updatedSkills.filter(s => s.trainedToday).length;
    updateChallengeProgress('skills_trained', trainedCount);
  }, [skills, addToast, gainXp, updateChallengeProgress]);

  const addSkill = useCallback((skill) => {
    setSkills(prev => [...prev, { ...skill, id:'s'+Date.now(), level:1, xp:0, trainedToday:false, lastTrainDate:null }]);
    addToast({ type:'reward', icon:'🌳', title:'New Skill Created!', desc: skill.name });
  }, [addToast]);

  const removeSkill = useCallback((id) => {
    showConfirm('Remove this skill? All progress will be lost.', () => {
      setSkills(prev => prev.filter(s => s.id !== id));
      closeConfirm();
    });
  }, [showConfirm, closeConfirm]);

  const completeFocus = useCallback((minutes) => {
    const xpReward = Math.round(minutes * 6);
    const goldReward = Math.round(minutes * 2);
    gainXp(xpReward);
    gainGold(goldReward);
    const t = today();
    setPlayer(prev => ({ ...prev, totalFocus: prev.totalFocus + 1, lastActiveDate: t }));

    const updated = { ...player, totalFocus: player.totalFocus + 1, lastActiveDate: t };
    updateChallengeProgress('focus_today', updated.totalFocus);

    addToast({ type:'reward', icon:'⚡', title:'Focus Complete!', desc:`Earned ${xpReward} XP and ${goldReward} Gold` });
    triggerConfetti();
  }, [player, gainXp, gainGold, addToast, triggerConfetti, updateChallengeProgress]);

  const addScheduleItem = useCallback((hour, item) => {
    setAllSchedules(prev => ({
      ...prev,
      [selectedDate]: { ...(prev[selectedDate] || {}), [hour]: item }
    }));
  }, [selectedDate]);
  const removeScheduleItem = useCallback((hour) => {
    setAllSchedules(prev => {
      const daySchedule = { ...(prev[selectedDate] || {}) };
      delete daySchedule[hour];
      return { ...prev, [selectedDate]: daySchedule };
    });
  }, [selectedDate]);
  const clearSchedule = useCallback(() => {
    showConfirm('Clear this day\'s entire schedule?', () => {
      setAllSchedules(prev => {
        const next = { ...prev };
        delete next[selectedDate];
        return next;
      });
      closeConfirm();
    });
  }, [showConfirm, closeConfirm, selectedDate]);

  const resetAllData = useCallback(() => {
    showConfirm('⚠️ This will erase ALL your progress — level, quests, skills, achievements, schedules, and gold. This cannot be undone. Are you sure?', () => {
      ['lq_player','lq_quests','lq_skills','lq_achievements','lq_schedules','lq_heroName','lq_history','lq_dailyChallenges','lq_lastRecurCheck','lq_shop','lq_combo'].forEach(k => localStorage.removeItem(k));
      setPlayer(DEFAULT_PLAYER);
      setQuests([]);
      setSkills(DEFAULT_SKILLS.map(s => ({ ...s })));
      setAchievements(DEFAULT_ACHIEVEMENTS.map(a => ({ ...a })));
      setAllSchedules({});
      setSelectedDate(todayKey());
      setHeroName('');
      setShowOnboarding(true);
      setHistory([]);
      setDailyChallenges([]);
      setComboCount({ count: 0, lastTime: 0 });
      closeConfirm();
      addToast({ type:'reward', icon:'🔄', title:'Data Reset', desc:'All progress has been cleared. Fresh start!' });
    });
  }, [showConfirm, closeConfirm, addToast]);

  const title = getTitle(player.level);
  const classData = getClassData(player.level);
  const xpNeeded = xpForLevel(player.level);
  const xpPercent = (player.xp / xpNeeded) * 100;
  const activeQuestCount = quests.filter(q => q.status === 'active').length;
  const trainedTodayCount = skills.filter(s => s.trainedToday).length;

  // Power Level = weighted combination of all stats
  const powerLevel = useMemo(() => {
    const lvlScore = player.level * 10;
    const questScore = player.totalQuests * 2;
    const streakScore = player.streakCount * 5;
    const focusScore = player.totalFocus * 8;
    const skillScore = skills.reduce((sum, s) => sum + s.level * 3, 0);
    const goldScore = Math.floor(player.gold / 10);
    return lvlScore + questScore + streakScore + focusScore + skillScore + goldScore;
  }, [player.level, player.totalQuests, player.streakCount, player.totalFocus, player.gold, skills]);

  // Check if combo is still active
  const isComboActive = (Date.now() - comboCount.lastTime) <= COMBO_WINDOW_MS && comboCount.count >= 2;

  return (
    <GameContext.Provider value={{
      player, heroName, title, classData, xpNeeded, xpPercent,
      quests, skills, achievements, schedule,
      toasts, floatingXps, confirmDialog,
      showOnboarding, activeQuestCount, trainedTodayCount,
      selectedDate, setSelectedDate,
      dailyChallenges, history, showConfetti,
      powerLevel, comboCount: comboCount.count, isComboActive,
      saveHeroName, setShowOnboarding,
      gainXp, gainGold, spendGold, takeDamage,
      addQuest, completeQuest, deleteQuest,
      trainSkill, addSkill, removeSkill,
      completeFocus, addToast, showConfirm, closeConfirm,
      addScheduleItem, removeScheduleItem, clearSchedule,
      resetAllData, triggerConfetti
    }}>
      {children}
    </GameContext.Provider>
  );
};
