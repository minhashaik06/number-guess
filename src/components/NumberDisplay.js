import React from 'react';

export default function NumberDisplay({ value, animate }) {
  return (
    <div className={`number-display ${animate ? 'pulse' : ''}`} aria-live="polite">
      <div className="number-inner">{value}</div>
    </div>
  );
}
