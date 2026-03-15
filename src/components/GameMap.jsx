import React, { useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import HUD from './HUD';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const WORLD_W = 4000;
const WORLD_H = 4000;
const TILE = 16;
const PLAYER_SPEED = 210;
const SPRITE_SCALE = 1.6;
const GROUND_RES = 800;
const PX_PER_TEXEL = WORLD_W / GROUND_RES;

/* ── asset paths ───────────────────────────────────────────── */
const HERO_BASE = 'assets/sprites/craftpix-891165-assassin-mage-viking-free-pixel-art-game-heroes/PNG';
const TREES   = 'assets/sprites/craftpix-net-385863-free-top-down-trees-pixel-art/PNG/Assets_separately/Trees_texture_shadow_dark';
const ROCKS   = 'assets/sprites/craftpix-net-974061-free-rocks-and-stones-top-down-pixel-art/PNG/Objects_separately';
const HOME    = 'assets/sprites/craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset/PNG';
const ORCS    = 'assets/sprites/craftpix-net-363992-free-top-down-orc-game-character-pixel-art/PNG';
const SLIMES  = 'assets/sprites/craftpix-net-788364-free-slime-mobs-pixel-art-top-down-sprite-pack/PNG';
const MONSTERS = 'assets/sprites/craftpix-561178-free-rpg-monster-sprites-pixel-art/PNG';
const VAMPIRES = 'assets/sprites/craftpix-net-208004-free-vampire-4-direction-pixel-character-sprite-pack/PNG';
const CRYPT_W = 2000, CRYPT_H = 2000;
const FOREST_PORTAL_POS = { x: 3200, y: 800 };
const NPC_POS = { x: 1950, y: 2050 };

/* ── hero class animation defs ─────────────────────────────── */
const HERO_CLASSES = {
  warrior: {
    folder: 'Knight',
    anims: [
      { name: 'idle', count: 12, start: 1 },
      { name: 'run',  count: 8,  start: 1 },
      { name: 'walk', count: 6,  start: 1, folder: 'Walk' },
      { name: 'attack', count: 5, start: 0, folder: 'Attack' },
      { name: 'death', count: 10, start: 1, folder: 'Death' },
      { name: 'hurt',  count: 4,  start: 1, folder: 'Hurt' },
    ],
  },
  mage: {
    folder: 'Mage',
    anims: [
      { name: 'idle', count: 14, start: 1 },
      { name: 'run',  count: 8,  start: 1 },
      { name: 'walk', count: 6,  start: 1, folder: 'Walk' },
      { name: 'attack', count: 7, start: 1, folder: 'Attack' },
      { name: 'death', count: 10, start: 1, folder: 'Death' },
      { name: 'hurt',  count: 4,  start: 1, folder: 'Hurt' },
    ],
  },
  rogue: {
    folder: 'Rogue',
    anims: [
      { name: 'idle', count: 17, start: 1 },
      { name: 'run',  count: 8,  start: 1 },
      { name: 'walk', count: 6,  start: 1, folder: 'Walk' },
      { name: 'attack', count: 7, start: 1, folder: 'Attack', filePrefix: 'Attack' },
      { name: 'death', count: 10, start: 1, folder: 'Death' },
      { name: 'hurt',  count: 4,  start: 1, folder: 'Hurt' },
    ],
  },
};

/* ── tree & rock defs ──────────────────────────────────────── */
const TREE_DEFS = [
  { key: 'tree_broken7', file: 'Broken_tree7.png', w: 128, h: 128, colR: 14 },
  { key: 'tree_burned1', file: 'Burned_tree1.png', w: 128, h: 128, colR: 14 },
  { key: 'tree_burned2', file: 'Burned_tree2.png', w: 64,  h: 64,  colR: 10 },
  { key: 'tree_autumn1', file: 'Autumn_tree1.png', w: 128, h: 128, colR: 18 },
  { key: 'tree_autumn2', file: 'Autumn_tree2.png', w: 64,  h: 64,  colR: 10 },
  { key: 'tree_moss1',   file: 'Moss_tree1.png',   w: 128, h: 128, colR: 16 },
  { key: 'tree_broken4', file: 'Broken_tree4.png', w: 64,  h: 64,  colR: 10 },
  { key: 'tree_broken1', file: 'Broken_tree1.png', w: 32,  h: 32,  colR: 6  },
];
const ROCK_DEFS = [
  { key: 'rock1_1', file: 'Rock1_1.png', w: 64, h: 64, col: true },
  { key: 'rock1_2', file: 'Rock1_2.png', w: 64, h: 64, col: true },
  { key: 'rock1_3', file: 'Rock1_3.png', w: 32, h: 32, col: false },
  { key: 'rock1_4', file: 'Rock1_4.png', w: 32, h: 32, col: false },
  { key: 'rock2_1', file: 'Rock2_1.png', w: 64, h: 64, col: true },
];

/* ── enemy definitions ─────────────────────────────────────── */
const ENEMY_TYPES = {
  orc: {
    key: 'orc1', hp: 60, dmg: 8, xp: 25, speed: 80,
    aggroRange: 300, atkRange: 50, atkCooldown: 1200, scale: 2.0,
    anims: {
      idle:   { sheet: 'orc1_idle',   cols: 4, frameRate: 6  },
      walk:   { sheet: 'orc1_walk',   cols: 6, frameRate: 8  },
      run:    { sheet: 'orc1_run',    cols: 8, frameRate: 10 },
      attack: { sheet: 'orc1_attack', cols: 8, frameRate: 12 },
      hurt:   { sheet: 'orc1_hurt',   cols: 6, frameRate: 10 },
      death:  { sheet: 'orc1_death',  cols: 8, frameRate: 8  },
    },
  },
  slime: {
    key: 'slime1', hp: 35, dmg: 5, xp: 15, speed: 55,
    aggroRange: 250, atkRange: 40, atkCooldown: 1500, scale: 1.8,
    anims: {
      idle:   { sheet: 'slime1_idle',   cols: 6, frameRate: 6  },
      walk:   { sheet: 'slime1_walk',   cols: 8, frameRate: 8  },
      run:    { sheet: 'slime1_run',    cols: 8, frameRate: 10 },
      attack: { sheet: 'slime1_attack', cols: 10, frameRate: 12 },
      hurt:   { sheet: 'slime1_hurt',   cols: 5, frameRate: 10 },
      death:  { sheet: 'slime1_death',  cols: 10, frameRate: 8  },
    },
  },
  demon: {
    key: 'demon', hp: 120, dmg: 15, xp: 60, speed: 65,
    aggroRange: 350, atkRange: 60, atkCooldown: 1800, scale: 2.5,
    anims: {
      idle:   { prefix: 'demon_idle_',   count: 3, frameRate: 5  },
      walk:   { prefix: 'demon_walk_',   count: 6, frameRate: 8  },
      attack: { prefix: 'demon_attack_', count: 4, frameRate: 10 },
      hurt:   { prefix: 'demon_hurt_',   count: 2, frameRate: 8  },
      death:  { prefix: 'demon_death_',  count: 6, frameRate: 7  },
    },
  },
  vampire: {
    key: 'vamp1', hp: 80, dmg: 12, xp: 40, speed: 75,
    aggroRange: 320, atkRange: 50, atkCooldown: 1400, scale: 2.0,
    anims: {
      idle:   { sheet: 'vamp1_idle',   cols: 4,  frameRate: 6  },
      walk:   { sheet: 'vamp1_walk',   cols: 6,  frameRate: 8  },
      run:    { sheet: 'vamp1_run',    cols: 8,  frameRate: 10 },
      attack: { sheet: 'vamp1_attack', cols: 12, frameRate: 12 },
      hurt:   { sheet: 'vamp1_hurt',   cols: 4,  frameRate: 10 },
      death:  { sheet: 'vamp1_death',  cols: 11, frameRate: 8  },
    },
  },
  dragon_boss: {
    key: 'dragon', hp: 800, dmg: 28, xp: 300, speed: 50,
    aggroRange: 500, atkRange: 80, atkCooldown: 2200, scale: 3.5,
    isBoss: true,
    anims: {
      idle:       { prefix: 'dragon_idle_',        count: 3, frameRate: 4  },
      walk:       { prefix: 'dragon_walk_',        count: 5, frameRate: 7  },
      attack:     { prefix: 'dragon_attack_',      count: 4, frameRate: 9  },
      fire_attack:{ prefix: 'dragon_fire_attack_', count: 6, frameRate: 10 },
      hurt:       { prefix: 'dragon_hurt_',        count: 2, frameRate: 8  },
      death:      { prefix: 'dragon_death_',       count: 5, frameRate: 5  },
    },
  },
};

/* ── loot tables ───────────────────────────────────────────── */
const RARITIES = {
  common:    { color: '#cccccc', weight: 60 },
  magic:     { color: '#4488ff', weight: 25 },
  rare:      { color: '#ffdd44', weight: 12 },
  legendary: { color: '#ff8800', weight: 3  },
};
const LOOT_TABLE = [
  /* ── Weapons ─────────────────────────────────────────────── */
  { name: 'Rusty Sword',     type: 'weapon', rarity: 'common',    dmg: 5  },
  { name: 'Iron Axe',        type: 'weapon', rarity: 'common',    dmg: 8  },
  { name: 'Enchanted Blade', type: 'weapon', rarity: 'magic',     dmg: 14, str: 2 },
  { name: 'Frostbite Dagger',type: 'weapon', rarity: 'magic',     dmg: 12, dex: 3 },
  { name: 'Bloodfang',       type: 'weapon', rarity: 'rare',      dmg: 22, str: 5, critChance: 0.04 },
  { name: 'Voidcleaver',     type: 'weapon', rarity: 'rare',      dmg: 20, int: 4, will: 3 },
  { name: 'Hellreaver',      type: 'weapon', rarity: 'legendary', dmg: 35, str: 8, critChance: 0.08 },
  /* ── Armor ───────────────────────────────────────────────── */
  { name: 'Leather Vest',    type: 'armor',  rarity: 'common',    def: 3  },
  { name: 'Torn Leggings',   type: 'armor',  rarity: 'common',    def: 2  },
  { name: 'Chainmail',       type: 'armor',  rarity: 'magic',     def: 8,  str: 2 },
  { name: 'Wraithguard',     type: 'armor',  rarity: 'magic',     def: 6,  will: 3 },
  { name: 'Shadow Plate',    type: 'armor',  rarity: 'rare',      def: 15, str: 4, dex: 2 },
  { name: 'Demonhide Mantle',type: 'armor',  rarity: 'legendary', def: 24, str: 6, will: 5 },
  /* ── Potions ─────────────────────────────────────────────── */
  { name: 'Health Potion',   type: 'potion', rarity: 'common',    heal: 30 },
  { name: 'Greater Heal',    type: 'potion', rarity: 'magic',     heal: 60 },
  { name: 'Mana Potion',     type: 'potion', rarity: 'common',    manaRestore: 20 },
  { name: 'Greater Mana',    type: 'potion', rarity: 'magic',     manaRestore: 40 },
  /* ── Rings & Amulets ─────────────────────────────────────── */
  { name: 'Bone Ring',       type: 'ring',   rarity: 'common',    str: 2 },
  { name: 'Signet of Focus', type: 'ring',   rarity: 'magic',     int: 4, will: 2 },
  { name: 'Band of Agony',   type: 'ring',   rarity: 'rare',      critChance: 0.06, dex: 5 },
  { name: 'Tarnished Amulet',type: 'amulet', rarity: 'common',    will: 2 },
  { name: 'Soulchain',       type: 'amulet', rarity: 'rare',      str: 4, int: 4, def: 5 },
];

/* ═══════════════════════════════════════════════════════════════
   PERLIN NOISE
   ═══════════════════════════════════════════════════════════════ */
function createNoise2D(seed = 42) {
  const perm = new Uint8Array(512);
  let s = seed;
  const rng = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const G = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
  const lerp = (a, b, t) => a + t * (b - a);
  const dot = (g, x, y) => g[0] * x + g[1] * y;
  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = perm[perm[X]+Y]&7, ab = perm[perm[X]+Y+1]&7;
    const ba = perm[perm[X+1]+Y]&7, bb = perm[perm[X+1]+Y+1]&7;
    return lerp(
      lerp(dot(G[aa],xf,yf), dot(G[ba],xf-1,yf), u),
      lerp(dot(G[ab],xf,yf-1), dot(G[bb],xf-1,yf-1), u), v);
  };
}
function fbm(noise, x, y, oct = 4) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += noise(x*f, y*f)*a; a *= 0.5; f *= 2; }
  return v;
}

/* ═══════════════════════════════════════════════════════════════
   PATH GENERATION
   ═══════════════════════════════════════════════════════════════ */
function generatePaths(count, w, h, rng) {
  const paths = [];
  for (let i = 0; i < count; i++) {
    const vert = rng() > 0.5;
    let x0, y0, x1, y1;
    if (vert) { x0 = w*0.15+rng()*w*0.7; y0 = 0; x1 = w*0.15+rng()*w*0.7; y1 = h; }
    else { x0 = 0; y0 = h*0.15+rng()*h*0.7; x1 = w; y1 = h*0.15+rng()*h*0.7; }
    paths.push({
      x0, y0, x1, y1,
      cx1: x0+(x1-x0)*0.33+(rng()-0.5)*w*0.4, cy1: y0+(y1-y0)*0.33+(rng()-0.5)*h*0.4,
      cx2: x0+(x1-x0)*0.66+(rng()-0.5)*w*0.4, cy2: y0+(y1-y0)*0.66+(rng()-0.5)*h*0.4,
    });
  }
  return paths;
}
function bezierPoint(p, t) {
  const mt=1-t, mt2=mt*mt, mt3=mt2*mt, t2=t*t, t3=t2*t;
  return {
    x: mt3*p.x0+3*mt2*t*p.cx1+3*mt*t2*p.cx2+t3*p.x1,
    y: mt3*p.y0+3*mt2*t*p.cy1+3*mt*t2*p.cy2+t3*p.y1,
  };
}

/* ═══════════════════════════════════════════════════════════════
   BUILDING TEMPLATES
   ═══════════════════════════════════════════════════════════════ */
const COTTAGE_W = 7, COTTAGE_H = 6;
const COTTAGE_TILES = [
  [0,1,1,1,1,1,2],[9,10,10,10,10,10,11],[9,10,10,10,10,10,11],
  [9,10,10,10,10,10,11],[9,10,10,10,10,10,11],[18,19,19,19,19,19,20],
];

/* ═══════════════════════════════════════════════════════════════
   SCENE — DarkForestScene
   ═══════════════════════════════════════════════════════════════ */
class DarkForestScene extends Phaser.Scene {
  constructor(key = 'DarkForest') { super(key); }

  init(data) {
    // Read from module-level storage (most reliable) or from Phaser data arg
    const d = (__pendingSceneData && __pendingSceneData.syncFn) ? __pendingSceneData : (data || {});
    if (__pendingSceneData) __pendingSceneData = null;
    console.log('[DarkForest] init() called, chosenClass:', d.chosenClass?.id, 'hasSyncFn:', !!d.syncFn);
    this._syncFn = d.syncFn;
    this._addToBackpack = d.addToBackpack;
    this._sceneRef = d.sceneRef;
    this._chosenClass = d.chosenClass;
    this._savedData = d.savedData;
    this._onPlayerDeath = d.onPlayerDeath;
    this._onOpenTrade = d.onOpenTrade;
    this._onZoneChange = d.onZoneChange;
    if (this._sceneRef) this._sceneRef.current = this;
    // Register ForsakenCrypt scene if not already present
    if (!this.scene.manager.keys['ForsakenCrypt']) {
      this.scene.manager.add('ForsakenCrypt', ForsakenCryptScene, false);
    }
  }

  /* ── PRELOAD ───────────────────────────────────────────────── */
  preload() {
    this.load.on('loaderror', (file) => {
      console.error('[PRELOAD ERROR] Failed to load:', file.key, file.url);
    });
    this._preloadHero();

    // Trees & Rocks
    for (const t of TREE_DEFS) this.load.image(t.key, `${TREES}/${t.file}`);
    for (const r of ROCK_DEFS) this.load.image(r.key, `${ROCKS}/${r.file}`);

    // Building
    this.load.spritesheet('walls_floor', `${HOME}/walls_floor.png`, { frameWidth: 16, frameHeight: 16 });

    // Orc spritesheets (64x64 frames, 4 direction rows)
    this.load.spritesheet('orc1_idle',   `${ORCS}/Orc1/With_shadow/orc1_idle_with_shadow.png`,   { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('orc1_walk',   `${ORCS}/Orc1/With_shadow/orc1_walk_with_shadow.png`,   { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('orc1_run',    `${ORCS}/Orc1/With_shadow/orc1_run_with_shadow.png`,    { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('orc1_attack', `${ORCS}/Orc1/With_shadow/orc1_attack_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('orc1_hurt',   `${ORCS}/Orc1/With_shadow/orc1_hurt_with_shadow.png`,   { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('orc1_death',  `${ORCS}/Orc1/With_shadow/orc1_death_with_shadow.png`,  { frameWidth: 64, frameHeight: 64 });

    // Slime spritesheets (64x64 frames, 4 direction rows)
    this.load.spritesheet('slime1_idle',   `${SLIMES}/Slime1/With_shadow/Slime1_Idle_with_shadow.png`,   { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('slime1_walk',   `${SLIMES}/Slime1/With_shadow/Slime1_Walk_with_shadow.png`,   { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('slime1_run',    `${SLIMES}/Slime1/With_shadow/Slime1_Run_with_shadow.png`,    { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('slime1_attack', `${SLIMES}/Slime1/With_shadow/Slime1_Attack_with_shadow.png`, { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('slime1_hurt',   `${SLIMES}/Slime1/With_shadow/Slime1_Hurt_with_shadow.png`,   { frameWidth: 64, frameHeight: 64 });
    this.load.spritesheet('slime1_death',  `${SLIMES}/Slime1/With_shadow/Slime1_Death_with_shadow.png`,  { frameWidth: 64, frameHeight: 64 });

    // Demon (individual frames 256x256)
    const demonAnims = [
      { name: 'idle', count: 3 }, { name: 'walk', count: 6 }, { name: 'attack', count: 4 },
      { name: 'hurt', count: 2 }, { name: 'death', count: 6 },
    ];
    for (const a of demonAnims) {
      const folder = a.name.charAt(0).toUpperCase() + a.name.slice(1);
      for (let i = 1; i <= a.count; i++)
        this.load.image(`demon_${a.name}_${i}`, `${MONSTERS}/demon/${folder}${i}.png`);
    }

    // NPC (blacksmith)
    this.load.image('npc_blacksmith', 'assets/sprites/npc_merchant.png');

    // Portal
    this.load.image('portal_purple', 'assets/sprites/portal_purple.png');
  }

  /* ── shared hero preload ─────────────────────────────────── */
  _preloadHero() {
    const classId = this._chosenClass?.id || 'warrior';
    const heroDef = HERO_CLASSES[classId] || HERO_CLASSES.warrior;
    const heroPath = `${HERO_BASE}/${heroDef.folder}`;
    for (const a of heroDef.anims) {
      const folder = a.folder || a.name.charAt(0).toUpperCase() + a.name.slice(1);
      const prefix = a.filePrefix || a.name;
      for (let i = a.start; i < a.start + a.count; i++)
        this.load.image(`hero_${a.name}_${i}`, `${heroPath}/${folder}/${prefix}${i}.png`);
    }
  }

  /* ── CREATE ────────────────────────────────────────────────── */
  create() {
    // === ON-SCREEN DEBUG PANEL ===
    const _dbgLines = [];
    const _dbg = (msg) => { _dbgLines.push(msg); console.log('[DarkForest]', msg); };
    _dbg('create() START');
    _dbg('chosenClass: ' + (this._chosenClass?.id || 'NULL'));
    _dbg('syncFn: ' + (!!this._syncFn));

    try {
    this._currentZone = 'forest';
    this._transitioning = false;
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    const seed = 12345;
    const noise = createNoise2D(seed);
    let rngState = seed;
    const rng = () => { rngState = (rngState * 16807) % 2147483647; return rngState / 2147483647; };
    this._noise = noise;

    this.worldPaths = generatePaths(4, WORLD_W, WORLD_H, rng);
    const pathPoints = this._rasterizePaths(this.worldPaths);
    this._pathExclude = this._buildPathExclude(pathPoints);

    /* --- World layers --- */
    this._createGroundTexture(noise, pathPoints);
    this.staticObjects = this.physics.add.staticGroup();
    this.decorations = [];
    _dbg('ground OK');

    try { this._createBuildings(rng); _dbg('buildings OK'); } catch(e) { _dbg('buildings FAIL: ' + e.message); }
    try { this._scatterTrees(noise, rng); _dbg('trees OK: ' + this.decorations.length); } catch(e) { _dbg('trees FAIL: ' + e.message); }
    try { this._scatterRocks(noise, rng); _dbg('rocks OK'); } catch(e) { _dbg('rocks FAIL: ' + e.message); }

    /* --- Player --- */
    try {
      this._createPlayer();
      _dbg('player OK at ' + this.knight?.x + ',' + this.knight?.y + ' vis=' + this.knight?.visible + ' alpha=' + this.knight?.alpha + ' tex=' + this.knight?.texture?.key);
    } catch(e) { _dbg('player FAIL: ' + e.message); }

    /* --- Enemies --- */
    this.enemies = [];
    try { this._createEnemyAnims(); _dbg('enemyAnims OK'); } catch(e) { _dbg('enemyAnims FAIL: ' + e.message); }
    try { this._spawnEnemies(rng); _dbg('enemies OK: ' + this.enemies.length); } catch(e) { _dbg('enemies FAIL: ' + e.message); }

    /* --- Loot on ground --- */
    this.lootDrops = [];

    /* --- Physics --- */
    if (this.knight) this.physics.add.collider(this.knight, this.staticObjects);

    /* --- Camera --- */
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    if (this.knight) {
      cam.startFollow(this.knight, true, 0.09, 0.09);
      _dbg('camera following knight');
    } else {
      cam.scrollX = WORLD_W / 2 - cam.width / 2;
      cam.scrollY = WORLD_H / 2 - cam.height / 2;
      _dbg('camera CENTERED (no knight!)');
    }
    cam.setBackgroundColor('#0a0a08');

    /* --- Input --- */
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E,F,Q,R,SPACE');
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) this._playerAttack();
      else if (pointer.rightButtonDown()) this._updateWSkill();
    });
    try { this.input.mouse.disableContextMenu(); } catch (_) {
      try { this.game.input.mouse.disableContextMenu(); } catch (_2) {}
    }
    _dbg('input OK, keys=' + !!this.keys);

    /* --- Player state (from class + save) --- */
    const cls = this._chosenClass || {};
    const sv = this._savedData || {};
    this.playerData = {
      hp: sv.hp ?? cls.hp ?? 100,
      maxHp: sv.maxHp ?? cls.hp ?? 100,
      mana: sv.mana ?? cls.mana ?? 50,
      maxMana: sv.maxMana ?? cls.mana ?? 50,
      xp: sv.xp ?? 0, xpToLevel: sv.xpToLevel ?? 100,
      level: sv.level ?? 1, gold: sv.gold ?? 0,
      baseDmg: sv.baseDmg ?? cls.baseDmg ?? 12,
      critChance: sv.critChance ?? (cls.critChance ?? 15) / 100,
      isAttacking: false, whirlwinding: false,
      skills: { q: 0, w: 0, e: 0, r: 0, eActive: false },
    };
    if (sv._equipBonusDmg != null) {
      this.playerData._equipBonusDmg = sv._equipBonusDmg;
      this.playerData._equipBonusDef = sv._equipBonusDef;
      this.playerData._equipBonusCrit = sv._equipBonusCrit;
    }
    this._isDead = false;

    /* --- Timers --- */
    this._atkCooldown = 0;
    this._hitStopTimer = 0;
    this._syncTimer = 0;
    this._cullTimer = 0;
    this._manaRegen = 0;
    this._whirlTimer = 0;
    this._frostCooldown = 0;
    this._dashCooldown = 0;
    this._qCooldown = 0;
    this._wCooldown = 0;
    this._rCooldown = 0;
    this._furyActive = false;

    try {
      this.npc = this.physics.add.sprite(NPC_POS.x, NPC_POS.y, 'npc_blacksmith');
      this.npc.setScale(2.2).setDepth(NPC_POS.y).setImmovable(true);
      this.npc.body.setImmovable(true);
      if (this.knight) this.physics.add.collider(this.knight, this.npc);
      this._npcLabel = this.add.text(NPC_POS.x, NPC_POS.y - 55, '[E] Trade', {
        fontSize: '11px', fontFamily: "'Cinzel', serif", color: '#c8a96e',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(10001).setVisible(false);
      _dbg('npc OK');
    } catch(e) { _dbg('npc FAIL: ' + e.message); }

    try {
      this.portal = this.physics.add.sprite(FOREST_PORTAL_POS.x, FOREST_PORTAL_POS.y, 'portal_purple');
      this.portal.setScale(2.5).setDepth(FOREST_PORTAL_POS.y);
      this.portal.body.setImmovable(true);
      this._portalLabel = this.add.text(FOREST_PORTAL_POS.x, FOREST_PORTAL_POS.y - 55, '[E] Enter Crypt', {
        fontSize: '11px', fontFamily: "'Cinzel', serif", color: '#aa88ff',
        stroke: '#000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(10001).setVisible(false);
      _dbg('portal OK');
    } catch(e) { _dbg('portal FAIL: ' + e.message); }

    try { this._createAtmosphere(); } catch(e) { _dbg('atmo FAIL: ' + e.message); }
    this._syncState();
    if (this._onZoneChange) this._onZoneChange('forest');
    this.cameras.main.fadeIn(800);

    try { this._createMinimap(); _dbg('minimap OK'); } catch(e) { _dbg('minimap FAIL: ' + e.message); }
    _dbg('create() COMPLETE');
    } catch (fatalErr) {
      _dbg('FATAL: ' + fatalErr.message);
      console.error('[DarkForest] create() FATAL:', fatalErr);
    }

  }

  /* ── ENEMY ANIMATIONS ──────────────────────────────────── */
  _createEnemyAnims() {
    // Orc (spritesheet, row 0 = first direction)
    for (const [state, info] of Object.entries(ENEMY_TYPES.orc.anims)) {
      const key = `orc1_${state}`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(info.sheet, { start: 0, end: info.cols - 1 }),
          frameRate: info.frameRate,
          repeat: state === 'death' ? 0 : -1,
        });
      }
    }
    // Slime (spritesheet)
    for (const [state, info] of Object.entries(ENEMY_TYPES.slime.anims)) {
      const key = `slime1_${state}`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(info.sheet, { start: 0, end: info.cols - 1 }),
          frameRate: info.frameRate,
          repeat: state === 'death' ? 0 : -1,
        });
      }
    }
    // Demon (individual frames)
    for (const [state, info] of Object.entries(ENEMY_TYPES.demon.anims)) {
      const key = `demon_${state}`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: Array.from({ length: info.count }, (_, i) => ({ key: `${info.prefix}${i + 1}` })),
          frameRate: info.frameRate,
          repeat: state === 'death' ? 0 : -1,
        });
      }
    }
    // Vampire (spritesheet — only if loaded, used in crypt)
    if (this.textures.exists('vamp1_idle')) {
      for (const [state, info] of Object.entries(ENEMY_TYPES.vampire.anims)) {
        const key = `vamp1_${state}`;
        if (!this.anims.exists(key)) {
          this.anims.create({
            key,
            frames: this.anims.generateFrameNumbers(info.sheet, { start: 0, end: info.cols - 1 }),
            frameRate: info.frameRate,
            repeat: state === 'death' ? 0 : -1,
          });
        }
      }
    }
  }
  _spawnEnemies(rng) {
    const MARGIN = 120;
    const spawnDefs = [
      { type: 'orc',   count: 18 },
      { type: 'slime', count: 22 },
      { type: 'demon', count: 6  },
    ];
    for (const sd of spawnDefs) {
      const typeDef = ENEMY_TYPES[sd.type];
      let placed = 0;
      for (let attempt = 0; attempt < 2000 && placed < sd.count; attempt++) {
        const x = MARGIN + rng() * (WORLD_W - MARGIN * 2);
        const y = MARGIN + rng() * (WORLD_H - MARGIN * 2);
        const gx = Math.floor(x / 48), gy = Math.floor(y / 48);
        if (this._pathExclude.has(`${gx},${gy}`)) continue;
        if (this._nearBuilding(x, y, 250)) continue;
        if (Math.hypot(x - WORLD_W / 2, y - WORLD_H / 2) < 400) continue;
        this._createEnemy(x, y, sd.type, typeDef);
        placed++;
      }
    }
  }

  _createEnemy(x, y, type, def) {
    const firstAnim = `${def.key}_idle`;
    const enemy = def.anims.idle.sheet
      ? this.physics.add.sprite(x, y, def.anims.idle.sheet, 0)
      : this.physics.add.sprite(x, y, `${def.anims.idle.prefix}1`);

    enemy.setScale(def.scale).setDepth(y).setCollideWorldBounds(true);
    enemy.body.setSize(24, 16).setOffset(20, 40);
    enemy.play(firstAnim);

    enemy.enemyData = {
      type, hp: def.hp, maxHp: def.hp, dmg: def.dmg,
      xp: def.xp, speed: def.speed,
      aggroRange: def.aggroRange, atkRange: def.atkRange,
      atkCooldown: def.atkCooldown,
      state: 'wander', isDead: false,
      wanderTimer: 0, wanderDirX: 0, wanderDirY: 0,
      atkTimer: 0, animKey: def.key,
    };

    // HP bars
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x000000, 0.7).fillRect(-20, -4, 40, 6).setDepth(y + 1);
    enemy.hpBg = hpBg;
    const hpFg = this.add.graphics();
    hpFg.fillStyle(0xcc2222).fillRect(-19, -3, 38, 4).setDepth(y + 2);
    enemy.hpFg = hpFg;

    this.enemies.push(enemy);
  }

  /* ── PLAYER ATTACK ──────────────────────────────────────── */
  _playerAttack() {
    if (this._atkCooldown > 0 || this.playerData.isAttacking) return;
    this.playerData.isAttacking = true;
    this._atkCooldown = 500;

    this.knight.play('hero_attack', true);
    this.knight.once('animationcomplete-hero_attack', () => {
      this.playerData.isAttacking = false;
    });

    const facingRight = !this.knight.flipX;
    const atkX = this.knight.x + (facingRight ? 50 : -50);
    const atkY = this.knight.y;

    const equipDmg = this.playerData._equipBonusDmg || 0;
    const equipCrit = this.playerData._equipBonusCrit || 0;
    for (const e of this.enemies) {
      if (e.enemyData.isDead) continue;
      if (Math.hypot(e.x - atkX, e.y - atkY) < 100) {
        const isCrit = Math.random() < (this.playerData.critChance + equipCrit);
        const dmg = Math.floor((this.playerData.baseDmg + equipDmg) * (isCrit ? 2.2 : 1) * (0.85 + Math.random() * 0.3));
        this._damageEnemy(e, dmg, isCrit);
      }
    }
  }

  /* ── WHIRLWIND ──────────────────────────────────────────── */
  _updateWhirlwind(delta) {
    const pd = this.playerData;
    if (this.keys.E.isDown && pd.mana > 0 && !pd.isAttacking) {
      pd.whirlwinding = true;
      pd.skills.eActive = true;
      pd.mana = Math.max(0, pd.mana - delta * 0.02);
      this.knight.angle += delta * 0.8;

      this._whirlTimer += delta;
      if (this._whirlTimer > 200) {
        this._whirlTimer = 0;
        for (const e of this.enemies) {
          if (e.enemyData.isDead) continue;
          if (Math.hypot(e.x - this.knight.x, e.y - this.knight.y) < 90) {
            const dmg = Math.floor(pd.baseDmg * 0.6 * (0.9 + Math.random() * 0.2));
            this._damageEnemy(e, dmg, false);
          }
        }
      }
    } else if (pd.whirlwinding) {
      pd.whirlwinding = false;
      pd.skills.eActive = false;
      this.knight.angle = 0;
    }
  }

  /* ── CLASS-AWARE E SKILL ────────────────────────────────── */
  _updateESkill(delta) {
    const classId = this._chosenClass?.id || 'warrior';
    if (classId === 'warrior') this._updateWhirlwind(delta);
    else if (classId === 'mage') this._updateFrostNova();
    else if (classId === 'rogue') this._updateShadowDash();
  }

  /* ── FROST NOVA (Mage E) ────────────────────────────────── */
  _updateFrostNova() {
    const pd = this.playerData;
    if (this._frostCooldown > 0 || pd.isAttacking) return;
    if (!Phaser.Input.Keyboard.JustDown(this.keys.E)) return;
    if (pd.mana < 25) return;

    pd.mana -= 25;
    this._frostCooldown = 5000;

    // Blue circle burst
    const cx = this.knight.x, cy = this.knight.y;
    const ring = this.add.graphics().setDepth(10000);
    ring.lineStyle(3, 0x4488ff, 0.6);
    ring.strokeCircle(cx, cy, 10);
    let radius = 10;
    const expandEvent = this.time.addEvent({
      delay: 16, repeat: 24,
      callback: () => {
        radius += 4.5;
        ring.clear();
        ring.lineStyle(3, 0x4488ff, 0.6 - (radius / 120) * 0.6);
        ring.strokeCircle(cx, cy, radius);
      },
    });
    this.time.delayedCall(420, () => ring.destroy());

    // Frost particles
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const g = this.add.graphics().setDepth(10000);
      g.fillStyle(0x66bbff, 0.7);
      g.fillCircle(0, 0, 3);
      g.setPosition(cx, cy);
      this.tweens.add({
        targets: g,
        x: cx + Math.cos(angle) * 120,
        y: cy + Math.sin(angle) * 120,
        alpha: 0, duration: 400,
        onComplete: () => g.destroy(),
      });
    }

    // Damage + freeze enemies in range
    const equipDmg = pd._equipBonusDmg || 0;
    for (const e of this.enemies) {
      if (e.enemyData.isDead) continue;
      if (Math.hypot(e.x - cx, e.y - cy) < 120) {
        const dmg = Math.floor((pd.baseDmg + equipDmg) * 0.8 * (0.9 + Math.random() * 0.2));
        this._damageEnemy(e, dmg, false);
        // Freeze
        e.setTint(0x6688ff);
        const prevSpeed = e.enemyData.speed;
        e.enemyData.speed = 0;
        e.enemyData.state = 'hurt';
        e.body.setVelocity(0, 0);
        this.time.delayedCall(2000, () => {
          if (!e.enemyData.isDead) {
            e.clearTint();
            e.enemyData.speed = prevSpeed;
            e.enemyData.state = 'wander';
          }
        });
      }
    }
    this.cameras.main.flash(200, 100, 150, 255, false);
  }

  /* ── SHADOW DASH (Rogue E) ──────────────────────────────── */
  _updateShadowDash() {
    const pd = this.playerData;
    if (this._dashCooldown > 0 || pd.isAttacking || pd.whirlwinding) return;
    if (!Phaser.Input.Keyboard.JustDown(this.keys.E)) return;
    if (pd.mana < 15) return;

    pd.mana -= 15;
    this._dashCooldown = 3000;

    const dir = this.playerFacing === 'right' ? 1 : -1;
    const startX = this.knight.x;
    const worldW = this.physics.world.bounds.width;
    const endX = Phaser.Math.Clamp(startX + dir * 200, 50, worldW - 50);
    const dashY = this.knight.y;

    // Shadow trail
    for (let i = 0; i < 5; i++) {
      const shadowX = startX + (endX - startX) * (i / 5);
      const shadow = this.add.sprite(shadowX, dashY, this.knight.texture.key, this.knight.frame?.name);
      shadow.setScale(this.knight.scaleX, this.knight.scaleY).setFlipX(this.knight.flipX);
      shadow.setAlpha(0.5).setTint(0x220044).setDepth(dashY - 1);
      this.tweens.add({ targets: shadow, alpha: 0, duration: 500, delay: i * 50, onComplete: () => shadow.destroy() });
    }

    // Teleport
    this.knight.setPosition(endX, dashY);

    // Damage enemies in path
    const equipDmg = pd._equipBonusDmg || 0;
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    for (const e of this.enemies) {
      if (e.enemyData.isDead) continue;
      if (e.x >= minX - 40 && e.x <= maxX + 40 && Math.abs(e.y - dashY) < 60) {
        const dmg = Math.floor((pd.baseDmg + equipDmg) * (0.9 + Math.random() * 0.2));
        this._damageEnemy(e, dmg, false);
      }
    }
    this.cameras.main.flash(100, 50, 0, 80, false);
  }

  /* ── Q SKILL DISPATCH ───────────────────────────────────── */
  _updateQSkill() {
    if (this._qCooldown > 0 || this.playerData.isAttacking) return;
    if (!Phaser.Input.Keyboard.JustDown(this.keys.Q)) return;
    const classId = this._chosenClass?.id || 'warrior';
    if (classId === 'warrior') this._warriorCleave();
    else if (classId === 'mage') this._mageIceShard();
    else if (classId === 'rogue') this._rogueDaggerSlash();
  }

  /* ── WARRIOR Q: CLEAVE ──────────────────────────────────── */
  _warriorCleave() {
    const pd = this.playerData;
    if (pd.mana < 10) return;
    pd.mana -= 10;
    this._qCooldown = 2000;
    pd.isAttacking = true;

    this.knight.play('hero_attack', true);
    this.knight.once('animationcomplete-hero_attack', () => { pd.isAttacking = false; });

    // Cone visual
    const facingRight = !this.knight.flipX;
    const cx = this.knight.x + (facingRight ? 30 : -30);
    const cy = this.knight.y;
    const arc = this.add.graphics().setDepth(10000);
    arc.fillStyle(0xff6622, 0.25);
    arc.slice(cx, cy, 110, facingRight ? -0.6 : Math.PI - 0.6, facingRight ? 0.6 : Math.PI + 0.6, false);
    arc.fillPath();
    this.tweens.add({ targets: arc, alpha: 0, duration: 350, onComplete: () => arc.destroy() });

    // Hit enemies in front cone
    const equipDmg = pd._equipBonusDmg || 0;
    const equipCrit = pd._equipBonusCrit || 0;
    for (const e of this.enemies) {
      if (e.enemyData.isDead) continue;
      const dx = e.x - this.knight.x, dy = e.y - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > 110) continue;
      const angle = Math.atan2(dy, dx);
      const facing = facingRight ? 0 : Math.PI;
      let diff = Math.abs(angle - facing);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;
      if (diff < 0.8) {
        const isCrit = Math.random() < (pd.critChance + equipCrit);
        const dmg = Math.floor((pd.baseDmg + equipDmg) * 1.6 * (isCrit ? 2.2 : 1) * (0.9 + Math.random() * 0.2));
        this._damageEnemy(e, dmg, isCrit);
      }
    }
    this.cameras.main.shake(100, 0.006);
  }

  /* ── MAGE Q: ICE SHARD ─────────────────────────────────── */
  _mageIceShard() {
    const pd = this.playerData;
    if (pd.mana < 12) return;
    pd.mana -= 12;
    this._qCooldown = 1200;

    this.knight.play('hero_attack', true);
    this.knight.once('animationcomplete-hero_attack', () => { pd.isAttacking = false; });
    pd.isAttacking = true;

    const facingRight = !this.knight.flipX;
    const dir = facingRight ? 1 : -1;
    const sx = this.knight.x + dir * 20;
    const sy = this.knight.y - 10;

    // Create shard projectile
    const shard = this.add.graphics().setDepth(10000);
    shard.fillStyle(0x66bbff, 0.9);
    shard.fillCircle(0, 0, 6);
    shard.fillStyle(0xaaddff, 0.5);
    shard.fillCircle(0, 0, 10);
    shard.setPosition(sx, sy);

    const speed = 450;
    const maxDist = 400;
    let traveled = 0;
    let hit = false;

    const ev = this.time.addEvent({
      delay: 16, repeat: Math.ceil(maxDist / (speed * 0.016)) + 2,
      callback: () => {
        if (hit) return;
        const step = speed * 0.016;
        shard.x += dir * step;
        traveled += step;

        // Trail
        const trail = this.add.graphics().setDepth(9999);
        trail.fillStyle(0x4488ff, 0.3);
        trail.fillCircle(0, 0, 4);
        trail.setPosition(shard.x - dir * 8, shard.y);
        this.tweens.add({ targets: trail, alpha: 0, duration: 200, onComplete: () => trail.destroy() });

        // Hit check
        const equipDmg = pd._equipBonusDmg || 0;
        for (const e of this.enemies) {
          if (e.enemyData.isDead) continue;
          if (Math.hypot(e.x - shard.x, e.y - shard.y) < 45) {
            const dmg = Math.floor((pd.baseDmg + equipDmg) * 1.4 * (0.9 + Math.random() * 0.2));
            this._damageEnemy(e, dmg, false);
            hit = true;
            // Freeze briefly
            e.setTint(0x88bbff);
            this.time.delayedCall(800, () => { if (!e.enemyData.isDead) e.clearTint(); });
            break;
          }
        }
        if (traveled >= maxDist || hit) {
          // Burst
          const burst = this.add.graphics().setDepth(10000);
          burst.fillStyle(0x66bbff, 0.4);
          burst.fillCircle(shard.x, shard.y, 20);
          this.tweens.add({ targets: burst, alpha: 0, scale: 2, duration: 250, onComplete: () => burst.destroy() });
          shard.destroy();
          ev.destroy();
        }
      },
    });
  }

  /* ── ROGUE Q: DAGGER SLASH ──────────────────────────────── */
  _rogueDaggerSlash() {
    const pd = this.playerData;
    if (pd.mana < 8) return;
    pd.mana -= 8;
    this._qCooldown = 800;
    pd.isAttacking = true;

    this.knight.play('hero_attack', true);
    this.knight.once('animationcomplete-hero_attack', () => { pd.isAttacking = false; });

    const facingRight = !this.knight.flipX;
    const atkX = this.knight.x + (facingRight ? 50 : -50);
    const atkY = this.knight.y;
    const equipDmg = pd._equipBonusDmg || 0;
    const equipCrit = pd._equipBonusCrit || 0;

    // Double hit: immediate + 150ms delay
    const doHit = () => {
      for (const e of this.enemies) {
        if (e.enemyData.isDead) continue;
        if (Math.hypot(e.x - atkX, e.y - atkY) < 80) {
          const isCrit = Math.random() < (pd.critChance + equipCrit + 0.15);
          const dmg = Math.floor((pd.baseDmg + equipDmg) * 0.7 * (isCrit ? 2.2 : 1) * (0.9 + Math.random() * 0.2));
          this._damageEnemy(e, dmg, isCrit);
        }
      }
    };

    doHit();
    this.time.delayedCall(150, doHit);

    // Slash visual
    for (let i = 0; i < 2; i++) {
      const slash = this.add.graphics().setDepth(10000);
      slash.lineStyle(2, 0xdddddd, 0.7);
      const ox = this.knight.x + (facingRight ? 20 : -20);
      const oy = this.knight.y - 15 + i * 20;
      slash.beginPath();
      slash.moveTo(ox, oy);
      slash.lineTo(ox + (facingRight ? 60 : -60), oy + (i === 0 ? -10 : 10));
      slash.strokePath();
      this.tweens.add({ targets: slash, alpha: 0, duration: 250, delay: i * 100, onComplete: () => slash.destroy() });
    }
  }

  /* ── W SKILL DISPATCH (Right-click / Space) ─────────────── */
  _updateWSkill() {
    if (this._wCooldown > 0 || this.playerData.isAttacking || this.playerData.whirlwinding) return;
    const classId = this._chosenClass?.id || 'warrior';
    if (classId === 'warrior') this._warriorBash();
    else if (classId === 'mage') this._mageArcanePulse();
    else if (classId === 'rogue') this._rogueSmokeBomb();
  }

  /* ── WARRIOR W: SHIELD BASH ─────────────────────────────── */
  _warriorBash() {
    const pd = this.playerData;
    if (pd.mana < 10) return;
    pd.mana -= 10;
    this._wCooldown = 3000;
    pd.isAttacking = true;

    this.knight.play('hero_attack', true);
    this.knight.once('animationcomplete-hero_attack', () => { pd.isAttacking = false; });

    const facingRight = !this.knight.flipX;
    const bx = this.knight.x + (facingRight ? 45 : -45);
    const by = this.knight.y;

    // Impact flash
    const flash = this.add.graphics().setDepth(10000);
    flash.fillStyle(0xffcc33, 0.4);
    flash.fillCircle(bx, by, 35);
    this.tweens.add({ targets: flash, alpha: 0, scale: 1.5, duration: 200, onComplete: () => flash.destroy() });

    const equipDmg = pd._equipBonusDmg || 0;
    for (const e of this.enemies) {
      if (e.enemyData.isDead) continue;
      if (Math.hypot(e.x - bx, e.y - by) < 70) {
        const dmg = Math.floor((pd.baseDmg + equipDmg) * 1.2 * (0.9 + Math.random() * 0.2));
        this._damageEnemy(e, dmg, false);
        // Stun: freeze enemy for 1.5s
        e.enemyData._stunned = true;
        e.setTint(0xffff66);
        e.body.setVelocity(0, 0);
        this.time.delayedCall(1500, () => {
          if (!e.enemyData.isDead) { e.enemyData._stunned = false; e.clearTint(); }
        });
        // Extra knockback
        const angle = Math.atan2(e.y - this.knight.y, e.x - this.knight.x);
        e.body.setVelocity(Math.cos(angle) * 350, Math.sin(angle) * 350);
        this.time.delayedCall(250, () => { if (!e.enemyData.isDead) e.body.setVelocity(0, 0); });
      }
    }
    this.cameras.main.shake(80, 0.005);
  }

  /* ── MAGE W: ARCANE PULSE ───────────────────────────────── */
  _mageArcanePulse() {
    const pd = this.playerData;
    if (pd.mana < 14) return;
    pd.mana -= 14;
    this._wCooldown = 3500;
    pd.isAttacking = true;

    this.knight.play('hero_attack', true);
    this.knight.once('animationcomplete-hero_attack', () => { pd.isAttacking = false; });

    // AoE ring expanding outward
    const ring = this.add.graphics().setDepth(10000);
    const cx = this.knight.x, cy = this.knight.y;
    let radius = 20;
    const maxR = 130;
    const equipDmg = pd._equipBonusDmg || 0;
    const hitSet = new Set();

    const ev = this.time.addEvent({
      delay: 16, repeat: 20,
      callback: () => {
        radius += 6;
        ring.clear();
        ring.lineStyle(4, 0x9944ff, 0.6 * (1 - radius / maxR));
        ring.strokeCircle(cx, cy, radius);

        for (const e of this.enemies) {
          if (e.enemyData.isDead || hitSet.has(e)) continue;
          if (Math.hypot(e.x - cx, e.y - cy) < radius + 30) {
            hitSet.add(e);
            const dmg = Math.floor((pd.baseDmg + equipDmg) * 0.9 * (0.9 + Math.random() * 0.2));
            this._damageEnemy(e, dmg, false);
            // Push enemies outward
            const angle = Math.atan2(e.y - cy, e.x - cx);
            e.body.setVelocity(Math.cos(angle) * 300, Math.sin(angle) * 300);
            this.time.delayedCall(300, () => { if (!e.enemyData.isDead) e.body.setVelocity(0, 0); });
          }
        }
        if (radius >= maxR) { ring.destroy(); ev.destroy(); }
      },
    });
    this.cameras.main.flash(80, 80, 0, 120, false);
  }

  /* ── ROGUE W: SMOKE BOMB ────────────────────────────────── */
  _rogueSmokeBomb() {
    const pd = this.playerData;
    if (pd.mana < 12) return;
    pd.mana -= 12;
    this._wCooldown = 5000;

    const sx = this.knight.x, sy = this.knight.y;

    // Smoke cloud (several fading circles)
    for (let i = 0; i < 8; i++) {
      const g = this.add.graphics().setDepth(10000);
      g.fillStyle(0x444444, 0.35);
      g.fillCircle(0, 0, 20 + Math.random() * 25);
      g.setPosition(sx + (Math.random() - 0.5) * 60, sy + (Math.random() - 0.5) * 40);
      this.tweens.add({
        targets: g, alpha: 0, y: g.y - 30, scale: 1.5,
        duration: 1500 + Math.random() * 500,
        onComplete: () => g.destroy(),
      });
    }

    // Invisibility: enemies lose aggro for 2.5s
    this.knight.setAlpha(0.3);
    pd._invisible = true;
    for (const e of this.enemies) {
      if (!e.enemyData.isDead && e.enemyData.state === 'chase') {
        e.enemyData.state = 'wander';
        e.body.setVelocity(0, 0);
      }
    }
    this.time.delayedCall(2500, () => {
      this.knight.setAlpha(1);
      pd._invisible = false;
    });
  }

  /* ── R SKILL DISPATCH (Ultimate) ────────────────────────── */
  _updateRSkill() {
    if (this._rCooldown > 0 || this.playerData.isAttacking || this.playerData.whirlwinding) return;
    if (!Phaser.Input.Keyboard.JustDown(this.keys.R)) return;
    const classId = this._chosenClass?.id || 'warrior';
    if (classId === 'warrior') this._warriorFury();
    else if (classId === 'mage') this._mageMeteor();
    else if (classId === 'rogue') this._rogueAssassinate();
  }

  /* ── WARRIOR R: BATTLE FURY ─────────────────────────────── */
  _warriorFury() {
    const pd = this.playerData;
    if (pd.mana < 30) return;
    pd.mana -= 30;
    this._rCooldown = 15000;

    // Buff: +60% damage, speed boost for 6s
    this._furyActive = true;
    this._furyTimer = 6000;
    this._furyDmgBonus = Math.floor(pd.baseDmg * 0.6);
    pd._equipBonusDmg = (pd._equipBonusDmg || 0) + this._furyDmgBonus;

    // Red aura ring around player
    this._furyAura = this.add.graphics().setDepth(9000);
    const pulseAura = () => {
      if (!this._furyActive || !this._furyAura) return;
      this._furyAura.clear();
      this._furyAura.lineStyle(3, 0xff2222, 0.4 + Math.sin(this.time.now / 200) * 0.2);
      this._furyAura.strokeCircle(this.knight.x, this.knight.y, 50);
      this._furyAura.fillStyle(0xff0000, 0.05);
      this._furyAura.fillCircle(this.knight.x, this.knight.y, 45);
    };
    this._furyAuraEvent = this.time.addEvent({ delay: 30, loop: true, callback: pulseAura });

    this.knight.setTint(0xff6666);
    this.cameras.main.flash(200, 120, 0, 0, false);
  }

  _endFuryBuff() {
    if (!this._furyActive) return;
    this._furyActive = false;
    const pd = this.playerData;
    pd._equipBonusDmg = Math.max(0, (pd._equipBonusDmg || 0) - (this._furyDmgBonus || 0));
    this._furyDmgBonus = 0;
    this.knight.clearTint();
    if (this._furyAuraEvent) { this._furyAuraEvent.destroy(); this._furyAuraEvent = null; }
    if (this._furyAura) { this._furyAura.destroy(); this._furyAura = null; }
  }

  /* ── MAGE R: METEOR STORM ───────────────────────────────── */
  _mageMeteor() {
    const pd = this.playerData;
    if (pd.mana < 35) return;
    pd.mana -= 35;
    this._rCooldown = 18000;

    // Get world pointer position for target area
    const ptr = this.input.activePointer;
    const tx = ptr.worldX;
    const ty = ptr.worldY;
    const equipDmg = pd._equipBonusDmg || 0;

    // 3 meteors with staggered delay
    for (let i = 0; i < 3; i++) {
      const ox = tx + (Math.random() - 0.5) * 100;
      const oy = ty + (Math.random() - 0.5) * 80;

      this.time.delayedCall(i * 600, () => {
        // Warning circle
        const warn = this.add.graphics().setDepth(9999);
        warn.lineStyle(2, 0xff4400, 0.5);
        warn.strokeCircle(ox, oy, 60);
        warn.fillStyle(0xff2200, 0.08);
        warn.fillCircle(ox, oy, 60);

        this.time.delayedCall(500, () => {
          warn.destroy();
          // Impact
          const impact = this.add.graphics().setDepth(10000);
          impact.fillStyle(0xff6600, 0.5);
          impact.fillCircle(ox, oy, 70);
          impact.fillStyle(0xffaa00, 0.3);
          impact.fillCircle(ox, oy, 40);
          this.tweens.add({ targets: impact, alpha: 0, scale: 1.8, duration: 500, onComplete: () => impact.destroy() });

          // Outer ring
          const ring = this.add.graphics().setDepth(10000);
          ring.lineStyle(4, 0xff8800, 0.6);
          ring.strokeCircle(ox, oy, 50);
          this.tweens.add({ targets: ring, alpha: 0, scale: 2, duration: 400, onComplete: () => ring.destroy() });

          this.cameras.main.shake(200, 0.015);

          // Damage enemies
          for (const e of this.enemies) {
            if (e.enemyData.isDead) continue;
            if (Math.hypot(e.x - ox, e.y - oy) < 80) {
              const dmg = Math.floor((pd.baseDmg + equipDmg) * 2.5 * (0.9 + Math.random() * 0.2));
              this._damageEnemy(e, dmg, true);
            }
          }
        });
      });
    }
  }

  /* ── ROGUE R: ASSASSINATE ───────────────────────────────── */
  _rogueAssassinate() {
    const pd = this.playerData;
    if (pd.mana < 25) return;
    pd.mana -= 25;
    this._rCooldown = 12000;

    // Find nearest alive enemy
    let nearest = null, minDist = 600;
    for (const e of this.enemies) {
      if (e.enemyData.isDead) continue;
      const d = Math.hypot(e.x - this.knight.x, e.y - this.knight.y);
      if (d < minDist) { minDist = d; nearest = e; }
    }
    if (!nearest) { this._rCooldown = 0; pd.mana += 25; return; } // refund if no target

    // Mark target
    const mark = this.add.graphics().setDepth(10001);
    mark.lineStyle(2, 0xff0000, 0.8);
    mark.strokeCircle(nearest.x, nearest.y, 30);
    const cross1 = this.add.graphics().setDepth(10001);
    cross1.lineStyle(2, 0xff0000, 0.6);
    cross1.lineBetween(nearest.x - 15, nearest.y - 15, nearest.x + 15, nearest.y + 15);
    cross1.lineBetween(nearest.x + 15, nearest.y - 15, nearest.x - 15, nearest.y + 15);

    // Brief vanish
    this.knight.setAlpha(0.1);
    pd.isAttacking = true;

    this.time.delayedCall(300, () => {
      mark.destroy(); cross1.destroy();

      // Teleport behind enemy
      const behind = nearest.flipX ? 40 : -40;
      this.knight.setPosition(nearest.x + behind, nearest.y);
      this.knight.setAlpha(1);
      this.knight.setFlipX(behind > 0);

      // Guaranteed crit massive hit
      this.knight.play('hero_attack', true);
      this.knight.once('animationcomplete-hero_attack', () => { pd.isAttacking = false; });

      const equipDmg = pd._equipBonusDmg || 0;
      const equipCrit = pd._equipBonusCrit || 0;
      const dmg = Math.floor((pd.baseDmg + equipDmg) * 4 * (0.9 + Math.random() * 0.2));
      this._damageEnemy(nearest, dmg, true);

      // Blood burst effect
      for (let i = 0; i < 12; i++) {
        const g = this.add.graphics().setDepth(10000);
        g.fillStyle(0x880000, 0.6);
        g.fillCircle(0, 0, 3 + Math.random() * 4);
        g.setPosition(nearest.x + (Math.random() - 0.5) * 50, nearest.y + (Math.random() - 0.5) * 40);
        this.tweens.add({
          targets: g, alpha: 0, x: g.x + (Math.random() - 0.5) * 60, y: g.y - 20 - Math.random() * 30,
          duration: 600 + Math.random() * 400, onComplete: () => g.destroy(),
        });
      }

      this.cameras.main.shake(150, 0.012);
      this.cameras.main.flash(100, 60, 0, 0, false);
    });
  }

  /* ── PHASER MINIMAP CAMERA ──────────────────────────────── */
  _createMinimap() {
    const mmSize = 160;
    const worldW = this.physics.world.bounds.width;
    const worldH = this.physics.world.bounds.height;

    // Secondary camera following player, zoomed out
    const miniCam = this.cameras.add(
      this.cameras.main.width - mmSize - 16, 16,
      mmSize, mmSize
    );
    miniCam.setZoom(mmSize / worldW);
    miniCam.startFollow(this.knight);
    miniCam.setBackgroundColor('#0a160a');
    miniCam.setName('minimap');
    miniCam.setRoundPixels(true);

    // Ignore small decorations and particles on minimap
    for (const d of this.decorations) miniCam.ignore(d);
    if (this.npc) miniCam.ignore(this.npc);
    if (this._npcLabel) miniCam.ignore(this._npcLabel);
    if (this._portalLabel) miniCam.ignore(this._portalLabel);

    // Circular mask
    const maskShape = this.make.graphics({ add: false });
    maskShape.fillStyle(0xffffff);
    maskShape.fillCircle(
      this.cameras.main.width - mmSize / 2 - 16,
      mmSize / 2 + 16,
      mmSize / 2 - 2
    );
    miniCam.setMask(new Phaser.Display.Masks.GeometryMask(this, maskShape));

    // Border ring (drawn on HUD layer, scroll-factor 0)
    const border = this.add.graphics().setScrollFactor(0).setDepth(9999);
    border.lineStyle(2, 0x3a2a18, 1);
    border.strokeCircle(
      this.cameras.main.width - mmSize / 2 - 16,
      mmSize / 2 + 16,
      mmSize / 2
    );
    border.lineStyle(1, 0x554433, 0.7);
    border.strokeCircle(
      this.cameras.main.width - mmSize / 2 - 16,
      mmSize / 2 + 16,
      mmSize / 2 - 3
    );
    // Make the main camera ignore the border (it's HUD-level)
    // and the minimap camera ignore it too
    miniCam.ignore(border);

    // Player dot (gold) on minimap — update in update loop
    this._mmPlayerDot = this.add.graphics().setDepth(9997);
    this._mmPlayerDot.fillStyle(0xffd700);
    this._mmPlayerDot.fillCircle(0, 0, 60);
    this._mmPlayerDot.setScrollFactor(0);
    // The main camera should ignore the player dot, minimap shows it via world pos
    // Actually let's just track it as world-positioned
    this._mmPlayerDot.setScrollFactor(1);
    this.cameras.main.ignore(this._mmPlayerDot);
    this.cameras.main.ignore(border);

    // Enemy dots
    this._mmEnemyDots = [];
    for (const e of this.enemies) {
      const dot = this.add.graphics().setDepth(9996);
      dot.fillStyle(0xcc3333);
      dot.fillCircle(0, 0, 40);
      dot.setPosition(e.x, e.y);
      this.cameras.main.ignore(dot);
      this._mmEnemyDots.push({ dot, enemy: e });
    }

    this._miniCam = miniCam;
  }

  /* ── UPDATE MINIMAP DOTS ────────────────────────────────── */
  _updateMinimapDots() {
    if (!this._miniCam) return;

    // Player dot tracks player
    if (this._mmPlayerDot && this.knight) {
      this._mmPlayerDot.setPosition(this.knight.x, this.knight.y);
    }

    // Enemy dots track enemies
    if (this._mmEnemyDots) {
      for (const ed of this._mmEnemyDots) {
        if (ed.enemy.enemyData?.isDead || !ed.enemy.active) {
          ed.dot.setVisible(false);
        } else {
          ed.dot.setPosition(ed.enemy.x, ed.enemy.y);
        }
      }
    }
  }

  /* ── PORTAL TRANSITION ──────────────────────────────────── */
  _enterPortal() {
    if (this._transitioning) return;
    this._transitioning = true;
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      this.scene.start('ForsakenCrypt', this._getTransitionData());
    });
  }

  _getTransitionData() {
    const pd = this.playerData;
    return {
      syncFn: this._syncFn,
      addToBackpack: this._addToBackpack,
      sceneRef: this._sceneRef,
      chosenClass: this._chosenClass,
      onPlayerDeath: this._onPlayerDeath,
      onOpenTrade: this._onOpenTrade,
      onZoneChange: this._onZoneChange,
      savedData: {
        hp: pd.hp, maxHp: pd.maxHp, mana: pd.mana, maxMana: pd.maxMana,
        xp: pd.xp, xpToLevel: pd.xpToLevel, level: pd.level, gold: pd.gold,
        baseDmg: pd.baseDmg, critChance: pd.critChance,
        _equipBonusDmg: pd._equipBonusDmg || 0,
        _equipBonusDef: pd._equipBonusDef || 0,
        _equipBonusCrit: pd._equipBonusCrit || 0,
      },
    };
  }

  /* ── DAMAGE ENEMY ───────────────────────────────────────── */
  _damageEnemy(enemy, dmg, isCrit) {
    const ed = enemy.enemyData;
    ed.hp -= dmg;

    // Floating damage number
    const txt = this.add.text(enemy.x, enemy.y - 40, `${dmg}${isCrit ? '!' : ''}`, {
      fontSize: `${isCrit ? 18 : 14}px`, fontFamily: 'monospace', fontStyle: 'bold',
      color: isCrit ? '#ffdd00' : '#ffffff',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10000);
    this.tweens.add({ targets: txt, y: txt.y - 40, alpha: 0, duration: 800, onComplete: () => txt.destroy() });

    // Blood splatter
    this._spawnBlood(enemy.x, enemy.y);

    // Screen shake on crit
    if (isCrit) this.cameras.main.shake(120, 0.008);

    // Hit-stop (50ms freeze frame)
    this._hitStopTimer = 50;

    // Knockback
    const angle = Math.atan2(enemy.y - this.knight.y, enemy.x - this.knight.x);
    enemy.body.setVelocity(Math.cos(angle) * 200, Math.sin(angle) * 200);
    this.time.delayedCall(150, () => { if (!ed.isDead) enemy.body.setVelocity(0, 0); });

    // Hurt anim
    const hurtAnim = `${ed.animKey}_hurt`;
    if (this.anims.exists(hurtAnim) && ed.state !== 'dead') {
      enemy.play(hurtAnim, true);
      ed.state = 'hurt';
      this.time.delayedCall(300, () => { if (!ed.isDead) ed.state = 'chase'; });
    }

    // Death
    if (ed.hp <= 0) {
      ed.hp = 0; ed.isDead = true; ed.state = 'dead';
      enemy.body.setVelocity(0, 0); enemy.body.enable = false;
      const deathAnim = `${ed.animKey}_death`;
      if (this.anims.exists(deathAnim)) enemy.play(deathAnim);

      this.time.delayedCall(1200, () => {
        this.tweens.add({
          targets: [enemy, enemy.hpBg, enemy.hpFg], alpha: 0, duration: 500,
          onComplete: () => {
            enemy.hpBg.destroy(); enemy.hpFg.destroy(); enemy.destroy();
            this.enemies = this.enemies.filter(e => e !== enemy);
          },
        });
      });

      this.playerData.xp += ed.xp;
      this._checkLevelUp();
      this._dropLoot(enemy.x, enemy.y, ed.type);

      // Boss kill: guaranteed legendary + extra gold + victory text
      if (ed.isBoss) {
        this.playerData.gold += 100;
        this._createLootLabel(enemy.x - 20, enemy.y - 10, '100 Gold', '#ffd700', { type: 'gold', amount: 100 });
        const legendaries = LOOT_TABLE.filter(l => l.rarity === 'legendary');
        if (legendaries.length > 0) {
          const item = legendaries[Math.floor(Math.random() * legendaries.length)];
          this._createLootLabel(enemy.x + 20, enemy.y + 20, item.name, RARITIES.legendary.color, { type: 'item', item });
        }
        // Victory announcement
        const vic = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 60, 'BOSS SLAIN!', {
          fontSize: '28px', fontFamily: "'Cinzel', serif", color: '#ffd700',
          stroke: '#000', strokeThickness: 4, fontStyle: 'bold',
        }).setOrigin(0.5).setScrollFactor(0).setDepth(10003);
        this.tweens.add({ targets: vic, y: vic.y - 40, alpha: 0, duration: 3000, delay: 1000, onComplete: () => vic.destroy() });
        this.cameras.main.flash(500, 100, 80, 0, false);
      }
    }
  }

  /* ── BLOOD PARTICLES ────────────────────────────────────── */
  _spawnBlood(x, y) {
    for (let i = 0; i < 4; i++) {
      const g = this.add.graphics();
      g.fillStyle(0x660000 + Math.floor(Math.random() * 0x330000), 0.7);
      g.fillCircle(0, 0, 2 + Math.random() * 3);
      g.setPosition(x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 20);
      g.setDepth(y - 1);
      this.tweens.add({ targets: g, alpha: 0, duration: 5000, delay: 3000, onComplete: () => g.destroy() });
    }
  }

  /* ── LOOT DROP ──────────────────────────────────────────── */
  _dropLoot(x, y) {
    // Gold always
    const goldAmt = 5 + Math.floor(Math.random() * 15);
    this._createLootLabel(x + (Math.random() - 0.5) * 20, y + 10, `${goldAmt} Gold`, '#ffd700', { type: 'gold', amount: goldAmt });

    // Random item (40% chance)
    if (Math.random() < 0.40) {
      const totalW = Object.values(RARITIES).reduce((s, r) => s + r.weight, 0);
      let roll = Math.random() * totalW;
      let chosenRarity = 'common';
      for (const [rarity, info] of Object.entries(RARITIES)) {
        roll -= info.weight;
        if (roll <= 0) { chosenRarity = rarity; break; }
      }
      const eligible = LOOT_TABLE.filter(l => l.rarity === chosenRarity);
      if (eligible.length > 0) {
        const item = eligible[Math.floor(Math.random() * eligible.length)];
        this._createLootLabel(x + (Math.random() - 0.5) * 30, y + 25, item.name, RARITIES[item.rarity].color, { type: 'item', item });
      }
    }
  }

  _createLootLabel(x, y, text, color, data) {
    const label = this.add.text(x, y, text, {
      fontSize: '11px', fontFamily: 'monospace', fontStyle: 'bold',
      color, stroke: '#000000', strokeThickness: 2,
      backgroundColor: 'rgba(0,0,0,0.5)', padding: { x: 4, y: 2 },
    }).setOrigin(0.5).setDepth(9000).setInteractive({ useHandCursor: true });
    label.lootData = data;
    label.on('pointerdown', () => this._pickupLoot(label));
    label.setScale(0);
    this.tweens.add({ targets: label, scale: 1, duration: 300, ease: 'Back.easeOut' });
    this.lootDrops.push(label);
  }

  _pickupLoot(label) {
    if (!label.active) return;
    if (label.lootData.type === 'gold') {
      this.playerData.gold += label.lootData.amount;
    } else if (label.lootData.type === 'item' && this._addToBackpack) {
      this._addToBackpack(label.lootData.item);
    }
    this.tweens.add({
      targets: label, y: label.y - 30, alpha: 0, scale: 0.5, duration: 300,
      onComplete: () => { label.destroy(); this.lootDrops = this.lootDrops.filter(l => l !== label); },
    });
  }

  /* ── LEVEL UP ───────────────────────────────────────────── */
  _checkLevelUp() {
    const pd = this.playerData;
    while (pd.xp >= pd.xpToLevel) {
      pd.xp -= pd.xpToLevel;
      pd.level++;
      pd.xpToLevel = Math.floor(pd.xpToLevel * 1.4);
      pd.maxHp += 12; pd.hp = pd.maxHp;
      pd.maxMana += 5; pd.mana = pd.maxMana;
      pd.baseDmg += 3;
      this.cameras.main.flash(400, 255, 220, 60);
    }
  }

  /* ── ENEMY AI ───────────────────────────────────────────── */
  _updateEnemyAI(delta) {
    const px = this.knight.x, py = this.knight.y;
    for (const e of this.enemies) {
      const ed = e.enemyData;
      if (ed.isDead) continue;
      if (ed._stunned) { e.body.setVelocity(0, 0); continue; }
      const dist = Math.hypot(e.x - px, e.y - py);

      // Sleep distant enemies
      if (dist > 900) { e.body.setVelocity(0, 0); continue; }

      // Player invisible → don't aggro
      const playerHidden = this.playerData._invisible;

      switch (ed.state) {
        case 'wander': {
          ed.wanderTimer -= delta;
          if (ed.wanderTimer <= 0) {
            ed.wanderTimer = 1500 + Math.random() * 2000;
            const a = Math.random() * Math.PI * 2;
            ed.wanderDirX = Math.cos(a); ed.wanderDirY = Math.sin(a);
          }
          e.body.setVelocity(ed.wanderDirX * ed.speed * 0.3, ed.wanderDirY * ed.speed * 0.3);
          if (dist < ed.aggroRange && !playerHidden) ed.state = 'chase';
          const walkAnim = `${ed.animKey}_walk`;
          if (this.anims.exists(walkAnim) && e.anims.currentAnim?.key !== walkAnim) e.play(walkAnim, true);
          break;
        }
        case 'chase': {
          const a = Math.atan2(py - e.y, px - e.x);
          e.body.setVelocity(Math.cos(a) * ed.speed, Math.sin(a) * ed.speed);
          e.setFlipX(px < e.x);
          if (dist < ed.atkRange) { ed.state = 'attack'; ed.atkTimer = 0; }
          else if (dist > ed.aggroRange * 1.5) ed.state = 'wander';
          const runAnim = `${ed.animKey}_run`;
          const wAnim = `${ed.animKey}_walk`;
          const chaseAnim = this.anims.exists(runAnim) ? runAnim : wAnim;
          if (e.anims.currentAnim?.key !== chaseAnim) e.play(chaseAnim, true);
          break;
        }
        case 'attack': {
          e.body.setVelocity(0, 0);
          ed.atkTimer -= delta;
          if (ed.atkTimer <= 0) {
            ed.atkTimer = ed.atkCooldown;
            const atkAnim = `${ed.animKey}_attack`;
            if (this.anims.exists(atkAnim)) e.play(atkAnim, true);
            if (dist < ed.atkRange + 30) {
              const equipDef = this.playerData._equipBonusDef || 0;
              const reducedDmg = Math.max(1, ed.dmg - Math.floor(equipDef * 0.3));
              this.playerData.hp = Math.max(0, this.playerData.hp - reducedDmg);
              if (this.playerData.hp <= 0 && !this._isDead) {
                this._isDead = true;
                this.knight.body.setVelocity(0, 0);
                if (this.anims.exists('hero_death')) this.knight.play('hero_death', true);
                this._syncState();
                if (this._onPlayerDeath) this._onPlayerDeath();
                return;
              }
              this.cameras.main.shake(80, 0.004);
              this.knight.setTint(0xff4444);
              this.time.delayedCall(150, () => this.knight.clearTint());
            }
          }
          if (dist > ed.atkRange + 20) ed.state = 'chase';
          break;
        }
        case 'hurt': {
          e.body.setVelocity(e.body.velocity.x * 0.9, e.body.velocity.y * 0.9);
          break;
        }
      }
      if (e.visible) e.setDepth(e.y);
    }
  }

  /* ── HP BARS ────────────────────────────────────────────── */
  _updateHPBars() {
    for (const e of this.enemies) {
      if (e.enemyData.isDead || !e.visible) {
        if (e.hpBg) e.hpBg.setVisible(false);
        if (e.hpFg) e.hpFg.setVisible(false);
        continue;
      }
      const yOff = -35 * e.scaleY;
      e.hpBg.setPosition(e.x, e.y + yOff).setVisible(true).setDepth(e.y + 1);
      const pct = Math.max(0, e.enemyData.hp / e.enemyData.maxHp);
      e.hpFg.clear();
      e.hpFg.fillStyle(pct > 0.5 ? 0xcc2222 : pct > 0.25 ? 0xff6600 : 0xff0000);
      e.hpFg.fillRect(-19, -3, Math.floor(38 * pct), 4);
      e.hpFg.setPosition(e.x, e.y + yOff).setVisible(true).setDepth(e.y + 2);
    }
  }

  /* ── GROUND TEXTURE ─────────────────────────────────────── */
  _createGroundTexture(noise, pathPoints) {
    const canvas = document.createElement('canvas');
    canvas.width = GROUND_RES; canvas.height = GROUND_RES;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(GROUND_RES, GROUND_RES);
    const d = imgData.data;
    const pathSet = new Set();
    for (const pt of pathPoints) {
      const tx = Math.floor(pt.x / PX_PER_TEXEL), ty = Math.floor(pt.y / PX_PER_TEXEL);
      for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
        const nx = tx + dx, ny = ty + dy;
        if (nx >= 0 && nx < GROUND_RES && ny >= 0 && ny < GROUND_RES)
          pathSet.add(ny * GROUND_RES + nx);
      }
    }
    for (let y = 0; y < GROUND_RES; y++) for (let x = 0; x < GROUND_RES; x++) {
      const wx = (x / GROUND_RES) * 6, wy = (y / GROUND_RES) * 6;
      const n1 = fbm(noise, wx, wy, 4), n2 = fbm(noise, wx + 50, wy + 50, 3);
      const idx = (y * GROUND_RES + x) * 4;
      let r, g, b;
      if (pathSet.has(y * GROUND_RES + x)) {
        const v = 0.7 + n2 * 0.2; r = Math.floor(90 * v); g = Math.floor(70 * v); b = Math.floor(45 * v);
      } else if (n1 > 0.15) {
        const v = 0.75 + n1 * 0.25; r = Math.floor(35 * v); g = Math.floor(65 * v); b = Math.floor(30 * v);
      } else if (n1 > -0.1) {
        const v = 0.75 + n2 * 0.2; r = Math.floor(30 * v); g = Math.floor(55 * v); b = Math.floor(35 * v);
      } else {
        const v = 0.7 + n1 * 0.15; r = Math.floor(45 * v); g = Math.floor(42 * v); b = Math.floor(30 * v);
      }
      d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = this.textures.createCanvas('biome_ground', GROUND_RES, GROUND_RES);
    tex.context.drawImage(canvas, 0, 0); tex.refresh();
    // Apply linear filtering for smooth ground when zoomed
    try { tex.setFilter(1); } catch (_) {}
    const groundImg = this.add.image(WORLD_W / 2, WORLD_H / 2, 'biome_ground');
    groundImg.setDisplaySize(WORLD_W, WORLD_H).setDepth(-1000);
  }

  /* ── PATH / EXCLUSION ───────────────────────────────────── */
  _rasterizePaths(paths) {
    const pts = [];
    for (const p of paths) for (let t = 0; t <= 1; t += 0.002) pts.push(bezierPoint(p, t));
    return pts;
  }
  _buildPathExclude(pathPoints) {
    const set = new Set();
    for (const pt of pathPoints) {
      const gx = Math.floor(pt.x / 48), gy = Math.floor(pt.y / 48);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) set.add(`${gx + dx},${gy + dy}`);
    }
    return set;
  }

  /* ── BUILDINGS ──────────────────────────────────────────── */
  _createBuildings(rng) {
    const cw = COTTAGE_W * TILE, ch = COTTAGE_H * TILE;
    const rt = this.add.renderTexture(0, 0, cw, ch); rt.setVisible(false);
    for (let row = 0; row < COTTAGE_H; row++)
      for (let col = 0; col < COTTAGE_W; col++)
        rt.drawFrame('walls_floor', COTTAGE_TILES[row][col], col * TILE, row * TILE);
    rt.saveTexture('building_cottage'); rt.destroy();

    this._buildingPositions = [
      { x: WORLD_W * 0.45, y: WORLD_H * 0.42 },
      { x: WORLD_W * 0.7,  y: WORLD_H * 0.35 },
    ];
    for (const pos of this._buildingPositions) {
      const bld = this.add.image(pos.x, pos.y, 'building_cottage');
      bld.setScale(3).setOrigin(0.5, 0.85).setDepth(pos.y);
      this.decorations.push(bld);
      const dispW = cw * 3, dispH = ch * 3, baseH = dispH * 0.25;
      const zone = this.add.zone(pos.x, pos.y - dispH * 0.15 + dispH * 0.5 - baseH / 2 + dispH * 0.3, dispW * 0.85, baseH);
      this.physics.add.existing(zone, true); this.staticObjects.add(zone);
    }
  }

  /* ── TREES ──────────────────────────────────────────────── */
  _scatterTrees(noise, rng) {
    const MARGIN = 80; let placed = 0;
    for (let att = 0; att < 5000 && placed < 220; att++) {
      const x = MARGIN + rng() * (WORLD_W - MARGIN * 2), y = MARGIN + rng() * (WORLD_H - MARGIN * 2);
      if (fbm(noise, (x / WORLD_W) * 6, (y / WORLD_H) * 6, 3) < -0.05) continue;
      if (this._pathExclude.has(`${Math.floor(x / 48)},${Math.floor(y / 48)}`)) continue;
      if (this._nearBuilding(x, y, 180)) continue;
      const def = TREE_DEFS[Math.floor(rng() * TREE_DEFS.length)];
      const sc = def.w >= 128 ? 2 + rng() * 0.8 : 1.5 + rng() * 0.5;
      const tree = this.add.image(x, y, def.key).setScale(sc).setOrigin(0.5, 0.85).setDepth(y);
      this.decorations.push(tree);
      const zone = this.add.zone(x, y + def.h * sc * 0.15, def.colR * sc * 1.5, def.colR * sc * 0.7);
      this.physics.add.existing(zone, true); this.staticObjects.add(zone);
      placed++;
    }
  }

  /* ── ROCKS ──────────────────────────────────────────────── */
  _scatterRocks(noise, rng) {
    let placed = 0;
    for (let att = 0; att < 3000 && placed < 100; att++) {
      const x = 60 + rng() * (WORLD_W - 120), y = 60 + rng() * (WORLD_H - 120);
      if (fbm(noise, (x / WORLD_W) * 8 + 100, (y / WORLD_H) * 8 + 100, 3) > 0.2) continue;
      if (this._pathExclude.has(`${Math.floor(x / 48)},${Math.floor(y / 48)}`)) continue;
      if (this._nearBuilding(x, y, 150)) continue;
      const def = ROCK_DEFS[Math.floor(rng() * ROCK_DEFS.length)];
      const sc = 1.5 + rng() * 1.0;
      this.add.image(x, y, def.key).setScale(sc).setOrigin(0.5, 0.7).setDepth(y);
      this.decorations.push(this.children.list[this.children.list.length - 1]);
      if (def.col) {
        const zone = this.add.zone(x, y + def.h * sc * 0.1, def.w * sc * 0.6, def.h * sc * 0.3);
        this.physics.add.existing(zone, true); this.staticObjects.add(zone);
      }
      placed++;
    }
  }

  _nearBuilding(x, y, dist) {
    const positions = this._buildingPositions || [
      { x: WORLD_W * 0.45, y: WORLD_H * 0.42 }, { x: WORLD_W * 0.7, y: WORLD_H * 0.35 },
    ];
    return positions.some(b => Math.abs(x - b.x) + Math.abs(y - b.y) < dist);
  }

  /* ── PLAYER ─────────────────────────────────────────────── */
  _createPlayer() {
    const sv = this._savedData || {};
    const startX = sv.x ?? WORLD_W / 2;
    const startY = sv.y ?? WORLD_H / 2;
    this.knight = this.physics.add.sprite(startX, startY, 'hero_idle_1');
    this.knight.setScale(SPRITE_SCALE).setCollideWorldBounds(true).setDepth(startY);
    this.knight.body.setSize(22, 14).setOffset(53, 106);

    // Build animations from class definition
    const classId = this._chosenClass?.id || 'warrior';
    const heroDef = HERO_CLASSES[classId] || HERO_CLASSES.warrior;
    const rates = { idle: 8, run: 10, attack: 14, hurt: 10, death: 10 };
    for (const a of heroDef.anims) {
      const isLoop = (a.name === 'idle' || a.name === 'run');
      this.anims.create({
        key: `hero_${a.name}`,
        frames: Array.from({ length: a.count }, (_, i) => ({ key: `hero_${a.name}_${i + a.start}` })),
        frameRate: rates[a.name] || 8,
        repeat: isLoop ? -1 : 0,
      });
    }

    this.knight.play('hero_idle');
    this.playerFacing = 'right';
  }

  /* ── ATMOSPHERE ─────────────────────────────────────────── */
  _createAtmosphere() {
    if (this.add.particles) {
      this.add.particles(0, 0, 'hero_idle_1', {
        alpha: { start: 0.06, end: 0 }, scale: { start: 0.03, end: 0.01 },
        tint: 0x888866, speed: { min: 5, max: 20 }, lifespan: 4000,
        frequency: 500, quantity: 1, blendMode: 'ADD', follow: this.knight,
        emitZone: { type: 'random', source: new Phaser.Geom.Rectangle(-500, -400, 1000, 800) },
      }).setDepth(10000);
    }
    const vig = this.add.graphics(); vig.setScrollFactor(0).setDepth(9998);
    const gw = this.cameras.main.width, gh = this.cameras.main.height;
    for (let i = 0; i < 20; i++) {
      vig.lineStyle(8, 0x000000, (i / 20) * 0.35);
      vig.strokeRect(i * 8, i * 8, gw - i * 16, gh - i * 16);
    }
  }

  /* ── FRUSTUM CULLING ────────────────────────────────────── */
  _updateCulling() {
    const cam = this.cameras.main, pad = 200;
    const l = cam.scrollX - pad, r = cam.scrollX + cam.width + pad;
    const t = cam.scrollY - pad, b = cam.scrollY + cam.height + pad;
    for (const obj of this.decorations) {
      const vis = obj.x > l && obj.x < r && obj.y > t && obj.y < b;
      obj.setVisible(vis); obj.setActive(vis);
    }
    for (const e of this.enemies) {
      if (e.enemyData.isDead) continue;
      e.setVisible(e.x > l && e.x < r && e.y > t && e.y < b);
    }
  }

  /* ── F KEY PICKUP ───────────────────────────────────────── */
  _checkPickupKey() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.F)) {
      let closest = null, closestDist = 80;
      for (const l of this.lootDrops) {
        const d = Math.hypot(l.x - this.knight.x, l.y - this.knight.y);
        if (d < closestDist) { closestDist = d; closest = l; }
      }
      if (closest) this._pickupLoot(closest);
    }
  }

  /* ── SYNC HUD STATE ─────────────────────────────────────── */
  _syncState() {
    if (this._syncFn) {
      const pd = this.playerData;
      this._syncFn({
        hp: Math.ceil(pd.hp), maxHp: pd.maxHp,
        mana: Math.ceil(pd.mana), maxMana: pd.maxMana,
        xp: pd.xp, xpToLevel: pd.xpToLevel,
        level: pd.level, gold: pd.gold,
        baseDmg: pd.baseDmg, critChance: pd.critChance,
        skills: { ...pd.skills },
        // Minimap data
        playerX: this.knight?.x, playerY: this.knight?.y,
        enemies: this.enemies ? this.enemies.filter(e => !e.enemyData.isDead).map(e => ({ x: e.x, y: e.y })) : [],
        npcX: this.npc?.x, npcY: this.npc?.y,
        portalX: this.portal?.x, portalY: this.portal?.y,
        worldW: this.physics.world.bounds.width,
        worldH: this.physics.world.bounds.height,
        zone: this._currentZone || 'forest',
      });
    }
  }

  /* ── UPDATE ─────────────────────────────────────────────── */
  update(time, delta) {
    if (!this.knight || this._isDead) return;

    // Hit-stop freeze
    if (this._hitStopTimer > 0) { this._hitStopTimer -= delta; return; }

    const pd = this.playerData;

    /* --- Movement --- */
    if (!pd.isAttacking && !pd.whirlwinding) {
      const k = this.keys, c = this.cursors;
      let vx = 0, vy = 0;
      if (k.A.isDown || c.left.isDown) vx = -1;
      if (k.D.isDown || c.right.isDown) vx = 1;
      if (k.W.isDown || c.up.isDown) vy = -1;
      if (k.S.isDown || c.down.isDown) vy = 1;
      if (vx && vy) { vx *= 0.707; vy *= 0.707; }
      this.knight.body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);
      if (vx !== 0 || vy !== 0) {
        if (this.knight.anims.currentAnim?.key !== 'hero_run') this.knight.play('hero_run', true);
        if (vx > 0) { this.knight.setFlipX(false); this.playerFacing = 'right'; }
        if (vx < 0) { this.knight.setFlipX(true); this.playerFacing = 'left'; }
      } else if (!pd.isAttacking) {
        if (this.knight.anims.currentAnim?.key !== 'hero_idle') this.knight.play('hero_idle', true);
      }
    } else if (pd.whirlwinding) {
      const k = this.keys, c = this.cursors;
      let vx = 0, vy = 0;
      if (k.A.isDown || c.left.isDown) vx = -1;
      if (k.D.isDown || c.right.isDown) vx = 1;
      if (k.W.isDown || c.up.isDown) vy = -1;
      if (k.S.isDown || c.down.isDown) vy = 1;
      if (vx && vy) { vx *= 0.707; vy *= 0.707; }
      this.knight.body.setVelocity(vx * PLAYER_SPEED * 0.5, vy * PLAYER_SPEED * 0.5);
    }

    /* --- Cooldowns & regen --- */
    if (this._atkCooldown > 0) this._atkCooldown -= delta;
    if (this._frostCooldown > 0) this._frostCooldown -= delta;
    if (this._dashCooldown > 0) this._dashCooldown -= delta;
    if (this._qCooldown > 0) this._qCooldown -= delta;
    if (this._wCooldown > 0) this._wCooldown -= delta;
    if (this._rCooldown > 0) this._rCooldown -= delta;
    if (this._furyActive && this._furyTimer > 0) {
      this._furyTimer -= delta;
      if (this._furyTimer <= 0) this._endFuryBuff();
    }

    /* --- E key: Portal > NPC > Skill --- */
    const nearPortal = this.portal && Math.hypot(this.knight.x - this.portal.x, this.knight.y - this.portal.y) < 80;
    const nearNPC = this.npc && Math.hypot(this.knight.x - this.npc.x, this.knight.y - this.npc.y) < 80;
    if (this._portalLabel) this._portalLabel.setVisible(nearPortal);
    if (this._npcLabel) this._npcLabel.setVisible(nearNPC && !nearPortal);

    if (nearPortal && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      this._enterPortal();
    } else if (nearNPC && Phaser.Input.Keyboard.JustDown(this.keys.E)) {
      if (this._onOpenTrade) this._onOpenTrade();
    } else {
      this._updateESkill(delta);
    }

    /* --- Q skill --- */
    this._updateQSkill();

    /* --- R skill (ultimate) --- */
    this._updateRSkill();

    /* --- Space also triggers W skill --- */
    if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) this._updateWSkill();

    // Sync skill cooldown for HUD
    const _cid = this._chosenClass?.id || 'warrior';
    if (_cid === 'mage') pd.skills.e = Math.max(0, Math.ceil(this._frostCooldown ?? 0));
    else if (_cid === 'rogue') pd.skills.e = Math.max(0, Math.ceil(this._dashCooldown ?? 0));
    pd.skills.q = Math.max(0, Math.ceil((this._qCooldown ?? 0) / 1000));
    pd.skills.w = Math.max(0, Math.ceil((this._wCooldown ?? 0) / 1000));
    pd.skills.r = Math.max(0, Math.ceil((this._rCooldown ?? 0) / 1000));

    this._manaRegen += delta;
    if (this._manaRegen > 500) {
      this._manaRegen = 0;
      if (pd.mana < pd.maxMana && !pd.whirlwinding) pd.mana = Math.min(pd.maxMana, pd.mana + 1);
    }

    /* --- Enemies --- */
    this._updateEnemyAI(delta);
    this._updateHPBars();
    this._checkPickupKey();

    /* --- Boss AI (crypt only) --- */
    if (this._boss) this._updateBossAI(delta);

    /* --- Depth --- */
    this.knight.setDepth(this.knight.y);

    /* --- Minimap dots --- */
    this._updateMinimapDots();

    /* --- Culling --- */
    this._cullTimer += delta;
    if (this._cullTimer > 200) { this._cullTimer = 0; this._updateCulling(); }

    /* --- HUD sync --- */
    this._syncTimer += delta;
    if (this._syncTimer > 100) { this._syncTimer = 0; this._syncState(); }
  }
}

/* ═══════════════════════════════════════════════════════════════
   FORSAKEN CRYPT SCENE (inherits combat/AI/loot from DarkForest)
   ═══════════════════════════════════════════════════════════════ */
class ForsakenCryptScene extends DarkForestScene {
  constructor() { super('ForsakenCrypt'); }

  preload() {
    this._preloadHero();

    // Vampire spritesheets (64×64 frames, 4 direction rows)
    for (const [state, file] of [
      ['idle', 'Idle'], ['walk', 'Walk'], ['run', 'Run'],
      ['attack', 'Attack'], ['hurt', 'Hurt'], ['death', 'Death'],
    ]) {
      this.load.spritesheet(`vamp1_${state}`,
        `${VAMPIRES}/Vampires1/With_shadow/Vampires1_${file}_with_shadow.png`,
        { frameWidth: 64, frameHeight: 64 });
    }

    // Demon frames
    const demonAnims = [
      { name: 'idle', count: 3 }, { name: 'walk', count: 6 }, { name: 'attack', count: 4 },
      { name: 'hurt', count: 2 }, { name: 'death', count: 6 },
    ];
    for (const a of demonAnims) {
      const folder = a.name.charAt(0).toUpperCase() + a.name.slice(1);
      for (let i = 1; i <= a.count; i++)
        this.load.image(`demon_${a.name}_${i}`, `${MONSTERS}/demon/${folder}${i}.png`);
    }

    // Portal
    this.load.image('portal_purple', 'assets/sprites/portal_purple.png');

    // Dragon Boss (individual frames)
    const dragonAnims = [
      { name: 'idle', count: 3, folder: 'Idle' },
      { name: 'walk', count: 5, folder: 'Walk' },
      { name: 'attack', count: 4, folder: 'Attack' },
      { name: 'fire_attack', count: 6, folder: 'Fire_Attack' },
      { name: 'hurt', count: 2, folder: 'Hurt' },
      { name: 'death', count: 5, folder: 'Death' },
    ];
    for (const a of dragonAnims) {
      for (let i = 1; i <= a.count; i++)
        this.load.image(`dragon_${a.name}_${i}`, `${MONSTERS}/dragon/${a.folder}${i}.png`);
    }
  }

  create() {
    this._currentZone = 'crypt';
    this.physics.world.setBounds(0, 0, CRYPT_W, CRYPT_H);

    /* --- Dungeon floor texture --- */
    const canvas = document.createElement('canvas');
    canvas.width = 400; canvas.height = 400;
    const ctx = canvas.getContext('2d');
    for (let y = 0; y < 400; y++) for (let x = 0; x < 400; x++) {
      const n = Math.random() * 12;
      ctx.fillStyle = `rgb(${18 + n},${16 + n},${22 + n})`;
      ctx.fillRect(x, y, 1, 1);
    }
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 400; i += 16) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(400, i); ctx.stroke();
    }
    const tex = this.textures.createCanvas('crypt_floor', 400, 400);
    tex.context.drawImage(canvas, 0, 0); tex.refresh();
    this.add.image(CRYPT_W / 2, CRYPT_H / 2, 'crypt_floor')
      .setDisplaySize(CRYPT_W, CRYPT_H).setDepth(-1000);

    /* --- Static groups --- */
    this.staticObjects = this.physics.add.staticGroup();
    this.decorations = [];

    /* --- Player --- */
    this._createPlayer();

    /* --- Enemies --- */
    this.enemies = [];
    this._createEnemyAnims();
    this._createDragonBossAnims();
    this._spawnCryptEnemies();
    this._spawnBoss();

    /* --- Loot --- */
    this.lootDrops = [];

    /* --- Exit portal --- */
    const exitX = CRYPT_W - 200, exitY = CRYPT_H - 200;
    this.portal = this.physics.add.sprite(exitX, exitY, 'portal_purple');
    this.portal.setScale(2.5).setDepth(exitY);
    this.portal.body.setImmovable(true);
    this._portalLabel = this.add.text(exitX, exitY - 55, '[E] Exit Crypt', {
      fontSize: '11px', fontFamily: "'Cinzel', serif", color: '#aa88ff',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(10001).setVisible(false);

    /* --- No NPC in crypt --- */
    this.npc = null;
    this._npcLabel = null;

    /* --- Physics --- */
    this.physics.add.collider(this.knight, this.staticObjects);

    /* --- Camera --- */
    const cam = this.cameras.main;
    cam.setBounds(0, 0, CRYPT_W, CRYPT_H);
    cam.startFollow(this.knight, true, 0.09, 0.09);
    cam.setBackgroundColor('#050508');
    cam.fadeIn(1000);

    /* --- Input --- */
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E,F,Q,R,SPACE');
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) this._playerAttack();
      else if (pointer.rightButtonDown()) this._updateWSkill();
    });
    try { this.input.mouse.disableContextMenu(); } catch (_) {
      try { this.game.input.mouse.disableContextMenu(); } catch (_2) { /* no mouse manager */ }
    }

    /* --- Player state --- */
    const cls = this._chosenClass || {};
    const sv = this._savedData || {};
    this.playerData = {
      hp: sv.hp ?? cls.hp ?? 100,
      maxHp: sv.maxHp ?? cls.hp ?? 100,
      mana: sv.mana ?? cls.mana ?? 50,
      maxMana: sv.maxMana ?? cls.mana ?? 50,
      xp: sv.xp ?? 0, xpToLevel: sv.xpToLevel ?? 100,
      level: sv.level ?? 1, gold: sv.gold ?? 0,
      baseDmg: sv.baseDmg ?? cls.baseDmg ?? 12,
      critChance: sv.critChance ?? (cls.critChance ?? 15) / 100,
      isAttacking: false, whirlwinding: false,
      skills: { q: 0, w: 0, e: 0, r: 0, eActive: false },
    };
    if (sv._equipBonusDmg != null) {
      this.playerData._equipBonusDmg = sv._equipBonusDmg;
      this.playerData._equipBonusDef = sv._equipBonusDef;
      this.playerData._equipBonusCrit = sv._equipBonusCrit;
    }
    this._isDead = false;
    this._transitioning = false;

    /* --- Timers --- */
    this._atkCooldown = 0;
    this._hitStopTimer = 0;
    this._syncTimer = 0;
    this._cullTimer = 0;
    this._manaRegen = 0;
    this._whirlTimer = 0;
    this._frostCooldown = 0;
    this._dashCooldown = 0;
    this._qCooldown = 0;
    this._wCooldown = 0;
    this._rCooldown = 0;
    this._furyActive = false;

    /* --- Atmosphere (dark purple vignette) --- */
    const vig = this.add.graphics(); vig.setScrollFactor(0).setDepth(9998);
    const gw = this.cameras.main.width, gh = this.cameras.main.height;
    for (let i = 0; i < 25; i++) {
      vig.lineStyle(8, 0x0a0020, (i / 25) * 0.5);
      vig.strokeRect(i * 8, i * 8, gw - i * 16, gh - i * 16);
    }

    this._syncState();
    if (this._onZoneChange) this._onZoneChange('crypt');
    this._createMinimap();
  }

  _spawnCryptEnemies() {
    const MARGIN = 200;
    const spawnDefs = [
      { type: 'vampire', count: 10 },
      { type: 'demon',   count: 4  },
    ];
    for (const sd of spawnDefs) {
      const typeDef = ENEMY_TYPES[sd.type];
      let placed = 0;
      for (let attempt = 0; attempt < 500 && placed < sd.count; attempt++) {
        const x = MARGIN + Math.random() * (CRYPT_W - MARGIN * 2);
        const y = MARGIN + Math.random() * (CRYPT_H - MARGIN * 2);
        if (Math.hypot(x - CRYPT_W / 2, y - CRYPT_H / 2) < 200) continue;
        this._createEnemy(x, y, sd.type, typeDef);
        placed++;
      }
    }
  }

  /* ── DRAGON BOSS ANIMATIONS ─────────────────────────────── */
  _createDragonBossAnims() {
    for (const [state, info] of Object.entries(ENEMY_TYPES.dragon_boss.anims)) {
      const key = `dragon_${state}`;
      if (!this.anims.exists(key)) {
        this.anims.create({
          key,
          frames: Array.from({ length: info.count }, (_, i) => ({ key: `${info.prefix}${i + 1}` })),
          frameRate: info.frameRate,
          repeat: (state === 'death') ? 0 : -1,
        });
      }
    }
  }

  /* ── SPAWN BOSS ─────────────────────────────────────────── */
  _spawnBoss() {
    const bx = CRYPT_W / 2;
    const by = 350; // North end of crypt — boss arena
    const def = ENEMY_TYPES.dragon_boss;

    const boss = this.physics.add.sprite(bx, by, 'dragon_idle_1');
    boss.setScale(def.scale).setDepth(by).setCollideWorldBounds(true);
    boss.body.setSize(50, 30).setOffset(90, 100);
    boss.play('dragon_idle');

    boss.enemyData = {
      type: 'dragon_boss', hp: def.hp, maxHp: def.hp, dmg: def.dmg,
      xp: def.xp, speed: def.speed,
      aggroRange: def.aggroRange, atkRange: def.atkRange,
      atkCooldown: def.atkCooldown,
      state: 'wander', isDead: false,
      wanderTimer: 0, wanderDirX: 0, wanderDirY: 0,
      atkTimer: 0, animKey: 'dragon',
      isBoss: true, phase: 1, fireTimer: 0, summonTimer: 0,
    };

    // Bigger HP bar for boss
    const hpBg = this.add.graphics();
    hpBg.fillStyle(0x000000, 0.7).fillRect(-50, -4, 100, 8).setDepth(by + 1);
    boss.hpBg = hpBg;
    const hpFg = this.add.graphics();
    hpFg.fillStyle(0xff2200).fillRect(-49, -3, 98, 6).setDepth(by + 2);
    boss.hpFg = hpFg;

    // Boss nameplate
    this._bossNameplate = this.add.text(bx, by - 80, '🐉 Drakul the Undying', {
      fontSize: '13px', fontFamily: "'Cinzel', serif", color: '#ff4444',
      stroke: '#000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(10002);

    // Boss HP bar on screen (UI)
    this._bossHpBg = this.add.graphics().setScrollFactor(0).setDepth(9998);
    this._bossHpFg = this.add.graphics().setScrollFactor(0).setDepth(9999);
    this._bossHpLabel = this.add.text(this.cameras.main.width / 2, 30, 'Drakul the Undying', {
      fontSize: '11px', fontFamily: "'Cinzel', serif", color: '#ff6644',
      stroke: '#000', strokeThickness: 2,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(9999);

    this._boss = boss;
    this.enemies.push(boss);

    // Ignore boss UI on minimap
    if (this._miniCam) {
      this._miniCam.ignore(this._bossHpBg);
      this._miniCam.ignore(this._bossHpFg);
      this._miniCam.ignore(this._bossHpLabel);
      this._miniCam.ignore(this._bossNameplate);
    }
  }

  /* ── BOSS AI (override update to add boss logic) ────────── */
  _updateBossAI(delta) {
    const boss = this._boss;
    if (!boss || boss.enemyData.isDead) {
      // Hide boss UI when dead
      if (this._bossHpBg) this._bossHpBg.setVisible(false);
      if (this._bossHpFg) this._bossHpFg.setVisible(false);
      if (this._bossHpLabel) this._bossHpLabel.setVisible(false);
      if (this._bossNameplate) this._bossNameplate.setVisible(false);
      return;
    }

    const ed = boss.enemyData;
    const px = this.knight.x, py = this.knight.y;
    const dist = Math.hypot(boss.x - px, boss.y - py);

    // Phase transitions
    const hpPct = ed.hp / ed.maxHp;
    if (hpPct < 0.5 && ed.phase === 1) {
      ed.phase = 2;
      ed.speed = 70; // Faster
      ed.dmg = 35;   // Hits harder
      boss.setTint(0xff4444);
      // Enrage flash
      this.cameras.main.flash(300, 80, 0, 0, false);
      const enrageTxt = this.add.text(boss.x, boss.y - 60, 'ENRAGED!', {
        fontSize: '16px', fontFamily: "'Cinzel', serif", color: '#ff2200',
        stroke: '#000', strokeThickness: 3, fontStyle: 'bold',
      }).setOrigin(0.5).setDepth(10002);
      this.tweens.add({ targets: enrageTxt, y: enrageTxt.y - 40, alpha: 0, duration: 1500, onComplete: () => enrageTxt.destroy() });
    }

    // Fire breath attack (special, every 6-8s)
    ed.fireTimer = (ed.fireTimer || 0) + delta;
    const fireInterval = ed.phase === 2 ? 5000 : 7000;
    if (dist < 300 && ed.fireTimer > fireInterval && ed.state !== 'dead') {
      ed.fireTimer = 0;
      this._bossFireBreath(boss);
    }

    // Summon minions in phase 2 (every 12s)
    if (ed.phase === 2) {
      ed.summonTimer = (ed.summonTimer || 0) + delta;
      if (ed.summonTimer > 12000) {
        ed.summonTimer = 0;
        this._bossSummonMinions(boss);
      }
    }

    // Nameplate follows boss
    if (this._bossNameplate && !ed.isDead) {
      this._bossNameplate.setPosition(boss.x, boss.y - 80 * boss.scaleY);
    }

    // Top-of-screen HP bar
    const barW = 300, barH = 12;
    const barX = (this.cameras.main.width - barW) / 2;
    const barY = 44;
    this._bossHpBg.clear();
    this._bossHpBg.fillStyle(0x000000, 0.8);
    this._bossHpBg.fillRect(barX - 2, barY - 2, barW + 4, barH + 4);
    this._bossHpBg.lineStyle(1, 0x442200);
    this._bossHpBg.strokeRect(barX - 2, barY - 2, barW + 4, barH + 4);

    this._bossHpFg.clear();
    const bossHpColor = ed.phase === 2 ? 0xff2200 : 0xcc4400;
    this._bossHpFg.fillStyle(bossHpColor);
    this._bossHpFg.fillRect(barX, barY, Math.floor(barW * hpPct), barH);

    // Override boss HP bar (wider than normal enemies)
    const yOff = -50 * boss.scaleY;
    boss.hpBg.setPosition(boss.x, boss.y + yOff).setDepth(boss.y + 1);
    boss.hpFg.clear();
    boss.hpFg.fillStyle(bossHpColor);
    boss.hpFg.fillRect(-49, -3, Math.floor(98 * hpPct), 6);
    boss.hpFg.setPosition(boss.x, boss.y + yOff).setDepth(boss.y + 2);
  }

  /* ── BOSS: FIRE BREATH ──────────────────────────────────── */
  _bossFireBreath(boss) {
    const px = this.knight.x, py = this.knight.y;
    const angle = Math.atan2(py - boss.y, px - boss.x);
    boss.setFlipX(px < boss.x);

    // Play fire attack anim
    const fireAnim = 'dragon_fire_attack';
    if (this.anims.exists(fireAnim)) boss.play(fireAnim, true);
    boss.once('animationcomplete-dragon_fire_attack', () => {
      if (!boss.enemyData.isDead) boss.play('dragon_idle', true);
    });

    // Fire projectiles in a cone
    const pd = this.playerData;
    const numFlames = boss.enemyData.phase === 2 ? 7 : 5;
    const spread = 0.4; // radians spread

    for (let i = 0; i < numFlames; i++) {
      const a = angle + (i - (numFlames - 1) / 2) * (spread / (numFlames - 1) * 2);
      const delay = i * 80;

      this.time.delayedCall(delay, () => {
        const flame = this.add.graphics().setDepth(10000);
        flame.fillStyle(0xff6600, 0.7);
        flame.fillCircle(0, 0, 8);
        flame.fillStyle(0xffaa00, 0.4);
        flame.fillCircle(0, 0, 12);
        flame.setPosition(boss.x + Math.cos(a) * 40, boss.y + Math.sin(a) * 40);

        const speed = 200;
        let traveled = 0;
        const maxDist = 280;
        let hit = false;

        const ev = this.time.addEvent({
          delay: 16, repeat: Math.ceil(maxDist / (speed * 0.016)),
          callback: () => {
            if (hit) return;
            const step = speed * 0.016;
            flame.x += Math.cos(a) * step;
            flame.y += Math.sin(a) * step;
            traveled += step;

            // Trail
            const trail = this.add.graphics().setDepth(9999);
            trail.fillStyle(0xff4400, 0.2);
            trail.fillCircle(0, 0, 5);
            trail.setPosition(flame.x, flame.y);
            this.tweens.add({ targets: trail, alpha: 0, duration: 300, onComplete: () => trail.destroy() });

            // Hit player check
            if (Math.hypot(flame.x - this.knight.x, flame.y - this.knight.y) < 35) {
              hit = true;
              const equipDef = pd._equipBonusDef || 0;
              const fireDmg = Math.max(1, boss.enemyData.dmg - Math.floor(equipDef * 0.3));
              pd.hp = Math.max(0, pd.hp - fireDmg);
              if (pd.hp <= 0 && !this._isDead) {
                this._isDead = true;
                this.knight.body.setVelocity(0, 0);
                if (this.anims.exists('hero_death')) this.knight.play('hero_death', true);
                this._syncState();
                if (this._onPlayerDeath) this._onPlayerDeath();
              }
              this.cameras.main.shake(100, 0.008);
              this.knight.setTint(0xff6600);
              this.time.delayedCall(200, () => { if (!this._isDead) this.knight.clearTint(); });
            }

            if (traveled >= maxDist || hit) { flame.destroy(); ev.destroy(); }
          },
        });
      });
    }

    this.cameras.main.shake(150, 0.006);
  }

  /* ── BOSS: SUMMON MINIONS ───────────────────────────────── */
  _bossSummonMinions(boss) {
    const summonTxt = this.add.text(boss.x, boss.y - 50, 'Summoning!', {
      fontSize: '12px', fontFamily: "'Cinzel', serif", color: '#aa44ff',
      stroke: '#000', strokeThickness: 2, fontStyle: 'bold',
    }).setOrigin(0.5).setDepth(10002);
    this.tweens.add({ targets: summonTxt, y: summonTxt.y - 30, alpha: 0, duration: 1200, onComplete: () => summonTxt.destroy() });

    // Summon 2 vampires near boss
    for (let i = 0; i < 2; i++) {
      const sx = boss.x + (Math.random() - 0.5) * 150;
      const sy = boss.y + 60 + Math.random() * 80;
      this._createEnemy(sx, sy, 'vampire', ENEMY_TYPES.vampire);

      // Spawn flash
      const flash = this.add.graphics().setDepth(10000);
      flash.fillStyle(0x8844ff, 0.4);
      flash.fillCircle(sx, sy, 30);
      this.tweens.add({ targets: flash, alpha: 0, scale: 2, duration: 400, onComplete: () => flash.destroy() });
    }
  }

  /* Override portal: return to forest */
  _enterPortal() {
    if (this._transitioning) return;
    this._transitioning = true;
    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      const data = this._getTransitionData();
      data.savedData.x = FOREST_PORTAL_POS.x;
      data.savedData.y = FOREST_PORTAL_POS.y + 50;
      this.scene.start('DarkForest', data);
    });
  }
}

/* ═══════════════════════════════════════════════════════════════
   REACT COMPONENT
   ═══════════════════════════════════════════════════════════════ */
// Module-level storage for scene data — avoids Phaser data-passing issues
let __pendingSceneData = null;

export default function GameMap({ playerState, setPlayerState, sceneRef, addToBackpack, inventoryOpen, setInventoryOpen, chosenClass, savedData, onPlayerDeath, onOpenTrade, onZoneChange }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  const syncFn = useCallback((state) => {
    setPlayerState(prev => {
      if (prev.hp === state.hp && prev.mana === state.mana &&
          prev.xp === state.xp && prev.level === state.level &&
          prev.gold === state.gold && prev.baseDmg === state.baseDmg) return prev;
      return state;
    });
  }, [setPlayerState]);

  // Store callbacks in refs so the useEffect doesn't re-run on every render
  const dataRef = useRef({ syncFn, addToBackpack, sceneRef, chosenClass, savedData, onPlayerDeath, onOpenTrade, onZoneChange });
  dataRef.current = { syncFn, addToBackpack, sceneRef, chosenClass, savedData, onPlayerDeath, onOpenTrade, onZoneChange };

  useEffect(() => {
    if (gameRef.current) return;
    const d = dataRef.current;
    console.log('[GameMap] Creating Phaser game, chosenClass:', d.chosenClass?.id);

    // Store data at module level — DarkForestScene.init will read it
    __pendingSceneData = { ...d };

    gameRef.current = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelArt: true,
      backgroundColor: '#0a0a08',
      physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
      scene: [DarkForestScene],
      scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH },
      input: { keyboard: { target: window }, mouse: { target: containerRef.current } },
    });
    // Focus the canvas so Phaser captures keyboard input
    setTimeout(() => {
      const canvas = containerRef.current?.querySelector('canvas');
      if (canvas) { canvas.setAttribute('tabindex', '0'); canvas.focus(); }
    }, 200);
    return () => { if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null; } };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        <HUD playerState={playerState} classId={chosenClass?.id} inventoryOpen={inventoryOpen} onToggleInventory={() => setInventoryOpen(prev => !prev)} />
      </div>
    </div>
  );
}

export { LOOT_TABLE, RARITIES };
