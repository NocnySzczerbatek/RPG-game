import React, { useRef, useEffect } from 'react';

const SIZE = 160;

export default function MiniMap({ playerState }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wW = playerState.worldW || 4000;
    const s = SIZE / wW;
    const r = SIZE / 2;

    ctx.clearRect(0, 0, SIZE, SIZE);

    /* ── Circular clip ───────────────────────────── */
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r - 2, 0, Math.PI * 2);
    ctx.clip();

    /* ── Dark forest background ──────────────────── */
    ctx.fillStyle = '#0a160a';
    ctx.fillRect(0, 0, SIZE, SIZE);
    // Subtle variation
    ctx.fillStyle = '#0f1f0f';
    for (let x = 0; x < SIZE; x += 10) {
      for (let y = 0; y < SIZE; y += 10) {
        if ((x + y) % 20 === 0) ctx.fillRect(x, y, 8, 8);
      }
    }

    /* ── Enemies — red dots ──────────────────────── */
    if (playerState.enemies) {
      ctx.fillStyle = '#cc3333';
      for (const e of playerState.enemies) {
        ctx.beginPath();
        ctx.arc(e.x * s, e.y * s, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    /* ── NPC — blue dot ──────────────────────────── */
    if (playerState.npcX != null) {
      ctx.fillStyle = '#44aaff';
      ctx.beginPath();
      ctx.arc(playerState.npcX * s, playerState.npcY * s, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── Portal — purple dot ─────────────────────── */
    if (playerState.portalX != null) {
      ctx.fillStyle = '#aa44ff';
      ctx.beginPath();
      ctx.arc(playerState.portalX * s, playerState.portalY * s, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    /* ── Player — gold dot + ring ────────────────── */
    if (playerState.playerX != null) {
      const px = playerState.playerX * s;
      const py = playerState.playerY * s;
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,215,0,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();

    /* ── Border rings ────────────────────────────── */
    ctx.strokeStyle = '#3a2a18';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(r, r, r - 1, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#554433';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(r, r, r - 3, 0, Math.PI * 2);
    ctx.stroke();
  }, [playerState]);

  return (
    <div style={{
      position: 'fixed', top: 12, right: 12, zIndex: 90,
      width: SIZE, height: SIZE, borderRadius: '50%',
      pointerEvents: 'none', overflow: 'hidden',
    }}>
      <canvas ref={canvasRef} width={SIZE} height={SIZE} />
      {/* Zone label */}
      <span style={{
        position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, fontFamily: "'Cinzel', serif", color: '#665544',
        whiteSpace: 'nowrap',
      }}>
        {playerState.zone === 'crypt' ? 'Forsaken Crypt' : 'Eldergrove'}
      </span>
    </div>
  );
}
