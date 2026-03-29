import React from 'react';
import { motion } from 'framer-motion';
import useSound from 'use-sound';
import { DIFFS } from '../gameData';

function timeLeft(deadline) {
  if (!deadline) return null;
  const ms = new Date(deadline).getTime() - Date.now();
  if (ms <= 0) return 'EXPIRED';
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  if (h > 48) return `${Math.floor(h / 24)}d left`;
  if (h > 0) return `${h}h ${m}m left`;
  return `${m}m left`;
}

export default function QuestCard({ quest, onComplete, onDelete }) {
  // Sound hook for hovering over interactable quests
  const [playHover] = useSound('/sounds/hover.mp3', { volume: 0.15 });

  const d = DIFFS[quest.difficulty] || DIFFS['Easy'];
  const isActive = quest.status === 'active' || quest.status === 'Pending';
  const isFailed = quest.status === 'failed' || quest.status === 'Failed';
  const isDone   = quest.status === 'completed' || quest.status === 'Completed';

  const tl = timeLeft(quest.deadline);
  const urgent =
    tl && tl !== 'EXPIRED' && quest.deadline &&
    new Date(quest.deadline).getTime() - Date.now() < 3600000;

  return (
    <motion.div
      onMouseEnter={isActive ? playHover : undefined}
      whileHover={isActive ? { scale: 1.01, x: 4 } : {}}
      className={`quest-card ${isActive ? 'active-card' : ''}`}
      style={{
        background: isDone ? 'rgba(34,197,94,.03)' : isFailed ? '#07050f' : '#0f0b1e',
        border: `1px solid ${
          isFailed ? '#1a1530' : isDone ? '#22c55e22' : d.color + '2a'
        }`,
        opacity: isFailed ? 0.5 : 1,
      }}
    >
      <div className="quest-card-top">
        <div className="quest-card-left">
          <div className="quest-card-badges">
            <span
              className="quest-diff-badge"
              style={{
                background: d.color + '1a',
                color: d.color,
                borderColor: d.color + '33',
              }}
            >
              {d.icon} {quest.difficulty.toUpperCase()}
            </span>
            {isDone && (
              <span className="quest-status-badge" style={{ color: '#4ade80' }}>
                ✓ COMPLETE
              </span>
            )}
            {isFailed && (
              <span className="quest-status-badge" style={{ color: '#f87171' }}>
                ✗ FAILED
              </span>
            )}
            {urgent && (
              <span className="quest-urgent-badge">⚡ URGENT</span>
            )}
          </div>
          <div className={`quest-title ${isFailed ? 'failed' : ''}`}>
            {quest.title}
          </div>
          {quest.description && (
            <div className="quest-desc">{quest.description}</div>
          )}
        </div>

        <div className="quest-card-right">
          <div className="quest-xp">+{d.xp} XP</div>
          {tl && (
            <div
              className="quest-time"
              style={{ color: urgent ? '#f97316' : '#4a4570' }}
            >
              {tl}
            </div>
          )}
          <button
            className="quest-delete-btn"
            onClick={() => onDelete(quest.id)}
            title="Remove"
          >
            ✕
          </button>
        </div>
      </div>

      {isActive && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          className="quest-complete-btn"
          onClick={() => onComplete(quest.id)}
        >
          COMPLETE QUEST
        </motion.button>
      )}
    </motion.div>
  );
}