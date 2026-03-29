import React from 'react';
import Bar from './Bar';
import { RANKS, XP_NEEDED } from '../gameData';

export default function CharacterCard({ player, name, rankInfo }) {
  const xpNeeded = XP_NEEDED(player.level);
  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  const xpPct = Math.max(0, (player.xp / xpNeeded) * 100);
  const hpColor = hpPct > 60 ? '#4ade80' : hpPct > 30 ? '#fbbf24' : '#f87171';

  return (
    <div
      className="char-card"
      style={{ border: `1px solid ${rankInfo.color}2a` }}
    >
      {/* Rank Badge */}
      <div className="rank-badge-wrap">
        <div
          className="rank-badge-inner"
          style={{
            background: rankInfo.bg,
            border: `1px solid ${rankInfo.color}33`,
          }}
        >
          <div
            className="rank-badge-letter"
            style={{
              color: rankInfo.color,
              textShadow: `0 0 30px ${rankInfo.shadow}`,
            }}
          >
            {rankInfo.rank}
          </div>
          <div className="rank-badge-sub" style={{ color: rankInfo.color }}>
            RANK
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="char-name-wrap">
        <div className="char-name">{name}</div>
        <div className="char-title" style={{ color: rankInfo.color }}>
          {rankInfo.title.toUpperCase()}
        </div>
      </div>

      {/* Level */}
      <div className="char-level-wrap">
        <div className="char-level-label">LEVEL</div>
        <div className="char-level-val">{player.level}</div>
      </div>

      {/* Bars */}
      <Bar
        label="HP"
        cur={player.hp}
        max={player.maxHp}
        color={hpColor}
        pct={hpPct}
      />
      <div style={{ height: 10 }} />
      <Bar
        label="XP"
        cur={player.xp}
        max={xpNeeded}
        color="#c084fc"
        pct={xpPct}
        gradient
      />

      {/* Rank Progress */}
      <div className="rank-progress">
        <div className="rank-progress-label">RANK PROGRESS</div>
        <div className="rank-dots">
          {RANKS.map((r) => {
            const active = player.level >= r.min;
            const current = player.level >= r.min && player.level <= r.max;
            return (
              <div key={r.rank}>
                <div
                  className="rank-dot"
                  style={{
                    borderColor: active ? r.color : '#7c3aed',
                    background: active ? r.color + '22' : 'transparent',
                    color: active ? r.color : '#7c3aed',
                    boxShadow: current ? `0 0 10px ${r.shadow}` : 'none',
                  }}
                >
                  {r.rank}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}