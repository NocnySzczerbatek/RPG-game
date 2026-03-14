// ============================================================
// COMPONENT: Inventory Panel — Slot Grid + Equipment + Quest Log
// Gothic ARPG overlay with drag/equip, rarity colors
// ============================================================
import React, { useState } from 'react';
import { ITEMS } from '../data/items.js';
import { getPortraitPath, CLASS_WEAPONS } from './GameMap.jsx';

const RARITY_COLORS = {
  common:    { border: 'border-gray-600',   text: 'text-gray-300',   bg: 'bg-gray-800',   glow: '' },
  rare:      { border: 'border-blue-500',   text: 'text-blue-400',   bg: 'bg-blue-950',   glow: 'shadow-blue-500/30 shadow-md' },
  epic:      { border: 'border-purple-500', text: 'text-purple-400', bg: 'bg-purple-950',  glow: 'shadow-purple-500/30 shadow-md' },
  legendary: { border: 'border-amber-500',  text: 'text-amber-400',  bg: 'bg-amber-950',  glow: 'shadow-amber-500/40 shadow-lg' },
  divine:    { border: 'border-yellow-400', text: 'text-yellow-300', bg: 'bg-yellow-950',  glow: 'shadow-yellow-400/50 shadow-xl' },
};

const SLOT_LABELS = {
  weapon: '\u2694\uFE0F Weapon',
  armor: '\uD83D\uDEE1\uFE0F Armor',
  helmet: '\u26D1\uFE0F Helmet',
  ring: '\uD83D\uDC8D Ring',
  amulet: '\uD83D\uDCFF Amulet',
};

const getItemData = (id) => ITEMS?.[id] || null;

const ItemSlot = ({ item, onClick, selected, size = 'normal' }) => {
  if (!item) {
    return (
      <div className={`${size === 'large' ? 'w-16 h-16' : 'w-12 h-12'} rounded border border-gray-800 bg-gray-900/50 flex items-center justify-center`}>
        <span className="text-gray-700 text-xs">—</span>
      </div>
    );
  }

  const data = getItemData(item.id) || {};
  const rarity = data.rarity || 'common';
  const rc = RARITY_COLORS[rarity] || RARITY_COLORS.common;

  return (
    <div
      onClick={() => onClick?.(item)}
      className={`${size === 'large' ? 'w-16 h-16' : 'w-12 h-12'} rounded border-2 ${rc.border} ${rc.bg} ${rc.glow}
        flex items-center justify-center cursor-pointer hover:brightness-125 transition-all relative
        ${selected ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-black' : ''}`}
      title={data.name || item.id}
    >
      <span className="text-lg">{data.icon || '\uD83D\uDCE6'}</span>
      {data.name && (
        <div className="absolute -bottom-0.5 left-0 right-0 text-center">
          <span className={`text-[6px] ${rc.text} font-cinzel leading-none truncate block px-0.5`}>
            {data.name?.length > 8 ? data.name.substring(0, 7) + '..' : data.name}
          </span>
        </div>
      )}
    </div>
  );
};

const StatRow = ({ label, value, bonus }) => (
  <div className="flex justify-between items-center py-0.5">
    <span className="text-[10px] text-gray-500 font-cinzel">{label}</span>
    <span className="text-[10px] text-gray-300 font-mono">
      {value}
      {bonus > 0 && <span className="text-green-400 ml-1">(+{bonus})</span>}
    </span>
  </div>
);

const InventoryPanel = ({ player, dispatch, onClose }) => {
  const [tab, setTab] = useState('inventory'); // inventory | equipment | questlog
  const [selectedItem, setSelectedItem] = useState(null);

  if (!player) return null;

  const inventory = player.inventory || [];
  const equipment = player.equipment || {};

  const selectedData = selectedItem ? (getItemData(selectedItem.id) || {}) : null;
  const selectedRarity = selectedData?.rarity || 'common';
  const selRC = RARITY_COLORS[selectedRarity] || RARITY_COLORS.common;

  // Pad inventory to 24 slots
  const GRID_SIZE = 24;
  const paddedInventory = [...inventory];
  while (paddedInventory.length < GRID_SIZE) paddedInventory.push(null);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[680px] max-h-[85vh] bg-gray-950 border-2 border-amber-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-amber-900/40 bg-gray-950">
          <h2 className="font-cinzel text-amber-400 text-lg font-bold">{'\u2694\uFE0F'} Inventory</h2>
          <div className="flex gap-1">
            {['inventory', 'equipment', 'questlog'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1 text-xs font-cinzel rounded transition-all border ${
                  tab === t ? 'border-amber-600 bg-amber-900/30 text-amber-400' : 'border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300'}`}>
                {t === 'inventory' ? 'Backpack' : t === 'equipment' ? 'Equipment' : 'Quest Log'}
              </button>
            ))}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-400 text-xl transition-colors">{'\u2715'}</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'inventory' && (
            <div className="flex gap-4">
              {/* Grid */}
              <div className="flex-1">
                <div className="text-[10px] text-gray-500 font-cinzel mb-2">{inventory.length}/{GRID_SIZE} Slots</div>
                <div className="grid grid-cols-6 gap-1.5">
                  {paddedInventory.slice(0, GRID_SIZE).map((item, idx) => (
                    <ItemSlot key={idx} item={item} onClick={setSelectedItem} selected={selectedItem?.instanceId === item?.instanceId} />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs text-yellow-400 font-cinzel">
                  <span>{'\uD83D\uDCB0'} {player.gold}g</span>
                  {player.bossKeys > 0 && <span className="text-amber-400">{'\uD83D\uDD11'} {player.bossKeys} Boss Keys</span>}
                </div>
              </div>

              {/* Detail Panel */}
              <div className="w-48 border-l border-gray-800 pl-4">
                {selectedItem && selectedData ? (
                  <div>
                    <div className={`font-cinzel text-sm font-bold ${selRC.text} mb-1`}>{selectedData.name}</div>
                    <div className="text-[9px] text-gray-500 font-cinzel capitalize mb-2">{selectedRarity} {selectedData.type || ''}</div>
                    {selectedData.description && <p className="text-[10px] text-gray-400 font-crimson italic mb-2">{selectedData.description}</p>}

                    {/* Stats */}
                    {selectedData.stats && (
                      <div className="border-t border-gray-800 pt-2 mb-2">
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

                    {/* Actions */}
                    <div className="flex flex-col gap-1 mt-2">
                      {selectedData.type && ['weapon','armor','helmet','ring','amulet'].includes(selectedData.type) && (
                        <button onClick={() => { dispatch({ type: 'EQUIP_ITEM', instanceId: selectedItem.instanceId }); setSelectedItem(null); }}
                          className="w-full py-1 bg-amber-900/40 border border-amber-700 rounded text-amber-400 text-xs font-cinzel hover:bg-amber-800/50 transition-all">
                          Equip
                        </button>
                      )}
                      {selectedData.type === 'consumable' && (
                        <button onClick={() => { dispatch({ type: 'USE_ITEM', instanceId: selectedItem.instanceId }); setSelectedItem(null); }}
                          className="w-full py-1 bg-green-900/40 border border-green-700 rounded text-green-400 text-xs font-cinzel hover:bg-green-800/50 transition-all">
                          Use
                        </button>
                      )}
                      <button onClick={() => { dispatch({ type: 'SELL_ITEM', instanceId: selectedItem.instanceId }); setSelectedItem(null); }}
                        className="w-full py-1 bg-gray-800/40 border border-gray-700 rounded text-gray-400 text-xs font-cinzel hover:bg-gray-700/50 transition-all">
                        Drop
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-600 text-xs font-crimson italic text-center mt-8">Select an item to view details</div>
                )}
              </div>
            </div>
          )}

          {tab === 'equipment' && (
            <div className="flex gap-6">
              {/* Equipment Slots */}
              <div className="flex-1">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(SLOT_LABELS).map(([slot, label]) => {
                    const eqId = equipment[slot];
                    const eqData = eqId ? getItemData(eqId) : null;
                    const rarity = eqData?.rarity || 'common';
                    const rc = RARITY_COLORS[rarity] || RARITY_COLORS.common;
                    return (
                      <div key={slot} className="flex items-center gap-2 p-2 rounded border border-gray-800 bg-gray-900/50">
                        <div className={`w-14 h-14 rounded border-2 ${eqId ? rc.border : 'border-gray-800'} ${eqId ? rc.bg : 'bg-gray-900/30'} ${eqId ? rc.glow : ''}
                          flex items-center justify-center`}>
                          <span className="text-xl">{eqData?.icon || '\u2796'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[9px] text-gray-500 font-cinzel">{label}</div>
                          {eqData ? (
                            <>
                              <div className={`text-xs font-cinzel font-bold ${rc.text} truncate`}>{eqData.name}</div>
                              <button onClick={() => dispatch({ type: 'UNEQUIP_ITEM', slot })}
                                className="text-[9px] text-red-400 hover:text-red-300 font-cinzel mt-0.5">
                                Unequip
                              </button>
                            </>
                          ) : (
                            <div className="text-[10px] text-gray-700 italic">Empty</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Character Stats */}
              <div className="w-44 border-l border-gray-800 pl-4">
                {/* Class Portrait */}
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-800">
                  <div className="w-12 h-12 rounded-lg border-2 border-amber-600 bg-gray-900 overflow-hidden flex-shrink-0">
                    <img src={getPortraitPath(player.class || 'warrior')} alt={player.class} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
                  </div>
                  <div>
                    <div className="font-cinzel text-amber-400 text-xs font-bold capitalize">{player.class || 'warrior'}</div>
                    <div className="text-[9px] text-gray-500 font-crimson">{CLASS_WEAPONS[player.class] || CLASS_WEAPONS.warrior}</div>
                  </div>
                </div>
                <div className="font-cinzel text-amber-400 text-xs font-bold mb-2">Character Stats</div>
                <div className="space-y-1.5">
                  <StatRow label="Level" value={player.level} />
                  <StatRow label="HP" value={`${Math.floor(player.hp)}/${player.maxHp}`} />
                  <StatRow label="Mana" value={`${Math.floor(player.mana)}/${player.maxMana}`} />
                  <div className="border-t border-gray-800 my-1" />
                  <StatRow label="STR" value={player.stats?.strength ?? 0} />
                  <StatRow label="AGI" value={player.stats?.agility ?? 0} />
                  <StatRow label="INT" value={player.stats?.intelligence ?? 0} />
                  <StatRow label="END" value={player.stats?.endurance ?? 0} />
                  <div className="border-t border-gray-800 my-1" />
                  <StatRow label="Gold" value={player.gold} />
                  {player.bossKeys > 0 && <StatRow label="Boss Keys" value={player.bossKeys} />}
                </div>
              </div>
            </div>
          )}

          {tab === 'questlog' && (
            <div className="space-y-3">
              <div className="font-cinzel text-amber-400 text-sm font-bold mb-2">{'\uD83D\uDCDC'} Quest Log</div>

              {/* Main Quest */}
              <div className="p-3 rounded border border-amber-900/40 bg-amber-950/20">
                <div className="font-cinzel text-amber-400 text-xs font-bold mb-1">Main Quest</div>
                <p className="text-xs text-gray-400 font-crimson">
                  Explore the world of Eldoria. Travel through 6 biomes, defeat biome bosses, and collect Boss Keys to unlock Golden Chests.
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] text-gray-500 font-cinzel">Boss Keys:</span>
                  <span className="text-xs text-amber-400 font-bold">{player.bossKeys ?? 0} / 6</span>
                </div>
              </div>

              {/* Active Bounties */}
              <div className="font-cinzel text-gray-400 text-xs font-bold mb-1">Active Bounties</div>
              {(player.activeBounties?.length ?? 0) === 0 ? (
                <p className="text-xs text-gray-600 font-crimson italic">No active bounties. Visit a Bounty Board in any city.</p>
              ) : (
                player.activeBounties?.map((bounty, idx) => (
                  <div key={idx} className="p-2 rounded border border-gray-800 bg-gray-900/30">
                    <div className="text-xs text-gray-300 font-cinzel">{bounty.name || bounty.description}</div>
                    {bounty.completed && <span className="text-[9px] text-green-400 font-cinzel">{'\u2713'} Complete</span>}
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
