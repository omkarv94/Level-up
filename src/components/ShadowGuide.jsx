import React, { useState, useEffect, useRef } from 'react';

const MESSAGES = {
  landing: [
    'The System has detected your presence...',
    'Only the strong may enter this realm.',
    'Are you ready to arise, Hunter?',
    'Darkness obeys those who command it.',
  ],
  login: [
    'Prove your identity, Hunter.',
    'The System never forgets its chosen ones.',
    'Enter your credentials and arise.',
  ],
  register: [
    'A new awakening begins...',
    'Choose your hunter name wisely.',
    'The System is watching your potential.',
    'Welcome to the dungeon, Hunter.',
  ],
  dashboard: [
    'Your quests await. Do not linger.',
    'Strength comes through completion.',
    'The System acknowledges your effort.',
    'Even shadows have purpose.',
  ],
  questAdded: ['A new challenge has been registered.'],
  questComplete: ['The System is pleased with your progress.'],
  levelUp: ['You grow stronger. The Monarchs take notice.'],
  punished: ['Failure is a lesson. Rise again, Hunter.'],
};

function ShadowMonarchSVG() {
  return (
    <svg
      viewBox="0 0 80 130"
      width="72"
      height="117"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="eyeBloom" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="charGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <radialGradient id="shadowAura" cx="50%" cy="100%" r="50%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Shadow aura base */}
      <ellipse cx="40" cy="124" rx="34" ry="8" fill="url(#shadowAura)" />

      {/* Cloak body */}
      <path
        d="M14 58 Q4 85 1 128 L79 128 Q76 85 66 58 Z"
        fill="#0a0520"
        filter="url(#charGlow)"
      />
      {/* Inner cloak */}
      <path
        d="M22 56 Q40 63 58 56 L62 88 Q50 98 30 98 Z"
        fill="#0f0830"
      />
      {/* Head */}
      <ellipse cx="40" cy="40" rx="21" ry="23" fill="#0f0830" />
      {/* Hood shadow */}
      <path
        d="M19 37 Q40 11 61 37 Q64 53 60 60 Q40 67 20 60 Q16 53 19 37 Z"
        fill="#070418"
      />

      {/* Left eye */}
      <g className="shadow-guide-eyes" filter="url(#eyeBloom)">
        <ellipse cx="30" cy="40" rx="6" ry="4.5" fill="#5b21b6" />
        <ellipse cx="30" cy="40" rx="4" ry="2.8" fill="#7c3aed" />
        <ellipse cx="30" cy="40" rx="2" ry="1.5" fill="#c084fc" />
        <ellipse cx="29" cy="39" rx="0.8" ry="0.6" fill="#f3e8ff" />
      </g>

      {/* Right eye */}
      <g className="shadow-guide-eyes" filter="url(#eyeBloom)">
        <ellipse cx="50" cy="40" rx="6" ry="4.5" fill="#5b21b6" />
        <ellipse cx="50" cy="40" rx="4" ry="2.8" fill="#7c3aed" />
        <ellipse cx="50" cy="40" rx="2" ry="1.5" fill="#c084fc" />
        <ellipse cx="49" cy="39" rx="0.8" ry="0.6" fill="#f3e8ff" />
      </g>

      {/* Shoulder pauldron hints */}
      <path d="M14 57 Q6 53 3 62 Q6 70 14 67 Z" fill="#1a0d35" />
      <path d="M66 57 Q74 53 77 62 Q74 70 66 67 Z" fill="#1a0d35" />

      {/* Shadow wisps rising from cloak */}
      <ellipse cx="25" cy="115" rx="4" ry="2" fill="#3d1f7a" opacity="0.5" />
      <ellipse cx="55" cy="112" rx="3" ry="1.5" fill="#3d1f7a" opacity="0.4" />
      <ellipse cx="40" cy="118" rx="5" ry="2" fill="#3d1f7a" opacity="0.6" />
    </svg>
  );
}

export default function ShadowGuide({ context = 'dashboard', trigger = null }) {
  const [visible, setVisible] = useState(false);
  const [messageList, setMessageList] = useState([]);
  const [msgIdx, setMsgIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typeRef = useRef(null);

  // Build message list based on context
  useEffect(() => {
    const msgs = MESSAGES[context] || MESSAGES.dashboard;
    setMessageList(msgs);
    setMsgIdx(0);
  }, [context]);

  // Show after a delay on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Typewriter for current message
  useEffect(() => {
    if (!visible || !messageList.length) return;
    const msg = messageList[msgIdx];
    setDisplayedText('');
    setIsTyping(true);
    let i = 0;
    clearInterval(typeRef.current);
    typeRef.current = setInterval(() => {
      i++;
      setDisplayedText(msg.slice(0, i));
      if (i >= msg.length) {
        clearInterval(typeRef.current);
        setIsTyping(false);
      }
    }, 28);
    return () => clearInterval(typeRef.current);
  }, [visible, msgIdx, messageList]);

  // React to external trigger (quest complete, level up, etc.)
  useEffect(() => {
    if (!trigger) return;
    const msgs = MESSAGES[trigger] || MESSAGES.dashboard;
    setMessageList(msgs);
    setMsgIdx(0);
    setVisible(true);
  }, [trigger]);

  // Auto-cycle messages every 8s
  useEffect(() => {
    if (!visible || !messageList.length) return;
    const t = setInterval(() => {
      setMsgIdx((prev) => (prev + 1) % messageList.length);
    }, 8000);
    return () => clearInterval(t);
  }, [visible, messageList]);

  const handleClick = (e) => {
    e.stopPropagation();
    if (isTyping) {
      // Skip to end of message
      clearInterval(typeRef.current);
      setDisplayedText(messageList[msgIdx]);
      setIsTyping(false);
    } else {
      setMsgIdx((prev) => (prev + 1) % messageList.length);
    }
  };

  return (
    <div className="shadow-guide" onClick={handleClick} title="Click to continue">
      {/* ADDED: Background Aura */}
      <div className="shadow-guide-aura" />

      {visible && (
        <div className="shadow-guide-bubble">
          <div style={{ fontSize: 8, color: '#7c3aed', letterSpacing: 3, marginBottom: 4, fontWeight: 700 }}>
            ◈ SYSTEM
          </div>
          {displayedText}
          {isTyping && <span className="typewriter-cursor">|</span>}
        </div>
      )}

      <div className="shadow-guide-char">
        <ShadowMonarchSVG />
      </div>

      <div className="shadow-guide-label">[ CLICK TO ADVANCE ]</div>
    </div>
  );
}