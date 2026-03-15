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
const SPRITE_SCALE = 2.5;
const GROUND_RES = 500;
const PX_PER_TEXEL = WORLD_W / GROUND_RES;

/* ── asset paths ───────────────────────────────────────────── */
const HERO_BASE = 'assets/sprites/craftpix-891165-assassin-mage-viking-free-pixel-art-game-heroes/PNG';
const TREES   = 'assets/sprites/craftpix-net-385863-free-top-down-trees-pixel-art/PNG/Assets_separately/Trees_texture_shadow_dark';
const ROCKS   = 'assets/sprites/craftpix-net-974061-free-rocks-and-stones-top-down-pixel-art/PNG/Objects_separately';
const HOME    = 'assets/sprites/craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset/PNG';
const ORCS    = 'assets/sprites/craftpix-net-363992-free-top-down-orc-game-character-pixel-art/PNG';
const SLIMES  = 'assets/sprites/craftpix-net-788364-free-slime-mobs-pixel-art-top-down-sprite-pack/PNG';
const MONSTERS = 'assets/sprites/craftpix-561178-free-rpg-monster-sprites-pixel-art/PNG';

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
  constructor() { super('DarkForest'); }

  init(data) {
    this._syncFn = data.syncFn;
    this._addToBackpack = data.addToBackpack;
    this._sceneRef = data.sceneRef;
    this._chosenClass = data.chosenClass;
    this._savedData = data.savedData;
    this._onPlayerDeath = data.onPlayerDeath;
    if (this._sceneRef) this._sceneRef.current = this;
  }

  /* ── PRELOAD ───────────────────────────────────────────────── */
  preload() {
    // Load hero frames for the chosen class
    const classId = this._chosenClass?.id || 'warrior';
    const heroDef = HERO_CLASSES[classId] || HERO_CLASSES.warrior;
    const heroPath = `${HERO_BASE}/${heroDef.folder}`;
    for (const a of heroDef.anims) {
      const folder = a.folder || a.name.charAt(0).toUpperCase() + a.name.slice(1);
      const prefix = a.filePrefix || a.name;
      for (let i = a.start; i < a.start + a.count; i++)
        this.load.image(`hero_${a.name}_${i}`, `${heroPath}/${folder}/${prefix}${i}.png`);
    }

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
  }

  /* ── CREATE ────────────────────────────────────────────────── */
  create() {
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
    this._createBuildings(rng);
    this._scatterTrees(noise, rng);
    this._scatterRocks(noise, rng);

    /* --- Player --- */
    this._createPlayer();

    /* --- Enemies --- */
    this.enemies = [];
    this._createEnemyAnims();
    this._spawnEnemies(rng);

    /* --- Loot on ground --- */
    this.lootDrops = [];

    /* --- Physics --- */
    this.physics.add.collider(this.knight, this.staticObjects);

    /* --- Camera --- */
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.startFollow(this.knight, true, 0.09, 0.09);
    cam.setBackgroundColor('#0a0a08');

    /* --- Input --- */
    this.keys = this.input.keyboard.addKeys('W,A,S,D,E,F');
    this.cursors = this.input.keyboard.createCursorKeys();
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) this._playerAttack();
    });

    /* --- Player state (from class + save) --- */
    const cls = this._chosenClass || {};
    const sv = this._savedData || {};
    this.playerData = {
      hp: sv.hp ?? cls.hp ?? 100,
      maxHp: cls.hp ?? 100,
      mana: sv.mana ?? cls.mana ?? 50,
      maxMana: cls.mana ?? 50,
      xp: sv.xp ?? 0, xpToLevel: sv.xpToLevel ?? 100,
      level: sv.level ?? 1, gold: sv.gold ?? 0,
      baseDmg: cls.baseDmg ?? 12, critChance: (cls.critChance ?? 15) / 100,
      isAttacking: false, whirlwinding: false,
      skills: { q: 0, w: 0, e: 0, r: 0, eActive: false },
    };
    this._isDead = false;

    /* --- Timers --- */
    this._atkCooldown = 0;
    this._hitStopTimer = 0;
    this._syncTimer = 0;
    this._cullTimer = 0;
    this._manaRegen = 0;
    this._whirlTimer = 0;

    /* --- Atmosphere --- */
    this._createAtmosphere();
    this._syncState();
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
  }

  /* ── SPAWN ENEMIES ──────────────────────────────────────── */
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
      const dist = Math.hypot(e.x - px, e.y - py);

      // Sleep distant enemies
      if (dist > 900) { e.body.setVelocity(0, 0); continue; }

      switch (ed.state) {
        case 'wander': {
          ed.wanderTimer -= delta;
          if (ed.wanderTimer <= 0) {
            ed.wanderTimer = 1500 + Math.random() * 2000;
            const a = Math.random() * Math.PI * 2;
            ed.wanderDirX = Math.cos(a); ed.wanderDirY = Math.sin(a);
          }
          e.body.setVelocity(ed.wanderDirX * ed.speed * 0.3, ed.wanderDirY * ed.speed * 0.3);
          if (dist < ed.aggroRange) ed.state = 'chase';
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
        const v = 0.5 + n2 * 0.15; r = Math.floor(55 * v); g = Math.floor(42 * v); b = Math.floor(30 * v);
      } else if (n1 > 0.15) {
        const v = 0.7 + n1 * 0.3; r = Math.floor(22 * v); g = Math.floor(38 * v); b = Math.floor(18 * v);
      } else if (n1 > -0.1) {
        const v = 0.7 + n2 * 0.25; r = Math.floor(18 * v); g = Math.floor(30 * v); b = Math.floor(22 * v);
      } else {
        const v = 0.6 + n1 * 0.2; r = Math.floor(28 * v); g = Math.floor(24 * v); b = Math.floor(18 * v);
      }
      d[idx] = r; d[idx + 1] = g; d[idx + 2] = b; d[idx + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const tex = this.textures.createCanvas('biome_ground', GROUND_RES, GROUND_RES);
    tex.context.drawImage(canvas, 0, 0); tex.refresh();
    const groundImg = this.add.image(WORLD_W / 2, WORLD_H / 2, 'biome_ground');
    groundImg.setDisplaySize(WORLD_W, WORLD_H).setDepth(-1000);
    if (groundImg.texture?.source?.[0]) {
      const glTex = groundImg.texture.source[0].glTexture;
      const renderer = this.game.renderer;
      if (renderer?.gl && glTex) {
        const gl = renderer.gl;
        renderer.setTexture2D(glTex, 0);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      }
    }
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
    this.knight.setScale(SPRITE_SCALE).setCollideWorldBounds(true).setDepth(WORLD_H / 2);
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
    this._updateWhirlwind(delta);
    this._manaRegen += delta;
    if (this._manaRegen > 500) {
      this._manaRegen = 0;
      if (pd.mana < pd.maxMana && !pd.whirlwinding) pd.mana = Math.min(pd.maxMana, pd.mana + 1);
    }

    /* --- Enemies --- */
    this._updateEnemyAI(delta);
    this._updateHPBars();
    this._checkPickupKey();

    /* --- Depth --- */
    this.knight.setDepth(this.knight.y);

    /* --- Culling --- */
    this._cullTimer += delta;
    if (this._cullTimer > 200) { this._cullTimer = 0; this._updateCulling(); }

    /* --- HUD sync --- */
    this._syncTimer += delta;
    if (this._syncTimer > 100) { this._syncTimer = 0; this._syncState(); }
  }
}

/* ═══════════════════════════════════════════════════════════════
   REACT COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function GameMap({ playerState, setPlayerState, sceneRef, addToBackpack, inventoryOpen, setInventoryOpen, chosenClass, savedData, onPlayerDeath }) {
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

  useEffect(() => {
    if (gameRef.current) return;
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
    });
    gameRef.current.scene.start('DarkForest', { syncFn, addToBackpack, sceneRef, chosenClass, savedData, onPlayerDeath });
    return () => { if (gameRef.current) { gameRef.current.destroy(true); gameRef.current = null; } };
  }, [syncFn, addToBackpack, sceneRef, chosenClass, savedData, onPlayerDeath]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      <HUD playerState={playerState} inventoryOpen={inventoryOpen} onToggleInventory={() => setInventoryOpen(prev => !prev)} />
    </div>
  );
}
