import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Speed lines drawn as conic-gradient overlay
function SpeedLines({ color }) {
  return (
    <motion.div
      initial={{ scale: 0.1, opacity: 1 }}
      animate={{ scale: 2.8, opacity: 0 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '50%',
        background: `repeating-conic-gradient(
          transparent 0deg, transparent 12deg,
          ${color}09 12deg, ${color}09 13.5deg
        )`,
        transformOrigin: 'center',
        pointerEvents: 'none',
      }}
    />
  );
}

// Glitch duplicate layer for the level number
function GlitchLayer({ children, color }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: '50%',
        transform: 'translateX(-50%)',
        color: color,
        opacity: 0.45,
        animation: 'glitch 1.8s infinite linear alternate-reverse',
        pointerEvents: 'none',
        fontFamily: 'Cinzel, serif',
        fontSize: 90,
        fontWeight: 900,
        lineHeight: 1,
      }}
    >
      {children}
    </div>
  );
}

export default function LevelUpOverlay({ data, onClose }) {
  const [phase, setPhase] = useState('flash'); // flash → lines → reveal

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('lines'),  280);
    const t2 = setTimeout(() => setPhase('reveal'), 680);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const { level, rankInfo } = data;

  return (
    <AnimatePresence>
      <motion.div
        className="fullscreen-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.3 } }}
        onClick={onClose}
      >
        {/* ── Phase 1: White impact flash ── */}
        {phase === 'flash' && (
          <div className="impact-flash" />
        )}

        {/* ── Phase 2: Speed lines ── */}
        {(phase === 'lines' || phase === 'reveal') && (
          <SpeedLines color={rankInfo.color} />
        )}

        {/* ── Phase 3: Content reveals ── */}
        {phase === 'reveal' && (
          <div className="levelup-inner">
            {/* System label */}
            <motion.div
              className="levelup-system"
              initial={{ opacity: 0, letterSpacing: 20 }}
              animate={{ opacity: 1, letterSpacing: 6 }}
              transition={{ duration: 0.4 }}
            >
              ◈ SYSTEM MESSAGE ◈
            </motion.div>

            {/* "You have leveled up" */}
            <motion.div
              className="levelup-sub"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              YOU HAVE LEVELED UP
            </motion.div>

            {/* The number — SLAMS DOWN */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <motion.div
                className="levelup-num"
                initial={{ y: -130, scale: 1.5, opacity: 0, filter: 'blur(12px)' }}
                animate={{ y: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }}
                transition={{
                  type: 'spring',
                  stiffness: 180,
                  damping: 14,
                  delay: 0.05,
                }}
                style={{
                  color: rankInfo.color,
                  textShadow: `0 0 40px ${rankInfo.shadow}, 0 0 80px ${rankInfo.shadow}`,
                }}
              >
                {level}
              </motion.div>
              {/* Glitch echo */}
              <GlitchLayer color={rankInfo.color}>{level}</GlitchLayer>
            </div>

            {/* "Level N" */}
            <motion.div
              className="levelup-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            >
              LEVEL {level}
            </motion.div>

            {/* Rank badge bounces in */}
            <motion.div
              className="levelup-rank-badge"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.4 }}
              style={{
                borderColor: rankInfo.color + '44',
                background: rankInfo.bg,
                color: rankInfo.color,
              }}
            >
              {rankInfo.rank} RANK — {rankInfo.title.toUpperCase()}
            </motion.div>

            {/* Character mini-appearance */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              style={{ marginTop: 16, marginBottom: 0 }}
            >
              <div style={{ fontSize: 11, color: rankInfo.color, letterSpacing: 3, fontFamily: 'Cinzel, serif', marginBottom: 6 }}>
                ◈ SHADOW MONARCH ◈
              </div>
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: `1px solid ${rankInfo.color}44`,
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 12,
                color: '#8b85b0',
                fontFamily: 'Cinzel, serif',
                fontStyle: 'italic',
                letterSpacing: 1,
                maxWidth: 300,
                margin: '0 auto',
              }}>
                "Arise. You grow worthy of the shadows."
              </div>
            </motion.div>

            <motion.div
              className="levelup-tap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              TAP TO CONTINUE
            </motion.div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}