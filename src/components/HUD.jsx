import React, { useState } from 'react';

const UI = 'assets/sprites/craftpix-net-255216-free-basic-pixel-art-ui-for-rpg/PNG';

/* ── Skill tooltip descriptions ────────────────────────────── */
const SKILL_TOOLTIPS = {
  warrior: {
    q: { name: 'Rozcięcie', desc: 'Potężne cięcie stożkowe, 160% OBR.', cost: '10 Many', cd: '2s' },
    w: { name: 'Tarcz. Cios', desc: 'Ogłuszenie na 1.5s, 120% OBR.', cost: '10 Many', cd: '3s' },
    e: { name: 'Wir Ostrzy', desc: 'Kręcisz się zadając 60% OBR co trafienie.', cost: 'Mana/s', cd: 'Trz.' },
    r: { name: 'Bitewna Furia', desc: '+60% OBR na 6s. Czerwona aura.', cost: '30 Many', cd: '15s' },
  },
  mage: {
    q: { name: 'Lodowy Odłamek', desc: 'Pocisk w kierunku kursora, 140% OBR.', cost: '12 Many', cd: '1.2s' },
    w: { name: 'Arkana Fala', desc: 'Rozszerzający się pierścień, 90% OBR.', cost: '14 Many', cd: '3.5s' },
    e: { name: 'Mroźna Nova', desc: 'Zamrożenie wrogów na 2s, 80% OBR.', cost: '25 Many', cd: '5s' },
    r: { name: 'Burza Meteorów', desc: '3 meteory przy kursorze, 250% OBR każdy.', cost: '35 Many', cd: '18s' },
  },
  rogue: {
    q: { name: 'Podw. Cięcie', desc: 'Podwójny cios — 70% OBR każdy, +15% krytyk.', cost: '8 Many', cd: '0.8s' },
    w: { name: 'Bomba Dymna', desc: 'Niewidzialność na 2.5s, wrogowie tracą cel.', cost: '12 Many', cd: '5s' },
    e: { name: 'Cień. Zryw', desc: 'Teleport 200px do kursora.', cost: '15 Many', cd: '3s' },
    r: { name: 'Egzekucja', desc: 'Teleport za wroga, gwarancja krytyku 400% OBR.', cost: '25 Many', cd: '12s' },
  },
};

/* ── Orb component (Health / Mana) ─────────────────────────── */
function Orb({ current, max, color, side }) {
  const pct = Math.max(0, Math.min(1, current / max));
  const isLeft = side === 'left';
  const bg = color === 'red' ? '#1a0505' : '#050515';
  const fill = color === 'red'
    ? 'linear-gradient(to top, #8b0000, #cc2222, #ff4444)'
    : 'linear-gradient(to top, #000060, #2244aa, #4488ff)';

  return (
    <div style={{
      width: 90, height: 90,
      borderRadius: '50%',
      background: bg,
      border: '3px solid #2a1a08',
      boxShadow: `0 0 15px ${color === 'red' ? 'rgba(180,0,0,0.4)' : 'rgba(0,60,180,0.4)'}, inset 0 0 20px rgba(0,0,0,0.8)`,
      position: 'relative',
      overflow: 'hidden',
      [isLeft ? 'marginRight' : 'marginLeft']: 8,
    }}>
      {/* Fill level */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${pct * 100}%`,
        background: fill,
        transition: 'height 0.3s ease',
        borderRadius: '0 0 50% 50%',
      }} />
      {/* Glass highlight */}
      <div style={{
        position: 'absolute',
        top: 8, left: 14,
        width: 18, height: 24,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: '50%',
        transform: 'rotate(-20deg)',
      }} />
      {/* Text */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Press Start 2P", monospace',
        fontSize: 10,
        color: '#fff',
        textShadow: '1px 1px 2px #000',
        zIndex: 2,
      }}>
        {current}
      </div>
    </div>
  );
}

/* ── Skill Slot ────────────────────────────────────────────── */
function SkillSlot({ hotkey, name, cooldown, active, tooltip }) {
  const [showTip, setShowTip] = useState(false);
  return (
    <div style={{
      width: 52, height: 52,
      position: 'relative',
      margin: '0 3px',
      imageRendering: 'pixelated',
      pointerEvents: 'auto',
    }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      {/* Tooltip popup */}
      {showTip && tooltip && (
        <div style={{
          position: 'absolute',
          bottom: 62, left: '50%', transform: 'translateX(-50%)',
          width: 180,
          background: 'linear-gradient(180deg, rgba(20,16,10,0.97), rgba(8,6,4,0.97))',
          border: '1px solid #4a3a18',
          borderRadius: 4,
          padding: '8px 10px',
          zIndex: 200,
          pointerEvents: 'none',
          boxShadow: '0 4px 16px rgba(0,0,0,0.8)',
        }}>
          <div style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: '#c9a84c', marginBottom: 4 }}>{tooltip.name}</div>
          <div style={{ fontFamily: 'sans-serif', fontSize: 10, color: '#aaa', lineHeight: '1.4', marginBottom: 6 }}>{tooltip.desc}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'monospace' }}>
            <span style={{ color: '#4488ff' }}>{tooltip.cost}</span>
            <span style={{ color: '#888' }}>CD: {tooltip.cd}</span>
          </div>
        </div>
      )}
      {/* Slot frame */}
      <div style={{
        width: '100%', height: '100%',
        background: active ? 'rgba(255,200,60,0.15)' : 'rgba(10,8,5,0.9)',
        border: `2px solid ${active ? '#aa8833' : '#3a2a10'}`,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: active
          ? '0 0 8px rgba(255,180,40,0.3), inset 0 0 6px rgba(255,180,40,0.1)'
          : 'inset 0 0 8px rgba(0,0,0,0.6)',
      }}>
        <span style={{
          fontSize: 9,
          color: '#ccc',
          fontFamily: 'monospace',
          textAlign: 'center',
          lineHeight: '1.1',
          textShadow: '1px 1px 1px #000',
        }}>{name}</span>
      </div>
      {/* Hotkey badge */}
      <div style={{
        position: 'absolute',
        top: -6, left: '50%', transform: 'translateX(-50%)',
        background: '#1a1208',
        border: '1px solid #4a3a18',
        borderRadius: 2,
        padding: '0 4px',
        fontSize: 8,
        color: '#d4aa44',
        fontFamily: 'monospace',
        fontWeight: 'bold',
      }}>{hotkey}</div>
      {/* Cooldown overlay */}
      {cooldown > 0 && (
        <div style={{
          position: 'absolute',
          inset: 2,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: '#ff6644',
          fontWeight: 'bold',
          borderRadius: 2,
        }}>{cooldown.toFixed(1)}</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN HUD COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const SKILL_NAMES = {
  warrior: { q: 'Rozcięcie', w: 'T.Cios',  e: 'Wir', r: 'Furia' },
  mage:    { q: 'Odłamek',  w: 'Fala', e: 'Nova', r: 'Meteor' },
  rogue:   { q: 'Cięcie', w: 'Dym', e: 'Zryw',  r: 'Egzek.' },
};

export default function HUD({ playerState, classId }) {
  const {
    hp = 100, maxHp = 100,
    mana = 50, maxMana = 50,
    xp = 0, xpToLevel = 100,
    level = 1, gold = 0,
    skills = {},
  } = playerState || {};

  const xpPct = Math.max(0, Math.min(100, (xp / xpToLevel) * 100));
  const sn = SKILL_NAMES[classId] || SKILL_NAMES.warrior;
  const st = SKILL_TOOLTIPS[classId] || SKILL_TOOLTIPS.warrior;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      pointerEvents: 'none',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Inventory toggle button */}
      {/* Inventory toggle button removed for singleton UI */}
      {/* Main bar */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingBottom: 8,
        gap: 6,
        width: '100%',
      }}>
        {/* Gold counter */}
        <div style={{
          position: 'absolute', top: -30, right: 16,
          fontFamily: 'monospace', fontSize: 13, color: '#ffd700',
          textShadow: '1px 1px 2px #000',
          pointerEvents: 'none',
        }}>&#x1F4B0; {gold}</div>
        {/* HP Orb */}
        <Orb current={hp} max={maxHp} color="red" side="left" />

        {/* Skill bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(10,8,4,0.85)',
          border: '2px solid #2a1a08',
          borderRadius: 4,
          padding: '6px 8px',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.6)',
        }}>
          <SkillSlot hotkey="Q" name={sn.q} cooldown={skills.q || 0} tooltip={st.q} />
          <SkillSlot hotkey="M2" name={sn.w} cooldown={skills.w || 0} tooltip={st.w} />
          <SkillSlot hotkey="E" name={sn.e} cooldown={skills.e || 0} active={skills.eActive} tooltip={st.e} />
          <SkillSlot hotkey="R" name={sn.r} cooldown={skills.r || 0} tooltip={st.r} />
        </div>

        {/* Mana Orb */}
        <Orb current={mana} max={maxMana} color="blue" side="right" />
      </div>

      {/* XP Bar */}
      <div style={{
        width: '100%',
        height: 6,
        background: '#0a0806',
        position: 'relative',
      }}>
        <div style={{
          height: '100%',
          width: `${xpPct}%`,
          background: 'linear-gradient(to right, #886611, #ccaa22)',
          transition: 'width 0.4s ease',
          boxShadow: '0 0 6px rgba(200,170,40,0.3)',
        }} />
        {/* Level indicator */}
        <div style={{
          position: 'absolute',
          top: -14, left: '50%', transform: 'translateX(-50%)',
          fontSize: 9,
          color: '#aa8833',
          fontFamily: 'monospace',
          textShadow: '1px 1px 2px #000',
        }}>LVL {level}</div>
      </div>
    </div>
  );
}
