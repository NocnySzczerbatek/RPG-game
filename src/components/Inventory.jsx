import React, { useState, useMemo, useCallback } from 'react';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS & DATA
   ═══════════════════════════════════════════════════════════════ */
const UI = 'assets/sprites/craftpix-net-255216-free-basic-pixel-art-ui-for-rpg/PNG';

const RARITY_COLORS = {
  common:    '#9d9d9d',
  magic:     '#4488ff',
  rare:      '#ffdd44',
  legendary: '#ff8800',
};

const RARITY_GLOW = {
  common:    'none',
  magic:     '0 0 6px rgba(68,136,255,0.4)',
  rare:      '0 0 8px rgba(255,221,68,0.4)',
  legendary: '0 0 12px rgba(255,136,0,0.5)',
};

const RARITY_BG = {
  common:    'rgba(60,60,60,0.15)',
  magic:     'rgba(30,50,100,0.2)',
  rare:      'rgba(80,70,20,0.2)',
  legendary: 'rgba(100,50,0,0.25)',
};

const SLOT_NAMES = {
  head:     'Head',
  torso:    'Torso',
  hands:    'Hands',
  legs:     'Legs',
  feet:     'Feet',
  neck:     'Amulet',
  ring1:    'Ring',
  ring2:    'Ring',
  mainHand: 'Main Hand',
  offHand:  'Off-Hand',
};

const SLOT_ICONS = {
  head:     '🪖',
  torso:    '🛡️',
  hands:    '🧤',
  legs:     '👖',
  feet:     '👢',
  neck:     '📿',
  ring1:    '💍',
  ring2:    '💍',
  mainHand: '⚔️',
  offHand:  '🛡️',
};

/* Which loot‐table "type" fits which equipment slots */
const TYPE_TO_SLOTS = {
  weapon:  ['mainHand'],
  armor:   ['torso', 'head', 'hands', 'legs', 'feet'],
  shield:  ['offHand'],
  amulet:  ['neck'],
  ring:    ['ring1', 'ring2'],
  potion:  [],
};

/* ═══════════════════════════════════════════════════════════════
   SHARED STYLES
   ═══════════════════════════════════════════════════════════════ */
const FONT = "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif";
const FONT_MONO = "'Fira Code', 'Consolas', monospace";

const styles = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 9000,
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'invFadeIn 0.2s ease-out',
  },
  panel: {
    width: 920, maxWidth: '96vw', height: 620, maxHeight: '90vh',
    background: `linear-gradient(180deg, #4a3c28 0%, #3a2e1e 40%, #2c2218 100%)`,
    border: '2px solid #8a6a38',
    borderRadius: 6,
    boxShadow: '0 0 60px rgba(0,0,0,0.9), inset 0 0 40px rgba(60,45,20,0.4), 0 0 30px rgba(100,70,20,0.3)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    imageRendering: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 18px',
    borderBottom: '1px solid #6a4a20',
    background: 'linear-gradient(90deg, rgba(50,40,24,0.95), rgba(80,60,30,0.7), rgba(50,40,24,0.95))',
  },
  title: {
    fontFamily: FONT, fontSize: 20, fontWeight: 700,
    color: '#e8c860',
    letterSpacing: 2,
    textShadow: '0 0 10px rgba(220,180,60,0.5)',
    textTransform: 'uppercase',
  },
  closeBtn: {
    width: 32, height: 32, border: '1px solid #6a5030',
    background: 'rgba(60,44,28,0.9)', borderRadius: 4,
    color: '#dda855', fontSize: 18, cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.15s',
  },
  body: {
    flex: 1, display: 'flex', padding: '10px 12px', gap: 12, overflow: 'hidden',
  },
  column: {
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  sectionLabel: {
    fontFamily: FONT, fontSize: 11, fontWeight: 700,
    color: '#c9a84c', letterSpacing: 2, textTransform: 'uppercase',
    padding: '4px 0 2px', borderBottom: '1px solid rgba(100,70,30,0.6)',
    marginBottom: 4,
    textShadow: '0 0 4px rgba(200,160,60,0.2)',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 18px',
    borderTop: '1px solid #6a4a20',
    background: 'rgba(40,32,20,0.85)',
  },
};

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ── Stat Row ──────────────────────────────────────────────── */
function StatRow({ label, value, bonus, color }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '3px 6px', borderRadius: 3,
      background: 'rgba(255,255,255,0.06)',
    }}>
      <span style={{ fontFamily: FONT, fontSize: 12, color: '#c0b090', fontWeight: 600 }}>{label}</span>
      <span style={{ fontFamily: FONT_MONO, fontSize: 13, color: color || '#e8dcc0', fontWeight: 700 }}>
        {value}
        {bonus > 0 && <span style={{ color: '#6e6', fontSize: 11, marginLeft: 3 }}>+{bonus}</span>}
      </span>
    </div>
  );
}

/* ── Equipment Slot ────────────────────────────────────────── */
function EquipSlot({ slotKey, item, onRightClick, onHover, onLeave, isHighlight, onDragStart, onDragOver, onDrop }) {
  const rarity = item?.rarity || 'common';
  return (
    <div
      draggable={!!item}
      onDragStart={(e) => { if (item) onDragStart(e, { type: 'equip', slot: slotKey }, item); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
      onDrop={(e) => { e.preventDefault(); onDrop(e, { type: 'equip', slot: slotKey }); }}
      onContextMenu={(e) => { e.preventDefault(); if (item) onRightClick(slotKey); }}
      onMouseEnter={() => item && onHover(item, 'equip')}
      onMouseLeave={onLeave}
      style={{
        width: 52, height: 52,
        background: item
          ? `linear-gradient(135deg, ${RARITY_BG[rarity]}, rgba(30,24,16,0.9))`
          : 'rgba(30,24,16,0.7)',
        border: `2px solid ${item ? RARITY_COLORS[rarity] + '88' : isHighlight ? '#8a7a4a' : '#4a3a20'}`,
        borderRadius: 4,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: item ? 'pointer' : 'default',
        boxShadow: item ? RARITY_GLOW[rarity] : 'inset 0 0 10px rgba(0,0,0,0.4)',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {item ? (
        <>
          <span style={{ fontSize: 20, lineHeight: 1 }}>{SLOT_ICONS[slotKey]}</span>
          <span style={{
            fontSize: 8, fontFamily: FONT, color: RARITY_COLORS[rarity],
            textAlign: 'center', lineHeight: 1, marginTop: 2,
            maxWidth: 46, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontWeight: 600,
          }}>{item.name}</span>
        </>
      ) : (
        <>
          <span style={{ fontSize: 16, opacity: 0.4 }}>{SLOT_ICONS[slotKey]}</span>
          <span style={{
            fontSize: 8, color: '#6a5a3a', fontFamily: FONT,
            textAlign: 'center', marginTop: 1,
          }}>{SLOT_NAMES[slotKey]}</span>
        </>
      )}
    </div>
  );
}

/* ── Backpack Slot ─────────────────────────────────────────── */
function BackpackSlot({ item, index, onRightClick, onHover, onLeave, onDragStart, onDragOver, onDrop }) {
  const rarity = item?.rarity || 'common';
  return (
    <div
      draggable={!!item}
      onDragStart={(e) => { if (item) onDragStart(e, { type: 'backpack', index }, item); }}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; }}
      onDrop={(e) => { e.preventDefault(); onDrop(e, { type: 'backpack', index }); }}
      onContextMenu={(e) => { e.preventDefault(); if (item) onRightClick(index); }}
      onMouseEnter={() => item && onHover(item, 'backpack')}
      onMouseLeave={onLeave}
      style={{
        width: 48, height: 48,
        background: item
          ? `linear-gradient(135deg, ${RARITY_BG[rarity]}, rgba(24,18,12,0.95))`
          : 'rgba(24,18,12,0.8)',
        border: `1px solid ${item ? RARITY_COLORS[rarity] + '66' : '#3a2a14'}`,
        borderRadius: 3,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: item ? 'pointer' : 'default',
        boxShadow: item ? RARITY_GLOW[rarity] : 'inset 0 0 8px rgba(0,0,0,0.3)',
        transition: 'all 0.12s',
      }}
    >
      {item && (
        <>
          <span style={{ fontSize: 16, lineHeight: 1 }}>
            {item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : item.type === 'potion' ? '🧪' : item.type === 'ring' ? '💍' : item.type === 'amulet' ? '📿' : '❓'}
          </span>
          <span style={{
            fontSize: 8, fontFamily: FONT, color: RARITY_COLORS[rarity],
            textAlign: 'center', lineHeight: 1, marginTop: 1,
            maxWidth: 42, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontWeight: 600,
          }}>{item.name}</span>
        </>
      )}
    </div>
  );
}

/* ── Tooltip ───────────────────────────────────────────────── */
function ItemTooltip({ item }) {
  if (!item) return (
    <div style={{
      flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#7a6a4a', fontFamily: FONT, fontSize: 12, fontStyle: 'italic',
    }}>
      Hover over an item to inspect
    </div>
  );

  const rarity = item.rarity || 'common';
  const lines = [];
  if (item.dmg) lines.push({ label: 'Damage', value: `+${item.dmg}`, color: '#dd6644' });
  if (item.def) lines.push({ label: 'Armor', value: `+${item.def}`, color: '#6688cc' });
  if (item.str) lines.push({ label: 'Strength', value: `+${item.str}`, color: '#cc8844' });
  if (item.int) lines.push({ label: 'Intelligence', value: `+${item.int}`, color: '#8866cc' });
  if (item.dex) lines.push({ label: 'Dexterity', value: `+${item.dex}`, color: '#66aa66' });
  if (item.will) lines.push({ label: 'Willpower', value: `+${item.will}`, color: '#aa8844' });
  if (item.critChance) lines.push({ label: 'Crit Chance', value: `+${(item.critChance * 100).toFixed(1)}%`, color: '#ee5555' });
  if (item.heal) lines.push({ label: 'Restores HP', value: `${item.heal}`, color: '#55cc55' });
  if (item.manaRestore) lines.push({ label: 'Restores Mana', value: `${item.manaRestore}`, color: '#5588ee' });

  const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);
  const typeLabel = (item.type || 'misc').charAt(0).toUpperCase() + (item.type || 'misc').slice(1);

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(40,32,20,0.98), rgba(24,18,12,0.98))',
      border: `1px solid ${RARITY_COLORS[rarity]}77`,
      borderRadius: 4, padding: '10px 12px',
      boxShadow: `${RARITY_GLOW[rarity]}, inset 0 0 20px rgba(0,0,0,0.3)`,
    }}>
      {/* Name */}
      <div style={{
        fontFamily: FONT, fontSize: 14, fontWeight: 700,
        color: RARITY_COLORS[rarity],
        textShadow: `0 0 6px ${RARITY_COLORS[rarity]}44`,
        marginBottom: 2,
      }}>{item.name}</div>

      {/* Type / Rarity */}
      <div style={{
        fontFamily: FONT, fontSize: 10, color: '#9a8a5a',
        textTransform: 'uppercase', letterSpacing: 1,
        paddingBottom: 6, marginBottom: 6,
        borderBottom: '1px solid rgba(100,70,30,0.5)',
      }}>{rarityLabel} {typeLabel}</div>

      {/* Stats */}
      {lines.map((l, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '2px 0',
        }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: '#b0a080' }}>{l.label}</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: l.color, fontWeight: 700 }}>{l.value}</span>
        </div>
      ))}

      {/* Hint */}
      {item.type !== 'potion' && (
        <div style={{
          marginTop: 8, paddingTop: 6,
          borderTop: '1px solid rgba(100,70,30,0.3)',
          fontFamily: FONT, fontSize: 10, color: '#7a6a44',
          fontStyle: 'italic',
        }}>Right-click to {item._source === 'equip' ? 'unequip' : 'equip'}</div>
      )}
      {item.type === 'potion' && (
        <div style={{
          marginTop: 8, paddingTop: 6,
          borderTop: '1px solid rgba(100,70,30,0.3)',
          fontFamily: FONT, fontSize: 10, color: '#7a6a44',
          fontStyle: 'italic',
        }}>Right-click to consume</div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN INVENTORY COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function Inventory({ isOpen, onClose, backpack, equipment, playerStats, onEquipItem, onUnequipItem, onConsumePotion, gold, classId, onSwapBackpack }) {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [dragSource, setDragSource] = useState(null);

  if (!isOpen) return null;

  /* Dynamic paperdoll based on class */
  const CLASS_FOLDERS = { warrior: 'Knight', mage: 'Mage', rogue: 'Rogue' };
  const heroFolder = CLASS_FOLDERS[classId] || 'Knight';
  const heroSprite = `assets/sprites/craftpix-891165-assassin-mage-viking-free-pixel-art-game-heroes/PNG/${heroFolder}/Idle/idle1.png`;

  /* Compute bonus stats from equipment */
  const equipBonus = useMemo(() => {
    const b = { dmg: 0, def: 0, str: 0, int: 0, dex: 0, will: 0, critChance: 0 };
    for (const item of Object.values(equipment)) {
      if (!item) continue;
      if (item.dmg) b.dmg += item.dmg;
      if (item.def) b.def += item.def;
      if (item.str) b.str += item.str;
      if (item.int) b.int += item.int;
      if (item.dex) b.dex += item.dex;
      if (item.will) b.will += item.will;
      if (item.critChance) b.critChance += item.critChance;
    }
    return b;
  }, [equipment]);

  const handleItemHover = (item, source) => {
    setHoveredItem({ ...item, _source: source });
  };
  const handleItemLeave = () => setHoveredItem(null);

  /* Drag and drop handlers */
  const handleDragStart = (e, source, item) => {
    setDragSource(source);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
  };

  const handleDrop = (e, target) => {
    if (!dragSource) return;
    const src = dragSource;
    if (src.type === 'backpack' && target.type === 'equip') {
      onEquipItem(src.index);
    } else if (src.type === 'equip' && target.type === 'backpack') {
      onUnequipItem(src.slot);
    } else if (src.type === 'backpack' && target.type === 'backpack' && src.index !== target.index) {
      if (onSwapBackpack) onSwapBackpack(src.index, target.index);
    }
    setDragSource(null);
    setHoveredItem(null);
  };

  const handleBackpackRightClick = (index) => {
    const item = backpack[index];
    if (!item) return;
    if (item.type === 'potion') {
      onConsumePotion(index);
    } else {
      onEquipItem(index);
    }
    setHoveredItem(null);
  };

  const handleEquipRightClick = (slotKey) => {
    onUnequipItem(slotKey);
    setHoveredItem(null);
  };

  /* Determine which equip slots to highlight when hovering a backpack item */
  const highlightSlots = useMemo(() => {
    if (!hoveredItem || hoveredItem._source !== 'backpack') return [];
    return TYPE_TO_SLOTS[hoveredItem.type] || [];
  }, [hoveredItem]);

  const GRID_COLS = 5;
  const GRID_ROWS = 8;
  const totalSlots = GRID_COLS * GRID_ROWS;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* ── Header ────────────────────────────────────────── */}
        <div style={styles.header}>
          <div style={styles.title}>Inventory</div>
          <div style={{
            fontFamily: FONT_MONO, fontSize: 11, color: '#8a7a5a',
            letterSpacing: 1,
          }}>[I] or [ESC] to close</div>
          <div
            style={styles.closeBtn}
            onClick={onClose}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#dd8844'; e.currentTarget.style.borderColor = '#5a4020'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#aa7744'; e.currentTarget.style.borderColor = '#3a2a10'; }}
          >✕</div>
        </div>

        {/* ── Body ──────────────────────────────────────────── */}
        <div style={styles.body}>

          {/* ─── LEFT: Attributes ─────────────────────────── */}
          <div style={{ ...styles.column, width: 190, minWidth: 190 }}>
            <div style={styles.sectionLabel}>Core Attributes</div>
            <StatRow label="Strength" value={playerStats.str + equipBonus.str} bonus={equipBonus.str} />
            <StatRow label="Intelligence" value={playerStats.int + equipBonus.int} bonus={equipBonus.int} />
            <StatRow label="Dexterity" value={playerStats.dex + equipBonus.dex} bonus={equipBonus.dex} />
            <StatRow label="Willpower" value={playerStats.will + equipBonus.will} bonus={equipBonus.will} />

            <div style={{ ...styles.sectionLabel, marginTop: 8 }}>Offensive</div>
            <StatRow label="Attack Power" value={playerStats.baseDmg + equipBonus.dmg} bonus={equipBonus.dmg} color="#dd6644" />
            <StatRow label="Crit Chance" value={`${((playerStats.critChance + equipBonus.critChance) * 100).toFixed(1)}%`} bonus={equipBonus.critChance > 0 ? (equipBonus.critChance * 100).toFixed(1) : 0} color="#ee5555" />

            <div style={{ ...styles.sectionLabel, marginTop: 8 }}>Defensive</div>
            <StatRow label="Armor" value={playerStats.def + equipBonus.def} bonus={equipBonus.def} color="#6688cc" />
            <StatRow label="Max Health" value={playerStats.maxHp} color="#cc4444" />
            <StatRow label="Max Mana" value={playerStats.maxMana} color="#4466cc" />

            <div style={{ ...styles.sectionLabel, marginTop: 8 }}>General</div>
            <StatRow label="Level" value={playerStats.level} color="#c9a84c" />
            <StatRow label="Experience" value={`${playerStats.xp} / ${playerStats.xpToLevel}`} color="#aa8833" />
          </div>

          {/* ─── CENTER: Paperdoll ────────────────────────── */}
          <div style={{
            ...styles.column, flex: 1,
            alignItems: 'center', justifyContent: 'center',
            position: 'relative',
            minWidth: 220,
          }}>
            {/* Dark ornamental background */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(50,40,24,0.5) 0%, transparent 70%)',
              pointerEvents: 'none',
            }} />

            {/* Equipment layout */}
            <div style={{
              display: 'grid',
              gridTemplateAreas: `
                ".       head    .      "
                "neck    torso   offHand"
                "mainHand torso  ring1  "
                "hands   legs    ring2  "
                ".       feet    .      "
              `,
              gridTemplateColumns: '58px 110px 58px',
              gridTemplateRows: 'repeat(5, 58px)',
              gap: 4,
              alignItems: 'center',
              justifyItems: 'center',
            }}>
              {/* Head */}
              <div style={{ gridArea: 'head' }}>
                <EquipSlot slotKey="head" item={equipment.head} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('head')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
              </div>
              {/* Neck */}
              <div style={{ gridArea: 'neck' }}>
                <EquipSlot slotKey="neck" item={equipment.neck} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('neck')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
              </div>
              {/* Torso — spans 2 rows visually, holds the hero sprite */}
              <div style={{
                gridArea: 'torso',
                width: 110, height: 120,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                {/* Hero frame */}
                <div style={{
                  width: 100, height: 110,
                  background: 'rgba(30,24,16,0.7)',
                  border: '1px solid #4a3a20',
                  borderRadius: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5), 0 0 10px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                }}>
                  <img
                    src={heroSprite}
                    alt="Hero"
                    style={{
                      width: 90, height: 90,
                      imageRendering: 'pixelated',
                      filter: 'drop-shadow(0 0 8px rgba(200,160,60,0.2))',
                    }}
                  />
                </div>
                {/* Equip slot overlay for torso */}
                <div style={{ position: 'absolute', bottom: -6, right: -6 }}>
                  <EquipSlot slotKey="torso" item={equipment.torso} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('torso')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
                </div>
              </div>
              {/* Off-hand */}
              <div style={{ gridArea: 'offHand' }}>
                <EquipSlot slotKey="offHand" item={equipment.offHand} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('offHand')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
              </div>
              {/* Main Hand */}
              <div style={{ gridArea: 'mainHand' }}>
                <EquipSlot slotKey="mainHand" item={equipment.mainHand} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('mainHand')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
              </div>
              {/* Ring 1 */}
              <div style={{ gridArea: 'ring1' }}>
                <EquipSlot slotKey="ring1" item={equipment.ring1} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('ring1')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
              </div>
              {/* Hands */}
              <div style={{ gridArea: 'hands' }}>
                <EquipSlot slotKey="hands" item={equipment.hands} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('hands')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
              </div>
              {/* Legs */}
              <div style={{ gridArea: 'legs' }}>
                <EquipSlot slotKey="legs" item={equipment.legs} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('legs')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
              </div>
              {/* Ring 2 */}
              <div style={{ gridArea: 'ring2' }}>
                <EquipSlot slotKey="ring2" item={equipment.ring2} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('ring2')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
              </div>
              {/* Feet */}
              <div style={{ gridArea: 'feet' }}>
                <EquipSlot slotKey="feet" item={equipment.feet} onRightClick={handleEquipRightClick} onHover={handleItemHover} onLeave={handleItemLeave} isHighlight={highlightSlots.includes('feet')} onDragStart={handleDragStart} onDragOver={() => {}} onDrop={handleDrop} />
              </div>
            </div>
          </div>

          {/* ─── RIGHT: Backpack & Tooltip ────────────────── */}
          <div style={{ ...styles.column, width: 280, minWidth: 260 }}>
            <div style={styles.sectionLabel}>Backpack</div>

            {/* Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLS}, 48px)`,
              gap: 3,
              justifyContent: 'center',
              padding: 6,
              background: 'rgba(30,24,14,0.7)',
              border: '1px solid #4a3a1c',
              borderRadius: 4,
            }}>
              {Array.from({ length: totalSlots }, (_, i) => (
                <BackpackSlot
                  key={i}
                  index={i}
                  item={backpack[i] || null}
                  onRightClick={handleBackpackRightClick}
                  onHover={handleItemHover}
                  onLeave={handleItemLeave}
                  onDragStart={handleDragStart}
                  onDragOver={() => {}}
                  onDrop={handleDrop}
                />
              ))}
            </div>

            {/* Tooltip / Inspection area */}
            <div style={{
              ...styles.sectionLabel, marginTop: 8,
            }}>Item Details</div>
            <div style={{
              flex: 1, minHeight: 100,
              overflow: 'auto',
            }}>
              <ItemTooltip item={hoveredItem} />
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <div style={styles.footer}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 16 }}>💰</span>
            <span style={{
              fontFamily: FONT, fontSize: 14, color: '#ffd700',
              textShadow: '0 0 4px rgba(255,215,0,0.3)',
            }}>{gold?.toLocaleString() || 0}</span>
          </div>
          <div style={{
            fontFamily: FONT, fontSize: 10, color: '#6a5a3a',
            letterSpacing: 1,
          }}>
            {backpack.filter(Boolean).length} / {totalSlots} slots used
          </div>
        </div>
      </div>
    </div>
  );
}
