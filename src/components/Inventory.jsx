import React, { useState, useEffect } from 'react';
import { RARITIES, SLOT_LABELS, TYPE_TO_SLOTS, SKILL_TREES, canClassEquip } from '../data/ItemDatabase';

/* ═══════════════════════════════════════════════════════════════
   STYLE CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const FONT = "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif";
const FONT_MONO = "'Fira Code', 'Consolas', monospace";

const RC = { common: '#9d9d9d', magic: '#6496ff', rare: '#ffe066', legendary: '#ff9933', mythic: '#ff55ff' };
const RB = { common: '#5a5a5a', magic: '#4070cc', rare: '#c8a020', legendary: '#cc6600', mythic: '#cc33cc' };
const RG = { common: 'none', magic: '0 0 8px rgba(68,136,255,0.5)', rare: '0 0 10px rgba(255,221,68,0.5)', legendary: '0 0 14px rgba(255,136,0,0.6)', mythic: '0 0 18px rgba(255,68,255,0.7)' };

const HERO_FOLDERS = { warrior: 'Knight', mage: 'Mage', rogue: 'Rogue' };

const SLOT_ICONS = {
  head: '🪖', torso: '🛡️', legs: '👖', feet: '👢',
  mainHand: '⚔️', offHand: '🗡️', hands: '🎗️',
  neck: '📿', ring1: '💎',
};

/* ═══════════════════════════════════════════════════════════════
   FLOATING TOOLTIP
   ═══════════════════════════════════════════════════════════════ */
function FloatingTooltip({ item, mousePos, classId }) {
  if (!item) return null;
  const rarity = item.rarity || 'common';
  const classBlocked = item._src === 'backpack' && !canClassEquip(classId, item);
  const lines = [];
  if (item.dmg) lines.push({ label: 'Obrażenia', val: `+${item.dmg}`, c: '#ff7755' });
  if (item.def) lines.push({ label: 'Pancerz', val: `+${item.def}`, c: '#6699dd' });
  if (item.str) lines.push({ label: 'SIŁ', val: `+${item.str}`, c: '#dd9944' });
  if (item.int) lines.push({ label: 'INT', val: `+${item.int}`, c: '#aa77dd' });
  if (item.dex) lines.push({ label: 'ZRE', val: `+${item.dex}`, c: '#77bb77' });
  if (item.will) lines.push({ label: 'WOL', val: `+${item.will}`, c: '#bbaa55' });
  if (item.critChance) lines.push({ label: 'Krytyk', val: `+${(item.critChance * 100).toFixed(1)}%`, c: '#ff5555' });
  if (item.heal) lines.push({ label: 'Leczenie', val: `${item.heal} PŻ`, c: '#55cc55' });
  if (item.manaRestore) lines.push({ label: 'Mana', val: `+${item.manaRestore}`, c: '#5599ee' });

  const rarityLabel = (RARITIES[rarity]?.label) || rarity;
  const typeMap = { weapon: 'Broń', dagger: 'Sztylet', bow: 'Łuk', armor: 'Zbroja', helmet: 'Hełm', pants: 'Spodnie', boots: 'Buty', belt: 'Pas', shield: 'Tarcza', amulet: 'Amulet', ring: 'Pierścień', potion: 'Mikstura' };
  const typeLabel = typeMap[item.type] || item.type;

  const x = Math.min(mousePos.x + 18, window.innerWidth - 270);
  const y = Math.min(mousePos.y + 18, window.innerHeight - 240);

  return (
    <div style={{
      position: 'fixed', left: x, top: y, zIndex: 99999, pointerEvents: 'none',
      minWidth: 200, maxWidth: 260,
      background: 'linear-gradient(180deg, rgba(22,18,12,0.97), rgba(10,8,5,0.97))',
      border: `2px solid ${RB[rarity]}`, borderRadius: 6, padding: '10px 14px',
      boxShadow: `${RG[rarity]}, 0 6px 28px rgba(0,0,0,0.9)`, fontFamily: FONT,
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: RC[rarity], textShadow: `0 0 8px ${RC[rarity]}55`, marginBottom: 3 }}>{item.name}</div>
      <div style={{ fontSize: 10, color: '#8a7a5a', textTransform: 'uppercase', letterSpacing: 1.5, paddingBottom: 6, marginBottom: 6, borderBottom: '1px solid rgba(80,60,30,0.5)' }}>{rarityLabel} {typeLabel}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
          <span style={{ fontSize: 12, color: '#b0a080' }}>{l.label}</span>
          <span style={{ fontSize: 12, color: l.c, fontWeight: 700, fontFamily: FONT_MONO }}>{l.val}</span>
        </div>
      ))}
      <div style={{ marginTop: 8, paddingTop: 6, borderTop: '1px solid rgba(80,60,30,0.3)', fontSize: 10, color: '#6a5a3a', fontStyle: 'italic' }}>
        {item.type === 'potion' ? 'PPM — użyj' : `PPM — ${item._src === 'equip' ? 'zdejmij' : 'załóż'}`}
      </div>
      {classBlocked && (
        <div style={{ marginTop: 6, padding: '4px 6px', background: 'rgba(180,30,30,0.2)', border: '1px solid #882222', borderRadius: 3, fontSize: 10, color: '#ff5544', fontWeight: 700, textAlign: 'center' }}>
          ✕ Ta klasa nie może używać tego przedmiotu
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   EQUIPMENT SLOT
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
      onMouseMove={(ev) => item && onHover(item, 'equip', ev)}
      onMouseLeave={onLeave}
      style={{
        width: 60, height: 60,
        background: item ? 'linear-gradient(180deg, rgba(40,32,18,0.9), rgba(24,18,10,0.95))' : 'linear-gradient(180deg, rgba(30,24,14,0.7), rgba(16,12,6,0.8))',
        border: item ? `2px solid ${RB[rarity]}` : hl ? '2px solid #8a7a44' : '2px solid #3a2a14',
        borderRadius: 4,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: item ? 'grab' : 'default',
        boxShadow: item ? RG[rarity] : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        position: 'relative',
      }}
    >
      {item && item.icon
        ? <img src={item.icon} alt="" style={{ width: 40, height: 40, imageRendering: 'pixelated', filter: 'drop-shadow(0 1px 3px #000)' }} />
        : item
          ? <span style={{ fontSize: 24, lineHeight: 1, filter: 'drop-shadow(0 1px 3px #000)' }}>{SLOT_ICONS[slotKey]}</span>
          : <span style={{ fontSize: 18, opacity: 0.3, filter: 'grayscale(1)' }}>{SLOT_ICONS[slotKey]}</span>}
      <div style={{
        position: 'absolute', bottom: -16, left: '50%', transform: 'translateX(-50%)',
        fontSize: 10, fontFamily: FONT, whiteSpace: 'nowrap',
        color: item ? RC[rarity] : '#a89870',
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
      onMouseMove={(ev) => item && onHover(item, 'backpack', ev)}
      onMouseLeave={onLeave}
      style={{
        width: 50, height: 50,
        background: item ? 'linear-gradient(180deg, rgba(40,32,18,0.9), rgba(24,18,10,0.95))' : 'linear-gradient(180deg, rgba(28,22,12,0.7), rgba(14,10,6,0.8))',
        border: item ? `2px solid ${RB[rarity]}` : '2px solid #2a1e10',
        borderRadius: 3,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: item ? 'grab' : 'default',
        boxShadow: item ? RG[rarity] : 'none',
        transition: 'all 0.12s',
      }}
    >
      {item && (
        item.icon
          ? <img src={item.icon} alt="" style={{ width: 34, height: 34, imageRendering: 'pixelated', filter: 'drop-shadow(0 1px 3px #000)' }} />
          : <span style={{ fontSize: 18, lineHeight: 1, filter: 'drop-shadow(0 1px 3px #000)' }}>
              {item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : item.type === 'potion' ? '🧪' : item.type === 'ring' ? '💍' : item.type === 'amulet' ? '📿' : '❓'}
            </span>
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

function SectionTitle({ text }) {
  return (
    <div style={{
      fontFamily: FONT, fontSize: 12, color: '#dbb854',
      letterSpacing: 2, textTransform: 'uppercase',
      marginTop: 10, marginBottom: 4,
      textShadow: '0 0 6px rgba(200,160,60,0.5), 0 1px 3px #000',
      borderBottom: '1px solid rgba(200,160,60,0.15)', paddingBottom: 3,
    }}>{text}</div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: STATYSTYKI (Stats)
   ═══════════════════════════════════════════════════════════════ */
function StatsTab({ playerStats, equipment }) {
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
  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <SectionTitle text="Żywotność" />
      <StatRow icon="❤️" label="PŻ" value={playerStats.maxHp} color="#dd4444" />
      <StatRow icon="💧" label="Mana" value={playerStats.maxMana} color="#4488dd" />
      <StatRow icon="⭐" label="Poziom" value={playerStats.level} color="#e8c860" />

      <SectionTitle text="Atrybuty" />
      <StatRow icon="💪" label="SIŁ" value={(playerStats.str || 0) + eb.str} bonus={eb.str} color="#dd9944" />
      <StatRow icon="🧠" label="INT" value={(playerStats.int || 0) + eb.int} bonus={eb.int} color="#aa77dd" />
      <StatRow icon="🏃" label="ZRE" value={(playerStats.dex || 0) + eb.dex} bonus={eb.dex} color="#77bb77" />
      <StatRow icon="🔮" label="WOL" value={(playerStats.will || 0) + eb.will} bonus={eb.will} color="#bbaa55" />

      <SectionTitle text="Walka" />
      <StatRow icon="⚔️" label="Obrażenia" value={(playerStats.baseDmg || 0) + eb.dmg} bonus={eb.dmg} color="#ff7755" />
      <StatRow icon="🛡️" label="Pancerz" value={(playerStats.def || 0) + eb.def} bonus={eb.def} color="#6699dd" />
      <StatRow icon="💥" label="Krytyk" value={`${(((playerStats.critChance || 0) + eb.critChance) * 100).toFixed(1)}%`} bonus={eb.critChance > 0 ? (eb.critChance * 100).toFixed(1) : 0} color="#ff5555" />

      <SectionTitle text="Doświadczenie" />
      <StatRow icon="📊" label="PD" value={`${playerStats.xp || 0} / ${playerStats.xpToLevel || 100}`} color="#aa8833" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: EKWIPUNEK (Gear)
   ═══════════════════════════════════════════════════════════════ */
function GearTab({
  backpack, equipment, classId, gold,
  onEquipItem, onUnequipItem, onConsumePotion, onSwapBackpack,
  tip, setTip, mpos, setMpos,
}) {
  const heroFolder = HERO_FOLDERS[classId] || 'Knight';
  const heroSprite = `assets/sprites/craftpix-891165-assassin-mage-viking-free-pixel-art-game-heroes/PNG/${heroFolder}/Idle/idle1.png`;

  const [dragSrc, setDragSrc] = useState(null);
  const hoverIn = (item, src, ev) => { if (ev) setMpos({ x: ev.clientX, y: ev.clientY }); setTip({ ...item, _src: src }); };
  const hoverOut = () => setTip(null);
  const dragStart = (e, src) => { setDragSrc(src); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); };

  const [errMsg, setErrMsg] = useState(null);

  const showErr = (msg) => { setErrMsg(msg); setTimeout(() => setErrMsg(null), 2000); };

  const drop = (e, tgt) => {
    if (!dragSrc) return;
    // Slot validation for equip drops
    if (dragSrc.type === 'backpack' && tgt.type === 'equip') {
      const item = backpack[dragSrc.index];
      if (item) {
        if (!canClassEquip(classId, item)) { showErr('Ta klasa nie może używać tego przedmiotu'); setDragSrc(null); return; }
        const allowed = TYPE_TO_SLOTS[item.type] || [];
        if (!allowed.includes(tgt.slot)) { setDragSrc(null); return; } // wrong slot
      }
      onEquipItem(dragSrc.index);
    } else if (dragSrc.type === 'equip' && tgt.type === 'backpack') {
      onUnequipItem(dragSrc.slot);
    } else if (dragSrc.type === 'backpack' && tgt.type === 'backpack' && dragSrc.index !== tgt.index) {
      onSwapBackpack?.(dragSrc.index, tgt.index);
    }
    setDragSrc(null); setTip(null);
  };

  const bpRC = (i) => {
    const it = backpack[i]; if (!it) return;
    if (it.type === 'potion') { onConsumePotion(i); setTip(null); return; }
    if (!canClassEquip(classId, it)) { showErr('Ta klasa nie może używać tego przedmiotu'); return; }
    onEquipItem(i); setTip(null);
  };
  const eqRC = (s) => { onUnequipItem(s); setTip(null); };
  const hl = tip && tip._src === 'backpack' ? (TYPE_TO_SLOTS[tip.type] || []) : [];

  const classLabel = { warrior: 'Wojownik', mage: 'Mag', rogue: 'Łotrzyk' };
  const BACKPACK_COLS = 10;
  const BACKPACK_TOTAL = 40;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Class restriction error toast */}
      {errMsg && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 300,
          background: 'rgba(120,20,20,0.95)', border: '2px solid #cc3333', borderRadius: 4,
          padding: '8px 16px', fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#ff6644',
          textShadow: '0 1px 3px #000', whiteSpace: 'nowrap',
          boxShadow: '0 4px 16px rgba(0,0,0,0.7)',
          animation: 'errShake 0.3s ease-out',
        }}>✕ {errMsg}</div>
      )}
      {/* Equipment paperdoll */}
      <div style={{
        flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '8px 12px',
        background: 'linear-gradient(180deg, rgba(22,16,8,0.8), rgba(14,10,6,0.9))',
        borderBottom: '2px solid #3a2a14', position: 'relative',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '68px 68px 140px 68px 68px',
          gridTemplateRows: 'repeat(3, 86px)',
          gap: 8, alignItems: 'center', justifyItems: 'center',
        }}>
          {/* Row 1 */}
          <div />
          <EquipSlot slotKey="head" item={equipment.head} label={SLOT_LABELS.head} onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('head')} />
          <div style={{
            gridRow: '1 / 4', gridColumn: '3',
            width: 135, height: 220,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(ellipse, rgba(40,30,16,0.6) 0%, transparent 70%)',
            borderRadius: 8, position: 'relative',
          }}>
            <img src={heroSprite} alt="Hero" style={{ width: 128, height: 128, imageRendering: 'pixelated', filter: 'drop-shadow(0 0 16px rgba(200,160,60,0.35))' }} />
            <div style={{
              position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
              fontFamily: FONT, fontSize: 13, color: '#dbb854', letterSpacing: 2, fontWeight: 700,
              textShadow: '0 0 8px rgba(220,180,60,0.5), 0 1px 4px #000', whiteSpace: 'nowrap', textTransform: 'uppercase',
            }}>{classLabel[classId] || 'Wojownik'}</div>
          </div>
          <EquipSlot slotKey="neck" item={equipment.neck} label={SLOT_LABELS.neck} onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('neck')} />
          <EquipSlot slotKey="ring1" item={equipment.ring1} label={SLOT_LABELS.ring1} onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('ring1')} />

          {/* Row 2 */}
          <EquipSlot slotKey="mainHand" item={equipment.mainHand} label={SLOT_LABELS.mainHand} onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('mainHand')} />
          <EquipSlot slotKey="torso" item={equipment.torso} label={SLOT_LABELS.torso} onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('torso')} />
          <EquipSlot slotKey="offHand" item={equipment.offHand} label={SLOT_LABELS.offHand} onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('offHand')} />
          <EquipSlot slotKey="hands" item={equipment.hands} label={SLOT_LABELS.hands} onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('hands')} />

          {/* Row 3 */}
          <div />
          <EquipSlot slotKey="legs" item={equipment.legs} label={SLOT_LABELS.legs} onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('legs')} />
          <EquipSlot slotKey="feet" item={equipment.feet} label={SLOT_LABELS.feet} onRC={eqRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} hl={hl.includes('feet')} />
          <div />
        </div>
      </div>

      {/* Backpack */}
      <div style={{ flex: 0.8, padding: '8px 12px', background: 'rgba(14,10,6,0.55)', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontFamily: FONT, fontSize: 12, color: '#dbb854', letterSpacing: 2, textTransform: 'uppercase', textShadow: '0 0 4px rgba(200,160,60,0.3)' }}>Plecak</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: '#6a5a3a' }}>{backpack.filter(Boolean).length} / {BACKPACK_TOTAL}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${BACKPACK_COLS}, 50px)`, gap: 3, justifyContent: 'center' }}>
          {Array.from({ length: BACKPACK_TOTAL }, (_, i) => (
            <BPSlot key={i} index={i} item={backpack[i] || null} onRC={bpRC} onHover={hoverIn} onLeave={hoverOut} onDragStart={dragStart} onDrop={drop} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB: UMIEJĘTNOŚCI (Skills)
   ═══════════════════════════════════════════════════════════════ */
function SkillsTab({ classId, unlockedSkills, skillPoints, onUnlock, skillSlots, onAssignSlot }) {
  const tree = SKILL_TREES[classId] || SKILL_TREES.warrior;
  const [selected, setSelected] = useState(null);

  const canUnlock = (skill) => {
    if (unlockedSkills.includes(skill.id)) return false;
    if (skillPoints <= 0) return false;
    if (!skill.requires) return true;
    return skill.requires.some(r => unlockedSkills.includes(r));
  };

  const tiers = [1, 2, 3, 4];
  const slotKeys = ['Q', 'W', 'E', 'R'];

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Skill points */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: FONT, fontSize: 14, color: '#dbb854', textTransform: 'uppercase', letterSpacing: 2 }}>Drzewo Umiejętności</span>
        <span style={{ fontFamily: FONT_MONO, fontSize: 12, color: '#66ee66' }}>Punkty: {skillPoints}</span>
      </div>

      {/* Skill tree */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tiers.map(tier => {
          const tierSkills = tree.skills.filter(s => s.tier === tier);
          const tierLabel = tier === 4 ? 'Pasywne' : `Poziom ${tier}`;
          return (
            <div key={tier}>
              <div style={{ fontSize: 10, color: '#8a7a5a', fontFamily: FONT, letterSpacing: 1, marginBottom: 4, textTransform: 'uppercase' }}>{tierLabel}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tierSkills.map(skill => {
                  const unlocked = unlockedSkills.includes(skill.id);
                  const available = canUnlock(skill);
                  const isSelected = selected === skill.id;
                  return (
                    <div
                      key={skill.id}
                      onClick={() => setSelected(isSelected ? null : skill.id)}
                      style={{
                        width: 72, padding: '6px 4px',
                        background: unlocked ? 'rgba(60,50,20,0.8)' : available ? 'rgba(40,32,18,0.7)' : 'rgba(20,16,10,0.7)',
                        border: `2px solid ${unlocked ? '#c9a84c' : available ? '#6a5a3a' : '#2a2014'}`,
                        borderRadius: 4, cursor: available || unlocked ? 'pointer' : 'default',
                        opacity: !unlocked && !available ? 0.4 : 1,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                        boxShadow: isSelected ? '0 0 12px rgba(200,160,60,0.5)' : unlocked ? '0 0 6px rgba(200,160,60,0.2)' : 'none',
                        transition: 'all 0.15s',
                      }}
                    >
                      <img src={skill.icon} alt="" style={{ width: 36, height: 36, imageRendering: 'pixelated', filter: unlocked ? 'none' : 'grayscale(0.7) brightness(0.6)' }} />
                      <span style={{ fontSize: 8, fontFamily: FONT, color: unlocked ? '#dbb854' : '#6a5a3a', textAlign: 'center', lineHeight: 1.1, fontWeight: 700 }}>{skill.name}</span>
                      {unlocked && <span style={{ fontSize: 7, color: '#66ee66', fontFamily: FONT_MONO }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected skill detail + unlock */}
      {selected && (() => {
        const skill = tree.skills.find(s => s.id === selected);
        if (!skill) return null;
        const unlocked = unlockedSkills.includes(skill.id);
        const available = canUnlock(skill);
        return (
          <div style={{
            background: 'rgba(20,16,10,0.9)', border: '2px solid #4a3a18', borderRadius: 4, padding: '10px 14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <img src={skill.icon} alt="" style={{ width: 40, height: 40, imageRendering: 'pixelated' }} />
              <div>
                <div style={{ fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#dbb854' }}>{skill.name}</div>
                <div style={{ fontFamily: FONT, fontSize: 10, color: '#8a7a5a' }}>
                  {skill.passive ? 'Pasywna' : `Klawisz: ${skill.key} | Mana: ${skill.manaCost} | OD: ${skill.cooldown}s`}
                </div>
              </div>
            </div>
            <div style={{ fontFamily: FONT, fontSize: 11, color: '#c0b090', lineHeight: 1.4, marginBottom: 8 }}>{skill.desc}</div>
            {!unlocked && available && (
              <button
                onClick={() => onUnlock(skill.id)}
                style={{
                  width: '100%', padding: '6px', background: 'linear-gradient(180deg, #5a4420, #3a2a14)',
                  border: '2px solid #c9a84c', borderRadius: 3, color: '#dbb854', fontFamily: FONT,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: 1,
                }}
              >Odblokuj (1 punkt)</button>
            )}
            {unlocked && !skill.passive && (
              <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                {slotKeys.map(k => (
                  <button
                    key={k}
                    onClick={() => onAssignSlot(k.toLowerCase(), skill.id)}
                    style={{
                      flex: 1, padding: '4px 0',
                      background: skillSlots[k.toLowerCase()] === skill.id ? 'rgba(200,160,60,0.3)' : 'rgba(20,16,10,0.8)',
                      border: `1px solid ${skillSlots[k.toLowerCase()] === skill.id ? '#c9a84c' : '#3a2a14'}`,
                      borderRadius: 2, color: skillSlots[k.toLowerCase()] === skill.id ? '#dbb854' : '#6a5a3a',
                      fontFamily: FONT_MONO, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    }}
                  >Slot {k}</button>
                ))}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN INVENTORY — 3-TAB SYSTEM
   ═══════════════════════════════════════════════════════════════ */
export default function Inventory({
  isOpen, onClose, backpack, equipment, playerStats,
  onEquipItem, onUnequipItem, onConsumePotion,
  gold, classId, onSwapBackpack,
  unlockedSkills, skillPoints, onUnlockSkill, skillSlots, onAssignSlot,
}) {
  const [tab, setTab] = useState('gear');
  const [tip, setTip] = useState(null);
  const [mpos, setMpos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mv = (e) => setMpos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', mv);
    return () => window.removeEventListener('mousemove', mv);
  }, []);

  if (!isOpen) return null;

  const tabs = [
    { id: 'stats', label: 'Statystyki', icon: '📊' },
    { id: 'gear', label: 'Ekwipunek', icon: '⚔️' },
    { id: 'skills', label: 'Umiejętności', icon: '✨' },
  ];

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'invFadeIn 0.25s ease-out',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            width: 1020, maxWidth: '98vw',
            height: 680, maxHeight: '95vh',
            background: 'linear-gradient(180deg, #1a140c 0%, #120e08 50%, #0e0a06 100%)',
            border: '3px solid #5a4020',
            borderRadius: 6,
            boxShadow: '0 0 80px rgba(0,0,0,0.95), 0 0 30px rgba(80,50,10,0.3), inset 0 0 60px rgba(0,0,0,0.4)',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', position: 'relative',
          }}
        >
          {/* HEADER */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 16px',
            background: 'linear-gradient(90deg, rgba(30,22,12,0.95), rgba(55,42,22,0.8), rgba(30,22,12,0.95))',
            borderBottom: '2px solid #5a4020',
            flexShrink: 0,
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 4 }}>
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    padding: '6px 14px',
                    background: tab === t.id ? 'rgba(200,160,60,0.2)' : 'transparent',
                    border: `2px solid ${tab === t.id ? '#c9a84c' : '#3a2a14'}`,
                    borderRadius: 3,
                    color: tab === t.id ? '#dbb854' : '#6a5a3a',
                    fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    transition: 'all 0.15s', letterSpacing: 1,
                  }}
                >{t.icon} {t.label}</button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontFamily: FONT, fontSize: 15, color: '#ffd700', textShadow: '0 0 6px rgba(255,215,0,0.4)' }}>💰 {(gold || 0).toLocaleString()}</span>
              <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: '#7a6a4a' }}>[I] / [ESC]</span>
            </div>

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

          {/* BODY */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {tab === 'stats' && <StatsTab playerStats={playerStats} equipment={equipment} />}
            {tab === 'gear' && (
              <GearTab
                backpack={backpack} equipment={equipment} classId={classId} gold={gold}
                onEquipItem={onEquipItem} onUnequipItem={onUnequipItem}
                onConsumePotion={onConsumePotion} onSwapBackpack={onSwapBackpack}
                tip={tip} setTip={setTip} mpos={mpos} setMpos={setMpos}
              />
            )}
            {tab === 'skills' && (
              <SkillsTab
                classId={classId}
                unlockedSkills={unlockedSkills || []}
                skillPoints={skillPoints || 0}
                onUnlock={onUnlockSkill}
                skillSlots={skillSlots || { q: null, w: null, e: null, r: null }}
                onAssignSlot={onAssignSlot}
              />
            )}
          </div>
        </div>
      </div>
      <FloatingTooltip item={tip} mousePos={mpos} classId={classId} />
    </>
  );
}
