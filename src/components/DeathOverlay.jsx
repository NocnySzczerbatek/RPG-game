import React, { useState, useEffect } from 'react';

const FONT = "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif";

export default function DeathOverlay({ gold, onRespawn }) {
  const [visible, setVisible] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const penalty = Math.floor((gold || 0) * 0.10);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 100);
    const t2 = setTimeout(() => setShowBtn(true), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 900,
      background: 'rgba(0,0,0,0)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      animation: 'deathBgFade 2s ease forwards',
      pointerEvents: 'auto',
    }}>
      {/* Blood vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        boxShadow: 'inset 0 0 200px rgba(80,0,0,0.7), inset 0 0 80px rgba(120,0,0,0.4)',
        pointerEvents: 'none',
        animation: 'bloodPulse 2s ease-in-out infinite alternate',
      }} />

      {/* Title text */}
      <div style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.9)',
        transition: 'all 1.2s cubic-bezier(0.23, 1, 0.32, 1)',
        textAlign: 'center',
        position: 'relative', zIndex: 2,
      }}>
        <div style={{
          fontFamily: FONT, fontSize: 13, fontWeight: 600,
          color: '#5a1111',
          letterSpacing: 6, textTransform: 'uppercase',
          marginBottom: 8,
        }}>You have fallen</div>

        <h1 style={{
          fontFamily: FONT, fontSize: 36, fontWeight: 700,
          color: '#aa2222',
          textShadow: '0 0 30px rgba(180,0,0,0.5), 0 0 60px rgba(120,0,0,0.3), 0 2px 4px rgba(0,0,0,0.8)',
          letterSpacing: 8,
          textTransform: 'uppercase',
          lineHeight: 1.2,
          margin: 0,
        }}>
          Your Soul Has<br />Been Consumed
        </h1>

        {/* Decorative line */}
        <div style={{
          width: 200, height: 1, margin: '16px auto',
          background: 'linear-gradient(90deg, transparent, #5a1111, transparent)',
        }} />

        {/* Penalty info */}
        <div style={{
          fontFamily: FONT, fontSize: 11, color: '#6a3a2a',
          letterSpacing: 2, marginBottom: 6,
        }}>
          Death claims its toll
        </div>
        <div style={{
          fontFamily: FONT, fontSize: 13, color: '#cc6633',
          letterSpacing: 1,
        }}>
          <span style={{ color: '#ffd700' }}>💰 −{penalty} Gold</span>
        </div>
      </div>

      {/* Respawn button */}
      {showBtn && (
        <button
          onClick={onRespawn}
          style={{
            marginTop: 32,
            padding: '14px 50px',
            fontFamily: FONT, fontSize: 14, fontWeight: 700,
            color: '#c9a84c',
            background: 'linear-gradient(180deg, rgba(30,16,8,0.95), rgba(14,8,4,0.98))',
            border: '2px solid #3a2210',
            borderRadius: 4, cursor: 'pointer',
            letterSpacing: 4, textTransform: 'uppercase',
            boxShadow: '0 0 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(0,0,0,0.3)',
            transition: 'all 0.25s ease',
            animation: 'respawnBtnAppear 0.6s ease-out',
            position: 'relative', zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = '#6a4422';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(200,160,60,0.2), inset 0 0 10px rgba(200,160,60,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#c9a84c';
            e.currentTarget.style.borderColor = '#3a2210';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(0,0,0,0.3)';
          }}
        >
          Rise Again
        </button>
      )}

      {/* Location hint */}
      {showBtn && (
        <div style={{
          marginTop: 10,
          fontFamily: FONT, fontSize: 9, color: '#3a2a18',
          letterSpacing: 2, textTransform: 'uppercase',
          animation: 'respawnBtnAppear 0.6s ease-out',
          position: 'relative', zIndex: 2,
        }}>
          You will return to Eldergrove
        </div>
      )}
    </div>
  );
}
