// ============================================================
// COMPONENT: Turn-Based Combat View
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import { getAvailableSkills } from '../data/classes.js';
import { ITEMS } from '../data/items.js';

// --- Sub-components ---

const BarFill = ({ value, max, colorClass, label }) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="mb-1">
      <div className="flex justify-between text-xs font-crimson mb-0.5">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">
          {value} / {max}
        </span>
      </div>
      <div className="w-full h-3 bg-slate-800 rounded overflow-hidden">
        <div
          className={`h-full rounded transition-all duration-500 ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

const StatusBadge = ({ effect }) => {
  const icons = {
    bleed: '🩸',
    poison: '☠️',
    freeze: '❄️',
    stun: '⚡',
    silence: '🙊',
    blind: '👁️',
    reflect: '🔮',
    shield: '🛡️',
    lifesteal: '🧛',
    burn: '🔥',
    regen: '💚',
    self_buff: '🌟',
  };
  return (
    <span className="text-xs bg-slate-800 border border-slate-700 rounded px-1 py-0.5 mr-1 mb-1">
      {icons[effect.type] ?? '✦'} {effect.type}
      {effect.stacks > 1 && <span className="text-amber-400 ml-0.5">×{effect.stacks}</span>}
    </span>
  );
};

const SkillButton = ({ skill, usable, onUse }) => {
  return (
    <button
      onClick={() => usable && onUse(skill)}
      disabled={!usable}
      title={skill.description}
      className={`text-left p-2 rounded border text-xs transition-all ${
        usable
          ? 'bg-blue-950/50 border-blue-800 text-blue-200 hover:bg-blue-900/50 hover:border-blue-600 active:scale-95'
          : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'
      }`}
    >
      <div className="font-cinzel text-xs flex items-center gap-1">
        <span>{skill.icon}</span>
        <span className="truncate">{skill.name}</span>
        {skill.currentCooldown > 0 && (
          <span className="ml-auto text-slate-500 text-xs">⏳{skill.currentCooldown}</span>
        )}
      </div>
      <div className="text-slate-500 text-xs mt-0.5">
        💧{skill.manaCost} MP
      </div>
    </button>
  );
};

// --- Main CombatView ---

const CombatView = ({ combatState, player, dispatch }) => {
  const [showSkills, setShowSkills] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const logRef = useRef(null);
  const prevLogLen = useRef(0);

  const cs = combatState;
  if (!cs) return null;

  // combat.js uses cs.player / cs.enemy (not playerState/enemyState)
  const pState = cs.player;
  const eState = cs.enemy;

  // Derive skills from player class definition + cooldowns from combat state
  const availableSkills = player
    ? getAvailableSkills(player).map((skill) => ({
        ...skill,
        currentCooldown: cs.player?.skillCooldowns?.[skill.id] ?? 0,
      }))
    : [];

  // Consumable items from player inventory
  const inventoryItems = (player?.inventory ?? [])
    .map((inv) => ({ ...(ITEMS[inv.id] ?? {}), instanceId: inv.instanceId, id: inv.id }))
    .filter((it) => it.type === 'consumable');

  const isEnraged = eState?.enraged;
  const isPlayerTurn = cs.phase === 'player_turn';
  const isFinished = cs.phase === 'finished';
  const isVictory = cs.result === 'victory';
  const isDefeat = cs.result === 'defeat';

  // Auto-scroll combat log
  useEffect(() => {
    if (logRef.current && (cs.log?.length ?? 0) !== prevLogLen.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
      prevLogLen.current = cs.log?.length ?? 0;
    }
  }, [cs.log?.length]);

  if (!pState || !eState) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500 font-cinzel">Błąd stanu walki…</div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {cs.enemyDialogue && (
        <div className="bg-red-950/80 border-b border-red-800 px-4 py-2 text-center text-red-300 font-crimson text-sm italic">{cs.enemyDialogue}</div>
      )}
      {isEnraged && (
        <div className="bg-red-900/60 border-b border-red-600 px-4 py-1.5 text-center text-red-300 font-cinzel text-xs animate-pulse">
          ⚠️ FAZA WŚCIEKŁOŚCI — {eState.name} PRZESZEDŁ W TRYB ENRAGE ⚠️
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 p-4 flex-1">
        {/* PLAYER PANEL */}
        <div className="lg:w-56 panel flex flex-col gap-2 shrink-0">
          <div className="text-center mb-1">
            <div className="font-cinzel text-amber-400 text-sm font-bold">{player?.name ?? 'Bohater'}</div>
            <div className="text-slate-500 font-crimson text-xs">Poz. {player?.level} · {player?.class}</div>
          </div>
          <BarFill value={pState.hp} max={pState.maxHp} colorClass="bg-red-600" label="HP" />
          <BarFill value={pState.mana} max={pState.maxMana} colorClass="bg-blue-600" label="MP" />
          <div className="w-full h-1.5 bg-slate-800 rounded overflow-hidden mt-1">
            <div className="h-full bg-amber-500 rounded" style={{ width: `${((player?.exp ?? 0) / Math.max(1, player?.expToNext ?? 1)) * 100}%` }} />
          </div>
          {pState.statusEffects?.length > 0 && (
            <div className="flex flex-wrap mt-1">
              {pState.statusEffects.map((e, i) => <StatusBadge key={i} effect={e} />)}
            </div>
          )}
          <div className="border-t border-slate-800 pt-2 mt-1 text-xs font-crimson text-slate-500">
            <div>⚔️ ATK: {pState.attack ?? '—'}</div>
            <div>🛡️ DEF: {pState.defense ?? '—'}</div>
            <div>💨 Unik: {Math.round((pState.dodgeChance ?? 0) * 100)}%</div>
            <div>🎯 Kryt: {Math.round((pState.critChance ?? 0) * 100)}%</div>
          </div>
          <div className="text-xs font-crimson text-slate-600 italic mt-2">Tura #{cs.turn ?? 1}</div>
        </div>

        {/* CENTER */}
        <div className="flex-1 flex flex-col gap-3">
          {/* Enemy card */}
          <div className={`panel ${isEnraged ? 'border-red-600' : ''}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className={`font-cinzel text-lg font-bold ${isEnraged ? 'text-red-400' : 'text-amber-400'}`}>
                  {eState.name}
                  {eState.isBoss && <span className="ml-2 text-xs text-red-500 font-crimson">[BOSS]</span>}
                </div>
                <div className="text-slate-500 font-crimson text-xs">Poz. {eState.level}</div>
              </div>
              <div className="text-2xl">{eState.icon ?? '💀'}</div>
            </div>
            <BarFill value={eState.hp} max={eState.maxHp} colorClass={isEnraged ? 'bg-red-500' : 'bg-red-700'} label="HP" />
            {eState.statusEffects?.length > 0 && (
              <div className="flex flex-wrap mt-1">
                {eState.statusEffects.map((e, i) => <StatusBadge key={i} effect={e} />)}
              </div>
            )}
            {eState.enrageThreshold && !isEnraged && (
              <div className="mt-2 text-xs text-slate-600 font-crimson">
                Próg wściekłości @ {Math.floor(eState.enrageThreshold * 100)}% HP
              </div>
            )}
          </div>

          {/* Log */}
          <div ref={logRef} className="flex-1 bg-slate-900 border border-slate-800 rounded p-3 overflow-y-auto max-h-44 font-crimson text-sm space-y-1" style={{ minHeight: '7rem' }}>
            {(cs.log ?? []).map((entry, i) => {
              const isRecent = i >= (cs.log.length - 2);
              const text = typeof entry === 'string' ? entry : entry?.text ?? '';
              const icon = typeof entry === 'object' ? entry?.icon : null;
              return (
                <p key={i} className={isRecent ? 'text-slate-200' : 'text-slate-500'}>
                  {icon && <span className="mr-1">{icon}</span>}{text}
                </p>
              );
            })}
          </div>

          {/* ACTIONS */}
          {!isFinished && isPlayerTurn && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={() => dispatch({ type: 'COMBAT_PLAYER_ATTACK' })} className="btn-gothic py-2.5 text-sm">⚔️ Atak</button>
                <button onClick={() => { setShowSkills(!showSkills); setShowItems(false); }}
                  className="px-3 py-2.5 bg-blue-950/50 border border-blue-800 text-blue-200 font-cinzel text-xs rounded hover:bg-blue-900/50 transition-all">
                  ✨ Umiejętności
                </button>
                <button onClick={() => { setShowItems(!showItems); setShowSkills(false); }}
                  className="px-3 py-2.5 bg-emerald-950/50 border border-emerald-800 text-emerald-200 font-cinzel text-xs rounded hover:bg-emerald-900/50 transition-all">
                  🧪 Przedmiot
                </button>
                <button onClick={() => dispatch({ type: 'COMBAT_FLEE' })}
                  className="px-3 py-2.5 bg-slate-800 border border-slate-700 text-slate-400 font-cinzel text-xs rounded hover:bg-slate-700 transition-all">
                  🏃 Uciekaj
                </button>
              </div>

              {showSkills && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-slate-900 border border-blue-900 rounded">
                  {availableSkills.length === 0 && <p className="text-slate-600 font-crimson text-xs col-span-full text-center py-2">Brak dostępnych umiejętności.</p>}
                  {availableSkills.map((skill, i) => {
                    const silenced = pState.statusEffects?.some((e) => e.type === 'silence');
                    const usable = (skill.currentCooldown ?? 0) === 0 && pState.mana >= skill.manaCost && !silenced;
                    return (
                      <button key={i} onClick={() => { if (usable) { dispatch({ type: 'COMBAT_PLAYER_SKILL', skill }); setShowSkills(false); } }}
                        disabled={!usable}
                        className={`text-left p-2 rounded border text-xs transition-all ${usable ? 'bg-blue-950/50 border-blue-800 text-blue-200 hover:bg-blue-900/50 active:scale-95' : 'bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed'}`}>
                        <div className="font-cinzel text-xs flex items-center gap-1">
                          <span>{skill.icon}</span><span className="truncate">{skill.name}</span>
                          {skill.currentCooldown > 0 && <span className="ml-auto text-slate-500">⏳{skill.currentCooldown}</span>}
                        </div>
                        <div className="text-slate-500 text-xs mt-0.5">💧{skill.manaCost} MP</div>
                      </button>
                    );
                  })}
                </div>
              )}

              {showItems && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-slate-900 border border-emerald-900 rounded">
                  {inventoryItems.length === 0 && <p className="text-slate-600 font-crimson text-xs col-span-full text-center py-2">Brak używalnych przedmiotów.</p>}
                  {inventoryItems.map((item, i) => (
                    <button key={i} onClick={() => { dispatch({ type: 'COMBAT_USE_ITEM', itemId: item.id }); setShowItems(false); }}
                      className="text-left p-2 rounded border bg-emerald-950/50 border-emerald-800 text-emerald-200 hover:bg-emerald-900/50 transition-all text-xs">
                      <span className="font-cinzel">{item.name}</span>
                      <div className="text-emerald-400 text-xs mt-0.5 font-crimson">{item.description}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isFinished && !isPlayerTurn && (
            <div className="text-center text-slate-500 font-cinzel text-sm animate-pulse py-3">⏳ Przeciwnik atakuje…</div>
          )}

          {/* POST-COMBAT */}
          {isFinished && (
            <div className={`panel text-center ${isVictory ? 'border-amber-600' : 'border-red-800'}`}>
              <div className={`font-cinzel text-2xl font-bold mb-2 ${isVictory ? 'text-amber-400' : 'text-red-400'}`}>
                {isVictory ? '⚔️ Zwycięstwo!' : '💀 Śmierć'}
              </div>
              {isVictory && (
                <div className="mb-4">
                  <div className="font-crimson text-slate-300 text-sm mb-2">
                    ✨ +{cs.xpEarned ?? 0} EXP &nbsp;|&nbsp; 🪙 +{cs.goldEarned ?? 0} złota
                  </div>
                  {(cs.lootEarned ?? []).length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2">
                      {cs.lootEarned.map((it, i) => (
                        <span key={i} className={`item-${it.rarity ?? 'common'} text-xs px-2 py-1 rounded border`}>{it.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {isDefeat && <p className="text-slate-500 font-crimson text-sm mb-4">Twoje ciało upada, ale duch wciąż się tli…</p>}
              <button onClick={() => dispatch({ type: 'RETURN_FROM_COMBAT' })} className="btn-gothic px-6 py-2">
                {isVictory ? '→ Wróć do Miasta' : '→ Wróć (Stracono złoto)'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CombatView;

