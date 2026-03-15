import React from 'react';

const UI = 'assets/sprites/craftpix-net-255216-free-basic-pixel-art-ui-for-rpg/PNG';

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
function SkillSlot({ hotkey, name, cooldown, active }) {
  return (
    <div style={{
      width: 52, height: 52,
      position: 'relative',
      margin: '0 3px',
      imageRendering: 'pixelated',
    }}>
      {/* Slot frame from UI pack — Equipment.png row 0 col 0 = 32x32 slot */}
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
  warrior: { q: 'Cleave', w: 'Bash',  e: 'Whirl', r: 'Fury' },
  mage:    { q: 'Shard',  w: 'Pulse', e: 'Frost', r: 'Meteor' },
  rogue:   { q: 'Dagger', w: 'Smoke', e: 'Dash',  r: 'Exec' },
};

export default function HUD({ playerState, classId, inventoryOpen, onToggleInventory }) {
  const {
    hp = 100, maxHp = 100,
    mana = 50, maxMana = 50,
    xp = 0, xpToLevel = 100,
    level = 1, gold = 0,
    skills = {},
  } = playerState || {};

  const xpPct = Math.max(0, Math.min(100, (xp / xpToLevel) * 100));
  const sn = SKILL_NAMES[classId] || SKILL_NAMES.warrior;

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
      <div style={{
        position: 'absolute', top: -60, right: 16,
        pointerEvents: 'auto',
      }}>
        <div
          onClick={onToggleInventory}
          style={{
            width: 44, height: 44,
            background: inventoryOpen ? 'rgba(60,44,16,0.9)' : 'rgba(10,8,5,0.85)',
            border: `2px solid ${inventoryOpen ? '#aa8833' : '#3a2a10'}`,
            borderRadius: 4,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: inventoryOpen
              ? '0 0 10px rgba(200,160,60,0.3)'
              : 'inset 0 0 8px rgba(0,0,0,0.5)',
            transition: 'all 0.15s',
            position: 'relative',
          }}
        >
          <span style={{ fontSize: 20 }}>🎒</span>
          <span style={{
            position: 'absolute', bottom: -8, left: '50%', transform: 'translateX(-50%)',
            fontSize: 8, color: '#8a7a5e', fontFamily: 'monospace', fontWeight: 'bold',
          }}>I</span>
        </div>
      </div>
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
          <SkillSlot hotkey="Q" name={sn.q} cooldown={skills.q || 0} />
          <SkillSlot hotkey="M2" name={sn.w} cooldown={skills.w || 0} />
          <SkillSlot hotkey="E" name={sn.e} cooldown={skills.e || 0} active={skills.eActive} />
          <SkillSlot hotkey="R" name={sn.r} cooldown={skills.r || 0} />
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
