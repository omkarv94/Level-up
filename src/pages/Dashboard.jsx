import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useSound from 'use-sound';
import { apiFetch, logout } from '../api';
import { getRank, DIFFS, PUNISH_MSGS, XP_NEEDED } from '../gameData';
import BgEffect from '../components/BgEffect';
import Header from '../components/Header';
import CharacterCard from '../components/CharacterCard';
import QuestCard from '../components/QuestCard';
import AddModal from '../components/AddModal';
import LevelUpOverlay from '../components/LevelUpOverlay';
import PunishOverlay from '../components/PunishOverlay';
import Toast from '../components/Toast';
import ShadowGuide from '../components/ShadowGuide';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapQuest(q) {
  const statusMap = {
    Pending: 'active', pending: 'active',
    Completed: 'completed', completed: 'completed',
    Failed: 'failed', failed: 'failed',
  };
  return { ...q, status: statusMap[q.status] ?? 'active' };
}

function buildPlayer(backendPlayer, extras = {}) {
  return {
    level:  backendPlayer.level  ?? 1,
    xp:     backendPlayer.xp     ?? 0,
    hp:     backendPlayer.hp     ?? 100,
    maxHp:  extras.maxHp  ?? 100 + (backendPlayer.level - 1) * 10,
    streak: extras.streak ?? 0,
    done:   extras.done   ?? 0,
  };
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function Dashboard({ onLogout }) {
  const [playerName, setPlayerName] = useState('');
  const [player, setPlayer]         = useState(null);
  const [quests, setQuests]         = useState([]);

  const [tab, setTab]             = useState('active');
  const [showAdd, setShowAdd]     = useState(false);
  const [lvlUp, setLvlUp]         = useState(null);
  const [punish, setPunish]       = useState(null);
  const [toast, setToast]         = useState(null);
  const [guideTrigger, setGuideTrigger] = useState(null); // for ShadowGuide context

  const prevLevel = useRef(1);
  const extrasRef = useRef({ streak: 0, done: 0, maxHp: 100 });
  const glowRef   = useRef(null);

  // ── Sounds ──
  const [playLevelUp] = useSound('/sounds/levelup.mp3', { volume: 0.6 });
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.4 });
  const [playError]   = useSound('/sounds/error.mp3',   { volume: 0.5 });
  const [playHover]   = useSound('/sounds/hover.mp3',   { volume: 0.2 });

  // ── Cursor glow ──
  useEffect(() => {
    const moveGlow = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top  = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', moveGlow);
    return () => window.removeEventListener('mousemove', moveGlow);
  }, []);

  // ── Load ──
  useEffect(() => { loadAll(); }, []);
  // ─── ADD THIS BLOCK ───
  useEffect(() => {
    const moveGlow = (e) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top  = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', moveGlow);
    return () => window.removeEventListener('mousemove', moveGlow);
  }, []);

  async function loadAll() {
    await Promise.all([loadPlayer(), loadQuests()]);
  }

  async function loadPlayer() {
    const res = await apiFetch('/players/me');
    if (!res.ok) { logout(); onLogout(); return; }
    const data = await res.json();
    setPlayerName(data.name);
    const p = buildPlayer(data, extrasRef.current);
    extrasRef.current.maxHp = p.maxHp;
    prevLevel.current = p.level;
    setPlayer(p);
  }

  async function loadQuests() {
    const res = await apiFetch('/quests/my');
    if (!res.ok) return;
    const data = await res.json();
    setQuests(data.map(mapQuest));
  }

  // ── Level-up watcher ──
  useEffect(() => {
    if (!player) return;
    if (player.level > prevLevel.current) {
      playLevelUp();
      setLvlUp({ level: player.level, rankInfo: getRank(player.level) });
      setGuideTrigger('levelUp');
      setTimeout(() => setLvlUp(null), 4500);
      setTimeout(() => setGuideTrigger(null), 6000);
    }
    prevLevel.current = player.level;
  }, [player?.level, playLevelUp]);

  // ── Deadline checker ──
  const checkDeadlines = useCallback(() => {
    const now = Date.now();
    let hpLost = 0;
    const failed = [];

    setQuests((prev) =>
      prev.map((q) => {
        if (q.status === 'active' && q.deadline && new Date(q.deadline).getTime() < now) {
          hpLost += DIFFS[q.difficulty]?.hp ?? 10;
          failed.push(q.title);
          apiFetch(`/quests/${q.id}/fail`, { method: 'PUT' }).catch(() => {});
          return { ...q, status: 'failed' };
        }
        return q;
      })
    );

    if (hpLost > 0) {
  playError();

  // 1. UPDATE LOCAL STATE IMMEDIATELY (Functional Update)
  setPlayer((p) => {
    if (!p) return null;
    const newHp = Math.max(0, p.hp - hpLost);
    
    // Reset streak locally
    extrasRef.current.streak = 0;

    // 2. SEND TO BACKEND (Ensure the key 'amount' matches your C# DTO)
    apiFetch('/players/take-damage', {
      method: 'PUT',
      body: JSON.stringify({ amount: hpLost }),
    }).catch(err => console.error("System failed to register damage", err));

    return { ...p, hp: newHp, streak: 0 };
  });

  // 3. SHOW UI OVERLAY
  setPunish({
    names: failed,
    msg: PUNISH_MSGS[Math.floor(Math.random() * PUNISH_MSGS.length)],
    hpLost,
  });
  
  setGuideTrigger('punished');
  setTimeout(() => setGuideTrigger(null), 6000);
}

  //   if (hpLost > 0) {
  //     playError();
  //     setPlayer((p) => {
  //       const newHp = Math.max(0, p.hp - hpLost);
  //       extrasRef.current.streak = 0;
  //       apiFetch('/players/take-damage', {
  //         method: 'PUT',
  //         body: JSON.stringify({ amount: hpLost }),
  //       }).catch(() => {});
  //       return { ...p, hp: newHp, streak: 0 };
  //     });
  //     setPunish({
  //       names: failed,
  //       msg: PUNISH_MSGS[Math.floor(Math.random() * PUNISH_MSGS.length)],
  //       hpLost,
  //     });
  //     setGuideTrigger('punished');
  //     setTimeout(() => setGuideTrigger(null), 6000);
  //   }
  }, [playError]);

  useEffect(() => {
    checkDeadlines();
    const iv = setInterval(checkDeadlines, 15000);
    return () => clearInterval(iv);
  }, [checkDeadlines]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  // ── Complete quest ──
  async function completeQuest(id) {
    const quest = quests.find((q) => q.id === id);
    if (!quest) return;

    const res = await apiFetch(`/quests/${id}/complete`, { method: 'PUT' });
    if (!res.ok) { showToast('⚠ System error — try again.'); return; }

    const xpGain = DIFFS[quest.difficulty]?.xp ?? 60;
    setQuests((prev) =>
      prev.map((q) => q.id === id ? { ...q, status: 'completed', completedAt: Date.now() } : q)
    );

    setPlayer((prev) => {
      let { level, xp, hp, maxHp } = prev;
      xp += xpGain;
      while (xp >= XP_NEEDED(level)) {
        xp -= XP_NEEDED(level);
        level++;
        maxHp += 10;
        hp = Math.min(maxHp, hp + 25);
      }
      extrasRef.current.done   += 1;
      extrasRef.current.streak += 1;
      extrasRef.current.maxHp   = maxHp;
      return { ...prev, level, xp, hp, maxHp, done: extrasRef.current.done, streak: extrasRef.current.streak };
    });

    playSuccess();
    showToast(`⚡ +${xpGain} XP — Quest Complete!`);
    setGuideTrigger('questComplete');
    setTimeout(() => setGuideTrigger(null), 6000);
  }

  // ── Delete quest ──
  async function deleteQuest(id) {
    await apiFetch(`/quests/${id}`, { method: 'DELETE' });
    setQuests((prev) => prev.filter((q) => q.id !== id));
  }

  // ── Add quest ──
  async function addQuest(data) {
    const body = {
      title: data.title, description: data.description || '',
      difficulty: data.difficulty, deadline: data.deadline || null,
    };
    const res = await apiFetch('/quests', { method: 'POST', body: JSON.stringify(body) });
    if (!res.ok) { showToast('⚠ Failed to register quest.'); return; }
    const created = await res.json();
    setQuests((prev) => [...prev, mapQuest(created)]);
    setShowAdd(false);
    showToast('New quest registered, Hunter.');
    setGuideTrigger('questAdded');
    setTimeout(() => setGuideTrigger(null), 5000);
  }

  if (!player) return <div className="sl-loading">◈ CONNECTING TO SYSTEM ◈</div>;

  const rank    = getRank(player.level);
  const activeQ = quests.filter((q) => q.status === 'active');
  const doneQ   = quests.filter((q) => q.status === 'completed');
  const failQ   = quests.filter((q) => q.status === 'failed');

  const TABS = [
    { k: 'active',    label: 'ACTIVE',    count: activeQ.length, c: '#c084fc' },
    { k: 'completed', label: 'COMPLETED', count: doneQ.length,   c: '#4ade80' },
    { k: 'failed',    label: 'FAILED',    count: failQ.length,   c: '#f87171' },
  ];

  // Quest card animation variants (anime slide-in)
  const cardVariants = {
    hidden: { opacity: 0, x: -40, filter: 'blur(8px)' },
    visible: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 180, damping: 22 } },
    exit: { opacity: 0, scale: 0.88, x: 30, filter: 'blur(4px)', transition: { duration: 0.22 } },
  };

  return (
    <div style={{ minHeight: '100vh', background: '#03010a', position: 'relative', overflow: 'hidden' }}>
      {/* Cursor glow */}
      <div ref={glowRef} className="system-cursor-glow" />
      <div className="system-scanlines" />
      <div className="system-noise" />
      <BgEffect rankColor={rank.color} />

      <Header player={player} name={playerName} rankInfo={rank} />

      <div className="main-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <CharacterCard player={player} name={playerName} rankInfo={rank} />
          <motion.button
            className="btn-ghost"
            style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
            onClick={() => { logout(); onLogout(); }}
            onMouseEnter={playHover}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            EXIT SYSTEM
          </motion.button>
        </aside>

        {/* Main */}
        <main style={{ flex: 1, minWidth: 0 }}>
          <div className="quest-board-header">
            <div>
              <div className="quest-board-sys">◈ SYSTEM</div>
              <div className="quest-board-title">QUEST BOARD</div>
            </div>
            <motion.button
              className="btn-primary"
              onClick={() => setShowAdd(true)}
              onMouseEnter={playHover}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              + NEW QUEST
            </motion.button>
          </div>

          {/* Tabs */}
          <div className="quest-tabs">
            {TABS.map((t) => (
              <motion.button
                key={t.k}
                className={`quest-tab ${tab === t.k ? 'active' : ''}`}
                style={{ color: tab === t.k ? t.c : '#4a4570', borderBottomColor: tab === t.k ? t.c : 'transparent' }}
                onClick={() => setTab(t.k)}
                onMouseEnter={playHover}
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                {t.label}
                <motion.span
                  className="quest-tab-count"
                  animate={{
                    background: tab === t.k ? t.c : '#1a1530',
                    color: tab === t.k ? '#0a0714' : '#4a4570',
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {t.count}
                </motion.span>
              </motion.button>
            ))}
          </div>

          {/* Quest lists with anime entrance */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
          >
            <AnimatePresence mode="popLayout">
              {tab === 'active' && activeQ.map((q) => (
                <motion.div key={q.id} variants={cardVariants} layout exit="exit">
                  <QuestCard quest={q} onComplete={completeQuest} onDelete={deleteQuest} />
                </motion.div>
              ))}
              {tab === 'completed' && doneQ.map((q) => (
                <motion.div key={q.id} variants={cardVariants} layout exit="exit">
                  <QuestCard quest={q} onDelete={deleteQuest} />
                </motion.div>
              ))}
              {tab === 'failed' && failQ.map((q) => (
                <motion.div key={q.id} variants={cardVariants} layout exit="exit">
                  <QuestCard quest={q} onDelete={deleteQuest} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Empty states */}
          {tab === 'active'    && activeQ.length === 0 && <div className="quest-empty"><div className="quest-empty-icon">◈</div><div className="quest-empty-text">No active quests. Arise, Hunter.</div></div>}
          {tab === 'completed' && doneQ.length   === 0 && <div className="quest-empty"><div className="quest-empty-icon">◈</div><div className="quest-empty-text">No quests completed yet.</div></div>}
          {tab === 'failed'    && failQ.length   === 0 && <div className="quest-empty"><div className="quest-empty-icon">◈</div><div className="quest-empty-text">No failed quests. Keep it that way.</div></div>}
        </main>
      </div>

      {/* ── Overlays ── */}
      <AnimatePresence>
        {showAdd  && <AddModal onAdd={addQuest} onClose={() => setShowAdd(false)} />}
        {lvlUp    && <LevelUpOverlay data={lvlUp} onClose={() => setLvlUp(null)} />}
        {punish   && <PunishOverlay data={punish} onClose={() => setPunish(null)} />}
      </AnimatePresence>

      {toast && <Toast msg={toast} />}

      {/* Shadow Monarch guide */}
      <ShadowGuide context="dashboard" trigger={guideTrigger} />
    </div>
  );
}