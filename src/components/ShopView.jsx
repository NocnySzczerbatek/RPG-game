// ============================================================
// COMPONENT: Shop View
// ============================================================
import React, { useState } from 'react';
import { ITEMS, SHOP_INVENTORY, RARITIES } from '../data/items.js';

const ShopView = ({ cityId, player, merchantGold, dispatch, onClose }) => {
  const [tab, setTab] = useState('buy');
  const [selected, setSelected] = useState(null);

  const shopItems = (SHOP_INVENTORY[cityId] ?? [])
    .map((id) => ITEMS[id])
    .filter(Boolean);

  const playerSellable = (player.inventory ?? [])
    .map((it) => ({ ...(ITEMS[it.id] ?? {}), ...it }))
    .filter((it) => it.type !== 'key' && it.value > 0);

  const displayList = tab === 'buy' ? shopItems : playerSellable;
  const sellPrice = (item) => Math.floor((item.value ?? 0) * 0.4);

  function handleBuy() {
    if (!selected || tab !== 'buy') return;
    dispatch({ type: 'BUY_ITEM', itemId: selected.id });
    setSelected(null);
  }

  function handleSell() {
    if (!selected || tab !== 'sell') return;
    dispatch({ type: 'SELL_ITEM', instanceId: selected.instanceId });
    setSelected(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-cinzel text-2xl font-bold text-amber-500">🏪 Sklep</h1>
          <div className="flex items-center gap-4">
            <span className="text-yellow-400 font-cinzel text-sm">🪙 {player.gold} złota</span>
            <button onClick={onClose} className="btn-gothic text-xs px-3 py-1.5">← Wróć</button>
          </div>
        </div>

        {/* Merchant gold */}
        <div className="panel mb-4 flex items-center justify-between text-sm font-crimson">
          <span className="text-slate-500">Złoto kupca:</span>
          <span className={`${merchantGold < 500 ? 'text-red-400' : 'text-yellow-400'} font-cinzel`}>
            🪙 {merchantGold ?? 5000}
          </span>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['buy', 'sell'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelected(null); }}
              className={`font-cinzel text-xs px-4 py-2 rounded border transition-all ${
                tab === t
                  ? 'border-amber-600 text-amber-400 bg-amber-950/30'
                  : 'border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              {t === 'buy' ? '🛒 Kup' : '💰 Sprzedaj'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Item list */}
          <div className="lg:col-span-2 panel">
            {displayList.length === 0 && (
              <p className="text-slate-600 font-crimson text-center py-10">
                {tab === 'buy' ? 'Sklep jest pusty.' : 'Nie masz nic do sprzedania.'}
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {displayList.map((item) => {
                const rarity = RARITIES[item.rarity] ?? RARITIES.common;
                const price = tab === 'buy' ? item.value : sellPrice(item);
                const canAfford = tab === 'buy' ? player.gold >= item.value : true;
                return (
                  <button
                    key={item.instanceId ?? item.id}
                    onClick={() => setSelected((prev) => (prev?.instanceId === item.instanceId ? null : item))}
                    className={`text-left p-3 rounded border transition-all ${
                      selected?.instanceId === item.instanceId
                        ? `${rarity.border} bg-slate-800`
                        : `border-slate-700 bg-slate-900 hover:border-slate-600`
                    } ${!canAfford && tab === 'buy' ? 'opacity-50' : ''}`}
                  >
                    <div className={`font-cinzel text-sm font-bold ${rarity.color}`}>{item.name}</div>
                    <div className="text-slate-500 text-xs font-crimson mb-2 line-clamp-1">{item.description}</div>
                    <div className={`text-xs font-cinzel ${canAfford ? 'text-yellow-400' : 'text-red-500'}`}>
                      🪙 {price}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detail panel */}
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

                {selected.stats && (
                  <div className="mb-4 text-xs space-y-1 font-crimson text-slate-400">
                    {Object.entries(selected.stats).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="capitalize text-slate-500">{k}</span>
                        <span className="text-green-400">+{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selected.legendaryEffect && (
                  <div className="text-xs text-yellow-300 font-crimson bg-yellow-950/30 border border-yellow-700/50 rounded p-2 mb-4 italic">
                    ✨ {selected.legendaryEffect}
                  </div>
                )}

                <div className="mt-auto">
                  <div className="text-center text-yellow-400 font-cinzel text-lg mb-3">
                    🪙 {tab === 'buy' ? selected.value : sellPrice(selected)}
                  </div>

                  {tab === 'buy' ? (
                    <button
                      onClick={handleBuy}
                      disabled={player.gold < (selected.value ?? 0)}
                      className={`btn-gothic w-full py-2 ${player.gold < (selected.value ?? 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Kup
                    </button>
                  ) : (
                    <button onClick={handleSell} className="btn-gothic w-full py-2">
                      Sprzedaj
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-700 font-crimson text-sm italic">
                Kliknij przedmiot, aby zobaczyć szczegóły
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopView;
