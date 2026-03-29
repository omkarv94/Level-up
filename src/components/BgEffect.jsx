import React from 'react';

export default function BgEffect({ rankColor }) {
  const color = rankColor || '#7c3aed';
  return (
    <div className="bg-effect">
      <div
        className="bg-blob-1"
        style={{
          background: `radial-gradient(circle, ${color}09 0%, transparent 70%)`,
        }}
      />
      <div className="bg-blob-2" />
      <div className="bg-blob-3" />
    </div>
  );
}