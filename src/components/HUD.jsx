// ============================================================
// COMPONENT: HUD (persistent top bar)
// ============================================================
import React from 'react';

const Bar = ({ current, max, colorClass, label }) => {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-xs text-slate-400 w-8 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-slate-300 w-20 text-right shrink-0">{current}/{max}</span>
    </div>
  );
};

const HUD = ({ player, currentCity, mainQuestStage, collectedShards, onOpenInventory, onOpenMap, onOpenQuests }) => {
  if (!player) return null;

  const expPct = Math.max(0, Math.min(100, (player.exp / Math.max(1, player.expToNext)) * 100));
  const cityLabels = { bastion: 'Bastion', iglieze: 'Iglicze', cytadela: 'Cytadela' };

  return (
    <div className="sticky top-0 z-40 bg-slate-950 border-b border-red-900 px-3 py-2 shadow-lg shadow-black/50">
      <div className="max-w-6xl mx-auto flex flex-col gap-1.5">
        {/* Top row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-amber-500 font-cinzel text-sm font-bold shrink-0 truncate max-w-[120px]">{player.name}</span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-purple-400 font-cinzel shrink-0">
              {player.class === 'warrior' ? 'Wojownik' : player.class === 'mage' ? 'Mag' : player.class === 'paladin' ? 'Paladyn' : 'Ninja'}
            </span>
            <span className="text-xs text-slate-500">|</span>
            <span className="text-xs text-amber-400 font-cinzel shrink-0">Poz. {player.level}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-500 font-cinzel">⚜ {cityLabels[currentCity] || currentCity}</span>
            <span className="text-xs text-yellow-400">💰 {player.gold}</span>
            {collectedShards > 0 && (
              <span className="text-xs text-yellow-200">☀ {collectedShards}/5</span>
            )}
          </div>

          <div className="flex gap-1">
            <button onClick={onOpenInventory} className="btn-gothic text-xs px-2 py-1">EQ</button>
            <button onClick={onOpenMap} className="btn-gothic text-xs px-2 py-1">🗺</button>
            <button onClick={onOpenQuests} className="btn-gothic text-xs px-2 py-1">📜</button>
          </div>
        </div>

        {/* Bars row */}
        <div className="grid grid-cols-3 gap-3">
          <Bar current={player.hp} max={player.maxHp} colorClass="hp-bar" label="HP" />
          <Bar current={player.mana} max={player.maxMana} colorClass="mana-bar" label="MP" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-400 w-8 shrink-0">EXP</span>
            <div className="flex-1 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
              <div
                className="h-full rounded-full transition-all duration-300 exp-bar"
                style={{ width: `${expPct}%` }}
              />
            </div>
            <span className="text-xs text-slate-300 w-20 text-right shrink-0">{player.exp}/{player.expToNext}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
