// ============================================================
// COMPONENT: HUD — CraftPix Pixel-Art UI (pack #4: craftpix-255216)
// Uses real spritesheet assets for orbs, skill bar, panels
// ============================================================
import React from 'react';
import { getClassSkills, SKILLS } from './GameMap.jsx';

const UI = 'assets/sprites/craftpix-net-255216-free-basic-pixel-art-ui-for-rpg/PNG/';

const Orb = ({ current, max, type }) => {
  const pct = Math.max(0, Math.min(100, (current / Math.max(1, max)) * 100));
  const isHp = type === 'hp';
  return (
    <div className="relative w-[80px] h-[80px] flex-shrink-0" style={{ imageRendering: 'pixelated' }}>
      {/* Orb frame from Equipment.png (slot graphic) */}
      <div className="absolute inset-0 rounded-full overflow-hidden border-[3px] shadow-lg"
        style={{
          borderColor: isHp ? '#5a1111' : '#111155',
          background: `radial-gradient(circle at 50% 90%, ${isHp ? '#1a0505' : '#05051a'}, ${isHp ? '#0d0202' : '#02020d'})`,
          boxShadow: `0 0 12px ${isHp ? 'rgba(180,30,30,0.4)' : 'rgba(30,30,180,0.4)'}, inset 0 0 20px rgba(0,0,0,0.5)`,
        }}>
        {/* Fluid fill */}
        <div className="absolute bottom-0 w-full transition-all duration-300"
          style={{
            height: `${pct}%`,
            background: isHp
              ? 'linear-gradient(to top, #8b1111 0%, #cc2222 40%, #ff4444 70%, #ff6666 100%)'
              : 'linear-gradient(to top, #112288 0%, #2244cc 40%, #4466ff 70%, #6688ff 100%)',
            boxShadow: `inset 0 -4px 8px ${isHp ? 'rgba(255,100,100,0.3)' : 'rgba(100,100,255,0.3)'}`,
          }} />
        {/* Bubble / highlight */}
        <div className="absolute top-[15%] left-[22%] w-[20%] h-[14%] bg-white/15 rounded-full blur-[1px]" />
        <div className="absolute top-[30%] left-[18%] w-[10%] h-[8%] bg-white/10 rounded-full" />
      </div>
      {/* Pixel frame overlay using Main_tiles */}
      <div className="absolute inset-[-4px] pointer-events-none rounded-full border-[4px]"
        style={{
          borderImage: `url('${UI}Main_tiles.png') 16 fill / 4px / 0 round`,
          borderColor: isHp ? '#6b2222' : '#22226b',
          opacity: 0.7,
        }} />
      {/* Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[11px] font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-cinzel leading-none">
          {Math.floor(current)}
        </span>
        <span className="text-[7px] text-white/50 font-mono leading-none">/{max}</span>
      </div>
      {/* Label */}
      <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-cinzel font-bold drop-shadow-lg"
        style={{ color: isHp ? '#ff6644' : '#6688ff' }}>
        {isHp ? 'HP' : 'MP'}
      </span>
    </div>
  );
};

const SkillSlot = ({ hotkey, name, manaCost, cooldownMs, maxCooldownMs, color }) => {
  const onCd = cooldownMs > 0;
  return (
    <div className="relative group">
      {/* Slot background from Equipment.png spritesheet */}
      <div className="w-14 h-14 flex flex-col items-center justify-center relative"
        style={{
          imageRendering: 'pixelated',
          background: `url('${UI}Equipment.png') -0px -0px / 160px 384px no-repeat`,
          backgroundSize: '320px 768px',
          backgroundPosition: onCd ? '-64px 0px' : '0px 0px',
          border: `2px solid ${onCd ? '#333' : '#8b6914'}`,
          borderRadius: '4px',
          boxShadow: onCd ? 'none' : `0 0 6px rgba(139,105,20,0.4), inset 0 0 8px rgba(0,0,0,0.5)`,
        }}>
        {onCd && (
          <div className="absolute inset-0 bg-black/60 rounded flex items-center justify-center z-10">
            <span className="text-[10px] text-gray-400 font-mono">{(cooldownMs / 1000).toFixed(1)}</span>
          </div>
        )}
        <span className="text-base font-bold font-cinzel leading-none z-20 drop-shadow-lg" style={{ color }}>{hotkey}</span>
        <span className="text-[7px] text-gray-300 font-crimson leading-none mt-0.5 z-20 drop-shadow">{name}</span>
      </div>
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-36 p-2 rounded text-[10px] z-[999] shadow-xl"
        style={{
          imageRendering: 'pixelated',
          backgroundColor: 'rgba(15,10,5,0.95)',
          border: '2px solid #5a4a20',
          boxShadow: '0 0 12px rgba(0,0,0,0.8)',
        }}>
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

  const classSkillsMap = getClassSkills(player.class || 'warrior');
  const skills = Object.entries(classSkillsMap).map(([key, s]) => ({
    hotkey: key,
    name: s.name,
    manaCost: s.manaCost,
    maxCd: s.cooldown,
    color: `#${s.color.toString(16).padStart(6, '0')}`,
  }));

  const panelBg = {
    imageRendering: 'pixelated',
    backgroundColor: 'rgba(12,8,4,0.92)',
    border: '3px solid #4a3a18',
    boxShadow: '0 0 16px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.3)',
  };

  const pixelBtn = (extra = '') => `
    px-3 py-1 text-xs font-cinzel rounded cursor-pointer transition-all
    hover:brightness-125 active:translate-y-[1px] ${extra}
  `;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* ── Top Info Bar (pixel panel style) ── */}
      <div className="pointer-events-auto fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between px-4 py-1.5" style={panelBg}>
          <div className="flex items-center gap-3">
            <span className="font-cinzel text-amber-400 font-bold text-sm truncate max-w-[140px]">{player.name}</span>
            <span className="text-[10px] text-gray-700">|</span>
            <span className="text-xs text-purple-400 font-cinzel capitalize">{player.class}</span>
            <span className="text-[10px] text-gray-700">|</span>
            <span className="text-xs text-amber-300 font-cinzel">Lv.{player.level}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-cinzel">EXP</span>
            {/* XP bar with pixel border */}
            <div className="w-28 h-2.5 rounded overflow-hidden relative"
              style={{ border: '2px solid #4a3a18', backgroundColor: '#0a0804' }}>
              <div className="h-full transition-all duration-300"
                style={{
                  width: `${expPct}%`,
                  background: 'linear-gradient(to right, #4a8a20, #88cc44, #aaee66)',
                  boxShadow: 'inset 0 -1px 2px rgba(0,0,0,0.3)',
                }} />
            </div>
            <span className="text-[10px] text-gray-400 font-mono">{player.exp}/{player.expToNext}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-500 font-cinzel">{cityLabels[currentCity] || currentCity}</span>
            <span className="text-xs text-yellow-400 font-cinzel">{'\uD83D\uDCB0'} {player.gold}</span>
            {(collectedShards ?? 0) > 0 && <span className="text-xs text-yellow-200">{'\u2600'} {collectedShards}/5</span>}
          </div>

          <div className="flex gap-1">
            <button onClick={onOpenInventory} className={pixelBtn()}
              style={{ border: '2px solid #8b6914', backgroundColor: '#2a1e0a', color: '#daa520' }}>EQ</button>
            <button onClick={onOpenMap} className={pixelBtn()}
              style={{ border: '2px solid #444', backgroundColor: '#1a1a1a', color: '#888' }}>{'\uD83D\uDDFA'}</button>
            <button onClick={onOpenQuests} className={pixelBtn()}
              style={{ border: '2px solid #5a2080', backgroundColor: '#1a0a2a', color: '#aa66dd' }}>{'\uD83D\uDCDC'}</button>
          </div>
        </div>
      </div>

      {/* ── Bottom HUD: Orbs + Action Panel + Skill Bar ── */}
      <div className="flex items-end justify-between px-4 pb-3">
        {/* Left: Health Orb */}
        <div className="pointer-events-auto flex items-end gap-3">
          <Orb current={player.hp} max={player.maxHp} type="hp" />
        </div>

        {/* Center: Skill Bar on Action Panel */}
        <div className="pointer-events-auto relative pb-1">
          {/* Action panel background */}
          <div className="flex gap-1.5 items-end px-4 py-2 rounded-lg"
            style={{
              ...panelBg,
              backgroundImage: `url('${UI}Action_panel.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minWidth: '280px',
              justifyContent: 'center',
            }}>
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
        </div>

        {/* Right: Mana Orb */}
        <div className="pointer-events-auto flex items-end gap-3">
          <Orb current={player.mana} max={player.maxMana} type="mp" />
        </div>
      </div>
    </div>
  );
};

export default HUD;
