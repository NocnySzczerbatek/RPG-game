// ============================================================
// COMPONENT: Real-Time ARPG World Map (Phaser 3)
// Uses ALL 10 CraftPix asset packs — no generic placeholders
// 5000×5000 world, 6 biomes, QWER skills, NPC quests
// ============================================================
import React, { useEffect, useRef, useState } from 'react';

// ── World Constants ───────────────────────────────────────
const WORLD_W = 5000;
const WORLD_H = 5000;
const TILE_SIZE = 16;
const TILE_SCALE = 3;
const TILE_SCALED = TILE_SIZE * TILE_SCALE;
const PLAYER_SPEED = 220;
const INTERACT_RADIUS = 80;
const SPRITE_SCALE = 2;
const SAVE_KEY = 'eldoria_arpg_save_v2';
const SAFE_ZONE_RADIUS = 1200;
const MOB_AGGRO_RANGE = 180;

// ── Asset path helpers (all 10 packs) ─────────────────────
const SP = 'assets/sprites/';
const TREES_DIR  = `${SP}craftpix-net-385863-free-top-down-trees-pixel-art/PNG/Assets_separately/Trees/`;
const ROCKS_DIR  = `${SP}craftpix-net-974061-free-rocks-and-stones-top-down-pixel-art/PNG/Objects_separately/`;
const ORC_DIR    = `${SP}craftpix-net-363992-free-top-down-orc-game-character-pixel-art/PNG/`;
const SLIME_DIR  = `${SP}craftpix-net-788364-free-slime-mobs-pixel-art-top-down-sprite-pack/PNG/`;
const MONSTER_DIR= `${SP}craftpix-561178-free-rpg-monster-sprites-pixel-art/PNG/`;
const CHAR_DIR   = `${SP}craftpix-net-555940-free-base-4-direction-male-character-pixel-art/PNG/`;
const HOME_DIR   = `${SP}craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset/PNG/`;
const HERO_DIR   = `${SP}craftpix-891165-assassin-mage-viking-free-pixel-art-game-heroes/PNG/`;
const VAMP_DIR   = `${SP}craftpix-net-208004-free-vampire-4-direction-pixel-character-sprite-pack/PNG/`;
const UI_DIR     = `${SP}craftpix-net-255216-free-basic-pixel-art-ui-for-rpg/PNG/`;

// ── Class → sprite folder mapping (pack #2: craftpix-891165) ──
const CLASS_SPRITE_MAP = {
  warrior: {
    folder: 'Knight', portrait: 'knight.png', weapon: 'Longsword',
    idle: { prefix: 'idle', count: 12, start: 1 },
    walk: { prefix: 'walk', count: 6, start: 1 },
    run:  { prefix: 'run',  count: 8, start: 1 },
    attack: { prefix: 'attack', count: 5, start: 0 },
    hurt: { prefix: 'hurt', count: 4, start: 1 },
    death: { prefix: 'death', count: 10, start: 1, size: 256 },
  },
  mage: {
    folder: 'Mage', portrait: 'mage.png', weapon: 'Staff',
    idle: { prefix: 'idle', count: 14, start: 1 },
    walk: { prefix: 'walk', count: 6, start: 1 },
    run:  { prefix: 'run',  count: 8, start: 1 },
    attack: { prefix: 'attack', count: 7, start: 1 },
    hurt: { prefix: 'hurt', count: 4, start: 1 },
    death: { prefix: 'death', count: 10, start: 1, size: 256 },
    fire: { prefix: 'fire', count: 9, start: 1, size: 32 },
  },
  ninja: {
    folder: 'Rogue', portrait: 'rogue.png', weapon: 'Daggers',
    idle: { prefix: 'idle', count: 17, start: 1, skip: [11] },
    walk: { prefix: 'walk', count: 6, start: 1 },
    run:  { prefix: 'run',  count: 8, start: 1 },
    attack: { prefix: 'Attack', count: 7, start: 1 },
    hurt: { prefix: 'hurt', count: 4, start: 1 },
    death: { prefix: 'death', count: 10, start: 1, size: 256 },
  },
  paladin: {
    folder: 'Knight', portrait: 'knight.png', weapon: 'Warhammer',
    idle: { prefix: 'idle', count: 12, start: 1 },
    walk: { prefix: 'walk', count: 6, start: 1 },
    run:  { prefix: 'run',  count: 8, start: 1 },
    attack: { prefix: 'attack', count: 5, start: 0 },
    hurt: { prefix: 'hurt', count: 4, start: 1 },
    death: { prefix: 'death', count: 10, start: 1, size: 256 },
  },
};

function getHeroFrameKeys(cls, anim) {
  const map = CLASS_SPRITE_MAP[cls] || CLASS_SPRITE_MAP.warrior;
  const a = map[anim]; if (!a) return [];
  const keys = [];
  for (let i = a.start; i < a.start + a.count; i++) {
    if (a.skip && a.skip.includes(i)) continue;
    keys.push(`hero_${anim}_${i}`);
  }
  return keys;
}

function getPortraitPath(cls) {
  const map = CLASS_SPRITE_MAP[cls] || CLASS_SPRITE_MAP.warrior;
  return `${HERO_DIR}${map.folder}/${map.portrait}`;
}

const CLASS_WEAPONS = { warrior: '⚔️ Longsword', mage: '🪄 Staff', ninja: '🗡️ Daggers', paladin: '🔨 Warhammer' };

// ══════════════════════════════════════════════════════════
// PERLIN NOISE — organic biome boundaries (no external deps)
// ══════════════════════════════════════════════════════════
const _perm = new Uint8Array(512);
const _grad = [];
(function _initNoise() {
  let s = 42;
  const r = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  for (let i = 0; i < 256; i++) { const a = r() * Math.PI * 2; _grad[i] = [Math.cos(a), Math.sin(a)]; }
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
  for (let i = 0; i < 512; i++) _perm[i] = p[i & 255];
})();
function _fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
function _lerp(a, b, t) { return a + t * (b - a); }
function noise2D(x, y) {
  const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
  const xf = x - Math.floor(x), yf = y - Math.floor(y);
  const u = _fade(xf), v = _fade(yf);
  const g00 = _grad[_perm[_perm[X] + Y]], g10 = _grad[_perm[_perm[X + 1] + Y]];
  const g01 = _grad[_perm[_perm[X] + Y + 1]], g11 = _grad[_perm[_perm[X + 1] + Y + 1]];
  return _lerp(
    _lerp(g00[0] * xf + g00[1] * yf, g10[0] * (xf - 1) + g10[1] * yf, u),
    _lerp(g01[0] * xf + g01[1] * (yf - 1), g11[0] * (xf - 1) + g11[1] * (yf - 1), u), v
  );
}
function fbm(x, y, oct = 4) {
  let v = 0, a = 1, f = 1, m = 0;
  for (let i = 0; i < oct; i++) { v += noise2D(x * f, y * f) * a; m += a; a *= 0.5; f *= 2; }
  return v / m;
}

// ── Biome Definitions — noise-based organic shapes ────────
const BIOMES = [
  { id: 'forest',   name: 'Verdant Forest',  color: 0x2d5a1e, groundTint: 0x3a7a2a, cx: 2500, cy: 1800, radius: 1800, nox: 0,  noy: 0,  treePalette: ['Tree1','Tree2','Tree3','Flower_tree1','Moss_tree1'] },
  { id: 'desert',   name: 'Scorched Desert', color: 0x8a7540, groundTint: 0xc4a84a, cx: 4200, cy: 1000, radius: 1500, nox: 7,  noy: 3,  treePalette: ['Palm_tree1_1','Palm_tree2_1','Burned_tree1'] },
  { id: 'ice',      name: 'Frozen Wastes',   color: 0x4a6a8a, groundTint: 0x8ab8d8, cx: 800,  cy: 1000, radius: 1500, nox: 13, noy: 5,  treePalette: ['Snow_tree1','Snow_tree2','Snow_christmass_tree1','Christmas_tree1'] },
  { id: 'volcanic', name: 'Volcanic Caldera', color: 0x5a1a0a, groundTint: 0x8a2a0a, cx: 4200, cy: 4000, radius: 1400, nox: 19, noy: 11, treePalette: ['Burned_tree1','Burned_tree2','Burned_tree3','Broken_tree1'] },
  { id: 'swamp',    name: 'Blighted Swamp',  color: 0x2a3a1a, groundTint: 0x3a4a2a, cx: 800,  cy: 4000, radius: 1400, nox: 23, noy: 17, treePalette: ['Moss_tree1','Moss_tree2','Moss_tree3','Broken_tree4','Broken_tree5'] },
  { id: 'mountain', name: 'Ashen Peaks',     color: 0x4a4a4a, groundTint: 0x6a6a6a, cx: 2500, cy: 4600, radius: 1300, nox: 29, noy: 23, treePalette: ['Broken_tree6','Broken_tree7','Autumn_tree1','Autumn_tree2'] },
];

// ── Noise-based biome lookup ──────────────────────────────
function getBiomeAt(x, y) {
  const nx = x / 1000, ny = y / 1000;
  let bestScore = -Infinity, secondScore = -Infinity;
  let primary = BIOMES[0], secondary = BIOMES[1];
  for (const b of BIOMES) {
    const dist = Math.hypot(x - b.cx, y - b.cy);
    const n = fbm(nx * 2.5 + b.nox, ny * 2.5 + b.noy, 4);
    const score = -(dist / b.radius) + n * 0.7;
    if (score > bestScore) { secondScore = bestScore; secondary = primary; bestScore = score; primary = b; }
    else if (score > secondScore) { secondScore = score; secondary = b; }
  }
  const diff = bestScore - secondScore;
  const blend = diff < 0.25 ? 1 - diff / 0.25 : 0;
  return { primary, secondary, blend };
}

function getBiomeBounds(b) {
  const r = b.radius * 1.2;
  const x0 = Math.max(50, b.cx - r), y0 = Math.max(50, b.cy - r);
  return { x: x0, y: y0, w: Math.min(WORLD_W - 50, b.cx + r) - x0, h: Math.min(WORLD_H - 50, b.cy + r) - y0 };
}

function randomBiomePoint(biome, rngFn, margin = 100) {
  const bd = getBiomeBounds(biome);
  for (let t = 0; t < 30; t++) {
    const x = bd.x + margin + rngFn() * (bd.w - margin * 2);
    const y = bd.y + margin + rngFn() * (bd.h - margin * 2);
    if (getBiomeAt(x, y).primary.id === biome.id) return { x, y };
  }
  return { x: biome.cx + (rngFn() - 0.5) * 200, y: biome.cy + (rngFn() - 0.5) * 200 };
}

// ── City data — one per biome, Eldergrove at center ───────
const CITIES = [
  { id: 'eldergrove', biome: 'forest',   x: 2500, y: 2500, name: 'Eldergrove',  subtitle: 'Heart of the Forest' },
  { id: 'sunhold',    biome: 'desert',   x: 4100, y: 1100, name: 'Sunhold',     subtitle: 'Jewel of the Sands' },
  { id: 'frostholm',  biome: 'ice',      x: 900,  y: 1100, name: 'Frostholm',   subtitle: 'Citadel of Eternal Ice' },
  { id: 'emberpeak',  biome: 'volcanic', x: 4100, y: 3900, name: 'Emberpeak',   subtitle: 'Forge of the World' },
  { id: 'mirewood',   biome: 'swamp',    x: 900,  y: 3900, name: 'Mirewood',    subtitle: 'The Sunken Village' },
  { id: 'ironspire',  biome: 'mountain', x: 2500, y: 4400, name: 'Ironspire',   subtitle: 'Summit Stronghold' },
];

function isInSafeZone(x, y) {
  return CITIES.some(c => Math.hypot(c.x - x, c.y - y) < SAFE_ZONE_RADIUS);
}

// ── NPC archetypes per city ───────────────────────────────
const CITY_NPCS = CITIES.flatMap(city => [
  { id: `${city.id}_blacksmith`, cityId: city.id, x: city.x - 100, y: city.y + 50, label: 'Blacksmith', role: 'blacksmith', icon: '⚒️' },
  { id: `${city.id}_healer`,    cityId: city.id, x: city.x + 100, y: city.y + 50, label: 'Healer',     role: 'healer',     icon: '💚' },
  { id: `${city.id}_quest`,     cityId: city.id, x: city.x,       y: city.y - 80, label: 'Quest Board', role: 'questgiver', icon: '❗' },
]);

// ── Enemy templates per biome ─────────────────────────────
const BIOME_ENEMIES = {
  forest:   [
    { type: 'slime1',   hp: 40,  atk: 8,  def: 2,  exp: 15,  gold: 5,  name: 'Green Slime',   sprite: 'slime1', isBoss: false },
    { type: 'slime2',   hp: 55,  atk: 12, def: 4,  exp: 22,  gold: 8,  name: 'Blue Slime',    sprite: 'slime2', isBoss: false },
    { type: 'orc1',     hp: 80,  atk: 18, def: 8,  exp: 35,  gold: 15, name: 'Orc Grunt',     sprite: 'orc1',   isBoss: false },
  ],
  desert:   [
    { type: 'lizard',   hp: 70,  atk: 22, def: 6,  exp: 40,  gold: 18, name: 'Sand Lizard',   sprite: 'lizard', isBoss: false },
    { type: 'medusa',   hp: 100, atk: 28, def: 10, exp: 55,  gold: 25, name: 'Desert Medusa',  sprite: 'medusa', isBoss: false },
    { type: 'orc2',     hp: 90,  atk: 25, def: 12, exp: 45,  gold: 20, name: 'Desert Orc',    sprite: 'orc2',   isBoss: false },
  ],
  ice:      [
    { type: 'slime3',   hp: 60,  atk: 15, def: 8,  exp: 30,  gold: 12, name: 'Frost Slime',   sprite: 'slime3', isBoss: false },
    { type: 'orc3',     hp: 100, atk: 30, def: 15, exp: 50,  gold: 22, name: 'Frost Orc',     sprite: 'orc3',   isBoss: false },
    { type: 'vamp1',    hp: 85,  atk: 26, def: 12, exp: 42,  gold: 18, name: 'Ice Vampire',   sprite: 'vamp1',  isBoss: false },
  ],
  volcanic: [
    { type: 'demon',    hp: 150, atk: 40, def: 18, exp: 80,  gold: 40, name: 'Magma Demon',   sprite: 'demon',  isBoss: false },
    { type: 'sdragon',  hp: 120, atk: 35, def: 14, exp: 65,  gold: 30, name: 'Fire Drake',    sprite: 'small_dragon', isBoss: false },
  ],
  swamp:    [
    { type: 'slime1_s', hp: 50,  atk: 10, def: 5,  exp: 20,  gold: 8,  name: 'Poison Slime',  sprite: 'slime1', isBoss: false },
    { type: 'jinn',     hp: 90,  atk: 24, def: 10, exp: 45,  gold: 20, name: 'Swamp Jinn',    sprite: 'jinn',   isBoss: false },
    { type: 'vamp2',    hp: 95,  atk: 28, def: 11, exp: 48,  gold: 22, name: 'Swamp Vampire', sprite: 'vamp2',  isBoss: false },
  ],
  mountain: [
    { type: 'orc3_m',   hp: 130, atk: 35, def: 20, exp: 70,  gold: 35, name: 'Mountain Orc',  sprite: 'orc3',   isBoss: false },
    { type: 'dragon',   hp: 200, atk: 50, def: 25, exp: 120, gold: 60, name: 'Elder Dragon',  sprite: 'dragon', isBoss: false },
    { type: 'vamp3',    hp: 160, atk: 42, def: 22, exp: 85,  gold: 45, name: 'Blood Lord',    sprite: 'vamp3',  isBoss: false },
  ],
};

const BIOME_BOSSES = {
  forest:   { type: 'boss_orc',    hp: 500,  atk: 45,  def: 20, exp: 300,  gold: 150, name: 'Warchief Grommash', sprite: 'orc1',   isBoss: true },
  desert:   { type: 'boss_medusa', hp: 600,  atk: 55,  def: 25, exp: 400,  gold: 200, name: 'Medusa Queen',      sprite: 'medusa', isBoss: true },
  ice:      { type: 'boss_frost',  hp: 700,  atk: 60,  def: 30, exp: 500,  gold: 250, name: 'Frost Titan',       sprite: 'orc3',   isBoss: true },
  volcanic: { type: 'boss_demon',  hp: 900,  atk: 75,  def: 35, exp: 700,  gold: 350, name: 'Infernal Lord',     sprite: 'demon',  isBoss: true },
  swamp:    { type: 'boss_jinn',   hp: 650,  atk: 50,  def: 22, exp: 450,  gold: 225, name: 'Jinn Overlord',     sprite: 'jinn',   isBoss: true },
  mountain: { type: 'boss_dragon', hp: 1200, atk: 90,  def: 40, exp: 1000, gold: 500, name: 'Ancient Wyrm',      sprite: 'dragon', isBoss: true },
};

// ── Class skills QWER ─────────────────────────────────────
const CLASS_SKILLS = {
  warrior: {
    Q: { name: 'Blade Throw',   manaCost: 8,  cooldown: 700,  damage: 1.4, type: 'projectile', color: 0xff4444, desc: 'Throw a spinning blade at cursor' },
    W: { name: 'Shield Charge', manaCost: 12, cooldown: 2000, damage: 0.5, type: 'dash',       color: 0xffaa44, desc: 'Charge forward with shield' },
    E: { name: 'Whirlwind',     manaCost: 22, cooldown: 3500, damage: 1.8, type: 'aoe',        color: 0xff6644, desc: 'Spinning slash around you' },
    R: { name: 'Executioner',   manaCost: 30, cooldown: 7000, damage: 3.5, type: 'strike',     color: 0xff0000, desc: 'Devastating overhead strike' },
  },
  mage: {
    Q: { name: 'Arcane Bolt',   manaCost: 10, cooldown: 600,  damage: 1.6, type: 'projectile', color: 0x00ccff, desc: 'Fire arcane bolt at cursor' },
    W: { name: 'Blink',         manaCost: 15, cooldown: 1800, damage: 0,   type: 'dash',       color: 0x9944ff, desc: 'Teleport toward cursor' },
    E: { name: 'Frost Nova',    manaCost: 25, cooldown: 4000, damage: 2.0, type: 'aoe',        color: 0x44ddff, desc: 'Freeze enemies around you' },
    R: { name: 'Meteor Strike', manaCost: 40, cooldown: 9000, damage: 4.0, type: 'strike',     color: 0xff4400, desc: 'Call a meteor at cursor' },
  },
  paladin: {
    Q: { name: 'Holy Bolt',     manaCost: 10, cooldown: 800,  damage: 1.3, type: 'projectile', color: 0xffdd44, desc: 'Holy projectile at cursor' },
    W: { name: 'Divine Leap',   manaCost: 14, cooldown: 2200, damage: 0.3, type: 'dash',       color: 0xffff88, desc: 'Leap toward cursor with light' },
    E: { name: 'Consecration',  manaCost: 28, cooldown: 4500, damage: 1.6, type: 'aoe',        color: 0xffee00, desc: 'Sanctify ground around you' },
    R: { name: 'Divine Smite',  manaCost: 35, cooldown: 8000, damage: 3.2, type: 'strike',     color: 0xffffff, desc: 'Heavenly strike at cursor' },
  },
  ninja: {
    Q: { name: 'Shuriken',      manaCost: 6,  cooldown: 500,  damage: 1.2, type: 'projectile', color: 0x88ff88, desc: 'Throw a shuriken at cursor' },
    W: { name: 'Shadow Step',   manaCost: 12, cooldown: 1500, damage: 0,   type: 'dash',       color: 0x444444, desc: 'Vanish and reappear at cursor' },
    E: { name: 'Smoke Bomb',    manaCost: 20, cooldown: 3500, damage: 1.5, type: 'aoe',        color: 0x666688, desc: 'Poison cloud around you' },
    R: { name: 'Assassination', manaCost: 30, cooldown: 7000, damage: 4.0, type: 'strike',     color: 0xcc00cc, desc: 'Lethal strike from shadows' },
  },
};
export const getClassSkills = (cls) => CLASS_SKILLS[cls] || CLASS_SKILLS.warrior;
export const SKILLS = CLASS_SKILLS.warrior;

// ── Quest templates ───────────────────────────────────────
const QUEST_TEMPLATES = {
  forest:   [
    { id: 'fq1', type: 'kill', target: 'slime1',   count: 5, name: 'Slime Infestation',   desc: 'Kill 5 Green Slimes',   reward: { gold: 30,  exp: 60 } },
    { id: 'fq2', type: 'kill', target: 'orc1',     count: 3, name: 'Orc Patrol',           desc: 'Defeat 3 Orc Grunts',   reward: { gold: 50,  exp: 100 } },
    { id: 'fq3', type: 'fetch', item: 'herb',      count: 3, name: 'Gather Forest Herbs',  desc: 'Collect 3 Forest Herbs', reward: { gold: 40,  exp: 50 } },
  ],
  desert:   [
    { id: 'dq1', type: 'kill', target: 'lizard',   count: 4, name: 'Lizard Hunt',          desc: 'Slay 4 Sand Lizards',   reward: { gold: 60,  exp: 120 } },
    { id: 'dq2', type: 'kill', target: 'medusa',   count: 2, name: 'Medusa Threat',        desc: 'Defeat 2 Medusas',      reward: { gold: 80,  exp: 160 } },
    { id: 'dq3', type: 'fetch', item: 'ore',       count: 4, name: 'Desert Ore',           desc: 'Collect 4 Desert Ores',  reward: { gold: 70,  exp: 90 } },
  ],
  ice:      [
    { id: 'iq1', type: 'kill', target: 'slime3',   count: 5, name: 'Frost Slime Menace',   desc: 'Kill 5 Frost Slimes',   reward: { gold: 50,  exp: 100 } },
    { id: 'iq2', type: 'kill', target: 'orc3',     count: 3, name: 'Frost Orc Riders',     desc: 'Defeat 3 Frost Orcs',   reward: { gold: 75,  exp: 150 } },
    { id: 'iq3', type: 'fetch', item: 'crystal',   count: 3, name: 'Ice Crystals',         desc: 'Collect 3 Ice Crystals', reward: { gold: 60,  exp: 80 } },
  ],
  volcanic: [
    { id: 'vq1', type: 'kill', target: 'demon',    count: 3, name: 'Demon Incursion',      desc: 'Slay 3 Magma Demons',   reward: { gold: 120, exp: 250 } },
    { id: 'vq2', type: 'kill', target: 'sdragon',  count: 4, name: 'Drake Culling',        desc: 'Kill 4 Fire Drakes',    reward: { gold: 100, exp: 200 } },
    { id: 'vq3', type: 'fetch', item: 'magma',     count: 3, name: 'Magma Samples',        desc: 'Collect 3 Magma Cores',  reward: { gold: 90,  exp: 120 } },
  ],
  swamp:    [
    { id: 'sq1', type: 'kill', target: 'slime1_s', count: 5, name: 'Poison Cleanup',       desc: 'Kill 5 Poison Slimes',  reward: { gold: 40,  exp: 80 } },
    { id: 'sq2', type: 'kill', target: 'jinn',     count: 3, name: 'Jinn Banishment',      desc: 'Defeat 3 Swamp Jinns',  reward: { gold: 70,  exp: 140 } },
    { id: 'sq3', type: 'fetch', item: 'moss',      count: 4, name: 'Swamp Moss',           desc: 'Collect 4 Swamp Mosses', reward: { gold: 50,  exp: 70 } },
  ],
  mountain: [
    { id: 'mq1', type: 'kill', target: 'orc3_m',   count: 4, name: 'Mountain Guard',       desc: 'Defeat 4 Mountain Orcs', reward: { gold: 110, exp: 220 } },
    { id: 'mq2', type: 'kill', target: 'dragon',   count: 2, name: 'Dragon Slayer',        desc: 'Slay 2 Elder Dragons',   reward: { gold: 180, exp: 350 } },
    { id: 'mq3', type: 'fetch', item: 'stone',     count: 5, name: 'Rare Stones',          desc: 'Collect 5 Mtn Stones',   reward: { gold: 80,  exp: 100 } },
  ],
};
const FETCH_ITEM_COLORS = { herb: 0x44ff44, ore: 0xccaa44, crystal: 0x88ddff, magma: 0xff4400, moss: 0x668844, stone: 0x888888 };

function seededRandom(seed) { let s = seed; return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; }; }

// ═══════════════════════════════════════════════════════════
// PHASER LAUNCHER
// ═══════════════════════════════════════════════════════════
function launchPhaser(Phaser, container, playerData, dispatchRef, onPlayerUpdate) {
  const playerClass = playerData.class || 'warrior';
  const skills = getClassSkills(playerClass);

  class ARPGScene extends Phaser.Scene {
    constructor() {
      super({ key: 'ARPGScene' });
      this.knight = null;
      this.playerState = {
        hp: playerData.hp ?? playerData.maxHp ?? 100, maxHp: playerData.maxHp ?? 100,
        mana: playerData.mana ?? playerData.maxMana ?? 50, maxMana: playerData.maxMana ?? 50,
        level: playerData.level ?? 1, exp: playerData.exp ?? 0,
        expToNext: playerData.expToNext ?? 100, gold: playerData.gold ?? 0,
        attack: playerData.stats?.strength ?? 10, defense: playerData.stats?.endurance ?? 5,
        intelligence: playerData.stats?.intelligence ?? 5,
        statPoints: playerData.statPoints ?? 0, skillPoints: playerData.skillPoints ?? 0,
        bossKeys: playerData.bossKeys ?? 0, class: playerClass,
      };
      if (this.playerState.hp <= 0) this.playerState.hp = this.playerState.maxHp;
      if (this.playerState.mana <= 0) this.playerState.mana = this.playerState.maxMana;
      this.enemies = []; this.npcs = []; this.projectiles = []; this.damageTexts = [];
      this.lootDrops = []; this.chests = []; this.fetchItems = [];
      this.skillCooldowns = { Q: 0, W: 0, E: 0, R: 0 };
      this.isDashing = false; this.mouseWorldPos = { x: 0, y: 0 };
      this.dialogueActive = false; this.moveTarget = null; this.moveMarker = null;
      this.activeQuests = []; this.completedQuestIds = []; this.saveTimer = 0;
      this._loadQuestState();
    }

    _loadQuestState() {
      try {
        const raw = localStorage.getItem(SAVE_KEY); if (!raw) return;
        const d = JSON.parse(raw);
        if (d.activeQuests) this.activeQuests = d.activeQuests;
        if (d.completedQuestIds) this.completedQuestIds = d.completedQuestIds;
        if (d.playerState) Object.assign(this.playerState, d.playerState);
        if (this.playerState.hp <= 0) this.playerState.hp = this.playerState.maxHp;
      } catch (_) {}
    }

    _saveToLocalStorage() {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify({ playerState: { ...this.playerState }, activeQuests: this.activeQuests, completedQuestIds: this.completedQuestIds, timestamp: Date.now() })); } catch (_) {}
    }

    // ══════════════════════════════════════════════════
    // PRELOAD — All 10 CraftPix Packs
    // ══════════════════════════════════════════════════
    preload() {
      // ── Pack #8: craftpix-654184 (HOME) — spritesheets ──
      // ground_grass_details.png  336×288  → 16px tiles = 21 cols × 18 rows
      this.load.spritesheet('ground_tiles', `${HOME_DIR}ground_grass_details.png`, { frameWidth: 16, frameHeight: 16 });
      // walls_floor.png  144×176  → 16px tiles = 9 cols × 11 rows
      this.load.spritesheet('floor_tiles', `${HOME_DIR}walls_floor.png`, { frameWidth: 16, frameHeight: 16 });
      // exterior.png  240×800  → 16px tiles = 15 cols × 50 rows
      this.load.spritesheet('exterior_tiles', `${HOME_DIR}exterior.png`, { frameWidth: 16, frameHeight: 16 });
      // house_details.png  160×272  → 16px tiles = 10 cols × 17 rows
      this.load.spritesheet('house_tiles', `${HOME_DIR}house_details.png`, { frameWidth: 16, frameHeight: 16 });
      // Interior.png  192×400  → 16px tiles = 12 cols × 25 rows
      this.load.spritesheet('interior_tiles', `${HOME_DIR}Interior.png`, { frameWidth: 16, frameHeight: 16 });

      // Custom floor tiles (loose 32×32 PNGs in sprites/)
      for (let i = 0; i < 8; i++) this.load.image(`floor_${i}`, `${SP}floor_${i}.png`);
      this.load.image('road', `${SP}road_tile.png`);

      // ── Pack #2: craftpix-891165 (Heroes) — per class ──
      const cm = CLASS_SPRITE_MAP[playerClass] || CLASS_SPRITE_MAP.warrior;
      const heroBase = `${HERO_DIR}${cm.folder}/`;
      this.load.image('hero_portrait', `${heroBase}${cm.portrait}`);
      const loadAnim = (anim) => {
        const a = cm[anim]; if (!a) return;
        for (let i = a.start; i < a.start + a.count; i++) {
          if (a.skip && a.skip.includes(i)) continue;
          this.load.image(`hero_${anim}_${i}`, `${heroBase}${anim.charAt(0).toUpperCase() + anim.slice(1)}/${a.prefix}${i}.png`);
        }
      };
      ['idle','walk','run','attack','hurt','death'].forEach(a => loadAnim(a));
      if (cm.fire) {
        for (let i = cm.fire.start; i < cm.fire.start + cm.fire.count; i++)
          this.load.image(`hero_fire_${i}`, `${heroBase}Fire/${cm.fire.prefix}${i}.png`);
      }

      // ── Pack #5: craftpix-363992 (Orcs) — 64×64 spritesheets ──
      ['orc1','orc2','orc3'].forEach(id => {
        const cap = id.charAt(0).toUpperCase() + id.slice(1);
        const dir = `${ORC_DIR}${cap}/With_shadow/`;
        ['idle','walk','attack','hurt','death'].forEach(a =>
          this.load.spritesheet(`${id}_${a}`, `${dir}${id}_${a}_with_shadow.png`, { frameWidth: 64, frameHeight: 64 }));
      });

      // ── Pack #9: craftpix-788364 (Slimes) — 32×32 spritesheets ──
      ['Slime1','Slime2','Slime3'].forEach(id => {
        const dir = `${SLIME_DIR}${id}/With_shadow/`; const lc = id.toLowerCase();
        ['Idle','Walk','Attack','Hurt','Death'].forEach(a =>
          this.load.spritesheet(`${lc}_${a.toLowerCase()}`, `${dir}${id}_${a}_with_shadow.png`, { frameWidth: 32, frameHeight: 32 }));
      });

      // ── Pack #1: craftpix-561178 (Monsters) — individual frames ──
      ['demon','dragon','jinn_animation','lizard','medusa','small_dragon'].forEach(id => {
        const dir = `${MONSTER_DIR}${id}/`; const key = id === 'jinn_animation' ? 'jinn' : id;
        ['Idle1','Idle2','Idle3','Walk1','Walk2','Attack1','Attack2','Hurt1','Death1'].forEach(f =>
          this.load.image(`${key}_${f.toLowerCase()}`, `${dir}${f}.png`));
      });

      // ── Pack #3: craftpix-208004 (Vampires) — 64×64 spritesheets ──
      ['Vampires1','Vampires2','Vampires3'].forEach((id, idx) => {
        const dir = `${VAMP_DIR}${id}/With_shadow/`;
        const lc = `vamp${idx + 1}`;
        ['Idle','Walk','Attack','Hurt','Death','Run'].forEach(a =>
          this.load.spritesheet(`${lc}_${a.toLowerCase()}`, `${dir}${id}_${a}_with_shadow.png`, { frameWidth: 64, frameHeight: 64 }));
      });

      // ── Pack #6: craftpix-385863 (Trees) — individual sprites ──
      const allTrees = new Set(); BIOMES.forEach(b => b.treePalette.forEach(t => allTrees.add(t)));
      allTrees.forEach(t => this.load.image(`tree_${t}`, `${TREES_DIR}${t}.png`));

      // ── Pack #10: craftpix-974061 (Rocks) — individual sprites ──
      for (let i = 1; i <= 8; i++) this.load.image(`rock_${i}`, `${ROCKS_DIR}Rock${i}_1.png`);

      // ── Pack #4: craftpix-255216 (UI) — icon spritesheet ──
      this.load.spritesheet('ui_icons', `${UI_DIR}Icons.png`, { frameWidth: 16, frameHeight: 16 });

      // ── Pack #7: craftpix-555940 (Male Char) — fallback ──
      this.load.spritesheet('male_idle', `${CHAR_DIR}Sword/With_shadow/Sword_Idle_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });

      // Props (loose sprites)
      this.load.image('chest_sprite',    `${SP}chest.png`);
      this.load.image('fountain_sprite', `${SP}fountain.png`);
      this.load.image('npc_sprite',      `${SP}npc_merchant.png`);
      this.load.image('shop_sprite',     `${SP}shop.png`);
      for (let i = 0; i < 5; i++) this.load.image(`torch_${i}`, `${SP}torch_${i}.png`);
      this.load.image('dark_particle', `${SP}dark_particle.png`);

      // Animated environment from HOME pack
      this.load.spritesheet('bird_fly', `${HOME_DIR}bird_fly_animation.png`, { frameWidth: 32, frameHeight: 32 });
      this.load.spritesheet('smoke_anim', `${HOME_DIR}Smoke_animation.png`, { frameWidth: 32, frameHeight: 32 });
    }

    // ══════════════════════════════════════════════════
    // CREATE
    // ══════════════════════════════════════════════════
    create() {
      const rng = seededRandom(42);
      this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
      this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

      // Nuclear fallback — ensure NEVER black
      this.add.rectangle(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 0x2d4a1e).setDepth(-2);

      this.renderGround(rng);
      this.renderBiomeDecorations(rng);
      this.renderCities(rng);
      this.spawnAllEnemies(rng);
      this.spawnNPCs();
      this.spawnChests(rng);
      this.spawnFetchItems(rng);
      this.createPlayer();
      this.cameras.main.startFollow(this.knight, true, 0.08, 0.08);
      this.purgeSpawnZone();
      this.setupInput();
      this.createAtmosphere();

      this.minimapCam = this.cameras.add(this.scale.width - 180, 10, 170, 170)
        .setZoom(0.034).setName('minimap');
      this.minimapCam.setBounds(0, 0, WORLD_W, WORLD_H);
      this.minimapCam.startFollow(this.knight);
      this.minimapCam.setBackgroundColor(0x111111);
      this.input.on('pointermove', (p) => { this.mouseWorldPos = this.cameras.main.getWorldPoint(p.x, p.y); });
      this.moveMarker = this.add.graphics().setDepth(99998);
    }

    // ══════════════════════════════════════════════════
    // GROUND — noise-based organic biomes with blending
    // ══════════════════════════════════════════════════
    renderGround(rng) {
      const hasGroundSheet = this.textures.exists('ground_tiles');
      const hasFloorSheet = this.textures.exists('floor_tiles');
      const groundTotal = hasGroundSheet ? this.textures.get('ground_tiles').frameTotal - 1 : 0;

      const BIOME_GROUND_FRAMES = {
        forest:   [0, 1, 2, 21, 22],
        desert:   [42, 43, 63, 64],
        ice:      [84, 85, 105, 106],
        volcanic: [126, 127, 147, 148],
        swamp:    [168, 169, 189, 190],
        mountain: [252, 253, 273, 274],
      };
      const BIOME_LEAF_FRAMES = {
        forest: [3, 4, 5, 24, 25], swamp: [3, 4, 5, 24, 25],
        desert: [44, 65], ice: [86, 107], volcanic: [128, 149], mountain: [254, 275],
      };

      // 1) Noise-sampled biome ground — organic & blended
      const step = TILE_SCALED * 2; // 96px
      const cols = Math.ceil(WORLD_W / step), rows = Math.ceil(WORLD_H / step);
      const g = this.add.graphics().setDepth(-1);

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const wx = col * step + step / 2, wy = row * step + step / 2;
          const { primary, secondary, blend } = getBiomeAt(wx, wy);

          // Darken the ground tint slightly for the base
          const gt = primary.groundTint;
          const cr = ((gt >> 16) & 0xff), cg = ((gt >> 8) & 0xff), cb = (gt & 0xff);
          g.fillStyle(((Math.floor(cr * 0.7)) << 16) | ((Math.floor(cg * 0.7)) << 8) | Math.floor(cb * 0.7), 1);
          g.fillRect(col * step, row * step, step, step);

          // Blend zone: overlay secondary biome color
          if (blend > 0.05) {
            const st = secondary.groundTint;
            const sr = ((st >> 16) & 0xff), sg = ((st >> 8) & 0xff), sb = (st & 0xff);
            g.fillStyle(((Math.floor(sr * 0.7)) << 16) | ((Math.floor(sg * 0.7)) << 8) | Math.floor(sb * 0.7), blend * 0.6);
            g.fillRect(col * step, row * step, step, step);
          }

          // Noise-based shade variation for texture
          const shade = fbm(wx / 400, wy / 400, 2);
          if (shade > 0.1) {
            g.fillStyle(0xffffff, shade * 0.05);
            g.fillRect(col * step, row * step, step, step);
          } else if (shade < -0.1) {
            g.fillStyle(0x000000, Math.abs(shade) * 0.07);
            g.fillRect(col * step, row * step, step, step);
          }
        }
      }

      // 2) Scattered ground detail tiles (~500 total)
      if (hasGroundSheet && groundTotal > 0) {
        const detailStep = TILE_SCALED * 3;
        for (let tx = 0; tx < WORLD_W; tx += detailStep) {
          for (let ty = 0; ty < WORLD_H; ty += detailStep) {
            const seed = tx * 7 + ty * 13;
            if (seededRandom(seed)() > 0.3) continue;
            const { primary: biome } = getBiomeAt(tx, ty);
            const frames = BIOME_GROUND_FRAMES[biome.id] || BIOME_GROUND_FRAMES.forest;
            const fr = frames[Math.floor(seededRandom(tx * 17 + ty * 31)() * frames.length)];
            if (fr < groundTotal) {
              this.add.image(tx + TILE_SCALED, ty + TILE_SCALED, 'ground_tiles', fr)
                .setScale(TILE_SCALE * (2 + seededRandom(tx * 3 + ty)() * 1.5))
                .setDepth(0).setTint(biome.groundTint).setAlpha(0.3 + seededRandom(tx + ty * 3)() * 0.3);
            }
          }
        }
      }

      // 3) Terrain details: grass tufts, bushes, fallen logs
      if (hasGroundSheet && groundTotal > 5) {
        for (let i = 0; i < 500; i++) {
          const x = rng() * WORLD_W, y = rng() * WORLD_H;
          if (isInSafeZone(x, y)) continue;
          const { primary: biome } = getBiomeAt(x, y);
          const leafFrames = BIOME_LEAF_FRAMES[biome.id] || BIOME_LEAF_FRAMES.forest;
          const fr = leafFrames[Math.floor(rng() * leafFrames.length)];
          if (fr < groundTotal) {
            this.add.image(x, y, 'ground_tiles', fr)
              .setScale(TILE_SCALE * (1.2 + rng() * 1.0)).setDepth(0.05)
              .setAlpha(0.25 + rng() * 0.3).setTint(biome.groundTint).setAngle(rng() * 360);
          }
        }
      }

      // 4) Safe zone indicator rings
      for (const c of CITIES) {
        const ring = this.add.graphics().setDepth(0.3);
        ring.lineStyle(3, 0x44ff44, 0.15); ring.strokeCircle(c.x, c.y, SAFE_ZONE_RADIUS);
        ring.lineStyle(1, 0x44ff44, 0.08); ring.strokeCircle(c.x, c.y, SAFE_ZONE_RADIUS - 20);
      }

      this.renderRoads();
    }

    renderRoads() {
      const gfx = this.add.graphics().setDepth(0.5);
      gfx.lineStyle(TILE_SCALED * 0.6, 0x8a7755, 0.5);
      for (let i = 0; i < CITIES.length; i++) {
        for (let j = i + 1; j < CITIES.length; j++) {
          const dx = CITIES[j].x - CITIES[i].x, dy = CITIES[j].y - CITIES[i].y;
          if (Math.sqrt(dx * dx + dy * dy) < 2800) {
            gfx.lineBetween(CITIES[i].x, CITIES[i].y, CITIES[j].x, CITIES[j].y);
            if (this.textures.exists('road')) {
              const roadStep = TILE_SCALED * 2;
              const steps = Math.floor(Math.sqrt(dx * dx + dy * dy) / roadStep);
              for (let s = 0; s <= steps; s++) {
                const t = s / Math.max(steps, 1);
                this.add.image(CITIES[i].x + dx * t, CITIES[i].y + dy * t, 'road')
                  .setScale(TILE_SCALE).setDepth(0.6).setAlpha(0.35);
              }
            }
          }
        }
      }
    }

    // ══════════════════════════════════════════════════
    // DECORATIONS — trees (pack #6), rocks (pack #10)
    // ══════════════════════════════════════════════════
    renderBiomeDecorations(rng) {
      for (const b of BIOMES) {
        // Trees from craftpix-385863
        for (let i = 0, n = 40 + Math.floor(rng() * 20); i < n; i++) {
          const pt = randomBiomePoint(b, rng, 80);
          const tx = pt.x, ty = pt.y;
          if (isInSafeZone(tx, ty)) continue;
          const tn = b.treePalette[Math.floor(rng() * b.treePalette.length)];
          if (this.textures.exists(`tree_${tn}`))
            this.add.image(tx, ty, `tree_${tn}`).setScale(SPRITE_SCALE * (0.8 + rng() * 0.4)).setDepth(ty + 40).setAlpha(0.9 + rng() * 0.1);
        }
        // Rocks from craftpix-974061
        for (let i = 0, n = 15 + Math.floor(rng() * 10); i < n; i++) {
          const pt = randomBiomePoint(b, rng, 60);
          const rx = pt.x, ry = pt.y;
          if (isInSafeZone(rx, ry)) continue;
          const rk = `rock_${1 + Math.floor(rng() * 8)}`;
          if (this.textures.exists(rk))
            this.add.image(rx, ry, rk).setScale(SPRITE_SCALE * (0.6 + rng() * 0.5)).setDepth(ry + 10);
        }
      }
    }

    // ══════════════════════════════════════════════════
    // CITIES — buildings from exterior_tiles & house_tiles spritesheets (pack #8)
    // ══════════════════════════════════════════════════
    renderCities(rng) {
      CITIES.forEach(city => {
        const biome = BIOMES.find(b => b.id === city.biome);
        // Ground platform (cobblestone from floor_tiles)
        const cg = this.add.graphics().setDepth(0.8);
        cg.fillStyle(0x554433, 0.6); cg.fillRoundedRect(city.x - 200, city.y - 180, 400, 360, 24);
        cg.fillStyle(0x665544, 0.35); cg.fillRoundedRect(city.x - 180, city.y - 160, 360, 320, 18);

        // Lay floor_tiles on the city ground
        if (this.textures.exists('floor_tiles')) {
          const totalFrames = this.textures.get('floor_tiles').frameTotal - 1;
          const cityStep = TILE_SCALED * 2;
          for (let fx = city.x - 180; fx < city.x + 180; fx += cityStep) {
            for (let fy = city.y - 160; fy < city.y + 160; fy += cityStep) {
              const fr = Math.min(Math.floor(rng() * 4), totalFrames - 1);
              this.add.image(fx + cityStep/2, fy + cityStep/2, 'floor_tiles', fr)
                .setScale(TILE_SCALE * 2).setDepth(0.85).setAlpha(0.55);
            }
          }
        }

        // ── Compose buildings from exterior_tiles spritesheet ──
        const hasExterior = this.textures.exists('exterior_tiles');
        const hasHouse = this.textures.exists('house_tiles');
        const hasInterior = this.textures.exists('interior_tiles');
        const extTotal = hasExterior ? this.textures.get('exterior_tiles').frameTotal - 1 : 0;
        const houseTotal = hasHouse ? this.textures.get('house_tiles').frameTotal - 1 : 0;

        // Building positions around city center
        const buildingPositions = [
          { x: city.x - 120, y: city.y - 80 },
          { x: city.x + 100, y: city.y - 60 },
          { x: city.x - 80,  y: city.y + 80 },
          { x: city.x + 120, y: city.y + 60 },
          { x: city.x,       y: city.y - 120 },
          { x: city.x - 140, y: city.y + 20 },
        ];
        const count = 4 + Math.floor(rng() * 3);
        for (let i = 0; i < Math.min(count, buildingPositions.length); i++) {
          const bp = buildingPositions[i];
          if (hasExterior && extTotal > 10) {
            // Compose a 3×4 tile building from exterior spritesheet
            // Exterior tiles: rows of building parts (walls, roofs, windows, doors)
            const wallBase = Math.floor(rng() * 4) * 15; // Different building "rows"
            for (let tx = 0; tx < 3; tx++) {
              for (let ty = 0; ty < 4; ty++) {
                const frameIdx = Math.min(wallBase + ty * 15 + tx, extTotal - 1);
                this.add.image(
                  bp.x + (tx - 1) * TILE_SCALED,
                  bp.y + (ty - 2) * TILE_SCALED,
                  'exterior_tiles', frameIdx
                ).setScale(TILE_SCALE).setDepth(bp.y + 100);
              }
            }
          } else if (hasHouse && houseTotal > 5) {
            // Compose from house_tiles: 2×3 tile building
            for (let tx = 0; tx < 2; tx++) {
              for (let ty = 0; ty < 3; ty++) {
                const frameIdx = Math.min(ty * 10 + tx + Math.floor(rng() * 3), houseTotal - 1);
                this.add.image(
                  bp.x + (tx - 0.5) * TILE_SCALED,
                  bp.y + (ty - 1) * TILE_SCALED,
                  'house_tiles', frameIdx
                ).setScale(TILE_SCALE).setDepth(bp.y + 100);
              }
            }
          } else {
            // Fallback: drawn building
            const fg = this.add.graphics().setDepth(bp.y + 100);
            const bw = 60 + rng() * 40, bh = 50 + rng() * 30;
            fg.fillStyle(0x000000, 0.3); fg.fillRect(bp.x-bw/2+4, bp.y-bh/2+4, bw, bh);
            const wc = biome.id === 'ice' ? 0x8899aa : biome.id === 'volcanic' ? 0x553322 : biome.id === 'desert' ? 0xaa9966 : 0x665544;
            fg.fillStyle(wc); fg.fillRect(bp.x-bw/2, bp.y-bh/2, bw, bh);
            const rc = biome.id === 'volcanic' ? 0x881100 : biome.id === 'ice' ? 0x4466aa : 0x884422;
            fg.fillStyle(rc); fg.fillTriangle(bp.x-bw/2-8, bp.y-bh/2, bp.x, bp.y-bh/2-28, bp.x+bw/2+8, bp.y-bh/2);
          }
        }

        // Shop building (uses shop.png from loose sprites)
        if (this.textures.exists('shop_sprite'))
          this.add.image(city.x + 60, city.y - 30, 'shop_sprite').setScale(SPRITE_SCALE * 0.8).setDepth(city.y);

        // Interior props using interior_tiles (pack #8)
        if (hasInterior) {
          const intTotal = this.textures.get('interior_tiles').frameTotal - 1;
          [0, 12, 24, 48, 96].forEach((fr, idx) => {
            const safeFr = Math.min(fr, intTotal - 1);
            const angle = (idx / 5) * Math.PI * 2;
            this.add.image(
              city.x + Math.cos(angle) * 50,
              city.y + Math.sin(angle) * 40 - 20,
              'interior_tiles', safeFr
            ).setScale(TILE_SCALE * 0.8).setDepth(city.y + 50);
          });
        }

        // City label
        this.add.text(city.x, city.y - 200, city.name, {
          fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#ffd700',
          stroke: '#000000', strokeThickness: 4, align: 'center'
        }).setOrigin(0.5).setDepth(9999);
        this.add.text(city.x, city.y - 182, city.subtitle, {
          fontFamily: 'Crimson Text, serif', fontSize: '11px', color: '#aaa',
          stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(9999);

        // Torches (loose sprites)
        for (let t = 0; t < 4; t++) {
          const ta = (t / 4) * Math.PI * 2;
          const tk = `torch_${Math.floor(rng() * 5)}`;
          if (this.textures.exists(tk))
            this.add.image(city.x + Math.cos(ta) * 160, city.y + Math.sin(ta) * 140, tk)
              .setScale(SPRITE_SCALE).setDepth(city.y + Math.sin(ta) * 140 + 20);
        }

        // Fountain
        if (this.textures.exists('fountain_sprite'))
          this.add.image(city.x, city.y - 30, 'fountain_sprite').setScale(SPRITE_SCALE).setDepth(city.y - 10);

        // Animated smoke from chimney (pack #8)
        if (this.textures.exists('smoke_anim')) {
          try {
            if (!this.anims.exists('smoke_puff')) {
              const fc = this.textures.get('smoke_anim').frameTotal - 1;
              if (fc > 1) this.anims.create({ key: 'smoke_puff', frames: this.anims.generateFrameNumbers('smoke_anim', { start: 0, end: fc - 1 }), frameRate: 6, repeat: -1 });
            }
            const sm = this.add.sprite(city.x - 100, city.y - 120, 'smoke_anim').setScale(1.5).setDepth(9998).setAlpha(0.5);
            if (this.anims.exists('smoke_puff')) sm.play('smoke_puff');
          } catch (_) {}
        }
      });
    }

    // ══════════════════════════════════════════════════
    // ENEMIES — 5 packs: orcs (#5), slimes (#9), monsters (#1), vampires (#3)
    // ══════════════════════════════════════════════════
    spawnAllEnemies(rng) {
      for (const b of BIOMES) {
        const templates = BIOME_ENEMIES[b.id] || [];
        for (let i = 0, n = 15 + Math.floor(rng() * 6); i < n; i++) {
          const t = templates[Math.floor(rng() * templates.length)]; if (!t) continue;
          const pt = randomBiomePoint(b, rng, 100);
          if (isInSafeZone(pt.x, pt.y)) continue;
          this.spawnEnemy(pt.x, pt.y, t, b.id);
        }
        const boss = BIOME_BOSSES[b.id];
        if (boss) {
          const bpt = randomBiomePoint(b, rng, 200);
          if (!isInSafeZone(bpt.x, bpt.y)) this.spawnEnemy(bpt.x, bpt.y, boss, b.id);
        }
      }
    }

    spawnEnemy(x, y, template, biomeId) {
      // Safe zone double-check
      if (isInSafeZone(x, y)) return;
      const dist = CITIES.reduce((min, c) => Math.min(min, Math.hypot(c.x - x, c.y - y)), Infinity);
      if (dist < 1000) return;

      const sk = template.sprite;
      const isTopDown = sk.startsWith('orc') || sk.startsWith('slime');
      const isVamp = sk.startsWith('vamp');
      let enemy;
      if (isTopDown && this.textures.exists(`${sk}_idle`)) {
        enemy = this.add.sprite(x, y, `${sk}_idle`, 0).setScale(SPRITE_SCALE);
      } else if (isVamp && this.textures.exists(`${sk}_idle`)) {
        enemy = this.add.sprite(x, y, `${sk}_idle`, 0).setScale(SPRITE_SCALE);
      } else if (this.textures.exists(`${sk}_idle1`)) {
        enemy = this.add.sprite(x, y, `${sk}_idle1`).setScale(SPRITE_SCALE * 0.7);
      } else {
        enemy = this.add.rectangle(x, y, 28, 28, template.isBoss ? 0xff0000 : 0xff6600);
      }
      this.physics.add.existing(enemy); enemy.body.setCollideWorldBounds(true);
      enemy.enemyData = {
        ...template, currentHp: template.hp, maxHp: template.hp, biome: biomeId,
        originX: x, originY: y, state: 'wander', wanderTarget: null, wanderTimer: 0,
        attackCooldown: 0, aggroRadius: template.isBoss ? 300 : MOB_AGGRO_RANGE,
        attackRange: template.isBoss ? 80 : 50, hitFlashTimer: 0, isDead: false,
        animTimer: 0, animFrame: 0,
      };
      enemy.hpBg = this.add.graphics().setDepth(9990);
      enemy.hpFg = this.add.graphics().setDepth(9991);
      enemy.nameLabel = this.add.text(x, y - 35, template.name, {
        fontSize: template.isBoss ? '11px' : '9px', fontFamily: 'Cinzel, serif',
        color: template.isBoss ? '#ff4444' : '#ff8866', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(9992);
      if (template.isBoss) { enemy.setTint(0xff4444); enemy.bossGlow = this.add.graphics().setDepth(enemy.depth - 1); }
      enemy.setDepth(y); this.enemies.push(enemy);
    }

    // ── NPCs ─────────────────────────────────────────
    spawnNPCs() {
      CITY_NPCS.forEach(nd => {
        const npc = this.add.image(nd.x, nd.y, 'npc_sprite').setScale(SPRITE_SCALE).setDepth(nd.y).setInteractive();
        npc.npcData = nd;
        const lc = nd.role === 'blacksmith' ? '#ffaa44' : nd.role === 'healer' ? '#44ff88' : '#ffdd00';
        npc.labelText = this.add.text(nd.x, nd.y - 30, `${nd.icon} ${nd.label}`, { fontSize: '10px', fontFamily: 'Cinzel, serif', color: lc, stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(9999);
        npc.indicator = this.add.text(nd.x, nd.y - 44, '[F] Talk', { fontSize: '8px', fontFamily: 'Cinzel, serif', color: '#ffdd00', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(9999).setAlpha(0);
        if (nd.role === 'questgiver') {
          npc.questMark = this.add.text(nd.x, nd.y - 55, '!', { fontSize: '16px', fontFamily: 'Cinzel, serif', fontStyle: 'bold', color: '#ffdd00', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(9999);
          this.tweens.add({ targets: npc.questMark, y: nd.y - 60, yoyo: true, repeat: -1, duration: 600, ease: 'Sine.easeInOut' });
        }
        this.npcs.push(npc);
      });
    }

    // ── FETCH ITEMS ──────────────────────────────────
    spawnFetchItems(rng) {
      for (const b of BIOMES) {
        const quests = QUEST_TEMPLATES[b.id]?.filter(q => q.type === 'fetch') || [];
        for (const q of quests) {
          for (let i = 0; i < q.count + 2; i++) {
            const pt = randomBiomePoint(b, rng, 100);
            if (isInSafeZone(pt.x, pt.y)) continue;
            const color = FETCH_ITEM_COLORS[q.item] || 0xffffff;
            const item = this.add.circle(pt.x, pt.y, 7, color, 0.8).setDepth(pt.y - 1).setInteractive();
            const glow = this.add.circle(pt.x, pt.y, 12, color, 0.2).setDepth(pt.y - 2);
            this.tweens.add({ targets: glow, scaleX: 1.5, scaleY: 1.5, alpha: 0, yoyo: true, repeat: -1, duration: 1000 });
            item.fetchData = { itemType: q.item, biome: b.id }; item.glowObj = glow;
            this.fetchItems.push(item);
          }
        }
      }
    }

    // ── CHESTS ───────────────────────────────────────
    spawnChests(rng) {
      for (const b of BIOMES) {
        for (let i = 0, n = 3 + Math.floor(rng() * 3); i < n; i++) {
          const pt = randomBiomePoint(b, rng, 120);
          if (isInSafeZone(pt.x, pt.y)) continue;
          this.createChest(pt.x, pt.y, 'common');
        }
        const bpt = randomBiomePoint(b, rng, 60);
        if (!isInSafeZone(bpt.x, bpt.y)) this.createChest(bpt.x, bpt.y, 'golden');
      }
    }

    createChest(x, y, type) {
      const chest = this.add.image(x, y, 'chest_sprite').setScale(SPRITE_SCALE).setDepth(y).setInteractive();
      if (type === 'golden') chest.setTint(0xffdd00);
      chest.chestData = { type, opened: false };
      chest.label = this.add.text(x, y - 24, type === 'golden' ? '🔒 Boss Chest' : 'Chest', {
        fontSize: '8px', fontFamily: 'Cinzel, serif', color: type === 'golden' ? '#ffd700' : '#aaaaaa', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(9999).setAlpha(0.7);
      this.chests.push(chest);
    }

    // ── PLAYER (pack #2: craftpix-891165 heroes) ─────
    createPlayer() {
      const start = CITIES[0];
      this.playerState.hp = this.playerState.maxHp; this.playerState.mana = this.playerState.maxMana;
      this.playerAnim = 'idle'; this.playerAnimFrame = 0; this.playerAnimTimer = 0;
      this.playerAttacking = false; this.playerAttackTimer = 0;
      const idleKeys = getHeroFrameKeys(playerClass, 'idle');
      const firstKey = idleKeys.length > 0 && this.textures.exists(idleKeys[0]) ? idleKeys[0] : null;
      if (firstKey) {
        this.knight = this.add.image(start.x, start.y, firstKey).setScale(SPRITE_SCALE);
        this.physics.add.existing(this.knight);
        if (playerClass === 'paladin') this.knight.setTint(0xffd700);
      } else if (this.textures.exists('male_idle')) {
        // Fallback to pack #7 male character
        this.knight = this.physics.add.sprite(start.x, start.y, 'male_idle', 0).setScale(SPRITE_SCALE);
      } else {
        this.knight = this.add.rectangle(start.x, start.y, 24, 32, 0x4488ff);
        this.physics.add.existing(this.knight);
      }
      this.knight.body.setCollideWorldBounds(true); this.knight.setDepth(start.y);
      this.knightLabel = this.add.text(start.x, start.y - 36, playerData.name || 'Hero', { fontSize: '11px', fontFamily: 'Cinzel, serif', color: '#66ccff', stroke: '#000', strokeThickness: 3 }).setOrigin(0.5).setDepth(99999);
      this.levelBadge = this.add.text(start.x, start.y - 48, `Lv.${this.playerState.level}`, { fontSize: '9px', fontFamily: 'Cinzel, serif', color: '#ffd700', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(99999);
    }

    purgeSpawnZone() {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        if (isInSafeZone(e.x, e.y)) {
          e.hpBg?.destroy(); e.hpFg?.destroy(); e.nameLabel?.destroy(); e.bossGlow?.destroy();
          e.destroy(); this.enemies.splice(i, 1);
        }
      }
    }

    // ── INPUT ────────────────────────────────────────
    setupInput() {
      ['Q','W','E','R','F'].forEach(k => this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes[k]));
      this.input.on('pointerdown', (ptr) => {
        if (this.dialogueActive) return;
        const wp = this.cameras.main.getWorldPoint(ptr.x, ptr.y);
        if (ptr.rightButtonDown()) { this.setMoveTarget(wp.x, wp.y); }
        else if (ptr.leftButtonDown()) {
          const clickNPC = this.npcs.find(n => Phaser.Math.Distance.Between(wp.x, wp.y, n.x, n.y) < 40);
          if (clickNPC && Phaser.Math.Distance.Between(this.knight.x, this.knight.y, clickNPC.x, clickNPC.y) < INTERACT_RADIUS) { this.openNPCDialogue(clickNPC); return; }
          const clickChest = this.chests.find(c => !c.chestData.opened && Phaser.Math.Distance.Between(wp.x, wp.y, c.x, c.y) < 40);
          if (clickChest && Phaser.Math.Distance.Between(this.knight.x, this.knight.y, clickChest.x, clickChest.y) < INTERACT_RADIUS) { this.openChest(clickChest); return; }
          this.performBasicAttack();
        }
      });
      container.addEventListener('contextmenu', (e) => e.preventDefault());
      this.input.keyboard.on('keydown-Q', () => this.useSkill('Q'));
      this.input.keyboard.on('keydown-W', () => this.useSkill('W'));
      this.input.keyboard.on('keydown-E', () => this.useSkill('E'));
      this.input.keyboard.on('keydown-R', () => this.useSkill('R'));
      this.input.keyboard.on('keydown-F', () => this.interactWithNearby());
      this.input.keyboard.on('keydown-M', () => { if (dispatchRef.current) dispatchRef.current({ type: 'TOGGLE_BIG_MAP', playerPos: { x: this.knight.x, y: this.knight.y } }); });
    }

    setMoveTarget(x, y) {
      this.moveTarget = { x: Phaser.Math.Clamp(x, 20, WORLD_W - 20), y: Phaser.Math.Clamp(y, 20, WORLD_H - 20) };
      if (this.moveMarker) {
        this.moveMarker.clear(); this.moveMarker.lineStyle(2, 0x44ff44, 0.8); this.moveMarker.strokeCircle(this.moveTarget.x, this.moveTarget.y, 12);
        this.moveMarker.fillStyle(0x44ff44, 0.3); this.moveMarker.fillCircle(this.moveTarget.x, this.moveTarget.y, 6);
        this.tweens.add({ targets: this.moveMarker, alpha: 0, duration: 800, onComplete: () => { if (this.moveMarker) { this.moveMarker.clear(); this.moveMarker.alpha = 1; } } });
      }
    }

    createAtmosphere() {
      // Animated birds from HOME pack
      if (this.textures.exists('bird_fly')) {
        try {
          const bc = this.textures.get('bird_fly').frameTotal - 1;
          if (bc > 1 && !this.anims.exists('bird_anim')) {
            this.anims.create({ key: 'bird_anim', frames: this.anims.generateFrameNumbers('bird_fly', { start: 0, end: bc - 1 }), frameRate: 8, repeat: -1 });
          }
          for (let i = 0; i < 5; i++) {
            const bx = 500 + Math.random() * (WORLD_W - 1000), by = 200 + Math.random() * (WORLD_H - 400);
            const bird = this.add.sprite(bx, by, 'bird_fly').setScale(1.5).setDepth(99990).setAlpha(0.7);
            if (this.anims.exists('bird_anim')) bird.play('bird_anim');
            this.tweens.add({ targets: bird, x: bx + 800, y: by - 200, duration: 12000 + Math.random() * 8000, repeat: -1, yoyo: true, ease: 'Sine.easeInOut' });
          }
        } catch (_) {}
      }
      // Dark particles
      if (this.textures.exists('dark_particle')) {
        this.add.particles(0, 0, 'dark_particle', {
          x: { min: 0, max: WORLD_W }, y: { min: 0, max: WORLD_H },
          lifespan: 6000, speed: { min: 5, max: 20 }, scale: { start: 0.3, end: 0 },
          alpha: { start: 0.3, end: 0 }, frequency: 200, quantity: 1
        }).setDepth(99990);
      }
    }

    // ═════════════════════════════════════════════════
    // UPDATE LOOP
    // ═════════════════════════════════════════════════
    update(time, delta) {
      if (!this.knight || this.dialogueActive) return;
      this.updatePlayerMovement(delta);
      this.updateEnemyAI(time, delta);
      this.updateProjectiles(delta);
      this.updateCooldowns(delta);
      this.updateDepthSorting();
      this.updateHPBars();
      this.updateLabels();
      this.updateNPCIndicators();
      this.updateDamageTexts(delta);
      this.updateLoot(delta);
      this.updateFetchPickup();
      this.checkPlayerDeath();
      this.syncPlayerState();
      this.saveTimer += delta;
      if (this.saveTimer > 10000) { this.saveTimer = 0; this._saveToLocalStorage(); }
    }

    setPlayerAnim(anim) {
      if (this.playerAnim !== anim) { this.playerAnim = anim; this.playerAnimFrame = 0; this.playerAnimTimer = 0; }
    }

    updatePlayerAnimation(delta) {
      if (!this.knight || !this.knight.setTexture) return;
      const rate = this.playerAnim === 'attack' ? 80 : this.playerAnim === 'idle' ? 140 : 100;
      this.playerAnimTimer += delta;
      if (this.playerAnimTimer >= rate) {
        this.playerAnimTimer = 0;
        const keys = getHeroFrameKeys(playerClass, this.playerAnim);
        if (keys.length === 0) return;
        this.playerAnimFrame = (this.playerAnimFrame + 1) % keys.length;
        const k = keys[this.playerAnimFrame];
        if (this.textures.exists(k)) this.knight.setTexture(k);
        if (this.playerAttacking && this.playerAnim === 'attack' && this.playerAnimFrame === keys.length - 1) {
          this.playerAttacking = false; this.setPlayerAnim('idle');
        }
      }
    }

    updatePlayerMovement(delta) {
      if (this.isDashing) return;
      this.updatePlayerAnimation(delta);
      if (this.moveTarget) {
        const dist = Phaser.Math.Distance.Between(this.knight.x, this.knight.y, this.moveTarget.x, this.moveTarget.y);
        if (dist < 8) {
          this.knight.body.setVelocity(0, 0); this.moveTarget = null;
          if (!this.playerAttacking) this.setPlayerAnim('idle');
        } else {
          const a = Math.atan2(this.moveTarget.y - this.knight.y, this.moveTarget.x - this.knight.x);
          this.knight.body.setVelocity(Math.cos(a) * PLAYER_SPEED, Math.sin(a) * PLAYER_SPEED);
          this.knight.setFlipX(Math.cos(a) < 0);
          if (!this.playerAttacking) this.setPlayerAnim('walk');
        }
      } else {
        this.knight.body.setVelocity(0, 0);
        if (!this.playerAttacking) this.setPlayerAnim('idle');
      }
    }

    // ── Enemy AI ─────────────────────────────────────
    updateEnemyAI(time, delta) {
      const px = this.knight.x, py = this.knight.y;
      for (const e of this.enemies) {
        if (e.enemyData.isDead) continue;
        const ed = e.enemyData, dist = Phaser.Math.Distance.Between(e.x, e.y, px, py);
        if (ed.hitFlashTimer > 0) { ed.hitFlashTimer -= delta; if (ed.hitFlashTimer <= 0) e.clearTint(); }
        if (ed.attackCooldown > 0) ed.attackCooldown -= delta;
        const isTopDown = ed.sprite.startsWith('orc') || ed.sprite.startsWith('slime');
        const isVamp = ed.sprite.startsWith('vamp');
        if (!isTopDown && !isVamp) {
          ed.animTimer = (ed.animTimer || 0) + delta;
          if (ed.animTimer > 400) { ed.animTimer = 0; ed.animFrame = ((ed.animFrame || 0) + 1) % 3; const k = `${ed.sprite}_idle${ed.animFrame + 1}`; if (this.textures.exists(k)) e.setTexture(k); }
        }
        // Push enemies out of safe zones
        if (isInSafeZone(e.x, e.y)) {
          const nc = CITIES.reduce((best, c) => { const d = Math.hypot(c.x - e.x, c.y - e.y); return d < best.d ? { c, d } : best; }, { d: Infinity }).c;
          if (nc) { const fl = Math.atan2(e.y - nc.y, e.x - nc.x); e.body.setVelocity(Math.cos(fl) * 120, Math.sin(fl) * 120); }
          continue;
        }
        switch (ed.state) {
          case 'wander': {
            ed.wanderTimer -= delta;
            if (ed.wanderTimer <= 0 || !ed.wanderTarget) { ed.wanderTarget = { x: ed.originX + (Math.random()-0.5)*200, y: ed.originY + (Math.random()-0.5)*200 }; ed.wanderTimer = 2000 + Math.random()*3000; }
            const wd = Phaser.Math.Distance.Between(e.x, e.y, ed.wanderTarget.x, ed.wanderTarget.y);
            if (wd > 10) { const a = Math.atan2(ed.wanderTarget.y-e.y, ed.wanderTarget.x-e.x); e.body.setVelocity(Math.cos(a)*30, Math.sin(a)*30); e.setFlipX(Math.cos(a)<0); } else e.body.setVelocity(0,0);
            if (dist < ed.aggroRadius) ed.state = 'chase';
            break;
          }
          case 'chase': {
            if (dist > ed.attackRange) { const a = Math.atan2(py-e.y, px-e.x); const spd = ed.isBoss ? 100 : 70; e.body.setVelocity(Math.cos(a)*spd, Math.sin(a)*spd); e.setFlipX(Math.cos(a)<0); }
            else { e.body.setVelocity(0,0); ed.state = 'attack'; }
            if (dist > ed.aggroRadius * 2.5) { ed.state = 'wander'; e.body.setVelocity(0,0); }
            break;
          }
          case 'attack': {
            e.body.setVelocity(0,0);
            if (dist > ed.attackRange * 1.5) { ed.state = 'chase'; break; }
            if (ed.attackCooldown <= 0) { this.enemyAttackPlayer(e); ed.attackCooldown = ed.isBoss ? 1200 : 1800; }
            break;
          }
        }
      }
    }

    enemyAttackPlayer(enemy) {
      const dmg = Math.max(1, enemy.enemyData.atk - Math.floor(this.playerState.defense * 0.4));
      this.playerState.hp = Math.max(0, this.playerState.hp - dmg);
      this.spawnDamageText(this.knight.x, this.knight.y - 20, dmg, '#ff4444');
      this.knight.setTint(0xff4444);
      this.time.delayedCall(200, () => { if (this.knight) this.knight.clearTint(); });
      this.syncPlayerState();
    }

    performBasicAttack() {
      if (!this.knight) return;
      this.moveTarget = null;
      this.playerAttacking = true;
      this.setPlayerAnim('attack');
      this.knight.setFlipX(this.mouseWorldPos.x < this.knight.x);
      const range = 70; let closest = null, cd = Infinity;
      for (const e of this.enemies) { if (e.enemyData.isDead) continue; const d = Phaser.Math.Distance.Between(this.knight.x, this.knight.y, e.x, e.y); if (d < range && d < cd) { closest = e; cd = d; } }
      if (closest) { const base = this.playerState.attack + this.playerState.level * 2; const crit = Math.random() < 0.15; this.damageEnemy(closest, crit ? Math.floor(base * 1.8) : base, crit); }
      const sg = this.add.graphics().setDepth(99999);
      const a = Math.atan2(this.mouseWorldPos.y - this.knight.y, this.mouseWorldPos.x - this.knight.x);
      sg.lineStyle(3, 0xffffff, 0.6); sg.beginPath(); sg.arc(this.knight.x, this.knight.y, range * 0.7, a - 0.5, a + 0.5); sg.strokePath();
      this.tweens.add({ targets: sg, alpha: 0, duration: 200, onComplete: () => sg.destroy() });
    }

    useSkill(key) {
      const skill = skills[key]; if (!skill || this.skillCooldowns[key] > 0) return;
      if (this.playerState.mana < skill.manaCost) { this.spawnDamageText(this.knight.x, this.knight.y - 40, 'No Mana!', '#4488ff'); return; }
      this.playerState.mana -= skill.manaCost; this.skillCooldowns[key] = skill.cooldown; this.moveTarget = null;
      this.knight.setFlipX(this.mouseWorldPos.x < this.knight.x);
      switch (skill.type) {
        case 'projectile': this.fireProjectile(skill); break;
        case 'dash': this.performDash(skill); break;
        case 'aoe': this.performAOE(skill); break;
        case 'strike': this.performStrike(skill); break;
      }
      this.syncPlayerState();
    }

    fireProjectile(skill) {
      const a = Math.atan2(this.mouseWorldPos.y - this.knight.y, this.mouseWorldPos.x - this.knight.x);
      const sz = playerClass === 'ninja' ? 4 : playerClass === 'mage' ? 8 : 6;
      const tw = playerClass === 'ninja' ? 1 : playerClass === 'mage' ? 3 : 2;
      const proj = this.add.circle(this.knight.x, this.knight.y, sz, skill.color).setDepth(99990);
      this.physics.add.existing(proj);
      const speed = playerClass === 'ninja' ? 500 : playerClass === 'mage' ? 350 : 400;
      proj.body.setVelocity(Math.cos(a) * speed, Math.sin(a) * speed);
      const trail = this.add.graphics().setDepth(99989);
      proj.projectileData = { damage: Math.floor((this.playerState.attack + this.playerState.intelligence) * skill.damage), lifetime: 2000, skill, trail, prevX: this.knight.x, prevY: this.knight.y, trailW: tw };
      this.projectiles.push(proj);
    }

    performDash(skill) {
      this.isDashing = true;
      const a = Math.atan2(this.mouseWorldPos.y - this.knight.y, this.mouseWorldPos.x - this.knight.x);
      const dist = Math.min(200, Phaser.Math.Distance.Between(this.knight.x, this.knight.y, this.mouseWorldPos.x, this.mouseWorldPos.y));
      const tx = Phaser.Math.Clamp(this.knight.x + Math.cos(a) * dist, 20, WORLD_W - 20);
      const ty = Phaser.Math.Clamp(this.knight.y + Math.sin(a) * dist, 20, WORLD_H - 20);
      const ox = this.knight.x, oy = this.knight.y;
      const dur = playerClass === 'ninja' ? 100 : playerClass === 'mage' ? 80 : 150;
      if (skill.damage > 0) {
        const dmg = Math.floor(this.playerState.attack * skill.damage);
        for (const e of this.enemies) {
          if (e.enemyData.isDead) continue;
          const dd = Phaser.Math.Distance.BetweenPointsSquared({ x: e.x, y: e.y }, Phaser.Geom.Line.GetNearestPoint(new Phaser.Geom.Line(ox, oy, tx, ty), { x: e.x, y: e.y }));
          if (dd < 50 * 50) this.damageEnemy(e, dmg, false);
        }
      }
      this.tweens.add({ targets: this.knight, x: tx, y: ty, duration: dur, ease: 'Quad.easeOut', onComplete: () => { this.isDashing = false; } });
    }

    performAOE(skill) {
      const radius = 120;
      const dmg = Math.floor((this.playerState.attack + this.playerState.intelligence * 0.5) * skill.damage);
      const cx = this.knight.x, cy = this.knight.y;
      const ng = this.add.graphics().setDepth(99999);
      this.tweens.add({ targets: { r: 10 }, r: radius, duration: 350,
        onUpdate: (tw) => { const r = tw.getValue(); ng.clear(); ng.lineStyle(3*(1-r/radius), skill.color, 0.8*(1-r/radius)); ng.strokeCircle(cx,cy,r); ng.fillStyle(skill.color, 0.1*(1-r/radius)); ng.fillCircle(cx,cy,r); },
        onComplete: () => ng.destroy() });
      for (const e of this.enemies) { if (e.enemyData.isDead) continue; if (Phaser.Math.Distance.Between(cx,cy,e.x,e.y) < radius) this.damageEnemy(e, dmg, false); }
    }

    performStrike(skill) {
      const dmg = Math.floor(this.playerState.attack * skill.damage);
      const a = Math.atan2(this.mouseWorldPos.y - this.knight.y, this.mouseWorldPos.x - this.knight.x);
      if (playerClass === 'mage') {
        const mx = this.mouseWorldPos.x, my = this.mouseWorldPos.y;
        const sg = this.add.graphics().setDepth(99999);
        this.tweens.add({ targets: { r: 10 }, r: 60, duration: 350, onUpdate: (tw) => { const r = tw.getValue(); sg.clear(); sg.fillStyle(0xff4400, 0.5*(1-r/60)); sg.fillCircle(mx,my,r); }, onComplete: () => sg.destroy() });
        for (const e of this.enemies) { if (e.enemyData.isDead) continue; if (Phaser.Math.Distance.Between(mx,my,e.x,e.y) < 60) this.damageEnemy(e, dmg, true); }
        this.cameras.main.shake(250, 0.008); return;
      }
      const hx = this.knight.x + Math.cos(a) * 50, hy = this.knight.y + Math.sin(a) * 50;
      const sg = this.add.graphics().setDepth(99999); sg.fillStyle(skill.color, 0.5); sg.fillCircle(hx,hy,35);
      this.tweens.add({ targets: sg, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 400, onComplete: () => sg.destroy() });
      for (const e of this.enemies) { if (e.enemyData.isDead) continue; if (Phaser.Math.Distance.Between(hx,hy,e.x,e.y) < 90) this.damageEnemy(e, dmg, true); }
      this.cameras.main.shake(200, 0.005);
    }

    damageEnemy(enemy, amount, isCrit) {
      const ed = enemy.enemyData;
      const d = Math.max(1, amount - Math.floor(ed.def * 0.3));
      ed.currentHp -= d; enemy.setTint(0xffffff); ed.hitFlashTimer = 150;
      this.spawnDamageText(enemy.x + (Math.random()-0.5)*20, enemy.y - 20, d, isCrit ? '#ffdd00' : '#ffffff');
      if (ed.currentHp <= 0) { ed.currentHp = 0; this.killEnemy(enemy); }
    }

    killEnemy(enemy) {
      const ed = enemy.enemyData; ed.isDead = true; ed.state = 'dead'; enemy.body.setVelocity(0,0);
      this.playerState.exp += ed.exp; this.playerState.gold += ed.gold;
      if (ed.isBoss) { this.playerState.bossKeys += 1; this.spawnDamageText(enemy.x, enemy.y - 40, '🔑 Boss Key!', '#ffd700'); }
      this.spawnDamageText(enemy.x, enemy.y - 30, `+${ed.exp} XP`, '#44ff44');
      this.spawnDamageText(enemy.x + 20, enemy.y - 20, `+${ed.gold}g`, '#ffdd44');
      this.updateKillQuests(ed.type); this.checkLevelUp(); this.spawnLootDrop(enemy.x, enemy.y, ed);
      this.tweens.add({ targets: enemy, alpha: 0, scaleX: 0, scaleY: 0, duration: 500,
        onComplete: () => { enemy.hpBg?.destroy(); enemy.hpFg?.destroy(); enemy.nameLabel?.destroy(); enemy.bossGlow?.destroy(); enemy.destroy(); } });
      if (!ed.isBoss) {
        this.time.delayedCall(15000 + Math.random() * 10000, () => {
          const biome = BIOMES.find(b => b.id === ed.biome); if (!biome) return;
          const templates = BIOME_ENEMIES[biome.id]; if (!templates?.length) return;
          const tmpl = templates[Math.floor(Math.random() * templates.length)];
          const pt = randomBiomePoint(biome, Math.random, 100);
          if (!isInSafeZone(pt.x, pt.y) && CITIES.every(c => Math.hypot(c.x - pt.x, c.y - pt.y) >= 1000)) {
            this.spawnEnemy(pt.x, pt.y, tmpl, biome.id);
          }
        });
      }
      this.syncPlayerState();
    }

    updateKillQuests(enemyType) {
      for (const q of this.activeQuests) {
        if (q.completed) continue;
        if (q.type === 'kill' && q.target === enemyType) {
          q.progress = Math.min((q.progress || 0) + 1, q.count);
          if (q.progress >= q.count) {
            q.completed = true; this.playerState.gold += q.reward.gold; this.playerState.exp += q.reward.exp;
            this.spawnDamageText(this.knight.x, this.knight.y - 60, `Quest Complete: ${q.name}!`, '#ffd700');
            this.completedQuestIds.push(q.id); this.checkLevelUp();
          }
        }
      }
    }
    updateFetchQuests(itemType) {
      for (const q of this.activeQuests) {
        if (q.completed) continue;
        if (q.type === 'fetch' && q.item === itemType) {
          q.progress = Math.min((q.progress || 0) + 1, q.count);
          if (q.progress >= q.count) {
            q.completed = true; this.playerState.gold += q.reward.gold; this.playerState.exp += q.reward.exp;
            this.spawnDamageText(this.knight.x, this.knight.y - 60, `Quest Complete: ${q.name}!`, '#ffd700');
            this.completedQuestIds.push(q.id); this.checkLevelUp();
          }
        }
      }
    }
    getAvailableQuests(cityId) {
      const city = CITIES.find(c => c.id === cityId); if (!city) return [];
      return (QUEST_TEMPLATES[city.biome] || []).filter(t => !this.completedQuestIds.includes(t.id) && !this.activeQuests.some(aq => aq.id === t.id));
    }
    acceptQuest(quest) { this.activeQuests.push({ ...quest, progress: 0, completed: false }); this.spawnDamageText(this.knight.x, this.knight.y - 50, `Quest Accepted: ${quest.name}`, '#ffdd44'); }

    updateFetchPickup() {
      if (!this.knight) return;
      for (let i = this.fetchItems.length - 1; i >= 0; i--) {
        const item = this.fetchItems[i];
        if (Phaser.Math.Distance.Between(this.knight.x, this.knight.y, item.x, item.y) < 30) {
          if (this.activeQuests.some(q => !q.completed && q.type === 'fetch' && q.item === item.fetchData.itemType)) {
            this.updateFetchQuests(item.fetchData.itemType);
            this.spawnDamageText(item.x, item.y - 10, `+1 ${item.fetchData.itemType}`, '#44ff44');
            item.glowObj?.destroy(); item.destroy(); this.fetchItems.splice(i, 1);
          }
        }
      }
    }

    spawnLootDrop(x, y, ed) {
      if (Math.random() >= (ed.isBoss ? 1.0 : 0.3)) return;
      const loot = this.add.circle(x + (Math.random()-0.5)*30, y + (Math.random()-0.5)*20, 8, 0x44ff44).setDepth(99000).setInteractive();
      loot.lootData = { type: ed.isBoss ? 'epic' : (Math.random() < 0.2 ? 'rare' : 'common'), lifetime: 30000 };
      this.tweens.add({ targets: loot, scaleX: 1.3, scaleY: 1.3, yoyo: true, repeat: -1, duration: 500 });
      loot.on('pointerdown', () => this.pickupLoot(loot)); this.lootDrops.push(loot);
    }
    pickupLoot(loot) {
      const g = loot.lootData.type === 'epic' ? 50 : loot.lootData.type === 'rare' ? 20 : 5;
      this.playerState.gold += g; this.spawnDamageText(loot.x, loot.y - 10, `+${g}g ${loot.lootData.type}`, loot.lootData.type === 'epic' ? '#aa44ff' : '#44ff44');
      loot.destroy(); this.lootDrops = this.lootDrops.filter(l => l !== loot); this.syncPlayerState();
    }

    checkLevelUp() {
      while (this.playerState.exp >= this.playerState.expToNext) {
        this.playerState.exp -= this.playerState.expToNext; this.playerState.level += 1;
        this.playerState.expToNext = Math.floor(this.playerState.expToNext * 1.35);
        this.playerState.attack += 3; this.playerState.defense += 2; this.playerState.intelligence += 2;
        this.playerState.maxHp += 15; this.playerState.maxMana += 8;
        this.playerState.hp = this.playerState.maxHp; this.playerState.mana = this.playerState.maxMana;
        this.playerState.statPoints += 3; this.playerState.skillPoints += 1;
        this.spawnDamageText(this.knight.x, this.knight.y - 60, `LEVEL UP! Lv.${this.playerState.level}`, '#ffd700');
      }
    }

    updateProjectiles(delta) {
      for (let i = this.projectiles.length - 1; i >= 0; i--) {
        const p = this.projectiles[i]; p.projectileData.lifetime -= delta;
        const td = p.projectileData; td.trail.clear(); td.trail.lineStyle(td.trailW||2, td.skill.color, 0.3); td.trail.lineBetween(td.prevX, td.prevY, p.x, p.y); td.prevX = p.x; td.prevY = p.y;
        if (td.lifetime <= 0) { td.trail.destroy(); p.destroy(); this.projectiles.splice(i, 1); continue; }
        for (const e of this.enemies) {
          if (e.enemyData.isDead) continue;
          if (Phaser.Math.Distance.Between(p.x, p.y, e.x, e.y) < 30) { this.damageEnemy(e, td.damage, false); td.trail.destroy(); p.destroy(); this.projectiles.splice(i, 1); break; }
        }
      }
    }

    updateCooldowns(delta) {
      for (const k of ['Q','W','E','R']) if (this.skillCooldowns[k] > 0) this.skillCooldowns[k] = Math.max(0, this.skillCooldowns[k] - delta);
      if (this.playerState.mana < this.playerState.maxMana) this.playerState.mana = Math.min(this.playerState.maxMana, this.playerState.mana + 0.01 * delta);
      if (this.playerState.hp < this.playerState.maxHp && this.playerState.hp > 0) this.playerState.hp = Math.min(this.playerState.maxHp, this.playerState.hp + 0.002 * delta);
    }

    updateDepthSorting() {
      if (this.knight) this.knight.setDepth(this.knight.y);
      for (const e of this.enemies) if (!e.enemyData.isDead) e.setDepth(e.y);
      for (const n of this.npcs) n.setDepth(n.y);
    }

    updateHPBars() {
      for (const e of this.enemies) {
        if (e.enemyData.isDead) continue;
        const ed = e.enemyData, bw = ed.isBoss ? 60 : 40, bh = 4;
        const bx = e.x - bw/2, by = e.y - 28, hp = ed.currentHp / ed.maxHp;
        e.hpBg.clear(); e.hpBg.fillStyle(0x222222, 0.8); e.hpBg.fillRect(bx-1, by-1, bw+2, bh+2);
        e.hpFg.clear(); e.hpFg.fillStyle(hp > 0.5 ? 0x44ff44 : hp > 0.25 ? 0xffaa00 : 0xff4444); e.hpFg.fillRect(bx, by, bw * hp, bh);
      }
    }

    updateLabels() {
      if (this.knight && this.knightLabel) this.knightLabel.setPosition(this.knight.x, this.knight.y - 36);
      if (this.knight && this.levelBadge) { this.levelBadge.setPosition(this.knight.x, this.knight.y - 48); this.levelBadge.setText(`Lv.${this.playerState.level}`); }
      for (const e of this.enemies) if (!e.enemyData.isDead && e.nameLabel) e.nameLabel.setPosition(e.x, e.y - 35);
    }

    updateNPCIndicators() {
      if (!this.knight) return;
      for (const n of this.npcs) {
        const d = Phaser.Math.Distance.Between(this.knight.x, this.knight.y, n.x, n.y);
        n.indicator.setPosition(n.x, n.y - 44).setAlpha(d < INTERACT_RADIUS ? 1 : 0);
      }
    }

    interactWithNearby() {
      if (!this.knight) return;
      for (const n of this.npcs) { if (Phaser.Math.Distance.Between(this.knight.x, this.knight.y, n.x, n.y) < INTERACT_RADIUS) { this.openNPCDialogue(n); return; } }
      for (const c of this.chests) { if (c.chestData.opened) continue; if (Phaser.Math.Distance.Between(this.knight.x, this.knight.y, c.x, c.y) < INTERACT_RADIUS) { this.openChest(c); return; } }
    }

    openNPCDialogue(npc) {
      this.dialogueActive = true; this.moveTarget = null; this.knight.body.setVelocity(0,0);
      if (dispatchRef.current) dispatchRef.current({ type: 'OPEN_NPC_DIALOGUE', npcId: npc.npcData.id, npcRole: npc.npcData.role, npcLabel: npc.npcData.label, cityId: npc.npcData.cityId, playerState: { ...this.playerState } });
    }

    openChest(chest) {
      const cd = chest.chestData;
      if (cd.type === 'golden' && this.playerState.bossKeys < 1) { this.spawnDamageText(chest.x, chest.y - 20, 'Need Boss Key!', '#ff4444'); return; }
      cd.opened = true; if (cd.type === 'golden') this.playerState.bossKeys -= 1;
      const gr = cd.type === 'golden' ? 100 + Math.floor(Math.random()*200) : 10 + Math.floor(Math.random()*30);
      const er = cd.type === 'golden' ? 50 + Math.floor(Math.random()*100) : 5 + Math.floor(Math.random()*15);
      this.playerState.gold += gr; this.playerState.exp += er;
      this.spawnDamageText(chest.x, chest.y - 20, `+${gr}g`, '#ffd700');
      this.spawnDamageText(chest.x, chest.y - 35, `+${er} XP`, '#44ff44');
      this.checkLevelUp(); this.syncPlayerState(); chest.setAlpha(0.3); chest.label.setText('(Empty)');
    }

    spawnDamageText(x, y, text, color) {
      const dt = this.add.text(x, y, String(text), { fontSize: typeof text === 'number' ? '14px' : '11px', fontFamily: 'Cinzel, serif', color, stroke: '#000000', strokeThickness: 3, fontStyle: 'bold' }).setOrigin(0.5).setDepth(999999);
      dt.dmgData = { lifetime: 1200 }; this.damageTexts.push(dt);
      this.tweens.add({ targets: dt, y: y - 40, alpha: 0, duration: 1200, ease: 'Quad.easeOut', onComplete: () => dt.destroy() });
    }
    updateDamageTexts(delta) { for (let i = this.damageTexts.length - 1; i >= 0; i--) { this.damageTexts[i].dmgData.lifetime -= delta; if (this.damageTexts[i].dmgData.lifetime <= 0) this.damageTexts.splice(i, 1); } }
    updateLoot(delta) {
      for (let i = this.lootDrops.length - 1; i >= 0; i--) {
        const l = this.lootDrops[i]; l.lootData.lifetime -= delta;
        if (this.knight && Phaser.Math.Distance.Between(this.knight.x, this.knight.y, l.x, l.y) < 30) { this.pickupLoot(l); continue; }
        if (l.lootData.lifetime <= 0) { l.destroy(); this.lootDrops.splice(i, 1); }
      }
    }
    checkPlayerDeath() { if (this.playerState.hp <= 0 && dispatchRef.current) dispatchRef.current({ type: 'PLAYER_DIED', playerState: { ...this.playerState } }); }

    syncPlayerState() {
      if (onPlayerUpdate) onPlayerUpdate({
        ...this.playerState, skillCooldowns: { ...this.skillCooldowns },
        activeQuests: this.activeQuests.filter(q => !q.completed),
        completedQuestCount: this.completedQuestIds.length,
      });
    }

    closeDialogue() { this.dialogueActive = false; }
    healPlayer(amt) { this.playerState.hp = Math.min(this.playerState.maxHp, this.playerState.hp + amt); this.spawnDamageText(this.knight.x, this.knight.y - 40, `+${amt} HP`, '#44ff88'); this.syncPlayerState(); }
    restoreMana(amt) { this.playerState.mana = Math.min(this.playerState.maxMana, this.playerState.mana + amt); this.spawnDamageText(this.knight.x, this.knight.y - 40, `+${amt} MP`, '#4488ff'); this.syncPlayerState(); }
  }

  return new Phaser.Game({
    type: Phaser.AUTO, parent: container,
    width: container.clientWidth || 960, height: container.clientHeight || 640,
    pixelArt: true, backgroundColor: '#1a2e12',
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [ARPGScene],
    scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
    input: { mouse: { preventDefaultWheel: false, preventDefaultDown: false } },
  });
}

// ═══════════════════════════════════════════════════════════
// REACT WRAPPER
// ═══════════════════════════════════════════════════════════
export { BIOMES, CITIES, CITY_NPCS, BIOME_BOSSES, WORLD_W, WORLD_H, CLASS_SPRITE_MAP, CLASS_WEAPONS, getPortraitPath, getBiomeAt, getBiomeBounds };

export default function GameMap({ dispatch, player }) {
  const containerRef = useRef(null);
  const phaserRef = useRef(null);
  const sceneRef = useRef(null);
  const dispatchRef = useRef(dispatch);
  const [playerState, setPlayerState] = useState(null);
  const [dialogueData, setDialogueData] = useState(null);
  const [questPanel, setQuestPanel] = useState(null);
  dispatchRef.current = dispatch;

  const gameDispatchRef = useRef((action) => {
    if (action.type === 'OPEN_NPC_DIALOGUE') {
      if (action.npcRole === 'questgiver') {
        const scene = sceneRef.current;
        if (scene) { setQuestPanel({ available: scene.getAvailableQuests(action.cityId), active: scene.activeQuests.filter(q => !q.completed), cityId: action.cityId }); scene.dialogueActive = true; }
      } else { setDialogueData(action); }
    } else if (action.type === 'PLAYER_DIED') { dispatch({ type: 'GOTO_SCREEN', screen: 'game_over' });
    } else { dispatch(action); }
  });

  useEffect(() => {
    if (!containerRef.current || phaserRef.current) return;
    import('phaser').then((PM) => {
      const Phaser = PM.default || PM;
      if (!containerRef.current || phaserRef.current) return;
      const game = launchPhaser(Phaser, containerRef.current, player, gameDispatchRef, (s) => setPlayerState(s));
      phaserRef.current = game;
      game.events.on('ready', () => { sceneRef.current = game.scene.getScene('ARPGScene'); });
    });
    return () => { if (phaserRef.current) { phaserRef.current.destroy(true); phaserRef.current = null; } };
  }, []);

  const handleCloseDialogue = () => { setDialogueData(null); sceneRef.current?.closeDialogue(); };
  const handleCloseQuestPanel = () => { setQuestPanel(null); sceneRef.current?.closeDialogue(); };
  const handleAcceptQuest = (quest) => {
    sceneRef.current?.acceptQuest(quest);
    const scene = sceneRef.current;
    if (scene && questPanel) setQuestPanel({ ...questPanel, available: scene.getAvailableQuests(questPanel.cityId), active: scene.activeQuests.filter(q => !q.completed) });
  };
  const handleHeal = () => {
    if (sceneRef.current && playerState && playerState.gold >= 20) { sceneRef.current.playerState.gold -= 20; sceneRef.current.healPlayer(sceneRef.current.playerState.maxHp); sceneRef.current.restoreMana(sceneRef.current.playerState.maxMana); sceneRef.current.syncPlayerState(); }
    handleCloseDialogue();
  };

  const pClass = player?.class || 'warrior';
  const classSkills = getClassSkills(pClass);
  const portraitSrc = getPortraitPath(pClass);
  const weaponLabel = CLASS_WEAPONS[pClass] || CLASS_WEAPONS.warrior;
  const ps = playerState || {
    hp: player?.hp ?? 100, maxHp: player?.maxHp ?? 100, mana: player?.mana ?? 50, maxMana: player?.maxMana ?? 50,
    level: player?.level ?? 1, exp: player?.exp ?? 0, expToNext: player?.expToNext ?? 100, gold: player?.gold ?? 0,
    skillCooldowns: { Q: 0, W: 0, E: 0, R: 0 }, statPoints: 0, skillPoints: 0, bossKeys: 0, activeQuests: [], completedQuestCount: 0,
  };
  const hpPct = ps.maxHp > 0 ? (ps.hp / ps.maxHp) * 100 : 0;
  const mpPct = ps.maxMana > 0 ? (ps.mana / ps.maxMana) * 100 : 0;
  const expPct = ps.expToNext > 0 ? (ps.exp / ps.expToNext) * 100 : 0;
  const activeQuests = ps.activeQuests || [];

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Health & Mana Orbs + Portrait ─── */}
      <div className="absolute bottom-4 left-4 flex items-end gap-3 z-50">
        <div className="relative w-36 h-36">
          <div className="absolute inset-0 rounded-full border-4 border-red-900 bg-gray-950 overflow-hidden">
            <div className="absolute bottom-0 w-full transition-all duration-300" style={{ height: `${hpPct}%`, background: 'radial-gradient(circle at 30% 40%, #ff3333, #881111)' }} />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-red-700/50" />
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-white drop-shadow-lg font-cinzel">{Math.floor(ps.hp)}/{ps.maxHp}</span></div>
        </div>
        <div className="relative w-16 h-16 mb-10 rounded-lg border-2 border-amber-500 bg-gray-900 overflow-hidden shadow-lg shadow-amber-900/30">
          <img src={portraitSrc} alt={pClass} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-center"><span className="text-[8px] text-amber-400 font-cinzel capitalize">{pClass}</span></div>
        </div>
        <div className="relative w-36 h-36">
          <div className="absolute inset-0 rounded-full border-4 border-blue-900 bg-gray-950 overflow-hidden">
            <div className="absolute bottom-0 w-full transition-all duration-300" style={{ height: `${mpPct}%`, background: 'radial-gradient(circle at 30% 40%, #3366ff, #112288)' }} />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-blue-700/50" />
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-white drop-shadow-lg font-cinzel">{Math.floor(ps.mana)}/{ps.maxMana}</span></div>
        </div>
      </div>

      {/* ── Skill Bar (QWER) ─── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        {Object.entries(classSkills).map(([key, skill]) => {
          const cd = ps.skillCooldowns?.[key] ?? 0;
          const ready = cd <= 0;
          return (
            <div key={key} className="relative group">
              <div className={`w-14 h-14 rounded-lg border-2 flex flex-col items-center justify-center cursor-pointer transition-all ${ready ? 'border-amber-600 bg-gray-900/90 hover:border-amber-400' : 'border-gray-700 bg-gray-900/70'}`}>
                {!ready && <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center"><span className="text-xs text-gray-400 font-mono">{(cd/1000).toFixed(1)}s</span></div>}
                <span className="text-lg font-bold font-cinzel" style={{ color: `#${skill.color.toString(16).padStart(6,'0')}` }}>{key}</span>
                <span className="text-[8px] text-gray-400 font-crimson">{skill.name}</span>
              </div>
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-36 p-2 bg-gray-950 border border-amber-900 rounded text-xs z-[999]">
                <div className="font-cinzel text-amber-400 font-bold">{skill.name}</div>
                <div className="text-gray-400 font-crimson">{skill.desc}</div>
                <div className="text-blue-400 mt-1">Mana: {skill.manaCost}</div>
                <div className="text-gray-500">CD: {skill.cooldown/1000}s</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Top Bar with Portrait ─── */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-gray-950/80 border border-amber-900/50 rounded-lg px-3 py-1.5">
        <div className="w-10 h-10 rounded-lg border-2 border-amber-600 bg-gray-900 overflow-hidden flex-shrink-0">
          <img src={portraitSrc} alt={pClass} className="w-full h-full object-cover" style={{ imageRendering: 'pixelated' }} />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-amber-400 font-bold text-sm">{player?.name || 'Hero'}</span>
            <span className="font-cinzel text-purple-400 text-xs capitalize">{pClass}</span>
            <span className="font-cinzel text-yellow-500 text-xs">Lv.{ps.level}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-crimson">{weaponLabel}</span>
            <div className="w-24 h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all" style={{ width: `${expPct}%` }} /></div>
            <span className="text-[10px] text-gray-400 font-mono">{Math.floor(ps.exp)}/{ps.expToNext} XP</span>
          </div>
        </div>
        <span className="text-yellow-400 text-xs font-cinzel">💰 {ps.gold}</span>
        {ps.bossKeys > 0 && <span className="text-amber-400 text-xs font-cinzel">🔑 {ps.bossKeys}</span>}
      </div>

      {/* ── Right Side Buttons ─── */}
      <div className="absolute top-16 right-3 flex flex-col gap-2 z-50">
        <button onClick={() => dispatch({ type: 'OPEN_INVENTORY' })} className="w-10 h-10 rounded border border-amber-800 bg-gray-950/80 text-amber-400 hover:bg-gray-900 font-cinzel text-sm" title="Inventory">EQ</button>
        <button onClick={() => dispatch({ type: 'OPEN_SKILL_TREE' })} className="w-10 h-10 rounded border border-green-800 bg-gray-950/80 text-green-400 hover:bg-gray-900 font-cinzel text-sm" title="Skills">SK</button>
        <button onClick={() => dispatch({ type: 'OPEN_QUEST_TRACKER' })} className="w-10 h-10 rounded border border-purple-800 bg-gray-950/80 text-purple-400 hover:bg-gray-900 text-sm" title="Quests">📜</button>
        <button onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })} className="w-10 h-10 rounded border border-gray-700 bg-gray-950/80 text-gray-400 hover:bg-gray-900 text-sm" title="City">🏠</button>
      </div>

      {/* ── Quest Tracker HUD ─── */}
      <div className="absolute top-32 right-3 w-52 z-40">
        <div className="bg-gray-950/80 border border-amber-900/40 rounded-lg p-2">
          <div className="font-cinzel text-amber-400 text-xs font-bold mb-1">📜 Active Quests ({activeQuests.length})</div>
          {activeQuests.length === 0 ? (
            <div className="text-gray-600 text-[10px] font-crimson italic">No active quests. Visit a Quest Board in any city.</div>
          ) : (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {activeQuests.map((q, i) => (
                <div key={q.id || i} className="border-l-2 border-amber-700 pl-2">
                  <div className="text-[10px] text-gray-300 font-cinzel font-bold">{q.name}</div>
                  <div className="flex items-center gap-1">
                    <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500 transition-all" style={{ width: `${q.count > 0 ? ((q.progress||0)/q.count)*100 : 0}%` }} /></div>
                    <span className="text-[9px] text-gray-500 font-mono">{q.progress||0}/{q.count}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {(ps.completedQuestCount || 0) > 0 && <div className="text-[9px] text-green-500 font-cinzel mt-1">✓ {ps.completedQuestCount} completed</div>}
        </div>
      </div>

      {/* ── Minimap border ─── */}
      <div className="absolute top-[10px] right-[10px] w-[170px] h-[170px] border-2 border-amber-900/60 rounded pointer-events-none z-30" />

      {/* ── NPC Dialogue ─── */}
      {dialogueData && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="max-w-md w-full bg-gray-950 border-2 border-amber-800 rounded-xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-amber-600 flex items-center justify-center text-2xl">
                {dialogueData.npcRole === 'blacksmith' ? '⚒️' : '💚'}
              </div>
              <div>
                <div className="font-cinzel text-amber-400 font-bold">{dialogueData.npcLabel}</div>
                <div className="text-xs text-gray-500 font-crimson capitalize">{dialogueData.npcRole} — {dialogueData.cityId}</div>
              </div>
            </div>
            {dialogueData.npcRole === 'healer' ? (
              <div>
                <p className="text-sm text-gray-300 font-crimson mb-4">I can mend your wounds and restore your spirit. It will cost 20 gold.</p>
                <div className="flex gap-2">
                  <button onClick={handleHeal} disabled={ps.gold < 20} className="btn-gothic px-4 py-2 disabled:opacity-50">Heal (20g)</button>
                  <button onClick={handleCloseDialogue} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-400 font-cinzel text-sm rounded hover:border-gray-600">Leave</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-300 font-crimson mb-4">Welcome! I can forge and repair your weapons and armor.</p>
                <button onClick={handleCloseDialogue} className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-400 font-cinzel text-sm rounded hover:border-gray-600">Leave</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Quest Board Panel ─── */}
      {questPanel && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="max-w-lg w-full bg-gray-950 border-2 border-amber-800 rounded-xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-cinzel text-amber-400 text-lg font-bold">📋 Quest Board</h3>
              <button onClick={handleCloseQuestPanel} className="text-gray-500 hover:text-red-400 text-xl">✕</button>
            </div>
            {questPanel.available.length > 0 && (
              <div className="mb-4">
                <h4 className="font-cinzel text-gray-400 text-sm mb-2">Available Quests</h4>
                {questPanel.available.map(q => (
                  <div key={q.id} className="p-3 mb-2 border border-gray-800 rounded-lg bg-gray-900/50">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-cinzel text-amber-300 text-sm font-bold">{q.name}</div>
                        <div className="text-xs text-gray-400 font-crimson">{q.desc}</div>
                        <div className="text-[10px] text-green-400 mt-1">Reward: {q.reward.gold}g + {q.reward.exp} XP</div>
                      </div>
                      <button onClick={() => handleAcceptQuest(q)} className="btn-gothic px-3 py-1 text-xs">Accept</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {questPanel.active.length > 0 && (
              <div>
                <h4 className="font-cinzel text-gray-400 text-sm mb-2">Active Quests</h4>
                {questPanel.active.map(q => (
                  <div key={q.id} className="p-3 mb-2 border border-amber-900/40 rounded-lg bg-amber-950/20">
                    <div className="font-cinzel text-amber-300 text-xs font-bold">{q.name}</div>
                    <div className="text-[10px] text-gray-400 font-crimson">{q.desc}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${q.count > 0 ? ((q.progress||0)/q.count)*100 : 0}%` }} /></div>
                      <span className="text-[10px] text-gray-500 font-mono">{q.progress||0}/{q.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {questPanel.available.length === 0 && questPanel.active.length === 0 && (
              <p className="text-gray-600 text-sm font-crimson italic text-center">No quests available in this city.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
