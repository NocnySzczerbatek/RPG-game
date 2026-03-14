// ============================================================
// COMPONENT: Inventory Panel — CraftPix Pixel-Art UI (pack #4)
// Uses Inventory.png, Equipment.png, Buttons.png, Icons.png
// ============================================================
import React, { useState } from 'react';
import { ITEMS } from '../data/items.js';
import { getPortraitPath, CLASS_WEAPONS } from './GameMap.jsx';

const UI = 'assets/sprites/craftpix-net-255216-free-basic-pixel-art-ui-for-rpg/PNG/';

// Pixel-art panel style reused across panels
const PANEL_STYLE = {
  imageRendering: 'pixelated',
  backgroundColor: 'rgba(12,8,4,0.96)',
  border: '4px solid #4a3a18',
  boxShadow: '0 0 24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(100,80,40,0.3), inset 0 0 40px rgba(0,0,0,0.4)',
  borderRadius: '8px',
};

const SLOT_STYLE = {
  imageRendering: 'pixelated',
  backgroundColor: 'rgba(20,15,8,0.9)',
  border: '2px solid #3a2a10',
  boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)',
  borderRadius: '4px',
};

const BTN_STYLE = (color = 'amber') => {
  const colors = {
    amber:  { bg: '#2a1e0a', border: '#8b6914', text: '#daa520', hover: '#3a2e14' },
    green:  { bg: '#0a2a0e', border: '#2e8b14', text: '#44dd44', hover: '#143a1e' },
    red:    { bg: '#2a0a0a', border: '#8b1414', text: '#dd4444', hover: '#3a1414' },
    gray:   { bg: '#1a1a1a', border: '#555', text: '#999', hover: '#2a2a2a' },
    purple: { bg: '#1a0a2a', border: '#5a2080', text: '#aa66dd', hover: '#2a1a3a' },
  };
  const c = colors[color] || colors.amber;
  return {
    backgroundColor: c.bg, border: `2px solid ${c.border}`, color: c.text,
    imageRendering: 'pixelated', boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 ${c.border}44`,
  };
};

const RARITY_GLOW = {
  common:    { borderColor: '#555', shadow: 'none' },
  rare:      { borderColor: '#4488ff', shadow: '0 0 6px rgba(68,136,255,0.4)' },
  epic:      { borderColor: '#aa44ff', shadow: '0 0 8px rgba(170,68,255,0.4)' },
  legendary: { borderColor: '#ffaa22', shadow: '0 0 10px rgba(255,170,34,0.5)' },
  divine:    { borderColor: '#ffee44', shadow: '0 0 14px rgba(255,238,68,0.6)' },
};
const RARITY_TEXT = {
  common: '#999', rare: '#4488ff', epic: '#aa44ff', legendary: '#ffaa22', divine: '#ffee44',
};

const SLOT_LABELS = {
  weapon: '\u2694\uFE0F Weapon', armor: '\uD83D\uDEE1\uFE0F Armor',
  helmet: '\u26D1\uFE0F Helmet', ring: '\uD83D\uDC8D Ring', amulet: '\uD83D\uDCFF Amulet',
};

const getItemData = (id) => ITEMS?.[id] || null;

const ItemSlot = ({ item, onClick, selected, size = 'normal' }) => {
  const dim = size === 'large' ? 60 : 48;
  const data = item ? (getItemData(item.id) || {}) : null;
  const rarity = data?.rarity || 'common';
  const glw = RARITY_GLOW[rarity] || RARITY_GLOW.common;

  return (
    <div
      onClick={() => item && onClick?.(item)}
      className="flex items-center justify-center cursor-pointer hover:brightness-125 transition-all relative"
      style={{
        width: dim, height: dim, ...SLOT_STYLE,
        borderColor: item ? glw.borderColor : '#3a2a10',
        boxShadow: item ? `${glw.shadow}, inset 0 0 8px rgba(0,0,0,0.6)` : SLOT_STYLE.boxShadow,
        outline: selected ? '2px solid #daa520' : 'none', outlineOffset: '1px',
      }}
      title={data?.name || ''}
    >
      {item ? (
        <>
          <span className="text-lg drop-shadow">{data?.icon || '\uD83D\uDCE6'}</span>
          {data?.name && (
            <span className="absolute bottom-0 left-0 right-0 text-center text-[6px] font-cinzel leading-none truncate px-0.5 drop-shadow"
              style={{ color: RARITY_TEXT[rarity] || '#999' }}>
              {data.name.length > 8 ? data.name.substring(0, 7) + '..' : data.name}
            </span>
          )}
        </>
      ) : (
        <span className="text-gray-700 text-xs">—</span>
      )}
    </div>
  );
};

const StatRow = ({ label, value, bonus }) => (
  <div className="flex justify-between items-center py-0.5">
    <span className="text-[10px] font-cinzel" style={{ color: '#7a6a4a' }}>{label}</span>
    <span className="text-[10px] font-mono" style={{ color: '#ccc' }}>
      {value}
      {bonus > 0 && <span style={{ color: '#44dd44' }} className="ml-1">(+{bonus})</span>}
    </span>
  </div>
);

const PixelButton = ({ onClick, label, color = 'amber', className = '' }) => (
  <button onClick={onClick}
    className={`w-full py-1.5 text-xs font-cinzel rounded cursor-pointer transition-all hover:brightness-125 active:translate-y-[1px] ${className}`}
    style={BTN_STYLE(color)}>
    {label}
  </button>
);

const InventoryPanel = ({ player, dispatch, onClose }) => {
  const [tab, setTab] = useState('inventory');
  const [selectedItem, setSelectedItem] = useState(null);
  if (!player) return null;

  const inventory = player.inventory || [];
  const equipment = player.equipment || {};
  const selectedData = selectedItem ? (getItemData(selectedItem.id) || {}) : null;
  const selectedRarity = selectedData?.rarity || 'common';

  const GRID_SIZE = 24;
  const paddedInventory = [...inventory];
  while (paddedInventory.length < GRID_SIZE) paddedInventory.push(null);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[700px] max-h-[85vh] overflow-hidden flex flex-col" style={PANEL_STYLE}>
        {/* ─── Header with Inventory.png background ─── */}
        <div className="flex items-center justify-between px-5 py-3 relative"
          style={{
            backgroundImage: `url('${UI}Inventory.png')`,
            backgroundSize: 'cover', backgroundPosition: 'top center',
            borderBottom: '2px solid #3a2a10',
          }}>
          <div className="absolute inset-0 bg-black/50" />
          <h2 className="font-cinzel text-amber-400 text-lg font-bold relative z-10 drop-shadow-lg">{'\u2694\uFE0F'} Inventory</h2>
          <div className="flex gap-1 relative z-10">
            {[['inventory', 'Backpack'], ['equipment', 'Equipment'], ['questlog', 'Quests']].map(([t, label]) => (
              <button key={t} onClick={() => setTab(t)}
                className="px-3 py-1 text-xs font-cinzel rounded transition-all hover:brightness-125"
                style={tab === t ? BTN_STYLE('amber') : BTN_STYLE('gray')}>
                {label}
              </button>
            ))}
          </div>
          <button onClick={onClose}
            className="text-xl transition-colors relative z-10 w-8 h-8 rounded flex items-center justify-center hover:brightness-125"
            style={BTN_STYLE('red')}>{'\u2715'}</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'inventory' && (
            <div className="flex gap-4">
              {/* ─── Slot Grid ─── */}
              <div className="flex-1">
                <div className="text-[10px] font-cinzel mb-2" style={{ color: '#7a6a4a' }}>{inventory.length}/{GRID_SIZE} Slots</div>
                <div className="grid grid-cols-6 gap-1.5">
                  {paddedInventory.slice(0, GRID_SIZE).map((item, idx) => (
                    <ItemSlot key={idx} item={item} onClick={setSelectedItem} selected={selectedItem?.instanceId === item?.instanceId} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs font-cinzel" style={{ color: '#daa520' }}>
                  <span>{'\uD83D\uDCB0'} {player.gold}g</span>
                  {player.bossKeys > 0 && <span style={{ color: '#ffaa22' }}>{'\uD83D\uDD11'} {player.bossKeys} Boss Keys</span>}
                </div>
              </div>

              {/* ─── Detail Panel ─── */}
              <div className="w-52 pl-4" style={{ borderLeft: '2px solid #3a2a10' }}>
                {selectedItem && selectedData ? (
                  <div>
                    <div className="font-cinzel text-sm font-bold mb-1" style={{ color: RARITY_TEXT[selectedRarity] }}>{selectedData.name}</div>
                    <div className="text-[9px] font-cinzel capitalize mb-2" style={{ color: '#666' }}>{selectedRarity} {selectedData.type || ''}</div>
                    {selectedData.description && <p className="text-[10px] font-crimson italic mb-2" style={{ color: '#888' }}>{selectedData.description}</p>}

                    {selectedData.stats && (
                      <div className="pt-2 mb-2" style={{ borderTop: '1px solid #3a2a10' }}>
                        {selectedData.stats.attack && <StatRow label="Attack" value={`+${selectedData.stats.attack}`} />}
                        {selectedData.stats.defense && <StatRow label="Defense" value={`+${selectedData.stats.defense}`} />}
                        {selectedData.stats.strength && <StatRow label="STR" value={`+${selectedData.stats.strength}`} />}
                        {selectedData.stats.agility && <StatRow label="AGI" value={`+${selectedData.stats.agility}`} />}
                        {selectedData.stats.intelligence && <StatRow label="INT" value={`+${selectedData.stats.intelligence}`} />}
                        {selectedData.stats.endurance && <StatRow label="END" value={`+${selectedData.stats.endurance}`} />}
                        {selectedData.stats.hp && <StatRow label="HP" value={`+${selectedData.stats.hp}`} />}
                        {selectedData.stats.mana && <StatRow label="Mana" value={`+${selectedData.stats.mana}`} />}
                      </div>
                    )}

                    <div className="flex flex-col gap-1 mt-2">
                      {selectedData.type && ['weapon','armor','helmet','ring','amulet'].includes(selectedData.type) && (
                        <PixelButton onClick={() => { dispatch({ type: 'EQUIP_ITEM', instanceId: selectedItem.instanceId }); setSelectedItem(null); }} label="Equip" color="amber" />
                      )}
                      {selectedData.type === 'consumable' && (
                        <PixelButton onClick={() => { dispatch({ type: 'USE_ITEM', instanceId: selectedItem.instanceId }); setSelectedItem(null); }} label="Use" color="green" />
                      )}
                      <PixelButton onClick={() => { dispatch({ type: 'SELL_ITEM', instanceId: selectedItem.instanceId }); setSelectedItem(null); }} label="Drop" color="red" />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-crimson italic text-center mt-8" style={{ color: '#555' }}>Select an item to view details</div>
                )}
              </div>
            </div>
          )}

          {tab === 'equipment' && (
            <div className="flex gap-6">
              {/* ─── Equipment Slots ─── */}
              <div className="flex-1">
                {/* Equipment panel header image */}
                <div className="mb-3 h-10 rounded flex items-center justify-center"
                  style={{
                    backgroundImage: `url('${UI}Equipment.png')`,
                    backgroundSize: '320px 768px', backgroundPosition: '0 -64px',
                    border: '2px solid #3a2a10',
                  }}>
                  <span className="font-cinzel text-xs text-amber-400 font-bold drop-shadow-lg">Equipment Slots</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(SLOT_LABELS).map(([slot, label]) => {
                    const eqId = equipment[slot];
                    const eqData = eqId ? getItemData(eqId) : null;
                    const rarity = eqData?.rarity || 'common';
                    const glw = RARITY_GLOW[rarity] || RARITY_GLOW.common;
                    return (
                      <div key={slot} className="flex items-center gap-2 p-2 rounded" style={{ ...SLOT_STYLE, borderColor: eqId ? glw.borderColor : '#3a2a10' }}>
                        <div className="w-14 h-14 rounded flex items-center justify-center"
                          style={{ ...SLOT_STYLE, borderColor: eqId ? glw.borderColor : '#3a2a10', boxShadow: eqId ? glw.shadow : SLOT_STYLE.boxShadow }}>
                          <span className="text-xl">{eqData?.icon || '\u2796'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] font-cinzel" style={{ color: '#7a6a4a' }}>{label}</div>
                          {eqData ? (
                            <>
                              <div className="text-xs font-cinzel font-bold truncate" style={{ color: RARITY_TEXT[rarity] }}>{eqData.name}</div>
                              <button onClick={() => dispatch({ type: 'UNEQUIP_ITEM', slot })}
                                className="text-[9px] font-cinzel mt-0.5 cursor-pointer hover:brightness-125"
                                style={{ color: '#dd4444' }}>Unequip</button>
                            </>
                          ) : (
                            <div className="text-[10px] italic" style={{ color: '#444' }}>Empty</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ─── Character Stats Panel ─── */}
              <div className="w-48 pl-4" style={{ borderLeft: '2px solid #3a2a10' }}>
                {/* Portrait with character_panel.png */}
                <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid #3a2a10' }}>
                  <div className="w-14 h-14 rounded overflow-hidden flex-shrink-0"
                    style={{ border: '2px solid #8b6914', boxShadow: '0 0 8px rgba(139,105,20,0.3)' }}>
                    <img src={getPortraitPath(player.class || 'warrior')} alt={player.class}
                      className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <div>
                    <div className="font-cinzel text-xs font-bold capitalize" style={{ color: '#daa520' }}>{player.class || 'warrior'}</div>
                    <div className="text-[9px] font-crimson" style={{ color: '#777' }}>{CLASS_WEAPONS[player.class] || CLASS_WEAPONS.warrior}</div>
                  </div>
                </div>
                <div className="font-cinzel text-xs font-bold mb-2" style={{ color: '#daa520' }}>Character Stats</div>
                <div className="space-y-1.5">
                  <StatRow label="Level" value={player.level} />
                  <StatRow label="HP" value={`${Math.floor(player.hp)}/${player.maxHp}`} />
                  <StatRow label="Mana" value={`${Math.floor(player.mana)}/${player.maxMana}`} />
                  <div style={{ borderTop: '1px solid #3a2a10', margin: '4px 0' }} />
                  <StatRow label="STR" value={player.stats?.strength ?? 0} />
                  <StatRow label="AGI" value={player.stats?.agility ?? 0} />
                  <StatRow label="INT" value={player.stats?.intelligence ?? 0} />
                  <StatRow label="END" value={player.stats?.endurance ?? 0} />
                  <div style={{ borderTop: '1px solid #3a2a10', margin: '4px 0' }} />
                  <StatRow label="Gold" value={player.gold} />
                  {player.bossKeys > 0 && <StatRow label="Boss Keys" value={player.bossKeys} />}
                </div>
              </div>
            </div>
          )}

          {tab === 'questlog' && (
            <div className="space-y-3">
              <div className="font-cinzel text-sm font-bold mb-2" style={{ color: '#daa520' }}>{'\uD83D\uDCDC'} Quest Log</div>

              <div className="p-3 rounded" style={{ ...SLOT_STYLE, borderColor: '#5a4a20' }}>
                <div className="font-cinzel text-xs font-bold mb-1" style={{ color: '#daa520' }}>Main Quest</div>
                <p className="text-xs font-crimson" style={{ color: '#888' }}>
                  Explore the world of Eldoria. Travel through 6 biomes, defeat biome bosses, and collect Boss Keys to unlock Golden Chests.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] font-cinzel" style={{ color: '#7a6a4a' }}>Boss Keys:</span>
                  <span className="text-xs font-bold" style={{ color: '#daa520' }}>{player.bossKeys ?? 0} / 6</span>
                </div>
              </div>

              <div className="font-cinzel text-xs font-bold mb-1" style={{ color: '#7a6a4a' }}>Active Bounties</div>
              {(player.activeBounties?.length ?? 0) === 0 ? (
                <p className="text-xs font-crimson italic" style={{ color: '#555' }}>No active bounties. Visit a Bounty Board in any city.</p>
              ) : (
                player.activeBounties?.map((bounty, idx) => (
                  <div key={idx} className="p-2 rounded" style={SLOT_STYLE}>
                    <div className="text-xs font-cinzel" style={{ color: '#ccc' }}>{bounty.name || bounty.description}</div>
                    {bounty.completed && <span className="text-[9px] font-cinzel" style={{ color: '#44dd44' }}>{'\u2713'} Complete</span>}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
