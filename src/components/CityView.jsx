// ============================================================
// COMPONENT: City Hub View
// ============================================================
import React, { useState } from 'react';
import { CITIES } from '../data/cities.js';
import { getCityNPCs } from '../data/cities.js';
import { getEnemiesByCity, getBossesByCity } from '../data/enemies.js';

const CityView = ({
  cityId,
  player,
  mainQuestStage,
  defeatedBosses,
  tutorialStep,
  dispatch,
}) => {
  const [hoverNpc, setHoverNpc] = useState(null);
  const city = CITIES[cityId];
  if (!city) return null;

  const npcs = getCityNPCs(cityId);
  const enemies = getEnemiesByCity(cityId);
  const bosses = getBossesByCity(cityId);
  const availableBosses = bosses.filter((b) => !defeatedBosses.includes(b.id));

  function handleFight() {
    const pool = enemies.filter((e) => !e.isBoss);
    const enemy = pool[Math.floor(Math.random() * pool.length)];
    if (enemy) dispatch({ type: 'START_COMBAT', enemyId: enemy.id });
  }

  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{
        background: `radial-gradient(ellipse at 50% 0%, ${city.accent ?? '#1e0a0a'} 0%, #0a0a0f 70%)`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* --- City Header --- */}
        <div className="mb-8 text-center">
          <div className="text-4xl mb-2">{city.icon}</div>
          <h1 className="font-cinzel text-4xl font-bold text-amber-500 drop-shadow mb-1">{city.name}</h1>
          <p className="text-slate-500 font-crimson italic text-sm mb-3">{city.subtitle}</p>
          <p className="text-slate-400 font-crimson max-w-xl mx-auto text-base">{city.description}</p>
        </div>

        {/* --- Tutorial overlay banner --- */}
        {tutorialStep === 0 && (
          <div className="border border-amber-700 bg-amber-950/50 rounded p-3 mb-6 text-amber-300 font-crimson text-sm text-center">
            🎯 Cel: Porozmawiaj z <strong>Kapitanem Lyrą</strong>, by rozpocząć swoją krzywdę.
          </div>
        )}
        {tutorialStep === 1 && (
          <div className="border border-amber-700 bg-amber-950/50 rounded p-3 mb-6 text-amber-300 font-crimson text-sm text-center">
            🎯 Cel: Pokonaj pierwszego wroga w tej dzielnicy.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* --- NPC Column --- */}
          <div className="lg:col-span-2">
            <h2 className="font-cinzel text-sm text-slate-500 uppercase tracking-widest mb-3">
              Mieszkańcy
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {npcs.map((npc) => (
                <button
                  key={npc.id}
                  onMouseEnter={() => setHoverNpc(npc.id)}
                  onMouseLeave={() => setHoverNpc(null)}
                  onClick={() => dispatch({ type: 'START_DIALOGUE', npcId: npc.id })}
                  className={`text-left panel p-3 transition-all hover:border-amber-700 active:scale-95 ${
                    hoverNpc === npc.id ? 'border-amber-700 bg-slate-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">{npc.icon ?? '🧑'}</span>
                    <div>
                      <div className="font-cinzel text-amber-400 text-sm font-semibold">{npc.name}</div>
                      <div className="text-slate-500 text-xs">{npc.title}</div>
                    </div>
                  </div>
                  <p className="text-slate-400 font-crimson text-xs line-clamp-2">{npc.shortDesc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* --- Action Column --- */}
          <div className="flex flex-col gap-4">
            {/* Combat Section */}
            <div className="panel">
              <h2 className="font-cinzel text-sm text-slate-500 uppercase tracking-widest mb-3">Walka</h2>

              <button
                onClick={handleFight}
                className="btn-gothic w-full mb-3 py-2.5"
              >
                ⚔️ Losowe Starcie
              </button>

              {availableBosses.map((boss) => (
                <button
                  key={boss.id}
                  onClick={() => dispatch({ type: 'START_COMBAT', enemyId: boss.id })}
                  className="w-full mb-2 px-3 py-2.5 bg-red-950/60 border border-red-800 text-red-300 font-cinzel text-xs rounded hover:bg-red-900/60 hover:border-red-600 transition-all active:scale-95"
                >
                  💀 Bossowa Walka — {boss.name}
                </button>
              ))}

              {defeatedBosses.some((id) => bosses.map((b) => b.id).includes(id)) && (
                <p className="text-slate-600 font-crimson text-xs text-center mt-1">
                  ✓ Boss tej lokacji pokonany
                </p>
              )}
            </div>

            {/* Services Section */}
            <div className="panel">
              <h2 className="font-cinzel text-sm text-slate-500 uppercase tracking-widest mb-3">Usługi</h2>

              {city.shop && (
                <button
                  onClick={() => dispatch({ type: 'OPEN_SHOP' })}
                  className="btn-gothic w-full mb-2 py-2"
                >
                  🏪 Sklep
                </button>
              )}

              {city.forge && (
                <button
                  onClick={() => dispatch({ type: 'OPEN_FORGE' })}
                  className="w-full mb-2 px-3 py-2 bg-amber-950/60 border border-amber-700 text-amber-300 font-cinzel text-xs rounded hover:bg-amber-900/60 hover:border-amber-500 transition-all active:scale-95"
                >
                  ⚒️ Boska Kuźnia
                </button>
              )}

              {city.questBoard && (
                <button
                  onClick={() => dispatch({ type: 'OPEN_BOUNTY_BOARD' })}
                  className="w-full mb-2 px-3 py-2 bg-purple-950/60 border border-purple-800 text-purple-300 font-cinzel text-xs rounded hover:bg-purple-900/60 hover:border-purple-600 transition-all active:scale-95"
                >
                  📋 Tablica Zleceń
                </button>
              )}

              <button
                onClick={() => dispatch({ type: 'OPEN_WORLD_MAP' })}
                className="w-full mb-2 px-3 py-2 bg-blue-950/60 border border-blue-800 text-blue-300 font-cinzel text-xs rounded hover:bg-blue-900/60 hover:border-blue-600 transition-all active:scale-95"
              >
                🗺️ Mapa Świata
              </button>

              <button
                onClick={() => dispatch({ type: 'OPEN_QUEST_TRACKER' })}
                className="w-full mb-2 px-3 py-2 bg-emerald-950/60 border border-emerald-800 text-emerald-300 font-cinzel text-xs rounded hover:bg-emerald-900/60 hover:border-emerald-600 transition-all active:scale-95"
              >
                📜 Dziennik Zadań
              </button>

              <button
                onClick={() => dispatch({ type: 'OPEN_INVENTORY' })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 text-slate-300 font-cinzel text-xs rounded hover:bg-slate-700 hover:border-slate-500 transition-all active:scale-95"
              >
                🎒 Ekwipunek
              </button>
            </div>

            {/* Player Summary */}
            <div className="panel">
              <div className="text-center">
                <div className="font-cinzel text-amber-400 text-sm">{player.name}</div>
                <div className="text-slate-500 text-xs font-crimson">
                  Poziom {player.level} {player.className}
                </div>
                <div className="mt-2 flex justify-center gap-4 text-xs">
                  <span className="text-red-400">❤️ {player.hp}/{player.maxHp}</span>
                  <span className="text-blue-400">💧 {player.mana}/{player.maxMana}</span>
                  <span className="text-yellow-400">🪙 {player.gold}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityView;
