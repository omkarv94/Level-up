import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PunishOverlay({ data, onClose }) {
  const [phase, setPhase] = useState('flash'); // flash → shake → reveal

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('shake'),  200);
    const t2 = setTimeout(() => setPhase('reveal'), 650);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fullscreen-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* ── Phase 1: Red flash ── */}
        {phase === 'flash' && (
          <div className="red-flash" />
        )}

        {/* ── Phase 2: Shake (apply to wrapper) ── */}
        {phase === 'shake' && (
          <>
            <div className="red-flash" style={{ opacity: 0.2 }} />
            <motion.div
              className="shake"
              style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div style={{
                width: 300, height: 300,
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(248,113,113,0.1) 0%, transparent 70%)',
              }} />
            </motion.div>
          </>
        )}

        {/* ── Phase 3: Content descends ── */}
        {phase === 'reveal' && (
          <motion.div
            className="punish-inner"
            initial={{ y: -90, opacity: 0, scale: 0.88 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          >
            {/* Speed lines (red variant) */}
            <motion.div
              initial={{ scale: 0.2, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              style={{
                position: 'absolute',
                inset: -40,
                borderRadius: '50%',
                background: `repeating-conic-gradient(
                  transparent 0deg, transparent 11deg,
                  rgba(248,113,113,0.07) 11deg, rgba(248,113,113,0.07) 12.5deg
                )`,
                pointerEvents: 'none',
                transformOrigin: 'center',
              }}
            />

            {/* Skull icon */}
            <motion.div
              className="punish-icon"
              initial={{ scale: 2, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}
            >
              💀
            </motion.div>

            <div className="punish-system">◈ SYSTEM ALERT ◈</div>
            <div className="punish-title">QUEST FAILED</div>

            <div className="punish-names">
              {data.names.map((n, i) => (
                <motion.div
                  key={i}
                  className="punish-name"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.06 }}
                >
                  "{n}"
                </motion.div>
              ))}
            </div>

            {/* Shadow Monarch quote box */}
            <motion.div
              className="punish-quote-box"
              initial={{ opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.3, duration: 0.35, ease: 'easeOut' }}
              style={{ transformOrigin: 'top' }}
            >
              <div style={{ fontSize: 9, color: '#f87171', letterSpacing: 3, marginBottom: 6 }}>
                ◈ SHADOW MONARCH
              </div>
              <div className="punish-quote">{data.msg}</div>
            </motion.div>

            {/* HP penalty badge */}
            <motion.div
              className="punish-hp-badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 280, damping: 16, delay: 0.45 }}
            >
              — {data.hpLost} HP PENALTY
            </motion.div>

            <div className="punish-tap">TAP TO CONTINUE</div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}