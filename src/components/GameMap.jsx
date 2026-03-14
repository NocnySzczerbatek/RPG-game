// ============================================================
// COMPONENT: Real-Time ARPG World Map (Phaser 3)
// Point-and-Click movement, QWER cursor-aimed skills,
// NPC side quests (Kill/Fetch), LocalStorage save,
// Per-class unique VFX, 5000×5000 world, 6 biomes
// Full integration with CraftPix asset packs
// ============================================================
import React, { useEffect, useRef, useState } from 'react';

// ── World Constants ───────────────────────────────────────
const WORLD_W = 5000;
const WORLD_H = 5000;
const TILE_SIZE = 32;
const TILE_SCALE = 2.5;
const TILE_SCALED = TILE_SIZE * TILE_SCALE;
const PLAYER_SPEED = 220;
const INTERACT_RADIUS = 80;
const SPRITE_SCALE = 2;
const SAVE_KEY = 'eldoria_arpg_save_v2';
const SAFE_ZONE_RADIUS = 1200;
const MOB_AGGRO_RANGE = 180;

// ── Asset path helpers ────────────────────────────────────
const SP = 'assets/sprites/';
const TREES_DIR = `${SP}craftpix-net-385863-free-top-down-trees-pixel-art/PNG/Assets_separately/Trees/`;
const ROCKS_DIR = `${SP}craftpix-net-974061-free-rocks-and-stones-top-down-pixel-art/PNG/Objects_separately/`;
const ORC_DIR = `${SP}craftpix-net-363992-free-top-down-orc-game-character-pixel-art/PNG/`;
const SLIME_DIR = `${SP}craftpix-net-788364-free-slime-mobs-pixel-art-top-down-sprite-pack/PNG/`;
const MONSTER_DIR = `${SP}craftpix-561178-free-rpg-monster-sprites-pixel-art/PNG/`;
const CHAR_DIR = `${SP}craftpix-net-555940-free-base-4-direction-male-character-pixel-art/PNG/`;
const HOME_DIR = `${SP}craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset/PNG/`;

// ── Biome Definitions ─────────────────────────────────────
const BIOMES = [
  { id: 'forest',   name: 'Verdant Forest',   color: 0x2d5a1e, x: 0,    y: 0,    w: 2500, h: 2500, groundTint: 0x3a7a2a, floorKeys: ['floor_0','floor_1','floor_2'], treePalette: ['Tree1','Tree2','Tree3','Flower_tree1','Moss_tree1'] },
  { id: 'desert',   name: 'Scorched Desert',  color: 0x8a7540, x: 2500, y: 0,    w: 2500, h: 2500, groundTint: 0xc4a84a, floorKeys: ['floor_3','floor_4','floor_5'], treePalette: ['Palm_tree1_1','Palm_tree2_1','Burned_tree1'] },
  { id: 'ice',      name: 'Frozen Wastes',    color: 0x4a6a8a, x: 0,    y: 2500, w: 2500, h: 1250, groundTint: 0x8ab8d8, floorKeys: ['floor_6','floor_7','floor_0'], treePalette: ['Snow_tree1','Snow_tree2','Snow_christmass_tree1','Christmas_tree1'] },
  { id: 'volcanic', name: 'Volcanic Caldera',  color: 0x5a1a0a, x: 2500, y: 2500, w: 2500, h: 1250, groundTint: 0x8a2a0a, floorKeys: ['floor_4','floor_5','floor_3'], treePalette: ['Burned_tree1','Burned_tree2','Burned_tree3','Broken_tree1'] },
  { id: 'swamp',    name: 'Blighted Swamp',   color: 0x2a3a1a, x: 0,    y: 3750, w: 2500, h: 1250, groundTint: 0x3a4a2a, floorKeys: ['floor_2','floor_6','floor_1'], treePalette: ['Moss_tree1','Moss_tree2','Moss_tree3','Broken_tree4','Broken_tree5'] },
  { id: 'mountain', name: 'Ashen Peaks',      color: 0x4a4a4a, x: 2500, y: 3750, w: 2500, h: 1250, groundTint: 0x6a6a6a, floorKeys: ['floor_7','floor_5','floor_3'], treePalette: ['Broken_tree6','Broken_tree7','Autumn_tree1','Autumn_tree2'] },
];

// ── City data — one per biome ─────────────────────────────
const CITIES = [
  { id: 'eldergrove', biome: 'forest',   x: 1250, y: 1200, name: 'Eldergrove',  subtitle: 'Heart of the Forest' },
  { id: 'sunhold',    biome: 'desert',   x: 3750, y: 1200, name: 'Sunhold',     subtitle: 'Jewel of the Sands' },
  { id: 'frostholm',  biome: 'ice',      x: 1250, y: 3100, name: 'Frostholm',   subtitle: 'Citadel of Eternal Ice' },
  { id: 'emberpeak',  biome: 'volcanic', x: 3750, y: 3100, name: 'Emberpeak',   subtitle: 'Forge of the World' },
  { id: 'mirewood',   biome: 'swamp',    x: 1250, y: 4300, name: 'Mirewood',    subtitle: 'The Sunken Village' },
  { id: 'ironspire',  biome: 'mountain', x: 3750, y: 4300, name: 'Ironspire',   subtitle: 'Summit Stronghold' },
];

function isInSafeZone(x, y) {
  return CITIES.some(c => Math.hypot(c.x - x, c.y - y) < SAFE_ZONE_RADIUS);
}

// ── NPC archetypes per city ───────────────────────────────
const CITY_NPCS = CITIES.flatMap(city => [
  { id: `${city.id}_blacksmith`, cityId: city.id, x: city.x - 100, y: city.y + 50, label: 'Blacksmith', role: 'blacksmith', icon: '\u2692\uFE0F' },
  { id: `${city.id}_healer`,    cityId: city.id, x: city.x + 100, y: city.y + 50, label: 'Healer',     role: 'healer',     icon: '\uD83D\uDC9A' },
  { id: `${city.id}_quest`,     cityId: city.id, x: city.x,       y: city.y - 80, label: 'Quest Board', role: 'questgiver', icon: '\u2757' },
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
  ],
  volcanic: [
    { type: 'demon',    hp: 150, atk: 40, def: 18, exp: 80,  gold: 40, name: 'Magma Demon',   sprite: 'demon',  isBoss: false },
    { type: 'sdragon',  hp: 120, atk: 35, def: 14, exp: 65,  gold: 30, name: 'Fire Drake',    sprite: 'small_dragon', isBoss: false },
  ],
  swamp:    [
    { type: 'slime1_s', hp: 50,  atk: 10, def: 5,  exp: 20,  gold: 8,  name: 'Poison Slime',  sprite: 'slime1', isBoss: false },
    { type: 'jinn',     hp: 90,  atk: 24, def: 10, exp: 45,  gold: 20, name: 'Swamp Jinn',    sprite: 'jinn',   isBoss: false },
  ],
  mountain: [
    { type: 'orc3_m',   hp: 130, atk: 35, def: 20, exp: 70,  gold: 35, name: 'Mountain Orc',  sprite: 'orc3',   isBoss: false },
    { type: 'dragon',   hp: 200, atk: 50, def: 25, exp: 120, gold: 60, name: 'Elder Dragon',  sprite: 'dragon', isBoss: false },
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

    // ── PRELOAD ──────────────────────────────────────
    preload() {
      // Floor textures
      for (let i = 0; i < 8; i++) this.load.image(`floor_${i}`, `${SP}floor_${i}.png`);
      this.load.image('road', `${SP}road_tile.png`);
      this.load.image('ground_grass', `${HOME_DIR}ground_grass_details.png`);
      this.load.image('walls_floor', `${HOME_DIR}walls_floor.png`);

      // Player spritesheets (4-direction male with sword)
      this.load.spritesheet('player_idle',   `${CHAR_DIR}Sword/With_shadow/Sword_Idle_with_shadow.png`,   { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player_walk',   `${CHAR_DIR}Sword/With_shadow/Sword_Walk_with_shadow.png`,   { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player_attack', `${CHAR_DIR}Sword/With_shadow/Sword_attack_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player_hurt',   `${CHAR_DIR}Sword/With_shadow/Sword_Hurt_with_shadow.png`,   { frameWidth: 64, frameHeight: 64 });
      this.load.spritesheet('player_run',    `${CHAR_DIR}Sword/With_shadow/Sword_Run_with_shadow.png`,    { frameWidth: 64, frameHeight: 64 });

      // Orc spritesheets (top-down 64×64)
      ['orc1','orc2','orc3'].forEach(id => {
        const cap = id.charAt(0).toUpperCase() + id.slice(1);
        const dir = `${ORC_DIR}${cap}/With_shadow/`;
        ['idle','walk','attack','hurt','death'].forEach(a =>
          this.load.spritesheet(`${id}_${a}`, `${dir}${id}_${a}_with_shadow.png`, { frameWidth: 64, frameHeight: 64 }));
      });

      // Slime spritesheets (top-down 32×32)
      ['Slime1','Slime2','Slime3'].forEach(id => {
        const dir = `${SLIME_DIR}${id}/With_shadow/`; const lc = id.toLowerCase();
        ['Idle','Walk','Attack','Hurt','Death'].forEach(a =>
          this.load.spritesheet(`${lc}_${a.toLowerCase()}`, `${dir}${id}_${a}_with_shadow.png`, { frameWidth: 32, frameHeight: 32 }));
      });

      // Monster individual frames
      ['demon','dragon','jinn_animation','lizard','medusa','small_dragon'].forEach(id => {
        const dir = `${MONSTER_DIR}${id}/`; const key = id === 'jinn_animation' ? 'jinn' : id;
        ['Idle1','Idle2','Idle3','Walk1','Walk2','Attack1','Attack2','Hurt1','Death1'].forEach(f =>
          this.load.image(`${key}_${f.toLowerCase()}`, `${dir}${f}.png`));
      });

      // Trees — collect unique names from all biomes
      const allTrees = new Set(); BIOMES.forEach(b => b.treePalette.forEach(t => allTrees.add(t)));
      allTrees.forEach(t => this.load.image(`tree_${t}`, `${TREES_DIR}${t}.png`));
      // Rocks
      for (let i = 1; i <= 7; i++) this.load.image(`rock_${i}`, `${ROCKS_DIR}Rock${i}_1.png`);
      // Buildings
      this.load.image('building_exterior', `${HOME_DIR}exterior.png`);
      this.load.image('building_house',    `${HOME_DIR}house_details.png`);
      // Props
      this.load.image('chest_sprite',    `${SP}chest.png`);
      this.load.image('fountain_sprite', `${SP}fountain.png`);
      this.load.image('npc_sprite',      `${SP}npc_merchant.png`);
      this.load.image('shop_sprite',     `${SP}shop.png`);
      for (let i = 0; i < 5; i++) this.load.image(`torch_${i}`, `${SP}torch_${i}.png`);
      this.load.image('dark_particle', `${SP}dark_particle.png`);
    }

    // ── CREATE ───────────────────────────────────────
    create() {
      const rng = seededRandom(42);
      this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
      this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

      // Nuclear fallback — ensure world is NEVER black
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

    // ── GROUND ───────────────────────────────────────
    renderGround(rng) {
      // Colored biome base
      const g = this.add.graphics().setDepth(-1);
      for (const b of BIOMES) {
        const r = (b.groundTint >> 16) & 0xff, gr = (b.groundTint >> 8) & 0xff, bl = b.groundTint & 0xff;
        g.fillStyle(((Math.floor(r * 0.7)) << 16) | ((Math.floor(gr * 0.7)) << 8) | Math.floor(bl * 0.7), 1);
        g.fillRect(b.x, b.y, b.w, b.h);
      }
      // Floor tile overlay per biome
      for (const b of BIOMES) {
        const keys = b.floorKeys.filter(k => this.textures.exists(k)); if (!keys.length) continue;
        for (let x = b.x; x < b.x + b.w; x += TILE_SCALED) {
          for (let y = b.y; y < b.y + b.h; y += TILE_SCALED) {
            this.add.image(x + TILE_SCALED / 2, y + TILE_SCALED / 2, keys[Math.floor(rng() * keys.length)])
              .setScale(TILE_SCALE).setDepth(0).setTint(b.groundTint);
          }
        }
      }
      // Grass detail overlays
      if (this.textures.exists('ground_grass')) {
        for (const b of BIOMES) {
          if (b.id !== 'forest' && b.id !== 'swamp') continue;
          for (let i = 0; i < 20; i++) {
            const gx = b.x + 200 + rng() * (b.w - 400), gy = b.y + 200 + rng() * (b.h - 400);
            if (isInSafeZone(gx, gy)) continue;
            this.add.image(gx, gy, 'ground_grass').setScale(1.5 + rng() * 0.5).setDepth(0.05).setAlpha(0.5 + rng() * 0.3).setTint(b.groundTint);
          }
        }
      }
      // Biome borders
      for (const b of BIOMES) {
        const border = this.add.graphics().setDepth(0.1);
        border.lineStyle(2, 0x000000, 0.3); border.strokeRect(b.x, b.y, b.w, b.h);
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
              const steps = Math.floor(Math.sqrt(dx * dx + dy * dy) / TILE_SCALED);
              for (let s = 0; s <= steps; s++) {
                const t = s / steps;
                this.add.image(CITIES[i].x + dx * t, CITIES[i].y + dy * t, 'road').setScale(TILE_SCALE).setDepth(0.6).setAlpha(0.4);
              }
            }
          }
        }
      }
    }

    // ── DECORATIONS ──────────────────────────────────
    renderBiomeDecorations(rng) {
      for (const b of BIOMES) {
        for (let i = 0, n = 40 + Math.floor(rng() * 20); i < n; i++) {
          const tx = b.x + 80 + rng() * (b.w - 160), ty = b.y + 80 + rng() * (b.h - 160);
          if (isInSafeZone(tx, ty)) continue;
          const tn = b.treePalette[Math.floor(rng() * b.treePalette.length)];
          if (this.textures.exists(`tree_${tn}`))
            this.add.image(tx, ty, `tree_${tn}`).setScale(SPRITE_SCALE * (0.8 + rng() * 0.4)).setDepth(ty + 40).setAlpha(0.9 + rng() * 0.1);
        }
        for (let i = 0, n = 15 + Math.floor(rng() * 10); i < n; i++) {
          const rx = b.x + 60 + rng() * (b.w - 120), ry = b.y + 60 + rng() * (b.h - 120);
          if (isInSafeZone(rx, ry)) continue;
          const rk = `rock_${1 + Math.floor(rng() * 7)}`;
          if (this.textures.exists(rk))
            this.add.image(rx, ry, rk).setScale(SPRITE_SCALE * (0.6 + rng() * 0.5)).setDepth(ry + 10);
        }
      }
    }

    // ── CITIES — real house sprites from CraftPix ────
    renderCities(rng) {
      CITIES.forEach(city => {
        const biome = BIOMES.find(b => b.id === city.biome);
        // Ground platform
        const cg = this.add.graphics().setDepth(0.8);
        cg.fillStyle(0x554433, 0.6); cg.fillRoundedRect(city.x - 200, city.y - 180, 400, 360, 24);
        cg.fillStyle(0x665544, 0.35); cg.fillRoundedRect(city.x - 180, city.y - 160, 360, 320, 18);

        const hasExterior = this.textures.exists('building_exterior');
        const hasHouseDetail = this.textures.exists('building_house');
        const hasShop = this.textures.exists('shop_sprite');
        const angles = [0, Math.PI*0.5, Math.PI, Math.PI*1.5, Math.PI*0.25, Math.PI*1.25];
        const count = 4 + Math.floor(rng() * 3);
        for (let i = 0; i < count; i++) {
          const angle = angles[i % angles.length] + (rng() - 0.5) * 0.3;
          const rad = 80 + rng() * 50;
          const bx = city.x + Math.cos(angle) * rad, by = city.y + Math.sin(angle) * rad - 10;
          if (i === 0 && hasShop) {
            this.add.image(bx, by, 'shop_sprite').setScale(SPRITE_SCALE * 0.8).setDepth(by + 30);
          } else if (i % 2 === 0 && hasExterior) {
            this.add.image(bx, by, 'building_exterior').setScale(SPRITE_SCALE * 0.7).setDepth(by + 30);
          } else if (hasHouseDetail) {
            this.add.image(bx, by, 'building_house').setScale(SPRITE_SCALE * 0.7).setDepth(by + 30);
          } else {
            // Fallback drawn building
            const fg = this.add.graphics().setDepth(by + 30);
            const bw = 60 + rng() * 40, bh = 50 + rng() * 30;
            fg.fillStyle(0x000000, 0.3); fg.fillRect(bx-bw/2+4, by-bh/2+4, bw, bh);
            const wc = biome.id === 'ice' ? 0x8899aa : biome.id === 'volcanic' ? 0x553322 : biome.id === 'desert' ? 0xaa9966 : 0x665544;
            fg.fillStyle(wc); fg.fillRect(bx-bw/2, by-bh/2, bw, bh);
            const rc = biome.id === 'volcanic' ? 0x881100 : biome.id === 'ice' ? 0x4466aa : 0x884422;
            fg.fillStyle(rc); fg.fillTriangle(bx-bw/2-8, by-bh/2, bx, by-bh/2-28, bx+bw/2+8, by-bh/2);
          }
        }
        // City label
        this.add.text(city.x, city.y - 200, city.name, { fontFamily: 'Cinzel, serif', fontSize: '18px', color: '#ffd700', stroke: '#000000', strokeThickness: 4, align: 'center' }).setOrigin(0.5).setDepth(9999);
        this.add.text(city.x, city.y - 182, city.subtitle, { fontFamily: 'Crimson Text, serif', fontSize: '11px', color: '#aaa', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5).setDepth(9999);
        // Torches
        for (let t = 0; t < 4; t++) {
          const ta = (t / 4) * Math.PI * 2;
          const tk = `torch_${Math.floor(rng() * 5)}`;
          if (this.textures.exists(tk))
            this.add.image(city.x + Math.cos(ta) * 160, city.y + Math.sin(ta) * 140, tk).setScale(SPRITE_SCALE).setDepth(city.y + Math.sin(ta) * 140 + 20);
        }
        // Fountain
        if (this.textures.exists('fountain_sprite'))
          this.add.image(city.x, city.y - 30, 'fountain_sprite').setScale(SPRITE_SCALE).setDepth(city.y - 10);
      });
    }

    // ── ENEMIES ──────────────────────────────────────
    spawnAllEnemies(rng) {
      for (const b of BIOMES) {
        const templates = BIOME_ENEMIES[b.id] || [];
        for (let i = 0, n = 15 + Math.floor(rng() * 6); i < n; i++) {
          const t = templates[Math.floor(rng() * templates.length)]; if (!t) continue;
          const ex = b.x + 100 + rng() * (b.w - 200), ey = b.y + 100 + rng() * (b.h - 200);
          if (isInSafeZone(ex, ey)) continue;
          this.spawnEnemy(ex, ey, t, b.id);
        }
        const boss = BIOME_BOSSES[b.id];
        if (boss) {
          const bx = b.x + b.w / 2 + (rng() - 0.5) * 400, by = b.y + b.h / 2 + (rng() - 0.5) * 200;
          if (!isInSafeZone(bx, by)) this.spawnEnemy(bx, by, boss, b.id);
        }
      }
    }

    spawnEnemy(x, y, template, biomeId) {
      const sk = template.sprite;
      const isTopDown = sk.startsWith('orc') || sk.startsWith('slime');
      let enemy;
      if (isTopDown && this.textures.exists(`${sk}_idle`)) {
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
            const fx = b.x + 100 + rng() * (b.w - 200), fy = b.y + 100 + rng() * (b.h - 200);
            if (isInSafeZone(fx, fy)) continue;
            const color = FETCH_ITEM_COLORS[q.item] || 0xffffff;
            const item = this.add.circle(fx, fy, 7, color, 0.8).setDepth(fy - 1).setInteractive();
            const glow = this.add.circle(fx, fy, 12, color, 0.2).setDepth(fy - 2);
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
          const cx = b.x + 120 + rng() * (b.w - 240), cy = b.y + 120 + rng() * (b.h - 240);
          if (isInSafeZone(cx, cy)) continue;
          this.createChest(cx, cy, 'common');
        }
        const bcx = b.x + b.w / 2 + 60, bcy = b.y + b.h / 2 + 60;
        if (!isInSafeZone(bcx, bcy)) this.createChest(bcx, bcy, 'golden');
      }
    }

    createChest(x, y, type) {
      const chest = this.add.image(x, y, 'chest_sprite').setScale(SPRITE_SCALE).setDepth(y).setInteractive();
      if (type === 'golden') chest.setTint(0xffdd00);
      chest.chestData = { type, opened: false };
      chest.label = this.add.text(x, y - 24, type === 'golden' ? '\uD83D\uDD12 Boss Chest' : 'Chest', {
        fontSize: '8px', fontFamily: 'Cinzel, serif', color: type === 'golden' ? '#ffd700' : '#aaaaaa', stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(9999).setAlpha(0.7);
      this.chests.push(chest);
    }

    // ── PLAYER ───────────────────────────────────────
    createPlayer() {
      const start = CITIES[0];
      this.playerState.hp = this.playerState.maxHp; this.playerState.mana = this.playerState.maxMana;
      if (this.textures.exists('player_idle')) {
        this.knight = this.physics.add.sprite(start.x, start.y, 'player_idle', 0).setScale(SPRITE_SCALE);
        try {
          const mk = (k, s, r, rep) => { const fc = this.textures.get(s).frameTotal - 1; if (fc > 1) this.anims.create({ key: k, frames: this.anims.generateFrameNumbers(s, { start: 0, end: fc - 1 }), frameRate: r, repeat: rep }); };
          mk('player_idle_anim', 'player_idle', 6, -1); mk('player_walk_anim', 'player_walk', 10, -1);
          mk('player_attack_anim', 'player_attack', 12, 0); mk('player_run_anim', 'player_run', 10, -1);
        } catch (_) {}
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
        if (isInSafeZone(e.x, e.y)) { e.hpBg?.destroy(); e.hpFg?.destroy(); e.nameLabel?.destroy(); e.bossGlow?.destroy(); e.destroy(); this.enemies.splice(i, 1); }
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
      if (this.textures.exists('dark_particle')) {
        this.add.particles(0, 0, 'dark_particle', { x: { min: 0, max: WORLD_W }, y: { min: 0, max: WORLD_H }, lifespan: 6000, speed: { min: 5, max: 20 }, scale: { start: 0.3, end: 0 }, alpha: { start: 0.3, end: 0 }, frequency: 200, quantity: 1 }).setDepth(99990);
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

    updatePlayerMovement() {
      if (this.isDashing) return;
      if (this.moveTarget) {
        const dist = Phaser.Math.Distance.Between(this.knight.x, this.knight.y, this.moveTarget.x, this.moveTarget.y);
        if (dist < 8) {
          this.knight.body.setVelocity(0, 0); this.moveTarget = null;
          if (this.anims.exists('player_idle_anim') && this.knight.anims) this.knight.anims.play('player_idle_anim', true);
        } else {
          const a = Math.atan2(this.moveTarget.y - this.knight.y, this.moveTarget.x - this.knight.x);
          this.knight.body.setVelocity(Math.cos(a) * PLAYER_SPEED, Math.sin(a) * PLAYER_SPEED);
          this.knight.setFlipX(Math.cos(a) < 0);
          if (this.anims.exists('player_walk_anim') && this.knight.anims) this.knight.anims.play('player_walk_anim', true);
        }
      } else {
        this.knight.body.setVelocity(0, 0);
        if (this.anims.exists('player_idle_anim') && this.knight.anims && !this.knight.anims.isPlaying) this.knight.anims.play('player_idle_anim', true);
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
        if (!isTopDown) {
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

    // ── Basic Attack ─────────────────────────────────
    performBasicAttack() {
      if (!this.knight) return;
      this.moveTarget = null;
      if (this.anims.exists('player_attack_anim') && this.knight.anims) {
        this.knight.anims.play('player_attack_anim', true);
        this.knight.once('animationcomplete', () => { if (this.knight && this.anims.exists('player_idle_anim')) this.knight.anims.play('player_idle_anim', true); });
      }
      this.knight.setFlipX(this.mouseWorldPos.x < this.knight.x);
      const range = 70; let closest = null, cd = Infinity;
      for (const e of this.enemies) { if (e.enemyData.isDead) continue; const d = Phaser.Math.Distance.Between(this.knight.x, this.knight.y, e.x, e.y); if (d < range && d < cd) { closest = e; cd = d; } }
      if (closest) { const base = this.playerState.attack + this.playerState.level * 2; const crit = Math.random() < 0.15; this.damageEnemy(closest, crit ? Math.floor(base * 1.8) : base, crit); }
      const sg = this.add.graphics().setDepth(99999);
      const a = Math.atan2(this.mouseWorldPos.y - this.knight.y, this.mouseWorldPos.x - this.knight.x);
      sg.lineStyle(3, 0xffffff, 0.6); sg.beginPath(); sg.arc(this.knight.x, this.knight.y, range * 0.7, a - 0.5, a + 0.5); sg.strokePath();
      this.tweens.add({ targets: sg, alpha: 0, duration: 200, onComplete: () => sg.destroy() });
    }

    // ── SKILLS (QWER) ───────────────────────────────
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
      const vfx = this.add.graphics().setDepth(99991); vfx.lineStyle(2, skill.color, 0.6); vfx.strokeCircle(this.knight.x, this.knight.y, 18);
      this.tweens.add({ targets: vfx, alpha: 0, duration: 300, onComplete: () => vfx.destroy() });
    }

    performDash(skill) {
      this.isDashing = true;
      const a = Math.atan2(this.mouseWorldPos.y - this.knight.y, this.mouseWorldPos.x - this.knight.x);
      const dist = Math.min(200, Phaser.Math.Distance.Between(this.knight.x, this.knight.y, this.mouseWorldPos.x, this.mouseWorldPos.y));
      const tx = Phaser.Math.Clamp(this.knight.x + Math.cos(a) * dist, 20, WORLD_W - 20);
      const ty = Phaser.Math.Clamp(this.knight.y + Math.sin(a) * dist, 20, WORLD_H - 20);
      const ox = this.knight.x, oy = this.knight.y;
      const dur = playerClass === 'ninja' ? 100 : playerClass === 'mage' ? 80 : 150;
      const tg = this.add.graphics().setDepth(99988); tg.lineStyle(4, skill.color, 0.5); tg.lineBetween(ox, oy, tx, ty); tg.fillStyle(skill.color, 0.15); tg.fillCircle(tx, ty, 25);
      this.tweens.add({ targets: tg, alpha: 0, duration: 500, onComplete: () => tg.destroy() });
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
        const ml = this.add.graphics().setDepth(99999); ml.lineStyle(3, 0xff4400, 0.6); ml.lineBetween(mx, my-200, mx, my);
        this.tweens.add({ targets: ml, alpha: 0, duration: 300, onComplete: () => ml.destroy() });
        const sg = this.add.graphics().setDepth(99999);
        this.tweens.add({ targets: { r: 10 }, r: 60, duration: 350, onUpdate: (tw) => { const r = tw.getValue(); sg.clear(); sg.fillStyle(0xff4400, 0.5*(1-r/60)); sg.fillCircle(mx,my,r); }, onComplete: () => sg.destroy() });
        for (const e of this.enemies) { if (e.enemyData.isDead) continue; if (Phaser.Math.Distance.Between(mx,my,e.x,e.y) < 60) this.damageEnemy(e, dmg, true); }
        this.cameras.main.shake(250, 0.008); return;
      }
      const hx = this.knight.x + Math.cos(a) * 50, hy = this.knight.y + Math.sin(a) * 50;
      const sg = this.add.graphics().setDepth(99999); sg.fillStyle(skill.color, 0.5); sg.fillCircle(hx,hy,35);
      sg.lineStyle(4, skill.color, 0.9); sg.beginPath(); sg.arc(hx,hy,40,a-0.8,a+0.8); sg.strokePath();
      this.tweens.add({ targets: sg, alpha: 0, scaleX: 1.5, scaleY: 1.5, duration: 400, onComplete: () => sg.destroy() });
      for (const e of this.enemies) { if (e.enemyData.isDead) continue; if (Phaser.Math.Distance.Between(hx,hy,e.x,e.y) < 90) this.damageEnemy(e, dmg, true); }
      this.cameras.main.shake(200, 0.005);
    }

    // ── Damage & Kill ────────────────────────────────
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
      if (ed.isBoss) { this.playerState.bossKeys += 1; this.spawnDamageText(enemy.x, enemy.y - 40, '\uD83D\uDD11 Boss Key!', '#ffd700'); }
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
          let rx, ry, safe = false;
          for (let tries = 0; tries < 20; tries++) {
            rx = biome.x + 100 + Math.random() * (biome.w - 200); ry = biome.y + 100 + Math.random() * (biome.h - 200);
            if (!isInSafeZone(rx, ry)) { safe = true; break; }
          }
          if (safe) this.spawnEnemy(rx, ry, tmpl, biome.id);
        });
      }
      this.syncPlayerState();
    }

    // ── Quest progress ───────────────────────────────
    updateKillQuests(enemyType) {
      for (const q of this.activeQuests) {
        if (q.completed) continue;
        if (q.type === 'kill' && q.target === enemyType) {
          q.progress = Math.min((q.progress || 0) + 1, q.count);
          if (q.progress >= q.count) {
            q.completed = true; this.playerState.gold += q.reward.gold; this.playerState.exp += q.reward.exp;
            this.spawnDamageText(this.knight.x, this.knight.y - 60, `Quest Complete: ${q.name}!`, '#ffd700');
            this.spawnDamageText(this.knight.x, this.knight.y - 75, `+${q.reward.gold}g +${q.reward.exp}XP`, '#44ff44');
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
            this.spawnDamageText(this.knight.x, this.knight.y - 75, `+${q.reward.gold}g +${q.reward.exp}XP`, '#44ff44');
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
        const lg = this.add.graphics().setDepth(99999); lg.fillStyle(0xffd700, 0.3); lg.fillCircle(this.knight.x, this.knight.y, 10);
        this.tweens.add({ targets: { r: 10 }, r: 150, duration: 600,
          onUpdate: (tw) => { const r = tw.getValue(); lg.clear(); lg.fillStyle(0xffd700, 0.3*(1-r/150)); lg.fillCircle(this.knight.x, this.knight.y, r); },
          onComplete: () => lg.destroy() });
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
export { BIOMES, CITIES, CITY_NPCS, BIOME_BOSSES, WORLD_W, WORLD_H };

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

  const classSkills = getClassSkills(player?.class || 'warrior');
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

      {/* ── Health & Mana Orbs (2x) ─── */}
      <div className="absolute bottom-4 left-4 flex items-end gap-5 z-50">
        <div className="relative w-36 h-36">
          <div className="absolute inset-0 rounded-full border-4 border-red-900 bg-gray-950 overflow-hidden">
            <div className="absolute bottom-0 w-full transition-all duration-300" style={{ height: `${hpPct}%`, background: 'radial-gradient(circle at 30% 40%, #ff3333, #881111)' }} />
          </div>
          <div className="absolute inset-0 rounded-full border-2 border-red-700/50" />
          <div className="absolute inset-0 flex items-center justify-center"><span className="text-sm font-bold text-white drop-shadow-lg font-cinzel">{Math.floor(ps.hp)}/{ps.maxHp}</span></div>
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

      {/* ── Top Bar ─── */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-gray-950/80 border border-amber-900/50 rounded-lg px-4 py-2">
        <span className="font-cinzel text-amber-400 font-bold text-sm">{player?.name || 'Hero'}</span>
        <span className="font-cinzel text-purple-400 text-xs capitalize">{player?.class || 'warrior'}</span>
        <span className="font-cinzel text-yellow-500 text-xs">Lv.{ps.level}</span>
        <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all" style={{ width: `${expPct}%` }} /></div>
        <span className="text-xs text-gray-400 font-mono">{Math.floor(ps.exp)}/{ps.expToNext} XP</span>
        <span className="text-yellow-400 text-xs font-cinzel">{'\uD83D\uDCB0'} {ps.gold}</span>
        {ps.bossKeys > 0 && <span className="text-amber-400 text-xs font-cinzel">{'\uD83D\uDD11'} {ps.bossKeys}</span>}
      </div>

      {/* ── Right Side Buttons ─── */}
      <div className="absolute top-16 right-3 flex flex-col gap-2 z-50">
        <button onClick={() => dispatch({ type: 'OPEN_INVENTORY' })} className="w-10 h-10 rounded border border-amber-800 bg-gray-950/80 text-amber-400 hover:bg-gray-900 font-cinzel text-sm" title="Inventory">EQ</button>
        <button onClick={() => dispatch({ type: 'OPEN_SKILL_TREE' })} className="w-10 h-10 rounded border border-green-800 bg-gray-950/80 text-green-400 hover:bg-gray-900 font-cinzel text-sm" title="Skills">SK</button>
        <button onClick={() => dispatch({ type: 'OPEN_QUEST_TRACKER' })} className="w-10 h-10 rounded border border-purple-800 bg-gray-950/80 text-purple-400 hover:bg-gray-900 text-sm" title="Quests">{'\uD83D\uDCDC'}</button>
        <button onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })} className="w-10 h-10 rounded border border-gray-700 bg-gray-950/80 text-gray-400 hover:bg-gray-900 text-sm" title="City">{'\uD83C\uDFE0'}</button>
      </div>

      {/* ── Quest Tracker HUD ─── */}
      <div className="absolute top-32 right-3 w-52 z-40">
        <div className="bg-gray-950/80 border border-amber-900/40 rounded-lg p-2">
          <div className="font-cinzel text-amber-400 text-xs font-bold mb-1">{'\uD83D\uDCDC'} Active Quests ({activeQuests.length})</div>
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
          {(ps.completedQuestCount || 0) > 0 && <div className="text-[9px] text-green-500 font-cinzel mt-1">{'\u2713'} {ps.completedQuestCount} completed</div>}
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
                {dialogueData.npcRole === 'blacksmith' ? '\u2692\uFE0F' : '\uD83D\uDC9A'}
              </div>
              <div>
                <div className="font-cinzel text-amber-400 font-bold">{dialogueData.npcLabel}</div>
                <div className="text-xs text-gray-500 font-crimson capitalize">{dialogueData.npcRole} — {dialogueData.cityId}</div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-800">
              <p className="font-crimson text-gray-300">
                {dialogueData.npcRole === 'blacksmith'
                  ? "Welcome, traveler. I can repair your gear and trade fine weapons. What do you need?"
                  : "Blessings upon you. I can restore your body and spirit. Shall I heal you?"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {dialogueData.npcRole === 'healer' && (
                <button onClick={handleHeal} className="w-full py-2 bg-green-900/50 border border-green-700 rounded text-green-400 font-cinzel text-sm hover:bg-green-800/50 transition-all">
                  {'\uD83D\uDC9A'} Heal &amp; Restore (20g)
                </button>
              )}
              {dialogueData.npcRole === 'blacksmith' && (
                <button onClick={() => { dispatch({ type: 'OPEN_SHOP' }); handleCloseDialogue(); }} className="w-full py-2 bg-amber-900/50 border border-amber-700 rounded text-amber-400 font-cinzel text-sm hover:bg-amber-800/50 transition-all">
                  {'\u2692\uFE0F'} Trade
                </button>
              )}
              <button onClick={handleCloseDialogue} className="w-full py-2 bg-gray-800/50 border border-gray-700 rounded text-gray-400 font-cinzel text-sm hover:bg-gray-700/50 transition-all">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Quest Board Panel ─── */}
      {questPanel && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60">
          <div className="max-w-lg w-full bg-gray-950 border-2 border-amber-800 rounded-xl p-6 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-yellow-900/30 border-2 border-yellow-600 flex items-center justify-center text-xl">{'\u2757'}</div>
                <div><div className="font-cinzel text-amber-400 font-bold">Quest Board</div><div className="text-xs text-gray-500 font-crimson capitalize">{questPanel.cityId}</div></div>
              </div>
              <button onClick={handleCloseQuestPanel} className="text-gray-500 hover:text-red-400 text-xl">{'\u2715'}</button>
            </div>
            {questPanel.available.length > 0 && (
              <div className="mb-4">
                <div className="font-cinzel text-yellow-400 text-xs font-bold mb-2">Available Quests</div>
                <div className="space-y-2">
                  {questPanel.available.map(q => (
                    <div key={q.id} className="p-3 border border-gray-800 rounded-lg bg-gray-900/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-cinzel text-sm text-gray-200 font-bold">{q.name}</div>
                          <div className="text-xs text-gray-400 font-crimson">{q.desc}</div>
                          <div className="text-[10px] text-gray-500 mt-1"><span className="text-yellow-400">+{q.reward.gold}g</span>{' '}<span className="text-green-400">+{q.reward.exp} XP</span></div>
                        </div>
                        <button onClick={() => handleAcceptQuest(q)} className="px-3 py-1.5 bg-amber-900/40 border border-amber-700 rounded text-amber-400 font-cinzel text-xs hover:bg-amber-800/50 transition-all shrink-0">Accept</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {questPanel.active.length > 0 && (
              <div>
                <div className="font-cinzel text-blue-400 text-xs font-bold mb-2">Active Quests</div>
                <div className="space-y-2">
                  {questPanel.active.map(q => (
                    <div key={q.id} className="p-3 border border-gray-800 rounded-lg bg-gray-900/30">
                      <div className="font-cinzel text-sm text-gray-300">{q.name}</div>
                      <div className="text-xs text-gray-500 font-crimson">{q.desc}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all" style={{ width: `${q.count > 0 ? ((q.progress||0)/q.count)*100 : 0}%` }} /></div>
                        <span className="text-xs text-gray-400 font-mono">{q.progress||0}/{q.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {questPanel.available.length === 0 && questPanel.active.length === 0 && (
              <div className="text-center text-gray-500 font-crimson italic py-4">No quests available here. Try another city.</div>
            )}
          </div>
        </div>
      )}

      {/* Controls hint */}
      <div className="absolute bottom-2 right-4 text-[10px] text-gray-500 font-mono z-50 text-right font-semibold">
        RMB: Move | LMB: Attack | QWER: Skills | F: Interact | M: Map
      </div>
    </div>
  );
}
