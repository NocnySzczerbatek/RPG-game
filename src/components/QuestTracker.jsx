import React from 'react';
export default function QuestTracker({ quest }) {
  return (
    <div style={{position: 'absolute', top: 20, right: 20, background: '#222a', color: '#fff', padding: 10, borderRadius: 8, zIndex: 10000}}>
      <b>Aktualne zadanie:</b><br />
      {quest}
    </div>
  );
}
