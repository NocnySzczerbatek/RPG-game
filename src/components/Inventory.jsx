import React, { useState, useEffect, useRef } from 'react';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
/* Sprite sheets removed — they don't tile well as individual backgrounds.
   Using CSS-only styling for a clean dark medieval look. */

const FONT = "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif";
const FONT_MONO = "'Fira Code', 'Consolas', monospace";

const RARITY_COLORS = {
  common:    '#9d9d9d',
  magic:     '#6496ff',
  rare:      '#ffe066',
  legendary: '#ff9933',
  mythic:    '#ff55ff',
};

const RARITY_BORDER = {
  common:    '#5a5a5a',
  magic:     '#4070cc',
  rare:      '#c8a020',
  legendary: '#cc6600',
  mythic:    '#cc33cc',
};

const RARITY_GLOW = {
  common:    'none',
  magic:     '0 0 8px rgba(68,136,255,0.5)',
  rare:      '0 0 10px rgba(255,221,68,0.5)',
  legendary: '0 0 14px rgba(255,136,0,0.6)',
  mythic:    '0 0 18px rgba(255,68,255,0.7)',
};

const SLOT_LABELS = {
  head:     'Helmet',
  torso:    'Chest',
  legs:     'Pants',
  feet:     'Boots',
  mainHand: 'Weapon 1',
  offHand:  'Weapon 2',
  hands:    'Belt',
  neck:     'Amulet 1',
  ring1:    'Amulet 2',
  ring2:    'Ring',
};

const SLOT_ICONS = {
  head:     '🪖',  torso: '🛡️', legs: '👖', feet: '👢',
  mainHand: '⚔️', offHand: '🗡️', hands: '🎗️',
  neck:     '📿',  ring1: '💎', ring2: '💍',
};

const TYPE_TO_SLOTS = {
  weapon:  ['mainHand', 'offHand'],
  armor:   ['torso', 'head', 'hands', 'legs', 'feet'],
  shield:  ['offHand'],
  amulet:  ['neck', 'ring1'],
  ring:    ['ring1', 'ring2'],
  potion:  [],
};

const BACKPACK_COLS = 10;
const BACKPACK_ROWS = 4;
const BACKPACK_TOTAL = BACKPACK_COLS * BACKPACK_ROWS;

/* ═══════════════════════════════════════════════════════════════
   FLOATING TOOLTIP — follows cursor
   ═══════════════════════════════════════════════════════════════ */
function FloatingTooltip({ item, mousePos }) {
  if (!item) return null;

  const rarity = item.rarity || 'common';
  const lines = [];
  if (item.dmg)  lines.push({ label: 'Damage', val: `+${item.dmg}`,  c: '#ff7755' });
  if (item.def)  lines.push({ label: 'Armor',  val: `+${item.def}`,  c: '#6699dd' });
  if (item.str)  lines.push({ label: 'STR',    val: `+${item.str}`,  c: '#dd9944' });
  if (item.int)  lines.push({ label: 'INT',    val: `+${item.int}`,  c: '#aa77dd' });
  if (item.dex)  lines.push({ label: 'DEX',    val: `+${item.dex}`,  c: '#77bb77' });
  if (item.will) lines.push({ label: 'WILL',   val: `+${item.will}`, c: '#bbaa55' });
  if (item.critChance) lines.push({ label: 'Crit', val: `+${(item.critChance * 100).toFixed(1)}%`, c: '#ff5555' });
  if (item.heal) lines.push({ label: 'Heal', val: `${item.heal} HP`, c: '#55cc55' });
  if (item.manaRestore) lines.push({ label: 'Mana', val: `+${item.manaRestore}`, c: '#5599ee' });

  const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);
  const typeLabel  = (item.type || 'misc').charAt(0).toUpperCase() + (item.type || 'misc').slice(1);

  const x = Math.min(mousePos.x + 18, window.innerWidth  - 270);
  const y = Math.min(mousePos.y + 18, window.innerHeight - 240);

  return (
    <div style={{
      position: 'fixed', left: x, top: y, zIndex: 99999, pointerEvents: 'none',
      minWidth: 200, maxWidth: 260,
      background: 'linear-gradient(180deg, rgba(22,18,12,0.97), rgba(10,8,5,0.97))',
      border: `2px solid ${RARITY_BORDER[rarity]}`,
      borderRadius: 6, padding: '10px 14px',
      boxShadow: `${RARITY_GLOW[rarity]}, 0 6px 28px rgba(0,0,0,0.9)`,
      fontFamily: FONT,
    }}>
      <div style={{
        fontSize: 15, fontWeight: 700, color: RARITY_COLORS[rarity],
        textShadow: `0 0 8px ${RARITY_COLORS[rarity]}55`, marginBottom: 3,
      }}>{item.name}</div>

      <div style={{
        fontSize: 10, color: '#8a7a5a', textTransform: 'uppercase', letterSpacing: 1.5,
        paddingBottom: 6, marginBottom: 6, borderBottom: '1px solid rgba(80,60,30,0.5)',
      }}>{rarityLabel} {typeLabel}</div>

      {lines.map((l, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span style={{ fontSize: 12, color: '#b0a080' }}>{l.label}</span>
          <span style={{ fontSize: 12, color: l.c, fontWeight: 700, fontFamily: FONT_MONO }}>{l.val}</span>
        </div>
      ))}

      <div style={{
        marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(80,60,30,0.3)',
        fontSize: 10, color: '#6a5a3a', fontStyle: 'italic',
      }}>
        {item.type === 'potion'
          ? 'Right-click to consume'
          : `Right-click to ${item._src === 'equip' ? 'unequip' : 'equip'}`}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EQUIPMENT SLOT — pixel-art slot.png background
   ═══════════════════════════════════════════════════════════════ */
function EquipSlot({ slotKey, item, label, onRC, onHover, onLeave, onDragStart, onDrop, hl }) {
  const rarity = item?.rarity || 'common';
  return (
    <div
      draggable={!!item}
      onDragStart={(e) => item && onDragStart(e, { type: 'equip', slot: slotKey })}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
      onDrop={(e) => { e.preventDefault(); onDrop(e, { type: 'equip', slot: slotKey }); }}
      onContextMenu={(e) => { e.preventDefault(); if (item) onRC(slotKey); }}
      onMouseEnter={(ev) => item && onHover(item, 'equip', ev)}
      onMouseMove={(ev)  => item && onHover(item, 'equip', ev)}
      onMouseLeave={onLeave}
      style={{
        width: 60, height: 60,
        background: item
          ? 'linear-gradient(180deg, rgba(40,32,18,0.9), rgba(24,18,10,0.95))'
          : 'linear-gradient(180deg, rgba(30,24,14,0.7), rgba(16,12,6,0.8))',
        border: item ? `2px solid ${RARITY_BORDER[rarity]}` : hl ? '2px solid #8a7a44' : '2px solid #3a2a14',
        borderRadius: 4,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: item ? 'grab' : 'default',
        boxShadow: item ? RARITY_GLOW[rarity] : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {item
        ? <span style={{ fontSize: 24, lineHeight: 1, filter: 'drop-shadow(0 1px 3px #000)' }}>{SLOT_ICONS[slotKey]}</span>
        : <span style={{ fontSize: 18, opacity: 0.3, filter: 'grayscale(1)' }}>{SLOT_ICONS[slotKey]}</span>}
      <div style={{
        position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, fontFamily: FONT, whiteSpace: 'nowrap',
        color: item ? RARITY_COLORS[rarity] : '#a89870',
        textShadow: '0 0 4px #000, 0 1px 4px #000, 0 0 8px rgba(0,0,0,0.8)', fontWeight: item ? 700 : 600, letterSpacing: 0.5,
      }}>{item ? item.name : label}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BACKPACK SLOT
   ═══════════════════════════════════════════════════════════════ */
function BPSlot({ item, index, onRC, onHover, onLeave, onDragStart, onDrop }) {
  const rarity = item?.rarity || 'common';
  return (
    <div
      draggable={!!item}
      onDragStart={(e) => item && onDragStart(e, { type: 'backpack', index })}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
      onDrop={(e) => { e.preventDefault(); onDrop(e, { type: 'backpack', index }); }}
      onContextMenu={(e) => { e.preventDefault(); if (item) onRC(index); }}
      onMouseEnter={(ev) => item && onHover(item, 'backpack', ev)}
      onMouseMove={(ev)  => item && onHover(item, 'backpack', ev)}
      onMouseLeave={onLeave}
      style={{
        width: 50, height: 50,
        background: item
          ? 'linear-gradient(180deg, rgba(40,32,18,0.9), rgba(24,18,10,0.95))'
          : 'linear-gradient(180deg, rgba(28,22,12,0.7), rgba(14,10,6,0.8))',
        border: item ? `2px solid ${RARITY_BORDER[rarity]}` : '2px solid #2a1e10',
        borderRadius: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: item ? 'grab' : 'default',
        boxShadow: item ? RARITY_GLOW[rarity] : 'none',
        transition: 'all 0.12s',
      }}
    >
      {item && (
        <>
          <span style={{ fontSize: 18, lineHeight: 1, filter: 'drop-shadow(0 1px 3px #000)' }}>
            {item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : item.type === 'potion' ? '🧪' : item.type === 'ring' ? '💍' : item.type === 'amulet' ? '📿' : '❓'}
          </span>
          <span style={{
            fontSize: 9, fontFamily: FONT, color: RARITY_COLORS[rarity], fontWeight: 700,
            textAlign: 'center', lineHeight: 1.1, marginTop: 2, textShadow: '0 0 4px #000, 0 1px 4px #000',
            maxWidth: 46, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{item.name}</span>
        </>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT ROW
   ═══════════════════════════════════════════════════════════════ */
function StatRow({ label, value, bonus, color, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 8px', borderRadius: 3,
      background: 'rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(60,50,30,0.25)',
    }}>
      {icon && <span style={{ fontSize: 14, opacity: 0.7 }}>{icon}</span>}
      <span style={{ flex: 1, fontFamily: FONT, fontSize: 12, color: '#c0b090', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: color || '#e8dcc0', fontWeight: 700 }}>
        {value}
        {bonus > 0 && <span style={{ color: '#66ee66', fontSize: 11, marginLeft: 3 }}>+{bonus}</span>}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN INVENTORY COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Inventory({
  isOpen, onClose, backpack, equipment, playerStats,
  onEquipItem, onUnequipItem, onConsumePotion,
  gold, classId, onSwapBackpack,
}) {
  const [tip, setTip]       = useState(null);
  const [mpos, setMpos]     = useState({ x: 0, y: 0 });
  const [dragSrc, setDragSrc] = useState(null);

  /* Track mouse for tooltip positioning */
  useEffect(() => {
    const mv = (e) => setMpos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', mv);
    return () => window.removeEventListener('mousemove', mv);
  }, []);

  if (!isOpen) return null;

  /* ── Hero sprite ─────────────────────────────────────────── */
  const HERO_FOLDERS = { warrior: 'Knight', mage: 'Mage', rogue: 'Rogue' };
  const heroFolder = HERO_FOLDERS[classId] || 'Knight';
  const heroSprite = `assets/sprites/craftpix-891165-assassin-mage-viking-free-pixel-art-game-heroes/PNG/${heroFolder}/Idle/idle1.png`;

  /* ── Equipment bonuses ───────────────────────────────────── */
  const eb = { dmg: 0, def: 0, str: 0, int: 0, dex: 0, will: 0, critChance: 0 };
  for (const it of Object.values(equipment)) {
    if (!it) continue;
    if (it.dmg) eb.dmg += it.dmg;
    if (it.def) eb.def += it.def;
    if (it.str) eb.str += it.str;
    if (it.int) eb.int += it.int;
    if (it.dex) eb.dex += it.dex;
    if (it.will) eb.will += it.will;
    if (it.critChance) eb.critChance += it.critChance;
  }

  /* ── Hover ───────────────────────────────────────────────── */
  const hoverIn  = (item, src, ev) => { if (ev) setMpos({ x: ev.clientX, y: ev.clientY }); setTip({ ...item, _src: src }); };
  const hoverOut = () => setTip(null);

  /* ── Drag / Drop ─────────────────────────────────────────── */
  const dragStart = (e, src) => { setDragSrc(src); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); };
  const drop = (e, tgt) => {
    if (!dragSrc) return;
    if (dragSrc.type === 'backpack'  && tgt.type === 'equip')    onEquipItem(dragSrc.index);
    else if (dragSrc.type === 'equip'    && tgt.type === 'backpack') onUnequipItem(dragSrc.slot);
    else if (dragSrc.type === 'backpack' && tgt.type === 'backpack' && dragSrc.index !== tgt.index)
      onSwapBackpack?.(dragSrc.index, tgt.index);
    setDragSrc(null); setTip(null);
  };

  /* ── Right-click ─────────────────────────────────────────── */
  const bpRC = (i) => { const it = backpack[i]; if (!it) return; it.type === 'potion' ? onConsumePotion(i) : onEquipItem(i); setTip(null); };
  const eqRC = (s) => { onUnequipItem(s); setTip(null); };

  /* ── Highlight compatible slots ──────────────────────────── */
  const hl = tip && tip._src === 'backpack' ? (TYPE_TO_SLOTS[tip.type] || []) : [];

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */
  return (
    <>
      {/* ── OVERLAY — absolute, z-index 100, transparent dark ─ */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'invFadeIn 0.25s ease-out',
        }}
      >
        {/* ── MAIN WINDOW ──────────────────────────────────── */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 1020, maxWidth: '98vw',
            height: 660, maxHeight: '95vh',
            background: 'linear-gradient(180deg, #1a140c 0%, #120e08 50%, #0e0a06 100%)',
            border: '3px solid #5a4020',
            borderRadius: 6,
            boxShadow: '0 0 80px rgba(0,0,0,0.95), 0 0 30px rgba(80,50,10,0.3), inset 0 0 60px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', position: 'relative',
          }}
        >

          {/* ══ HEADER ═══════════════════════════════════════ */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 16px',
            background: 'linear-gradient(90deg, rgba(30,22,12,0.95), rgba(55,42,22,0.8), rgba(30,22,12,0.95))',
            borderBottom: '2px solid #5a4020',
            flexShrink: 0,
          }}>
            <div style={{
              fontFamily: FONT, fontSize: 22, fontWeight: 700,
              color: '#e8c860', letterSpacing: 3, textTransform: 'uppercase',
              textShadow: '0 0 12px rgba(220,180,60,0.5), 0 2px 4px #000',
            }}>⚔️ Inventory</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: FONT, fontSize: 15, color: '#ffd700', textShadow: '0 0 6px rgba(255,215,0,0.4)' }}>
                💰 {(gold || 0).toLocaleString()}
              </span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: '#7a6a4a' }}>[I] / [ESC]</span>
            </div>

            {/* X button uses slot graphic */}
            <div
              onClick={onClose}
              style={{
                width: 36, height: 36,
                background: 'linear-gradient(180deg, #3a2a14, #2a1c0c)',
                border: '2px solid #5a4020',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 20, color: '#dda855', fontWeight: 700,
                textShadow: '0 1px 3px #000', borderRadius: 4, transition: 'transform 0.1s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.15)'; e.currentTarget.style.color = '#ff8844'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.color = '#dda855'; }}
            >✕</div>
          </div>

          {/* ══ BODY — left stats | right (equip + backpack) ═ */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

            {/* ──── LEFT: STATS PANEL ──────────────────────── */}
            <div style={{
              width: 215, minWidth: 200, padding: '12px 10px',
              borderRight: '2px solid #3a2a14',
              background: 'rgba(14,10,6,0.55)',
              display: 'flex', flexDirection: 'column', gap: 3,
              overflowY: 'auto', flexShrink: 0,
            }}>
              <SectionTitle text="Vitals" />
              <StatRow icon="❤️" label="HP"    value={playerStats.maxHp}                 color="#dd4444" />
              <StatRow icon="💧" label="Mana"  value={playerStats.maxMana}               color="#4488dd" />
              <StatRow icon="⭐" label="Level" value={playerStats.level}                 color="#e8c860" />

              <SectionTitle text="Attributes" />
              <StatRow icon="💪" label="STR"  value={(playerStats.str  || 0) + eb.str}  bonus={eb.str}  color="#dd9944" />
              <StatRow icon="🧠" label="INT"  value={(playerStats.int  || 0) + eb.int}  bonus={eb.int}  color="#aa77dd" />
              <StatRow icon="🏃" label="AGI"  value={(playerStats.dex  || 0) + eb.dex}  bonus={eb.dex}  color="#77bb77" />
              <StatRow icon="🔮" label="END"  value={(playerStats.will || 0) + eb.will} bonus={eb.will} color="#bbaa55" />

              <SectionTitle text="Combat" />
              <StatRow icon="⚔️" label="Damage" value={(playerStats.baseDmg  || 0) + eb.dmg} bonus={eb.dmg} color="#ff7755" />
              <StatRow icon="🛡️" label="Armor"  value={(playerStats.def      || 0) + eb.def} bonus={eb.def} color="#6699dd" />
              <StatRow icon="💥" label="Crit"   value={`${(((playerStats.critChance || 0) + eb.critChance) * 100).toFixed(1)}%`} bonus={eb.critChance > 0 ? (eb.critChance * 100).toFixed(1) : 0} color="#ff5555" />

              <SectionTitle text="Experience" />
              <StatRow icon="📊" label="XP" value={`${playerStats.xp || 0} / ${playerStats.xpToLevel || 100}`} color="#aa8833" />
            </div>

            {/* ──── RIGHT AREA ─────────────────────────────── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

              {/* ── TOP: PAPERDOLL + 9 EQUIPMENT SLOTS ─────── */}
              <div style={{
                flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px 12px',
                background: 'linear-gradient(180deg, rgba(22,16,8,0.8), rgba(14,10,6,0.9))',
                borderBottom: '2px solid #3a2a14',
                position: 'relative',
              }}>
                {/*
                  D4-style layout: 5 columns × 3 rows
                  Col: [Left-1] [Left-2] [HERO-center] [Right-1] [Right-2]
                  Row 1:  _       Helmet    HERO         Amulet1    Amulet2
                  Row 2:  Weap1   Chest     HERO         Weap2      Belt
                  Row 3:  _       Pants     HERO         Boots      _
                */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '68px 68px 140px 68px 68px',
                  gridTemplateRows: 'repeat(3, 86px)',
                  gap: 8, alignItems: 'center', justifyItems: 'center',
                }}>
                  {/* Row 1 */}
                  <div />
                  <EquipSlot slotKey="head" item={equipment.head} label="Helmet" onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('head')} />
                  {/* HERO: spans all 3 rows */}
                  <div style={{
                    gridRow: '1 / 4', gridColumn: '3',
                    width: 135, height: 220,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'radial-gradient(ellipse, rgba(40,30,16,0.6) 0%, transparent 70%)',
                    borderRadius: 8, position: 'relative',
                  }}>
                    <img src={heroSprite} alt="Hero" style={{
                      width: 128, height: 128, imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 16px rgba(200,160,60,0.35))',
                    }} />
                    <div style={{
                      position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
                      fontFamily: FONT, fontSize: 13, color: '#dbb854', letterSpacing: 2, fontWeight: 700,
                      textShadow: '0 0 8px rgba(220,180,60,0.5), 0 1px 4px #000', whiteSpace: 'nowrap', textTransform: 'uppercase',
                    }}>{classId || 'Warrior'}</div>
                  </div>
                  <EquipSlot slotKey="neck"  item={equipment.neck}  label="Amulet 1" onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('neck')} />
                  <EquipSlot slotKey="ring1" item={equipment.ring1} label="Amulet 2" onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('ring1')} />

                  {/* Row 2 */}
                  <EquipSlot slotKey="mainHand" item={equipment.mainHand} label="Weapon 1" onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('mainHand')} />
                  <EquipSlot slotKey="torso"    item={equipment.torso}    label="Chest"    onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('torso')} />
                  {/* hero col 3 */}
                  <EquipSlot slotKey="offHand" item={equipment.offHand} label="Weapon 2" onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('offHand')} />
                  <EquipSlot slotKey="hands"   item={equipment.hands}   label="Belt"     onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('hands')} />

                  {/* Row 3 */}
                  <div />
                  <EquipSlot slotKey="legs" item={equipment.legs} label="Pants" onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('legs')} />
                  {/* hero col 3 */}
                  <EquipSlot slotKey="feet" item={equipment.feet} label="Boots" onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('feet')} />
                  <div />
                </div>
              </div>

              {/* ── BOTTOM: BACKPACK GRID ──────────────────── */}
              <div style={{
                flex: 0.8, padding: '8px 12px',
                background: 'rgba(14,10,6,0.55)',
                display: 'flex', flexDirection: 'column', overflowY: 'auto',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontFamily: FONT, fontSize: 12, color: '#c9a84c', letterSpacing: 2, textTransform: 'uppercase', textShadow: '0 0 4px rgba(200,160,60,0.3)' }}>Backpack</span>
                  <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: '#6a5a3a' }}>{backpack.filter(Boolean).length} / {BACKPACK_TOTAL}</span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${BACKPACK_COLS}, 50px)`,
                  gap: 3, justifyContent: 'center',
                }}>
                  {Array.from({ length: BACKPACK_TOTAL }, (_, i) => (
                    <BPSlot
                      key={i} index={i} item={backpack[i] || null}
                      onRC={bpRC} onHover={hoverIn} onLeave={hoverOut}
                      onDragStart={dragStart} onDrop={drop}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FLOATING TOOLTIP (rendered outside overlay for z) ─ */}
      <FloatingTooltip item={tip} mousePos={mpos} />
    </>
  );
}

/* ── Tiny helper ──────────────────────────────────────────── */
function SectionTitle({ text }) {
  return (
    <div style={{
      fontFamily: "'Cinzel', serif", fontSize: 12, color: '#dbb854',
      letterSpacing: 2, textTransform: 'uppercase',
      marginTop: 10, marginBottom: 4,
      textShadow: '0 0 6px rgba(200,160,60,0.5), 0 1px 3px #000',
      borderBottom: '1px solid rgba(200,160,60,0.15)', paddingBottom: 3,
    }}>{text}</div>
  );
}
