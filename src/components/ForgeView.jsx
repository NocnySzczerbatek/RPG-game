// ============================================================
// COMPONENT: Divine Forge View (Cytadela only)
// ============================================================
import React, { useState } from 'react';
import { ITEMS, FORGE_RECIPES, RARITIES } from '../data/items.js';

const ForgeView = ({ player, dispatch, onClose }) => {
  const [selected, setSelected] = useState(null);

  const inventory = player.inventory ?? [];

  function countInInventory(itemId) {
    return inventory.filter((i) => i.id === itemId).reduce((sum, i) => sum + (i.quantity ?? 1), 0);
  }

  function canCraft(recipe) {
    const hasMaterials = recipe.ingredients.every(
      (ing) => countInInventory(ing.itemId) >= ing.quantity
    );
    const hasGold = player.gold >= (recipe.goldCost ?? 0);
    return hasMaterials && hasGold;
  }

  function handleCraft() {
    if (!selected) return;
    dispatch({ type: 'CRAFT_ITEM', recipe: selected });
    setSelected(null);
  }

  const resultItem = selected ? ITEMS[selected.result] : null;

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-cinzel text-2xl font-bold text-amber-500">⚒️ Boska Kuźnia</h1>
          <div className="flex items-center gap-4">
            <span className="text-yellow-400 font-cinzel text-sm">🪙 {player.gold}</span>
            <button onClick={onClose} className="btn-gothic text-xs px-3 py-1.5">← Wróć</button>
          </div>
        </div>

        <div className="panel mb-6">
          <p className="text-slate-500 font-crimson italic text-sm text-center">
            "Tylko na kowadle Cytadeli można wykuć boskie oręże z odłamków martwych bogów."
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Recipe list */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-cinzel text-sm text-slate-500 uppercase tracking-widest">Receptury</h2>
            {FORGE_RECIPES.map((recipe) => {
              const craftable = canCraft(recipe);
              const result = ITEMS[recipe.result];
              return (
                <button
                  key={recipe.id}
                  onClick={() => setSelected((prev) => (prev?.id === recipe.id ? null : recipe))}
                  className={`w-full text-left p-4 rounded border transition-all ${
                    selected?.id === recipe.id
                      ? 'border-amber-600 bg-amber-950/20'
                      : craftable
                      ? 'border-yellow-700 bg-slate-900 hover:border-yellow-500'
                      : 'border-slate-800 bg-slate-900 opacity-60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-cinzel text-amber-400 font-bold text-sm">
                        {result?.name ?? recipe.result}
                      </div>
                      <div className="text-slate-500 font-crimson text-xs">
                        {RARITIES[result?.rarity]?.label ?? 'Boski'} · {result?.slot}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-yellow-400 text-xs font-cinzel">🪙 {recipe.goldCost}</span>
                      <span className={`text-xs font-cinzel ${craftable ? 'text-green-400' : 'text-red-500'}`}>
                        {craftable ? '✓ Możliwe' : '✗ Brak surowców'}
                      </span>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {recipe.ingredients.map((ing) => {
                      const ingItem = ITEMS[ing.itemId];
                      const have = countInInventory(ing.itemId);
                      const enough = have >= ing.quantity;
                      return (
                        <div
                          key={ing.itemId}
                          className={`text-xs px-2 py-0.5 rounded border ${
                            enough
                              ? 'border-green-800 bg-green-950/30 text-green-400'
                              : 'border-red-900 bg-red-950/30 text-red-400'
                          }`}
                        >
                          {ingItem?.name ?? ing.itemId} ×{ing.quantity}{' '}
                          <span className="text-slate-500">({have}/{ing.quantity})</span>
                        </div>
                      );
                    })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          <div className="panel flex flex-col">
            {selected && resultItem ? (
              <>
                <div className="divine-glow rounded p-1 mb-3 text-center">
                  <div className="text-3xl mb-1">⚒️</div>
                  <div className="font-cinzel text-lg font-bold text-yellow-300">{resultItem.name}</div>
                </div>

                <div className="text-slate-500 font-crimson text-xs mb-1 capitalize italic">
                  Przedmiot Boski · {resultItem.slot}
                </div>
                <p className="text-slate-400 font-crimson text-sm mb-4">{resultItem.description}</p>

                {resultItem.stats && (
                  <div className="mb-4 text-xs space-y-1 font-crimson">
                    {Object.entries(resultItem.stats).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-yellow-200">
                        <span className="capitalize text-slate-500">{k}</span>
                        <span>+{v}</span>
                      </div>
                    ))}
                  </div>
                )}

                {resultItem.legendaryEffect && (
                  <div className="text-xs text-yellow-300 font-crimson bg-yellow-950/30 border border-yellow-700/50 rounded p-2 mb-4 italic">
                    ✨ {resultItem.legendaryEffect}
                  </div>
                )}

                <div className="mt-auto">
                  <div className="text-center font-cinzel text-yellow-400 text-sm mb-2">
                    Koszt: 🪙 {selected.goldCost} złota
                  </div>
                  <button
                    onClick={handleCraft}
                    disabled={!canCraft(selected)}
                    className={`btn-divine w-full py-2.5 ${!canCraft(selected) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    ⚒️ Wykuj
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-700 font-crimson text-sm italic">
                Wybierz recepturę, aby zobaczyć szczegóły
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgeView;
