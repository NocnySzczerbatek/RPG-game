// ============================================================
// COMPONENT: Inventory & Equipment Panel
// ============================================================
import React, { useState } from 'react';
import { ITEMS, RARITIES } from '../data/items.js';

const SLOT_LABELS = {
  weapon: '⚔️ Broń',
  armor: '🛡️ Zbroja',
  helmet: '⛑️ Hełm',
  ring: '💍 Pierścień',
  amulet: '📿 Amulet',
};

const ItemCard = ({ item, onClick, selected, equipped }) => {
  const rarity = RARITIES[item.rarity] ?? RARITIES.common;

  return (
    <button
      onClick={() => onClick(item)}
      className={`text-left w-full p-2 rounded border transition-all ${
        selected
          ? `${rarity.border} bg-slate-800`
          : equipped
          ? `border-amber-700 bg-amber-950/20`
          : `border-slate-700 bg-slate-900 hover:border-slate-600`
      }`}
    >
      <div className={`font-cinzel text-xs font-bold mb-0.5 ${rarity.color}`}>
        {item.name}
        {equipped && <span className="ml-1 text-amber-500 text-xs">✓</span>}
      </div>
      <div className="text-slate-500 text-xs font-crimson line-clamp-1">{item.description}</div>
      {item.quantity > 1 && (
        <div className="text-slate-600 text-xs mt-0.5">×{item.quantity}</div>
      )}
    </button>
  );
};

const StatDiff = ({ label, current, next }) => {
  const diff = (next ?? 0) - (current ?? 0);
  return (
    <div className="flex justify-between text-xs font-crimson py-0.5">
      <span className="text-slate-500">{label}</span>
      <span className={diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}>
        {next ?? 0} {diff !== 0 && <span>({diff > 0 ? '+' : ''}{diff})</span>}
      </span>
    </div>
  );
};

const InventoryPanel = ({ player, dispatch, onClose }) => {
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('inventory'); // 'inventory' | 'equipment'

  const inventory = player.inventory ?? [];
  const equipment = player.equipment ?? {};

  const equippedIds = Object.values(equipment).filter(Boolean);

  function handleSelect(item) {
    setSelected((prev) => (prev?.id === item.id ? null : item));
  }

  function handleEquip() {
    if (!selected) return;
    dispatch({ type: 'EQUIP_ITEM', itemId: selected.id });
    setSelected(null);
  }

  function handleUnequip(slot) {
    dispatch({ type: 'UNEQUIP_ITEM', slot });
  }

  function handleUse() {
    if (!selected) return;
    dispatch({ type: 'USE_ITEM_OUTSIDE_COMBAT', itemId: selected.id });
    setSelected(null);
  }

  const canEquip = selected && ['weapon', 'armor', 'helmet', 'ring', 'amulet'].includes(selected.slot);
  const canUse = selected && selected.type === 'consumable';

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-cinzel text-2xl font-bold text-amber-500">Ekwipunek</h1>
          <button onClick={onClose} className="btn-gothic text-xs px-3 py-1.5">← Zamknij</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['inventory', 'equipment'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-cinzel text-xs px-4 py-2 rounded border transition-all ${
                tab === t
                  ? 'border-amber-600 text-amber-400 bg-amber-950/30'
                  : 'border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              {t === 'inventory' ? '🎒 Plecak' : '🧥 Założone'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main panel */}
          <div className="lg:col-span-2 panel">
            {tab === 'inventory' && (
              <>
                <div className="text-xs text-slate-500 font-crimson mb-3">
                  {inventory.length} / {player.inventoryMax ?? 30} przedmiotów
                </div>
                {inventory.length === 0 && (
                  <p className="text-slate-600 font-crimson text-center py-8">Plecak jest pusty.</p>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {inventory.map((item) => {
                    const itemDef = ITEMS[item.id] ?? item;
                    const merged = { ...itemDef, ...item };
                    return (
                      <ItemCard
                        key={item.id + (item._iid ?? '')}
                        item={merged}
                        onClick={handleSelect}
                        selected={selected?.id === item.id}
                        equipped={equippedIds.includes(item.id)}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {tab === 'equipment' && (
              <div className="space-y-2">
                {Object.entries(SLOT_LABELS).map(([slot, label]) => {
                  const itemId = equipment[slot];
                  const equippedItem = itemId ? (ITEMS[itemId] ?? { id: itemId, name: itemId, rarity: 'common' }) : null;
                  return (
                    <div
                      key={slot}
                      className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800"
                    >
                      <div className="text-xs text-slate-500 font-cinzel w-24 shrink-0">{label}</div>
                      {equippedItem ? (
                        <>
                          <div
                            className={`flex-1 text-sm font-cinzel font-bold ${RARITIES[equippedItem.rarity]?.color ?? 'text-slate-300'}`}
                          >
                            {equippedItem.name}
                          </div>
                          <button
                            onClick={() => handleUnequip(slot)}
                            className="text-xs text-slate-500 hover:text-red-400 ml-2 font-cinzel transition-all"
                          >
                            Zdejmij
                          </button>
                        </>
                      ) : (
                        <div className="flex-1 text-xs text-slate-700 font-crimson italic">— puste —</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Item detail panel */}
          <div className="panel flex flex-col">
            {selected ? (
              <>
                <div className={`font-cinzel text-lg font-bold mb-1 ${RARITIES[selected.rarity]?.color ?? 'text-slate-300'}`}>
                  {selected.name}
                </div>
                <div className="text-slate-500 font-crimson text-xs mb-1 italic capitalize">
                  {selected.rarity} · {selected.slot ?? selected.type}
                </div>
                <p className="text-slate-400 font-crimson text-sm mb-4">{selected.description}</p>

                {/* Stats */}
                {selected.stats && (
                  <div className="mb-4 space-y-0.5">
                    {selected.stats.attack && <StatDiff label="Atak" current={player.stats?.attack} next={(player.stats?.attack ?? 0) + selected.stats.attack} />}
                    {selected.stats.defense && <StatDiff label="Obrona" current={player.stats?.defense} next={(player.stats?.defense ?? 0) + selected.stats.defense} />}
                    {selected.stats.hp && <StatDiff label="HP" current={player.maxHp} next={player.maxHp + selected.stats.hp} />}
                    {selected.stats.mana && <StatDiff label="MP" current={player.maxMana} next={player.maxMana + selected.stats.mana} />}
                    {selected.stats.crit && <StatDiff label="Kryt%" current={player.crit} next={(player.crit ?? 0) + selected.stats.crit} />}
                    {selected.stats.dodge && <StatDiff label="Unik%" current={player.dodge} next={(player.dodge ?? 0) + selected.stats.dodge} />}
                  </div>
                )}

                {selected.legendaryEffect && (
                  <div className="text-xs text-yellow-300 font-crimson bg-yellow-950/30 border border-yellow-700/50 rounded p-2 mb-4 italic">
                    ✨ {selected.legendaryEffect}
                  </div>
                )}

                <div className="mt-auto space-y-2">
                  {canEquip && (
                    <button onClick={handleEquip} className="btn-gothic w-full py-2 text-sm">
                      Założ
                    </button>
                  )}
                  {canUse && (
                    <button
                      onClick={handleUse}
                      className="w-full py-2 bg-emerald-950 border border-emerald-700 text-emerald-300 font-cinzel text-sm rounded hover:bg-emerald-900 transition-all active:scale-95"
                    >
                      Użyj
                    </button>
                  )}
                  <button
                    onClick={() => setSelected(null)}
                    className="w-full py-1.5 text-xs text-slate-600 hover:text-slate-400 font-cinzel transition-all"
                  >
                    Odznacz
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-700 font-crimson text-sm italic">
                Wybierz przedmiot, aby zobaczyć szczegóły
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryPanel;
