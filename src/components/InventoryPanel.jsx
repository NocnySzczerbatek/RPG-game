// ============================================================
// COMPONENT: Inventory Panel — Diablo IV Triple-Column Layout
// CraftPix pack #4 (craftpix-net-255216) pixel-art UI assets
// Polish labels · No CSS borders · All backgroundImage panels
// ============================================================
import React, { useState } from 'react';
import { ITEMS } from '../data/items.js';
import { getPortraitPath, CLASS_WEAPONS, getClassSkills } from './GameMap.jsx';

const UI = 'assets/sprites/craftpix-net-255216-free-basic-pixel-art-ui-for-rpg/PNG/';

const RARITY_CLR = {
  common: '#8a8a8a', rare: '#4488ff', epic: '#aa44ff', legendary: '#ffaa22', divine: '#ffee44',
};
const RARITY_GLOW = {
  common:    'none',
  rare:      '0 0 6px rgba(68,136,255,0.5)',
  epic:      '0 0 8px rgba(170,68,255,0.5)',
  legendary: '0 0 10px rgba(255,170,34,0.6)',
  divine:    '0 0 14px rgba(255,238,68,0.7)',
};
const RARITY_PL = {
  common: 'Zwykły', rare: 'Rzadki', epic: 'Epicki', legendary: 'Legendarny', divine: 'Boski',
};

const getItemData = (id) => ITEMS?.[id] || null;

// ── Reusable tiledBg: tiles Main_tiles.png as a subtle panel texture ──
const tiledBg = (alpha = 0.12) => ({
  backgroundImage: `url('${UI}Main_tiles.png')`,
  backgroundSize: '192px 152px',
  backgroundRepeat: 'repeat',
  imageRendering: 'pixelated',
  opacity: alpha,
  position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
});

// ── Slot with Equipment.png spritesheet backdrop ──
// Equipment.png is 160×384. 10 cols × 24 rows of 16px cells.
// We scale ×3 for visual 48×48 slots
const slotBg = (hasItem, rarity = 'common') => ({
  width: 48, height: 48,
  backgroundImage: `url('${UI}Equipment.png')`,
  backgroundSize: `${160 * 3}px ${384 * 3}px`,
  backgroundPosition: '0 0',
  imageRendering: 'pixelated',
  borderRadius: 4,
  boxShadow: hasItem
    ? `${RARITY_GLOW[rarity] || 'none'}, inset 0 0 10px rgba(0,0,0,0.5)`
    : 'inset 0 0 10px rgba(0,0,0,0.7)',
  outline: hasItem ? `2px solid ${RARITY_CLR[rarity] || '#555'}` : '1px solid #2a1e0a',
  outlineOffset: '-1px',
  cursor: hasItem ? 'pointer' : 'default',
  position: 'relative',
});

// ── Panel section wrapper (uses Main_tiles.png tiling) ──
const Panel = ({ children, className = '', style = {} }) => (
  <div className={`relative overflow-hidden ${className}`}
    style={{
      backgroundColor: 'rgba(10,7,3,0.94)',
      borderImage: `url('${UI}Main_tiles.png') 16 stretch`,
      borderWidth: 4, borderStyle: 'solid',
      borderColor: '#3a2a10',
      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.6), 0 0 12px rgba(0,0,0,0.5)',
      imageRendering: 'pixelated',
      borderRadius: 6,
      ...style,
    }}>
    <div style={tiledBg(0.06)} />
    <div className="relative z-10">{children}</div>
  </div>
);

// ── Section label ──
const SectionLabel = ({ text }) => (
  <div className="flex items-center gap-2 mb-2">
    <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, #5a4420, transparent)' }} />
    <span className="font-cinzel text-[11px] font-bold tracking-widest uppercase"
      style={{ color: '#c9a84c', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>{text}</span>
    <div style={{ height: 1, flex: 1, background: 'linear-gradient(270deg, #5a4420, transparent)' }} />
  </div>
);

// ── Stat row — white text on dark ──
const StatRow = ({ icon, label, value, bonus }) => (
  <div className="flex items-center py-[3px]">
    {icon && <span className="mr-1.5 text-[10px]">{icon}</span>}
    <span className="flex-1 font-cinzel text-[11px]" style={{ color: '#b0a080' }}>{label}</span>
    <span className="font-mono text-[11px] font-bold" style={{ color: '#fff' }}>
      {value}
      {bonus > 0 && <span style={{ color: '#44dd44' }} className="ml-1 font-normal text-[10px]">+{bonus}</span>}
    </span>
  </div>
);

// ── Equipment slot in paperdoll ──
const EqSlot = ({ slotKey, label, equipment, onSelect, selected }) => {
  const itemId = equipment[slotKey];
  const data = itemId ? getItemData(itemId) : null;
  const rarity = data?.rarity || 'common';
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div onClick={() => data && onSelect({ id: itemId, slot: slotKey, equipped: true })}
        className="flex items-center justify-center transition-all hover:brightness-125"
        style={{
          ...slotBg(!!data, rarity),
          outline: selected ? '2px solid #daa520' : slotBg(!!data, rarity).outline,
        }}>
        {data && <span className="text-xl drop-shadow-lg">{data.icon || '📦'}</span>}
      </div>
      <span className="font-cinzel text-[8px] uppercase tracking-wider" style={{ color: '#6a5a3a' }}>{label}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
const InventoryPanel = ({ player, dispatch, onClose }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  if (!player) return null;

  const inventory = player.inventory || [];
  const equipment = player.equipment || {};
  const pClass = player.class || 'warrior';
  const skills = getClassSkills(pClass);
  const selData = selectedItem ? getItemData(selectedItem.id) : null;
  const selRarity = selData?.rarity || 'common';

  const GRID_SIZE = 24;
  const padded = [...inventory];
  while (padded.length < GRID_SIZE) padded.push(null);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/75 backdrop-blur-sm">
      {/* ═══ MAIN WINDOW — uses Inventory.png as header + Main_tiles as body ═══ */}
      <div className="flex flex-col" style={{
        width: 980, maxHeight: '92vh',
        backgroundColor: 'rgba(8,5,2,0.97)',
        border: '4px solid #4a3a18',
        borderImage: `url('${UI}Main_tiles.png') 24 stretch`,
        borderWidth: 5, borderStyle: 'solid',
        boxShadow: '0 0 60px rgba(0,0,0,0.9), inset 0 1px 0 rgba(120,100,50,0.2)',
        imageRendering: 'pixelated',
        borderRadius: 10,
      }}>
        {/* ─── Title Bar ─── */}
        <div className="relative flex items-center justify-between px-5 py-2" style={{
          backgroundImage: `url('${UI}Inventory.png')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          borderBottom: '3px solid #3a2a10',
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)' }} />
          <h2 className="relative z-10 font-cinzel text-[15px] font-bold tracking-wider uppercase"
            style={{ color: '#e8c860', textShadow: '0 2px 8px rgba(0,0,0,0.9)' }}>
            ⚔️ EKWIPUNEK — {(player.name || 'Bohater').toUpperCase()}
          </h2>
          <button onClick={onClose} className="relative z-10 w-8 h-8 flex items-center justify-center font-bold text-red-400 hover:text-red-300 transition-colors"
            style={{
              backgroundImage: `url('${UI}Buttons.png')`,
              backgroundSize: `${400 * 0.8}px ${528 * 0.8}px`,
              backgroundPosition: '-2px -2px',
              imageRendering: 'pixelated', borderRadius: 4,
            }}>✕</button>
        </div>

        {/* ─── Triple Column Body ─── */}
        <div className="flex-1 overflow-y-auto flex gap-3 p-3" style={{ minHeight: 0 }}>

          {/* ════════════════════════════════════
              COLUMN 1 — POSTAĆ (Stats & Skills)
              ════════════════════════════════════ */}
          <Panel className="flex-shrink-0 p-3" style={{ width: 230 }}>
            {/* Portrait + name */}
            <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid #2a1e0a' }}>
              <div className="relative" style={{
                width: 56, height: 56, borderRadius: 6, overflow: 'hidden',
                backgroundImage: `url('${UI}character_panel.png')`,
                backgroundSize: `${192 * 1.8}px ${160 * 1.8}px`,
                backgroundPosition: '0 0',
                imageRendering: 'pixelated',
                boxShadow: '0 0 8px rgba(139,105,20,0.4)',
              }}>
                <img src={getPortraitPath(pClass)} alt={pClass}
                  className="w-full h-full object-cover relative z-10" style={{ imageRendering: 'pixelated' }} />
              </div>
              <div>
                <div className="font-cinzel text-[12px] font-bold" style={{ color: '#fff' }}>{player.name || 'Bohater'}</div>
                <div className="font-cinzel text-[10px] capitalize" style={{ color: '#c9a84c' }}>{pClass} · Poz. {player.level}</div>
                <div className="font-crimson text-[9px]" style={{ color: '#777' }}>{CLASS_WEAPONS[pClass] || '⚔️'}</div>
              </div>
            </div>

            <SectionLabel text="STATYSTYKI" />
            <div className="space-y-0.5 mb-3">
              <StatRow icon="❤️" label="Zdrowie" value={`${Math.floor(player.hp)}/${player.maxHp}`} />
              <StatRow icon="💎" label="Mana" value={`${Math.floor(player.mana)}/${player.maxMana}`} />
              <div style={{ height: 1, background: '#2a1e0a', margin: '4px 0' }} />
              <StatRow icon="💪" label="Siła" value={player.stats?.strength ?? 0} />
              <StatRow icon="🏃" label="Zręczność" value={player.stats?.agility ?? 0} />
              <StatRow icon="🧠" label="Inteligencja" value={player.stats?.intelligence ?? 0} />
              <StatRow icon="🛡️" label="Wytrzymałość" value={player.stats?.endurance ?? 0} />
              <div style={{ height: 1, background: '#2a1e0a', margin: '4px 0' }} />
              <StatRow icon="⚔️" label="Atak" value={player.attack ?? (player.stats?.strength ?? 10)} />
              <StatRow icon="🛡️" label="Obrona" value={player.defense ?? (player.stats?.endurance ?? 5)} />
              <StatRow icon="💰" label="Złoto" value={player.gold ?? 0} />
              {(player.bossKeys ?? 0) > 0 && <StatRow icon="🔑" label="Klucze Bossa" value={player.bossKeys} />}
            </div>

            <SectionLabel text="UMIEJĘTNOŚCI" />
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(skills).map(([key, skill]) => (
                <div key={key} className="flex items-center gap-1.5 p-1.5 rounded" style={{
                  backgroundColor: 'rgba(30,22,10,0.8)',
                  border: '1px solid #3a2a10',
                  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.5)',
                }}>
                  <div className="w-7 h-7 rounded flex items-center justify-center font-bold font-cinzel text-[11px]"
                    style={{
                      backgroundColor: 'rgba(40,30,15,0.9)',
                      border: '1px solid #4a3a18',
                      borderRadius: 4,
                      color: `#${skill.color.toString(16).padStart(6, '0')}`,
                      textShadow: '0 0 4px rgba(0,0,0,0.8)',
                    }}>{key}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-cinzel text-[8px] font-bold truncate" style={{ color: '#fff' }}>{skill.name}</div>
                    <div className="font-crimson text-[7px]" style={{ color: '#888' }}>{skill.manaCost} many</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* ════════════════════════════════════
              COLUMN 2 — EKWIPUNEK (Paperdoll)
              ════════════════════════════════════ */}
          <Panel className="flex-1 p-3 flex flex-col items-center">
            <SectionLabel text="EKWIPUNEK" />

            {/* Central paperdoll area */}
            <div className="relative w-full flex-1 flex flex-col items-center justify-center py-2" style={{
              backgroundColor: 'rgba(15,10,5,0.9)',
              border: '2px solid #3a2a10',
              borderRadius: 8,
              minHeight: 360,
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(60,45,20,0.15) 0%, transparent 70%)', borderRadius: 8 }} />

              <div className="relative z-10 flex flex-col items-center gap-3">
                {/* Row 1: Helmet */}
                <div className="flex items-center gap-10">
                  <EqSlot slotKey="amulet" label="Amulet" equipment={equipment} onSelect={setSelectedItem}
                    selected={selectedItem?.slot === 'amulet' && selectedItem?.equipped} />
                  <EqSlot slotKey="helmet" label="Hełm" equipment={equipment} onSelect={setSelectedItem}
                    selected={selectedItem?.slot === 'helmet' && selectedItem?.equipped} />
                  <EqSlot slotKey="ring" label="Pierścień" equipment={equipment} onSelect={setSelectedItem}
                    selected={selectedItem?.slot === 'ring' && selectedItem?.equipped} />
                </div>

                {/* Row 2: Weapon — Armor — Shield */}
                <div className="flex items-center gap-6">
                  <EqSlot slotKey="weapon" label="Broń" equipment={equipment} onSelect={setSelectedItem}
                    selected={selectedItem?.slot === 'weapon' && selectedItem?.equipped} />

                  {/* Large central portrait */}
                  <div className="relative" style={{
                    width: 96, height: 120, borderRadius: 8, overflow: 'hidden',
                    backgroundColor: 'rgba(25,18,8,0.9)',
                    border: '2px solid #5a4a20',
                    boxShadow: '0 0 16px rgba(139,105,20,0.3), inset 0 0 20px rgba(0,0,0,0.6)',
                  }}>
                    <img src={getPortraitPath(pClass)} alt={pClass}
                      className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                    <div className="absolute bottom-0 left-0 right-0 text-center py-0.5"
                      style={{ background: 'rgba(0,0,0,0.7)' }}>
                      <span className="font-cinzel text-[9px] font-bold uppercase"
                        style={{ color: '#c9a84c' }}>{pClass}</span>
                    </div>
                  </div>

                  <EqSlot slotKey="armor" label="Zbroja" equipment={equipment} onSelect={setSelectedItem}
                    selected={selectedItem?.slot === 'armor' && selectedItem?.equipped} />
                </div>

                {/* Row 3: Ring2 — Boots placeholder */}
                <div className="flex items-center gap-10">
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center justify-center" style={{ ...slotBg(false), opacity: 0.4 }} />
                    <span className="font-cinzel text-[8px] uppercase tracking-wider" style={{ color: '#4a3a2a' }}>Rękawice</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center justify-center" style={{ ...slotBg(false), opacity: 0.4 }} />
                    <span className="font-cinzel text-[8px] uppercase tracking-wider" style={{ color: '#4a3a2a' }}>Buty</span>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <div className="flex items-center justify-center" style={{ ...slotBg(false), opacity: 0.4 }} />
                    <span className="font-cinzel text-[8px] uppercase tracking-wider" style={{ color: '#4a3a2a' }}>Tarcza</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom: gold bar */}
            <div className="flex items-center justify-center gap-4 mt-2 py-1.5 w-full rounded" style={{
              backgroundColor: 'rgba(30,22,10,0.85)',
              border: '1px solid #3a2a10',
            }}>
              <span className="font-cinzel text-[11px] font-bold" style={{ color: '#ffd700', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                💰 {player.gold ?? 0} złota
              </span>
              {(player.bossKeys ?? 0) > 0 && (
                <span className="font-cinzel text-[11px] font-bold" style={{ color: '#ffaa22', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
                  🔑 {player.bossKeys} kluczy
                </span>
              )}
            </div>
          </Panel>

          {/* ════════════════════════════════════
              COLUMN 3 — PLECAK & SZCZEGÓŁY
              ════════════════════════════════════ */}
          <Panel className="flex-shrink-0 p-3 flex flex-col" style={{ width: 280 }}>
            <SectionLabel text="PLECAK" />
            <div className="text-[9px] font-cinzel mb-1.5" style={{ color: '#6a5a3a' }}>
              {inventory.length}/{GRID_SIZE} przedmiotów
            </div>

            {/* 6×4 backpack grid */}
            <div className="grid grid-cols-6 gap-1" style={{
              backgroundColor: 'rgba(15,10,5,0.9)',
              border: '2px solid #3a2a10',
              padding: 6, borderRadius: 6,
              boxShadow: 'inset 0 0 16px rgba(0,0,0,0.5)',
            }}>
              {padded.slice(0, GRID_SIZE).map((item, idx) => {
                const data = item ? getItemData(item.id) : null;
                const rarity = data?.rarity || 'common';
                const isSel = selectedItem && !selectedItem.equipped && selectedItem.instanceId === item?.instanceId;
                return (
                  <div key={idx}
                    onClick={() => item && setSelectedItem({ ...item, equipped: false })}
                    className="flex items-center justify-center transition-all hover:brightness-125"
                    style={{
                      ...slotBg(!!data, rarity),
                      outline: isSel ? '2px solid #daa520' : slotBg(!!data, rarity).outline,
                    }}>
                    {data && <span className="text-[15px] drop-shadow-lg">{data.icon || '📦'}</span>}
                  </div>
                );
              })}
            </div>

            {/* ─── SZCZEGÓŁY (Details) Panel ─── */}
            <SectionLabel text="SZCZEGÓŁY" />
            <div className="flex-1 rounded p-3" style={{
              backgroundColor: 'rgba(15,10,5,0.9)',
              border: '2px solid #3a2a10',
              minHeight: 180,
              boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)',
              position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(40,30,15,0.15) 0%, transparent 70%)', borderRadius: 6 }} />
              <div className="relative z-10">
                {selData ? (
                  <>
                    <div className="font-cinzel text-[13px] font-bold mb-0.5"
                      style={{ color: RARITY_CLR[selRarity] || '#fff' }}>{selData.name}</div>
                    <div className="font-cinzel text-[9px] uppercase tracking-wide mb-1.5"
                      style={{ color: '#666' }}>
                      {RARITY_PL[selRarity] || selRarity} · {selData.type === 'weapon' ? 'Broń' : selData.type === 'armor' ? 'Zbroja' : selData.type === 'helmet' ? 'Hełm' : selData.type === 'ring' ? 'Pierścień' : selData.type === 'amulet' ? 'Amulet' : selData.type === 'consumable' ? 'Użycie' : selData.type || ''}
                    </div>
                    {selData.description && (
                      <p className="font-crimson text-[10px] italic mb-2" style={{ color: '#a09070' }}>
                        „{selData.description}"
                      </p>
                    )}
                    {selData.stats && (
                      <div className="mb-2 pt-1.5" style={{ borderTop: '1px solid #2a1e0a' }}>
                        {selData.stats.attack != null && <StatRow label="Atak" value={`+${selData.stats.attack}`} />}
                        {selData.stats.defense != null && <StatRow label="Obrona" value={`+${selData.stats.defense}`} />}
                        {selData.stats.strength != null && <StatRow label="Siła" value={`+${selData.stats.strength}`} />}
                        {selData.stats.agility != null && <StatRow label="Zręczność" value={`+${selData.stats.agility}`} />}
                        {selData.stats.intelligence != null && <StatRow label="Inteligencja" value={`+${selData.stats.intelligence}`} />}
                        {selData.stats.endurance != null && <StatRow label="Wytrzymałość" value={`+${selData.stats.endurance}`} />}
                        {selData.stats.hp != null && <StatRow label="Zdrowie" value={`+${selData.stats.hp}`} />}
                        {selData.stats.mana != null && <StatRow label="Mana" value={`+${selData.stats.mana}`} />}
                      </div>
                    )}
                    {/* Action buttons */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      {selectedItem?.equipped ? (
                        <button onClick={() => { dispatch({ type: 'UNEQUIP_ITEM', slot: selectedItem.slot }); setSelectedItem(null); }}
                          className="w-full py-1.5 font-cinzel text-[11px] font-bold rounded cursor-pointer transition-all hover:brightness-125 active:translate-y-[1px]"
                          style={{
                            backgroundImage: `url('${UI}Buttons.png')`,
                            backgroundSize: `${400 * 0.6}px ${528 * 0.6}px`,
                            backgroundPosition: '0 -32px',
                            imageRendering: 'pixelated',
                            color: '#dd4444', textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                            border: '1px solid #5a2020',
                          }}>Zdejmij</button>
                      ) : (
                        <>
                          {selData.type && ['weapon','armor','helmet','ring','amulet'].includes(selData.type) && (
                            <button onClick={() => { dispatch({ type: 'EQUIP_ITEM', instanceId: selectedItem.instanceId }); setSelectedItem(null); }}
                              className="w-full py-1.5 font-cinzel text-[11px] font-bold rounded cursor-pointer transition-all hover:brightness-125 active:translate-y-[1px]"
                              style={{
                                backgroundImage: `url('${UI}Buttons.png')`,
                                backgroundSize: `${400 * 0.6}px ${528 * 0.6}px`,
                                backgroundPosition: '0 0',
                                imageRendering: 'pixelated',
                                color: '#daa520', textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                border: '1px solid #5a4a20',
                              }}>Załóż</button>
                          )}
                          {selData.type === 'consumable' && (
                            <button onClick={() => { dispatch({ type: 'USE_ITEM', instanceId: selectedItem.instanceId }); setSelectedItem(null); }}
                              className="w-full py-1.5 font-cinzel text-[11px] font-bold rounded cursor-pointer transition-all hover:brightness-125 active:translate-y-[1px]"
                              style={{
                                backgroundImage: `url('${UI}Buttons.png')`,
                                backgroundSize: `${400 * 0.6}px ${528 * 0.6}px`,
                                backgroundPosition: '0 0',
                                imageRendering: 'pixelated',
                                color: '#44dd44', textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                                border: '1px solid #205a20',
                              }}>Użyj</button>
                          )}
                          <button onClick={() => { dispatch({ type: 'SELL_ITEM', instanceId: selectedItem.instanceId }); setSelectedItem(null); }}
                            className="w-full py-1.5 font-cinzel text-[11px] font-bold rounded cursor-pointer transition-all hover:brightness-125 active:translate-y-[1px]"
                            style={{
                              backgroundImage: `url('${UI}Buttons.png')`,
                              backgroundSize: `${400 * 0.6}px ${528 * 0.6}px`,
                              backgroundPosition: '0 -32px',
                              imageRendering: 'pixelated',
                              color: '#dd4444', textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                              border: '1px solid #5a2020',
                            }}>Wyrzuć</button>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full pt-6">
                    <span className="text-2xl mb-2" style={{ opacity: 0.3 }}>🔍</span>
                    <span className="font-crimson text-[11px] italic text-center" style={{ color: '#4a4030' }}>
                      Zaznacz przedmiot, aby zobaczyć szczegóły
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Panel>

        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
