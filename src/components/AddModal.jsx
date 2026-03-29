import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DIFFS } from '../gameData';

export default function AddModal({ onAdd, onClose }) {
  const [title, setTitle]       = useState('');
  const [desc, setDesc]         = useState('');
  const [diff, setDiff]         = useState('Easy');
  const [deadline, setDeadline] = useState('');

  const submit = () => {
    if (!title.trim()) return;
    onAdd({
      title:       title.trim(),
      description: desc.trim(),
      difficulty:  diff,
      deadline:    deadline ? new Date(deadline).toISOString() : null,
    });
  };

  return (
    <AnimatePresence>
      {/* Backdrop fades in */}
      <motion.div
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Card springs up from below */}
        <motion.div
          className="modal-card"
          initial={{ y: 120, opacity: 0, scale: 0.92 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 80, opacity: 0, scale: 0.94, transition: { duration: 0.22 } }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        >
          {/* Header */}
          <div className="modal-header">
            <div>
              <div className="modal-sys">◈ SYSTEM</div>
              <div className="modal-title">REGISTER QUEST</div>
            </div>
            <motion.button
              className="modal-close"
              onClick={onClose}
              whileHover={{ scale: 1.2, color: '#f87171' }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </div>

          {/* Quest title */}
          <label className="field-label">QUEST TITLE *</label>
          <input
            className="sl-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to accomplish?"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />

          {/* Description */}
          <label className="field-label">DESCRIPTION</label>
          <textarea
            className="sl-input"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Additional details (optional)..."
          />

          {/* Difficulty */}
          <label className="field-label">DIFFICULTY</label>
          <div className="diff-buttons">
            {Object.entries(DIFFS).map(([k, v]) => (
              <motion.button
                key={k}
                className="diff-btn"
                onClick={() => setDiff(k)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  borderColor: diff === k ? v.color : '#2a1f4e',
                  background: diff === k ? v.color + '1a' : 'transparent',
                  color: diff === k ? v.color : '#4a4570',
                  boxShadow: diff === k ? `0 0 12px ${v.color}44` : 'none',
                }}
                transition={{ duration: 0.15 }}
              >
                {v.icon} {k.toUpperCase()}&nbsp;
                <span style={{ opacity: 0.65 }}>+{v.xp}</span>
              </motion.button>
            ))}
          </div>

          {/* Deadline */}
          <label className="field-label">DEADLINE (OPTIONAL)</label>
          <input
            type="datetime-local"
            className="sl-input"
            style={{ colorScheme: 'dark' }}
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <AnimatePresence>
            {deadline && (
              <motion.div
                className="deadline-warning"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                ⚠ Missing deadline costs -{DIFFS[diff].hp} HP
              </motion.div>
            )}
          </AnimatePresence>

          {/* Buttons */}
          <div className="modal-btn-row">
            <motion.button
              className="btn-primary wide"
              style={{ flex: 1, opacity: title.trim() ? 1 : 0.4 }}
              onClick={submit}
              disabled={!title.trim()}
              whileHover={title.trim() ? { scale: 1.02 } : {}}
              whileTap={title.trim() ? { scale: 0.97 } : {}}
            >
              REGISTER QUEST
            </motion.button>
            <motion.button
              className="btn-ghost"
              onClick={onClose}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              CANCEL
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}