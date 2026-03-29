import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch, setToken } from '../api';
import BgEffect from '../components/BgEffect';
import ShadowGuide from '../components/ShadowGuide';
import useSound from 'use-sound';

// ─── Rune characters for decorative rings ────────────────────────────────────
const RUNES = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'.split('');

function RuneRing({ radius, speed, characters, direction = 1, mouseAngle }) {
  const offset = mouseAngle * direction * 0.04;
  return (
    <div
      className="rune-ring"
      style={{
        width: radius * 2,
        height: radius * 2,
        transform: `rotate(${offset}deg)`,
        transition: 'transform 0.4s ease-out',
        position: 'absolute',
        borderRadius: '50%',
        border: `1px solid rgba(124,58,237,${direction > 0 ? 0.15 : 0.1})`, // Increased visibility
      }}
    >
      {characters.map((char, i) => {
        const angle = (i / characters.length) * Math.PI * 2;
        const x = Math.cos(angle) * radius + radius;
        const y = Math.sin(angle) * radius + radius;
        return (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              transform: 'translate(-50%, -50%)',
              fontFamily: 'Cinzel, serif',
              fontSize: 15, // Slightly larger
              color: `rgba(168, 85, 247, ${0.4 + Math.sin(i * 0.5) * 0.2})`, // Brighter purple
              userSelect: 'none',
              textShadow: '0 0 8px rgba(124, 58, 237, 0.6)' // Added glow
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}

// ─── Canvas particle + tendril system ─────────────────────────────────────────
function useShadowCanvas(canvasRef, active) {
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef([]);
  const frameRef = useRef(null);
  const timeRef = useRef(0);
  const lastSpawnRef = useRef(0);

  const spawnParticle = useCallback((x, y, burst = false) => {
    const count = burst ? 16 : 1;
    for (let i = 0; i < count; i++) {
      const angle = burst ? (Math.PI * 2 * i) / count : Math.random() * Math.PI * 2;
      const speed = burst ? Math.random() * 6 + 2 : Math.random() * 2;
      particlesRef.current.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (burst ? 0 : 0.5),
        size: Math.random() * (burst ? 5 : 3) + 1,
        life: 1,
        decay: burst ? 0.015 : 0.008,
        hue: 280, // Electric Purple
        burst,
      });
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    const onMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      const now = Date.now();
      if (now - lastSpawnRef.current > 30) {
        spawnParticle(e.clientX, e.clientY);
        lastSpawnRef.current = now;
      }
    };

    const onClick = (e) => spawnParticle(e.clientX, e.clientY, true);

    // Ambient rising wisps
    const ambientInterval = setInterval(() => {
      if (particlesRef.current.length < 80) {
        const x = Math.random() * canvas.width;
        particlesRef.current.push({
          x, y: canvas.height + 5,
          vx: (Math.random() - 0.5) * 0.4,
          vy: -(Math.random() * 0.6 + 0.15),
          size: Math.random() * 1.8 + 0.4,
          life: 1,
          decay: 0.003 + Math.random() * 0.003,
          hue: 255 + Math.random() * 45,
          ambient: true,
        });
      }
    }, 120);

    // ── TENDRIL ANCHORS ──
    const getAnchors = () => [
      { x: 0, y: 0 }, { x: canvas.width, y: 0 },
      { x: 0, y: canvas.height }, { x: canvas.width, y: canvas.height },
      { x: canvas.width * 0.5, y: 0 }, { x: canvas.width * 0.5, y: canvas.height },
      { x: 0, y: canvas.height * 0.45 }, { x: canvas.width, y: canvas.height * 0.55 },
    ];

    const drawTendrils = (mx, my, t) => {
      const anchors = getAnchors();
      anchors.forEach((anchor, i) => {
        const dx = mx - anchor.x;
        const dy = my - anchor.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
        const proximity = Math.max(0, 1 - dist / maxDist);

        const wave1 = Math.sin(t * 0.04 + i) * 30;
        const wave2 = Math.sin(t * 0.04 + i) * 30;

        const cp1x = anchor.x + dx * 0.22 + wave1;
        const cp1y = anchor.y + dy * 0.22 + wave2;
        const cp2x = anchor.x + dx * 0.78 - wave2 * 0.6;
        const cp2y = anchor.y + dy * 0.78 - wave1 * 0.6;

        const alpha = proximity * 0.3;
        if (alpha < 0.01) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = `hsl(280, 80%, 70%)`;
        ctx.lineWidth = 1.5 + proximity * 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#7c3aed';
        ctx.beginPath();
        ctx.moveTo(anchor.x, anchor.y);
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, mx, my);

        
        ctx.stroke();
        ctx.restore();
      });
    };

    const animate = () => {
      timeRef.current++;
      const t = timeRef.current;
      const { x: mx, y: my } = mouseRef.current;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawTendrils(mx, my, t);

      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.life -= p.decay;
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        const alpha = p.life * (p.ambient ? 0.45 : p.burst ? 0.85 : 0.7);
        if (alpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.shadowBlur = p.size * 5;
        ctx.shadowColor = `hsl(${p.hue}, 80%, 68%)`;
        ctx.fillStyle = `hsl(${p.hue}, 80%, 68%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      frameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('click', onClick);
    window.addEventListener('resize', resize);
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearInterval(ambientInterval);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('resize', resize);
    };
  }, [active, canvasRef, spawnParticle]);
}

// ─── LOGIN COMPONENT ──────────────────────────────────────────────────────────
export default function Login({ onLogin }) {
  const [systemInitialized, setSystemInitialized] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [playerName, setPlayerName] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [isMuted, setIsMuted]       = useState(false);
  const [mouseAngle, setMouseAngle] = useState(0);
  const [cardTilt, setCardTilt]     = useState({ rx: 0, ry: 0 });
  const [guideContext, setGuideContext] = useState('landing');

  const canvasRef = useRef(null);

  // ── Sound ──
  const [playEntry, { stop, sound }] = useSound('/sounds/entry-theme.mp3', { volume: 0.4, loop: true, interrupt: true });
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.6 });
  const [playArise]   = useSound('/sounds/arise.mp3',   { volume: 0.8 });

  // ── Canvas shadow tendrils ──
  useShadowCanvas(canvasRef, true);

  // ── Cursor angle for rune ring rotation ──
  useEffect(() => {
    const onMove = (e) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * (180 / Math.PI);
      setMouseAngle(angle);

      // Subtle card tilt based on cursor
      if (systemInitialized) {
        const rx = ((e.clientY - cy) / cy) * -6;
        const ry = ((e.clientX - cx) / cx) * 6;
        setCardTilt({ rx, ry });
      }
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [systemInitialized]);

  const handleInitialize = () => {
    setSystemInitialized(true);
    setGuideContext('login');
    playEntry();
  };

  const toggleMute = () => {
    if (sound) { sound.mute(!isMuted); setIsMuted(!isMuted); }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!loading) playArise();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister
        ? { email, password, playerName }
        : { email, password };

      const res = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setError(errData?.message || (isRegister ? 'Registration failed.' : 'Invalid credentials.'));
        return;
      }

      if (isRegister) {
        setIsRegister(false);
        setEmail(''); setPassword(''); setPlayerName('');
        setGuideContext('login');
        setError('✨ Hunter registered. Please log in.');
        return;
      }

      const data = await res.json();
      setToken(data.token);
      if (sound) { sound.fade(0.4, 0, 800); setTimeout(() => stop(), 800); }
      playSuccess();
      onLogin();
    } catch {
      setError('Cannot reach the System. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleMode = (register) => {
    setIsRegister(register);
    setError('');
    setGuideContext(register ? 'register' : 'login');
  };

  // ── LANDING GATEWAY SCREEN ─────────────────────────────────────────────────
  if (!systemInitialized) {
    return (
      <div className="setup-screen" style={{ overflow: 'hidden' }}>
        <canvas ref={canvasRef} className="cursor-canvas" />
        <BgEffect rankColor="#7c3aed" />

        {/* Rune rings centred on screen */}
        <div className="rune-ring-wrap">
          <RuneRing radius={300} speed={40} characters={RUNES} direction={1}  mouseAngle={mouseAngle} />
          <RuneRing radius={200} speed={28} characters={RUNES.slice(8)} direction={-1} mouseAngle={mouseAngle} />
          <RuneRing radius={120} speed={18} characters={RUNES.slice(16)} direction={1} mouseAngle={mouseAngle} />
        </div>

        {/* Portal circles */}
        <div className="portal-circle" style={{ width: 500, height: 500, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', animationDelay: '0s' }} />
        <div className="portal-circle" style={{ width: 340, height: 340, left: '50%', top: '50%', transform: 'translate(-50%,-50%)', animationDelay: '1s' }} />

        <div className="setup-card" style={{ textAlign: 'center', zIndex: 10 }}>
          {/* Scanner line */}
          <div className="gateway-scan-line" />

          <span className="gateway-icon">◈</span>
          <div className="setup-system-label">◈ SYSTEM DETECTED ◈</div>
          <h1 className="setup-title" style={{ fontSize: '2rem', letterSpacing: 4 }}>
            WANNA BE A<br />MONARCH?
          </h1>
          <p className="setup-desc">
            THE SYSTEM GRANTS POWER TO THOSE{'\n'}WHO DARE TO ARISE.{'\n'}ARE YOU READY, HUNTER?
          </p>
          <button className="btn-primary full" onClick={handleInitialize}>
            ◈ ENTER THE SYSTEM ◈
          </button>
        </div>

        <ShadowGuide context="landing" />
      </div>
    );
  }

  // ── LOGIN / REGISTER SCREEN ────────────────────────────────────────────────
  return (
    <div className="setup-screen" style={{ overflow: 'hidden' }}>
      <canvas ref={canvasRef} className="cursor-canvas" />
      <BgEffect rankColor="#7c3aed" />

      {/* Subtle background rune rings */}
      <div className="rune-ring-wrap" style={{ opacity: 0.5 }}>
        <RuneRing radius={380} speed={50} characters={RUNES} direction={1} mouseAngle={mouseAngle} />
        <RuneRing radius={260} speed={35} characters={RUNES.slice(10)} direction={-1} mouseAngle={mouseAngle} />
      </div>

      {/* Mute button */}
      <button onClick={toggleMute} className="system-mute-btn">
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Card with subtle 3D tilt on cursor */}
      <div
        className="setup-card setup-card-magnetic"
        style={{
          transform: `perspective(900px) rotateX(${cardTilt.rx}deg) rotateY(${cardTilt.ry}deg)`,
          zIndex: 10,
        }}
      >
        <div className="setup-system-label">◈ SYSTEM MESSAGE ◈</div>
        <div className="setup-subtitle">
          {isRegister ? 'A NEW HUNTER HAS BEEN' : 'WELCOME BACK,'}
        </div>
        <h1 className="setup-title">
          {isRegister ? 'AWAKENED' : 'HUNTER'}
        </h1>
        <p className="setup-desc">
          {isRegister
            ? 'THE SYSTEM GRANTS YOU POWER.\nCOMPLETE YOUR QUESTS. LEVEL UP.\nBECOME THE SHADOW MONARCH.'
            : 'THE SYSTEM AWAITS YOUR RETURN.\nARISE AND CONTINUE YOUR JOURNEY.'}
        </p>

        <div className="setup-toggle-row">
          <button className={`setup-toggle-btn ${!isRegister ? 'active' : ''}`} onClick={() => handleToggleMode(false)}>
            LOGIN
          </button>
          <button className={`setup-toggle-btn ${isRegister ? 'active' : ''}`} onClick={() => handleToggleMode(true)}>
            REGISTER
          </button>
        </div>

        {error && (
          <div
            className="sl-error"
            style={{
              color: error.startsWith('✨') ? '#4ade80' : '#f87171',
              borderColor: error.startsWith('✨') ? 'rgba(74,222,128,.25)' : 'rgba(248,113,113,.25)',
              background: error.startsWith('✨') ? 'rgba(74,222,128,.06)' : 'rgba(248,113,113,.06)',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <label className="field-label">HUNTER NAME</label>
              <input
                className="sl-input center"
                placeholder="Enter your hunter name..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                required
                autoFocus={isRegister}
              />
            </>
          )}

          <label className="field-label">EMAIL</label>
          <input
            className="sl-input"
            type="email"
            placeholder="Enter your email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus={!isRegister}
          />

          <label className="field-label">PASSWORD</label>
          <input
            className="sl-input"
            type="password"
            placeholder="Enter your password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn-primary full"
            disabled={loading || !email.trim() || !password.trim() || (isRegister && !playerName.trim())}
          >
            {loading ? '◈ CONNECTING...' : '◈ ARISE ◈'}
          </button>
        </form>
      </div>

      <ShadowGuide context={guideContext} />
    </div>
  );
}

