import React from 'react';

export default function Header({ player, name, rankInfo }) {
  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  const hpColor =
    hpPct > 60 ? '#4ade80' : hpPct > 30 ? '#fbbf24' : '#f87171';

  return (
    <header className="sl-header">
      <div className="header-brand">
        <span
          className="header-brand-icon"
          style={{ color: rankInfo.color }}
        >
          ◈
        </span>
        <div>
          <div className="header-brand-name">SOLO LEVELING</div>
          <div className="header-brand-sub">REAL LIFE SYSTEM</div>
        </div>
      </div>

      <div className="header-right">
        <div className="stat-box">
          <div className="stat-box-label">STREAK</div>
          <div className="stat-box-val" style={{ color: '#fbbf24' }}>
            {player.streak ?? 0}
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-box-label">DONE</div>
          <div className="stat-box-val" style={{ color: '#c084fc' }}>
            {player.done ?? 0}
          </div>
        </div>
        <div className="header-hp-box">
          <div className="header-hp-label">
            HP {player.hp}/{player.maxHp}
          </div>
          <div className="header-hp-track">
            <div
              className="header-hp-fill"
              style={{ width: `${hpPct}%`, background: hpColor }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}