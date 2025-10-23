import React from 'react';

function formatTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString();
  } catch (e) {
    return '';
  }
}

export default function GuessHistory({ items }) {
  if (!items || items.length === 0) {
    return <div className="history-empty">No guesses yet. Make your first guess!</div>;
  }
  return (
    <ul className="guess-history" aria-label="Guess history">
      {items.map((it, idx) => (
        <li key={it.time + '-' + idx} className="history-item">
          <span className="history-value">{it.value}</span>
          <span className="history-time">{formatTime(it.time)}</span>
        </li>
      ))}
    </ul>
  );
}
