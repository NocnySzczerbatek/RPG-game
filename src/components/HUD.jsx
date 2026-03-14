// ============================================================
// COMPONENT: HUD — Gothic ARPG Style
// Red Health Orb, Blue Mana Orb, Skill Bar, XP Bar
// Class-specific QWER skills
// ============================================================
import React from 'react';
import { getClassSkills, SKILLS } from './GameMap.jsx';

const Orb = ({ current, max, colorStart, colorEnd, borderColor, label }) => {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  return (
    <div className="relative w-[72px] h-[72px] flex-shrink-0">
      {/* Outer ring */}
      <div className={`absolute inset-0 rounded-full border-2 ${borderColor} bg-gray-950 overflow-hidden shadow-lg`}>
        {/* Fill */}
        <div
          className="absolute bottom-0 w-full transition-all duration-300"
          style={{ height: `${pct}%`, background: `radial-gradient(circle at 35% 40%, ${colorStart}, ${colorEnd})` }}
        />
        {/* Glass highlight */}
        <div className="absolute top-[10%] left-[20%] w-[30%] h-[20%] bg-white/10 rounded-full blur-sm" />
      </div>
      {/* Inner ring */}
      <div className={`absolute inset-[2px] rounded-full border ${borderColor} opacity-40`} />
      {/* Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold text-white drop-shadow-lg font-cinzel leading-none">
          {Math.floor(current)}
        </span>
        <span className="text-[7px] text-white/60 font-mono leading-none">/ {max}</span>
      </div>
      {/* Label */}
      <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-[8px] font-cinzel text-gray-400 font-bold">{label}</span>
    </div>
  );
};

const SkillSlot = ({ hotkey, name, manaCost, cooldownMs, maxCooldownMs, color }) => {
  const onCd = cooldownMs > 0;
  const cdPct = maxCooldownMs > 0 ? (cooldownMs / maxCooldownMs) * 100 : 0;
  return (
    <div className="relative group">
      <div className={`w-12 h-12 rounded-md border-2 flex flex-col items-center justify-center
        ${onCd ? 'border-gray-700 bg-gray-900/80' : 'border-amber-700 bg-gray-900/90 hover:border-amber-500'} transition-all`}>
        {onCd && (
          <div className="absolute inset-0 bg-black/50 rounded-md flex items-center justify-center">
            <span className="text-[10px] text-gray-400 font-mono">{(cooldownMs / 1000).toFixed(1)}</span>
          </div>
        )}
        <span className="text-base font-bold font-cinzel leading-none" style={{ color }}>{hotkey}</span>
        <span className="text-[7px] text-gray-500 font-crimson leading-none mt-0.5">{name}</span>
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-32 p-2 bg-gray-950 border border-amber-900 rounded text-[10px] z-[999] shadow-xl">
        <div className="font-cinzel text-amber-400 font-bold">{name}</div>
        <div className="text-blue-300 mt-0.5">Mana: {manaCost}</div>
        <div className="text-gray-500">CD: {maxCooldownMs / 1000}s</div>
      </div>
    </div>
  );
};

const HUD = ({ player, currentCity, collectedShards, onOpenInventory, onOpenMap, onOpenQuests, skillCooldowns }) => {
  if (!player) return null;

  const expPct = Math.max(0, Math.min(100, (player.exp / Math.max(1, player.expToNext)) * 100));
  const cityLabels = {
    bastion: 'Bastion', iglieze: 'Iglicze', cytadela: 'Cytadela',
    eldergrove: 'Eldergrove', sunhold: 'Sunhold', frostholm: 'Frostholm',
    emberpeak: 'Emberpeak', mirewood: 'Mirewood', ironspire: 'Ironspire',
  };

  // Dynamic class skills from GameMap CLASS_SKILLS
  const classSkillsMap = getClassSkills(player.class || 'warrior');

  const skills = Object.entries(classSkillsMap).map(([key, s]) => ({
    hotkey: key,
    name: s.name,
    manaCost: s.manaCost,
    maxCd: s.cooldown,
    color: `#${s.color.toString(16).padStart(6, '0')}`,
  }));

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* ── Top Info Bar ── */}
      <div className="pointer-events-auto fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 py-1.5 bg-gray-950/85 border-b border-amber-900/40 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <span className="font-cinzel text-amber-400 font-bold text-sm truncate max-w-[140px]">{player.name}</span>
            <span className="text-[10px] text-gray-600">|</span>
            <span className="text-xs text-purple-400 font-cinzel capitalize">{player.class}</span>
            <span className="text-[10px] text-gray-600">|</span>
            <span className="text-xs text-amber-300 font-cinzel">Lv.{player.level}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* XP Bar inline */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-500 font-cinzel">EXP</span>
              <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
                <div className="h-full bg-gradient-to-r from-green-700 to-green-400 transition-all duration-300" style={{ width: `${expPct}%` }} />
              </div>
              <span className="text-[10px] text-gray-400 font-mono">{player.exp}/{player.expToNext}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-500 font-cinzel">{cityLabels[currentCity] || currentCity}</span>
            <span className="text-xs text-yellow-400 font-cinzel">{'\uD83D\uDCB0'} {player.gold}</span>
            {(collectedShards ?? 0) > 0 && <span className="text-xs text-yellow-200">{'\u2600'} {collectedShards}/5</span>}
          </div>

          <div className="flex gap-1">
            <button onClick={onOpenInventory} className="px-2 py-0.5 border border-amber-800/60 bg-gray-900 text-amber-400 text-xs font-cinzel rounded hover:bg-gray-800 transition-colors pointer-events-auto">EQ</button>
            <button onClick={onOpenMap} className="px-2 py-0.5 border border-gray-700 bg-gray-900 text-gray-400 text-xs rounded hover:bg-gray-800 transition-colors pointer-events-auto">{'\uD83D\uDDFA'}</button>
            <button onClick={onOpenQuests} className="px-2 py-0.5 border border-purple-800/60 bg-gray-900 text-purple-400 text-xs rounded hover:bg-gray-800 transition-colors pointer-events-auto">{'\uD83D\uDCDC'}</button>
          </div>
        </div>
      </div>

      {/* ── Bottom HUD: Orbs + Skill Bar ── */}
      <div className="flex items-end justify-between px-4 pb-3">
        {/* Left: Health Orb */}
        <div className="pointer-events-auto flex items-end gap-3">
          <Orb current={player.hp} max={player.maxHp} colorStart="#ff3333" colorEnd="#881111" borderColor="border-red-900" label="HP" />
        </div>

        {/* Center: Skill Bar */}
        <div className="pointer-events-auto flex gap-1.5 items-end pb-1">
          {skills.map(s => (
            <SkillSlot
              key={s.hotkey}
              hotkey={s.hotkey}
              name={s.name}
              manaCost={s.manaCost}
              cooldownMs={skillCooldowns?.[s.hotkey] ?? 0}
              maxCooldownMs={s.maxCd}
              color={s.color}
            />
          ))}
        </div>

        {/* Right: Mana Orb */}
        <div className="pointer-events-auto flex items-end gap-3">
          <Orb current={player.mana} max={player.maxMana} colorStart="#3366ff" colorEnd="#112288" borderColor="border-blue-900" label="MP" />
        </div>
      </div>
    </div>
  );
};

export default HUD;
