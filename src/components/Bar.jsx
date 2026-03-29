import React from 'react';

export default function Bar({ label, cur, max, color, pct, gradient }) {
  return (
    <div className="sl-bar">
      <div className="sl-bar-header">
        <span className="sl-bar-label" style={{ color }}>{label}</span>
        <span className="sl-bar-val" style={{ color }}>
          {cur}<span> / {max}</span>
        </span>
      </div>
      <div className="sl-bar-track">
        <div
          className="sl-bar-fill"
          style={{
            width: `${pct}%`,
            background: gradient
              ? 'linear-gradient(90deg, #7c3aed, #c084fc)'
              : color,
            boxShadow: `0 0 8px ${color}55`,
          }}
        />
      </div>
    </div>
  );
}