// ============================================================
// COMPONENT: Skill Tree — Attribute Allocation + Class Skills
// Gothic ARPG overlay with STR/DEX/INT paths, skill point spending
// ============================================================
import React, { useState } from 'react';

const ATTRIBUTES = [
  { id: 'strength',     label: 'Strength',     abbr: 'STR', color: 'red',    icon: '\u2694\uFE0F', desc: '+2 Attack, +5 HP per point' },
  { id: 'agility',      label: 'Agility',      abbr: 'AGI', color: 'green',  icon: '\uD83C\uDFF9',  desc: '+1 Attack, +2% Crit per point' },
  { id: 'intelligence', label: 'Intelligence', abbr: 'INT', color: 'blue',   icon: '\uD83D\uDD2E',  desc: '+3 Mana, +2 Spell Power per point' },
  { id: 'endurance',    label: 'Endurance',    abbr: 'END', color: 'amber',  icon: '\uD83D\uDEE1\uFE0F',  desc: '+2 Defense, +8 HP per point' },
];

const COLOR_MAP = {
  red:   { border: 'border-red-700',   bg: 'bg-red-950/40',   text: 'text-red-400',   hover: 'hover:bg-red-900/50',   ring: 'ring-red-500',   fill: 'bg-red-600' },
  green: { border: 'border-green-700', bg: 'bg-green-950/40', text: 'text-green-400', hover: 'hover:bg-green-900/50', ring: 'ring-green-500', fill: 'bg-green-600' },
  blue:  { border: 'border-blue-700',  bg: 'bg-blue-950/40',  text: 'text-blue-400',  hover: 'hover:bg-blue-900/50',  ring: 'ring-blue-500',  fill: 'bg-blue-600' },
  amber: { border: 'border-amber-700', bg: 'bg-amber-950/40', text: 'text-amber-400', hover: 'hover:bg-amber-900/50', ring: 'ring-amber-500', fill: 'bg-amber-600' },
};

const CLASS_SKILLS = {
  warrior: [
    { id: 'cleave',       name: 'Cleave',        desc: 'Wide swing hitting nearby foes', cost: 1, maxRank: 3, icon: '\u2694\uFE0F' },
    { id: 'war_cry',      name: 'War Cry',       desc: '+20% Attack for 10s',           cost: 2, maxRank: 3, icon: '\uD83D\uDCA2' },
    { id: 'iron_skin',    name: 'Iron Skin',     desc: '+30% Defense for 8s',            cost: 2, maxRank: 3, icon: '\uD83D\uDEE1\uFE0F' },
    { id: 'berserker',    name: 'Berserker Rage', desc: '+50% damage at <30% HP',        cost: 3, maxRank: 1, icon: '\uD83D\uDD25' },
  ],
  mage: [
    { id: 'chain_lightning', name: 'Chain Lightning', desc: 'Bounces between 3 targets', cost: 1, maxRank: 3, icon: '\u26A1' },
    { id: 'mana_shield',     name: 'Mana Shield',    desc: 'Absorb damage with mana',    cost: 2, maxRank: 3, icon: '\uD83D\uDCA0' },
    { id: 'arcane_surge',    name: 'Arcane Surge',   desc: '+25% Spell Power for 10s',   cost: 2, maxRank: 3, icon: '\u2728' },
    { id: 'meteor',          name: 'Meteor',         desc: 'Massive AoE fire damage',    cost: 3, maxRank: 1, icon: '\u2604\uFE0F' },
  ],
  paladin: [
    { id: 'holy_strike',  name: 'Holy Strike',  desc: 'Light-infused attack',          cost: 1, maxRank: 3, icon: '\u2600\uFE0F' },
    { id: 'divine_heal',  name: 'Divine Heal',  desc: 'Restore HP over time',          cost: 2, maxRank: 3, icon: '\uD83D\uDC9A' },
    { id: 'consecration', name: 'Consecration', desc: 'AoE holy ground damage',        cost: 2, maxRank: 3, icon: '\u2B50' },
    { id: 'wrath_of_god', name: 'Wrath of God', desc: 'Devastating holy burst',        cost: 3, maxRank: 1, icon: '\uD83C\uDF1F' },
  ],
  ninja: [
    { id: 'shadow_step',  name: 'Shadow Step',  desc: 'Teleport behind target',        cost: 1, maxRank: 3, icon: '\uD83D\uDC64' },
    { id: 'poison_blade', name: 'Poison Blade', desc: 'Apply poison DoT',              cost: 2, maxRank: 3, icon: '\uD83D\uDDE1\uFE0F' },
    { id: 'smoke_bomb',   name: 'Smoke Bomb',   desc: 'Evade all attacks for 3s',      cost: 2, maxRank: 3, icon: '\uD83D\uDCA8' },
    { id: 'assassination',name: 'Assassination', desc: '3x damage from stealth',       cost: 3, maxRank: 1, icon: '\uD83D\uDC80' },
  ],
};

const SkillTree = ({ player, dispatch, onClose }) => {
  const [tab, setTab] = useState('attributes'); // attributes | skills

  if (!player) return null;

  const statPoints = player.statPoints ?? 0;
  const skillPoints = player.skillPoints ?? 0;
  const allocatedSkills = player.allocatedSkills ?? {};
  const playerClass = player.class || 'warrior';
  const skills = CLASS_SKILLS[playerClass] || CLASS_SKILLS.warrior;

  const handleAllocateStat = (attrId) => {
    if (statPoints <= 0) return;
    dispatch({ type: 'ALLOCATE_STAT', attribute: attrId });
  };

  const handleAllocateSkill = (skillId, cost) => {
    if (skillPoints < cost) return;
    const currentRank = allocatedSkills[skillId] ?? 0;
    const skillDef = skills.find(s => s.id === skillId);
    if (skillDef && currentRank >= skillDef.maxRank) return;
    dispatch({ type: 'ALLOCATE_SKILL', skillId, cost });
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[600px] max-h-[85vh] bg-gray-950 border-2 border-amber-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-amber-900/40 bg-gray-950">
          <h2 className="font-cinzel text-amber-400 text-lg font-bold">{'\uD83C\uDF1F'} Skill Tree</h2>
          <div className="flex gap-1">
            <button onClick={() => setTab('attributes')}
              className={`px-3 py-1 text-xs font-cinzel rounded transition-all border ${
                tab === 'attributes' ? 'border-amber-600 bg-amber-900/30 text-amber-400' : 'border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300'}`}>
              Attributes ({statPoints})
            </button>
            <button onClick={() => setTab('skills')}
              className={`px-3 py-1 text-xs font-cinzel rounded transition-all border ${
                tab === 'skills' ? 'border-amber-600 bg-amber-900/30 text-amber-400' : 'border-gray-700 bg-gray-900 text-gray-500 hover:text-gray-300'}`}>
              Class Skills ({skillPoints})
            </button>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-red-400 text-xl transition-colors">{'\u2715'}</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'attributes' && (
            <div>
              <p className="text-xs text-gray-500 font-crimson mb-4">
                Spend stat points to permanently increase your attributes. You earn points each level.
              </p>
              <div className="text-center mb-4">
                <span className="font-cinzel text-amber-400 text-sm">Available Points: </span>
                <span className="font-cinzel text-amber-300 text-lg font-bold">{statPoints}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {ATTRIBUTES.map(attr => {
                  const c = COLOR_MAP[attr.color];
                  const currentVal = player.stats?.[attr.id] ?? 0;
                  return (
                    <div key={attr.id} className={`p-3 rounded-lg border ${c.border} ${c.bg} transition-all`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{attr.icon}</span>
                          <div>
                            <div className={`font-cinzel text-sm font-bold ${c.text}`}>{attr.label}</div>
                            <div className="text-[9px] text-gray-500 font-crimson">{attr.desc}</div>
                          </div>
                        </div>
                        <span className={`font-cinzel text-2xl font-bold ${c.text}`}>{currentVal}</span>
                      </div>
                      <button
                        onClick={() => handleAllocateStat(attr.id)}
                        disabled={statPoints <= 0}
                        className={`w-full py-1.5 rounded border ${c.border} font-cinzel text-xs transition-all
                          ${statPoints > 0 ? `${c.hover} ${c.text} cursor-pointer` : 'bg-gray-900 text-gray-700 cursor-not-allowed'}`}>
                        + Allocate
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {tab === 'skills' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="font-cinzel text-amber-400 text-sm capitalize">{playerClass} Skills</span>
                  <p className="text-[10px] text-gray-500 font-crimson">Spend skill points to unlock and rank up class abilities.</p>
                </div>
                <div>
                  <span className="font-cinzel text-amber-400 text-xs">Points: </span>
                  <span className="font-cinzel text-amber-300 font-bold">{skillPoints}</span>
                </div>
              </div>
              <div className="space-y-3">
                {skills.map(skill => {
                  const rank = allocatedSkills[skill.id] ?? 0;
                  const maxed = rank >= skill.maxRank;
                  const canAfford = skillPoints >= skill.cost;
                  return (
                    <div key={skill.id} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      maxed ? 'border-amber-700 bg-amber-950/20' : 'border-gray-800 bg-gray-900/50'}`}>
                      <div className={`w-12 h-12 rounded border-2 flex items-center justify-center text-xl ${
                        maxed ? 'border-amber-600 bg-amber-900/30' : rank > 0 ? 'border-amber-800 bg-gray-800' : 'border-gray-700 bg-gray-900'}`}>
                        {skill.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-cinzel text-sm font-bold ${maxed ? 'text-amber-400' : rank > 0 ? 'text-gray-200' : 'text-gray-400'}`}>
                            {skill.name}
                          </span>
                          <span className="text-[9px] text-gray-600 font-cinzel">({skill.cost} pts)</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-crimson">{skill.desc}</p>
                        {/* Rank pips */}
                        <div className="flex gap-1 mt-1">
                          {Array.from({ length: skill.maxRank }).map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-sm border ${
                              i < rank ? 'border-amber-600 bg-amber-500' : 'border-gray-700 bg-gray-900'}`} />
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => handleAllocateSkill(skill.id, skill.cost)}
                        disabled={maxed || !canAfford}
                        className={`px-3 py-1.5 rounded border font-cinzel text-xs transition-all shrink-0 ${
                          maxed ? 'border-amber-700 bg-amber-900/20 text-amber-500 cursor-default'
                          : canAfford ? 'border-amber-700 bg-amber-900/30 text-amber-400 hover:bg-amber-800/40 cursor-pointer'
                          : 'border-gray-700 bg-gray-900 text-gray-600 cursor-not-allowed'}`}>
                        {maxed ? 'MAX' : `Rank ${rank + 1}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillTree;
