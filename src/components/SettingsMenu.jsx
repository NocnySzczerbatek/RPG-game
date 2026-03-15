import React, { useState } from 'react';

const FONT = "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif";
const FONT_MONO = "'Fira Code', 'Consolas', monospace";

const DEFAULT_BINDINGS = {
  inventory: 'I',
  skill_q: 'Q',
  skill_w: 'W',
  skill_e: 'E',
  skill_r: 'R',
  interact: 'F',
  admin: '`',
};

const BINDING_LABELS = {
  inventory: 'Ekwipunek',
  skill_q: 'Umiejętność 1',
  skill_w: 'Umiejętność 2',
  skill_e: 'Umiejętność 3',
  skill_r: 'Umiejętność 4',
  interact: 'Interakcja',
  admin: 'Konsola admina',
};

function Slider({ label, value, onChange, min = 0, max = 100 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
      <span style={{ fontFamily: FONT, fontSize: 12, color: '#c0b090', minWidth: 120 }}>{label}</span>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          flex: 1, height: 6, cursor: 'pointer',
          accentColor: '#c9a84c',
        }}
      />
      <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: '#8a7a5a', minWidth: 32, textAlign: 'right' }}>{value}%</span>
    </div>
  );
}

function KeyBindRow({ label, value, onRebind }) {
  const [listening, setListening] = useState(false);

  const handleClick = () => {
    setListening(true);
    const handler = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const key = e.key === ' ' ? 'SPACE' : e.key.length === 1 ? e.key.toUpperCase() : e.key;
      if (key === 'Escape') { setListening(false); window.removeEventListener('keydown', handler, true); return; }
      onRebind(key);
      setListening(false);
      window.removeEventListener('keydown', handler, true);
    };
    window.addEventListener('keydown', handler, true);
  };

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '5px 0',
      borderBottom: '1px solid rgba(60,50,30,0.15)',
    }}>
      <span style={{ fontFamily: FONT, fontSize: 12, color: '#c0b090', flex: 1 }}>{label}</span>
      <div
        onClick={handleClick}
        style={{
          minWidth: 60, padding: '4px 10px', textAlign: 'center',
          background: listening ? 'rgba(200,160,60,0.2)' : 'rgba(20,16,10,0.8)',
          border: `2px solid ${listening ? '#c9a84c' : '#3a2a14'}`,
          borderRadius: 3,
          fontFamily: FONT_MONO, fontSize: 12, fontWeight: 700,
          color: listening ? '#ffe066' : '#c9a84c',
          cursor: 'pointer',
          animation: listening ? 'settingsPulse 1s ease-in-out infinite' : 'none',
        }}
      >
        {listening ? '...' : value}
      </div>
    </div>
  );
}

function SectionTitle({ text }) {
  return (
    <div style={{
      fontFamily: FONT, fontSize: 13, color: '#dbb854',
      letterSpacing: 2, textTransform: 'uppercase',
      marginTop: 16, marginBottom: 6,
      textShadow: '0 0 6px rgba(200,160,60,0.5), 0 1px 3px #000',
      borderBottom: '1px solid rgba(200,160,60,0.2)', paddingBottom: 4,
    }}>{text}</div>
  );
}

export default function SettingsMenu({
  isOpen, onClose, onReturnToMenu, bindings, onUpdateBindings,
  musicVolume, sfxVolume, onMusicVolume, onSfxVolume,
}) {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'settingsFadeIn 0.2s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 480, maxWidth: '95vw',
          maxHeight: '90vh',
          background: 'linear-gradient(180deg, #1a140c 0%, #120e08 50%, #0e0a06 100%)',
          border: '3px solid #5a4020',
          borderRadius: 6,
          boxShadow: '0 0 60px rgba(0,0,0,0.9), 0 0 20px rgba(80,50,10,0.3)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '10px 18px',
          background: 'linear-gradient(90deg, rgba(30,22,12,0.95), rgba(55,42,22,0.8), rgba(30,22,12,0.95))',
          borderBottom: '2px solid #5a4020',
        }}>
          <span style={{ fontFamily: FONT, fontSize: 18, fontWeight: 700, color: '#dbb854', letterSpacing: 2 }}>⚙ USTAWIENIA</span>
          <div
            onClick={onClose}
            style={{
              width: 32, height: 32,
              background: 'linear-gradient(180deg, #3a2a14, #2a1c0c)',
              border: '2px solid #5a4020', borderRadius: 4,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', fontSize: 18, color: '#dda855', fontWeight: 700,
            }}
          >✕</div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px 20px' }}>
          {/* Audio */}
          <SectionTitle text="Dźwięk" />
          <Slider label="Muzyka" value={musicVolume} onChange={onMusicVolume} />
          <Slider label="Efekty" value={sfxVolume} onChange={onSfxVolume} />

          {/* Keybindings */}
          <SectionTitle text="Przypisanie klawiszy" />
          {Object.keys(bindings).map(key => (
            <KeyBindRow
              key={key}
              label={BINDING_LABELS[key] || key}
              value={bindings[key]}
              onRebind={(newKey) => onUpdateBindings(key, newKey)}
            />
          ))}
          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: '#4a3a1a', marginTop: 6 }}>
            Kliknij klawisz aby zmienić, ESC aby anulować
          </div>

          {/* Exit */}
          <SectionTitle text="Gra" />
          <button
            onClick={onReturnToMenu}
            style={{
              width: '100%', padding: '10px 0', marginTop: 8,
              background: 'linear-gradient(180deg, #4a1a1a, #2a0e0e)',
              border: '2px solid #8a3030',
              borderRadius: 4, cursor: 'pointer',
              fontFamily: FONT, fontSize: 13, fontWeight: 700,
              color: '#ff8866', letterSpacing: 1,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(180deg, #5a2020, #3a1414)'; e.currentTarget.style.color = '#ffaa88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(180deg, #4a1a1a, #2a0e0e)'; e.currentTarget.style.color = '#ff8866'; }}
          >
            Powrót do Menu Głównego
          </button>
        </div>
      </div>

      <style>{`
        @keyframes settingsFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes settingsPulse {
          0%, 100% { border-color: #c9a84c; }
          50%      { border-color: #ffe066; box-shadow: 0 0 8px rgba(200,160,60,0.4); }
        }
      `}</style>
    </div>
  );
}

export { DEFAULT_BINDINGS };
