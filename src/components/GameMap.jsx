import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const WORLD_W = 4000;
const WORLD_H = 4000;
const TILE = 16;
const PLAYER_SPEED = 210;
const SPRITE_SCALE = 2.5;
const GROUND_RES = 500;          // ground canvas texture resolution
const PX_PER_TEXEL = WORLD_W / GROUND_RES; // 8

/* ── asset shorthand paths ─────────────────────────────────── */
const HERO = 'assets/sprites/craftpix-891165-assassin-mage-viking-free-pixel-art-game-heroes/PNG/Knight';
const TREES = 'assets/sprites/craftpix-net-385863-free-top-down-trees-pixel-art/PNG/Assets_separately/Trees_texture_shadow_dark';
const ROCKS = 'assets/sprites/craftpix-net-974061-free-rocks-and-stones-top-down-pixel-art/PNG/Objects_separately';
const HOME  = 'assets/sprites/craftpix-net-654184-main-characters-home-free-top-down-pixel-art-asset/PNG';

/* ── tree & rock definitions ───────────────────────────────── */
const TREE_DEFS = [
  { key: 'tree_broken7',  file: 'Broken_tree7.png',  w: 128, h: 128, colR: 14 },
  { key: 'tree_burned1',  file: 'Burned_tree1.png',  w: 128, h: 128, colR: 14 },
  { key: 'tree_burned2',  file: 'Burned_tree2.png',  w: 64,  h: 64,  colR: 10 },
  { key: 'tree_autumn1',  file: 'Autumn_tree1.png',  w: 128, h: 128, colR: 18 },
  { key: 'tree_autumn2',  file: 'Autumn_tree2.png',  w: 64,  h: 64,  colR: 10 },
  { key: 'tree_moss1',    file: 'Moss_tree1.png',    w: 128, h: 128, colR: 16 },
  { key: 'tree_broken4',  file: 'Broken_tree4.png',  w: 64,  h: 64,  colR: 10 },
  { key: 'tree_broken1',  file: 'Broken_tree1.png',  w: 32,  h: 32,  colR: 6  },
];

const ROCK_DEFS = [
  { key: 'rock1_1', file: 'Rock1_1.png', w: 64, h: 64, col: true  },
  { key: 'rock1_2', file: 'Rock1_2.png', w: 64, h: 64, col: true  },
  { key: 'rock1_3', file: 'Rock1_3.png', w: 32, h: 32, col: false },
  { key: 'rock1_4', file: 'Rock1_4.png', w: 32, h: 32, col: false },
  { key: 'rock2_1', file: 'Rock2_1.png', w: 64, h: 64, col: true  },
];

/* ═══════════════════════════════════════════════════════════════
   PERLIN NOISE  – classic 2-D gradient noise
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
  const dot  = (g, x, y) => g[0] * x + g[1] * y;

  return (x, y) => {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x), yf = y - Math.floor(y);
    const u = fade(xf), v = fade(yf);
    const aa = perm[perm[X] + Y] & 7,     ab = perm[perm[X] + Y + 1] & 7;
    const ba = perm[perm[X + 1] + Y] & 7, bb = perm[perm[X + 1] + Y + 1] & 7;
    return lerp(
      lerp(dot(G[aa], xf, yf),     dot(G[ba], xf - 1, yf), u),
      lerp(dot(G[ab], xf, yf - 1), dot(G[bb], xf - 1, yf - 1), u),
      v,
    );
  };
}

function fbm(noise, x, y, oct = 4) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += noise(x * f, y * f) * a; a *= 0.5; f *= 2; }
  return v;
}

/* ═══════════════════════════════════════════════════════════════
   PATH GENERATION  – wandering bezier curves
   ═══════════════════════════════════════════════════════════════ */
function generatePaths(count, w, h, rng) {
  const paths = [];
  for (let i = 0; i < count; i++) {
    const vertical = rng() > 0.5;
    let x0, y0, x1, y1;
    if (vertical) {
      x0 = w * 0.15 + rng() * w * 0.7; y0 = 0;
      x1 = w * 0.15 + rng() * w * 0.7; y1 = h;
    } else {
      x0 = 0; y0 = h * 0.15 + rng() * h * 0.7;
      x1 = w; y1 = h * 0.15 + rng() * h * 0.7;
    }
    const cx1 = x0 + (x1 - x0) * 0.33 + (rng() - 0.5) * w * 0.4;
    const cy1 = y0 + (y1 - y0) * 0.33 + (rng() - 0.5) * h * 0.4;
    const cx2 = x0 + (x1 - x0) * 0.66 + (rng() - 0.5) * w * 0.4;
    const cy2 = y0 + (y1 - y0) * 0.66 + (rng() - 0.5) * h * 0.4;
    paths.push({ x0, y0, cx1, cy1, cx2, cy2, x1, y1 });
  }
  return paths;
}

function bezierPoint(p, t) {
  const mt = 1 - t;
  const mt2 = mt * mt, mt3 = mt2 * mt;
  const t2 = t * t, t3 = t2 * t;
  return {
    x: mt3 * p.x0 + 3 * mt2 * t * p.cx1 + 3 * mt * t2 * p.cx2 + t3 * p.x1,
    y: mt3 * p.y0 + 3 * mt2 * t * p.cy1 + 3 * mt * t2 * p.cy2 + t3 * p.y1,
  };
}

/* ═══════════════════════════════════════════════════════════════
   BUILDING TEMPLATES  – baked from walls_floor tiles via RenderTexture
   ═══════════════════════════════════════════════════════════════ */
const COTTAGE_W = 7;  // tiles
const COTTAGE_H = 6;  // tiles
// 9-slice composition: TL, T, TR, L, C, R, BL, B, BR
// walls_floor.png  = 9 cols × 11 rows  (16px each)
// Row 0: top edges   Row 1-2: wall fills   Row 3: bottom edges
const COTTAGE_TILES = [
  [0, 1, 1, 1, 1, 1, 2],
  [9,10,10,10,10,10,11],
  [9,10,10,10,10,10,11],
  [9,10,10,10,10,10,11],
  [9,10,10,10,10,10,11],
  [18,19,19,19,19,19,20],
];

/* ═══════════════════════════════════════════════════════════════
   SCENE    –   DarkForestScene
   ═══════════════════════════════════════════════════════════════ */
class DarkForestScene extends Phaser.Scene {
  constructor() { super('DarkForest'); }

  /* ── PRELOAD ───────────────────────────────────────────────── */
  preload() {
    // Knight individual frames
    const anims = [
      { name: 'idle', count: 12, start: 1 },
      { name: 'run',  count: 8,  start: 1 },
      { name: 'walk', count: 6,  start: 1, folder: 'Walk' },
      { name: 'attack', count: 5, start: 0, folder: 'Attack' },
      { name: 'death',  count: 10, start: 1, folder: 'Death' },
      { name: 'hurt',   count: 4,  start: 1, folder: 'Hurt' },
    ];
    for (const a of anims) {
      const folder = a.folder || a.name.charAt(0).toUpperCase() + a.name.slice(1);
      for (let i = a.start; i < a.start + a.count; i++) {
        this.load.image(`knight_${a.name}_${i}`, `${HERO}/${folder}/${a.name}${i}.png`);
      }
    }

    // Trees
    for (const t of TREE_DEFS) this.load.image(t.key, `${TREES}/${t.file}`);

    // Rocks
    for (const r of ROCK_DEFS) this.load.image(r.key, `${ROCKS}/${r.file}`);

    // Building tilesheets
    this.load.spritesheet('walls_floor', `${HOME}/walls_floor.png`, { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet('exterior',    `${HOME}/exterior.png`,     { frameWidth: 16, frameHeight: 16 });
    this.load.image('ground_details', `${HOME}/ground_grass_details.png`);
  }

  /* ── CREATE ────────────────────────────────────────────────── */
  create() {
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);

    // Seeded RNG for reproducibility
    const seed = 12345;
    const noise = createNoise2D(seed);
    let rngState = seed;
    const rng = () => { rngState = (rngState * 16807) % 2147483647; return rngState / 2147483647; };

    // Pre-compute path data
    this.worldPaths = generatePaths(4, WORLD_W, WORLD_H, rng);
    const pathPoints = this._rasterizePaths(this.worldPaths);

    /* ---------- 1. GROUND CANVAS TEXTURE ---------- */
    this._createGroundTexture(noise, pathPoints);

    /* ---------- 2. BUILDINGS ---------- */
    this.staticObjects = this.physics.add.staticGroup();
    this.decorations = [];
    this._createBuildings(rng);

    /* ---------- 3. TREES ---------- */
    this._scatterTrees(noise, rng, pathPoints);

    /* ---------- 4. ROCKS ---------- */
    this._scatterRocks(noise, rng, pathPoints);

    /* ---------- 5. PLAYER ---------- */
    this._createPlayer();

    /* ---------- 6. PHYSICS ---------- */
    this.physics.add.collider(this.knight, this.staticObjects);

    /* ---------- 7. CAMERA ---------- */
    const cam = this.cameras.main;
    cam.setBounds(0, 0, WORLD_W, WORLD_H);
    cam.startFollow(this.knight, true, 0.09, 0.09);
    cam.setZoom(1);
    // dark tint overlay
    cam.setBackgroundColor('#0a0a08');

    /* ---------- 8. INPUT ---------- */
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
    this.cursors = this.input.keyboard.createCursorKeys();

    /* ---------- 9. ATMOSPHERE ---------- */
    this._createAtmosphere();

    /* ---------- 10. FRUSTUM CULLING ---------- */
    this._cullTimer = 0;
  }

  /* ── GROUND TEXTURE ─────────────────────────────────────── */
  _createGroundTexture(noise, pathPoints) {
    const canvas = document.createElement('canvas');
    canvas.width = GROUND_RES;
    canvas.height = GROUND_RES;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(GROUND_RES, GROUND_RES);
    const d = imgData.data;

    // Build path lookup set (texel coords)
    const pathSet = new Set();
    for (const pt of pathPoints) {
      const tx = Math.floor(pt.x / PX_PER_TEXEL);
      const ty = Math.floor(pt.y / PX_PER_TEXEL);
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const nx = tx + dx, ny = ty + dy;
          if (nx >= 0 && nx < GROUND_RES && ny >= 0 && ny < GROUND_RES) {
            pathSet.add(ny * GROUND_RES + nx);
          }
        }
      }
    }

    for (let y = 0; y < GROUND_RES; y++) {
      for (let x = 0; x < GROUND_RES; x++) {
        const wx = (x / GROUND_RES) * 6;
        const wy = (y / GROUND_RES) * 6;
        const n1 = fbm(noise, wx, wy, 4);
        const n2 = fbm(noise, wx + 50, wy + 50, 3);
        const idx = (y * GROUND_RES + x) * 4;

        let r, g, b;
        if (pathSet.has(y * GROUND_RES + x)) {
          // Dirt path
          const v = 0.5 + n2 * 0.15;
          r = Math.floor(55 * v);
          g = Math.floor(42 * v);
          b = Math.floor(30 * v);
        } else if (n1 > 0.15) {
          // Dark grass
          const v = 0.7 + n1 * 0.3;
          r = Math.floor(22 * v);
          g = Math.floor(38 * v);
          b = Math.floor(18 * v);
        } else if (n1 > -0.1) {
          // Mossy earth
          const v = 0.7 + n2 * 0.25;
          r = Math.floor(18 * v);
          g = Math.floor(30 * v);
          b = Math.floor(22 * v);
        } else {
          // Dark bare earth
          const v = 0.6 + n1 * 0.2;
          r = Math.floor(28 * v);
          g = Math.floor(24 * v);
          b = Math.floor(18 * v);
        }
        d[idx]     = r;
        d[idx + 1] = g;
        d[idx + 2] = b;
        d[idx + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const tex = this.textures.createCanvas('biome_ground', GROUND_RES, GROUND_RES);
    tex.context.drawImage(canvas, 0, 0);
    tex.refresh();

    const groundImg = this.add.image(WORLD_W / 2, WORLD_H / 2, 'biome_ground');
    groundImg.setDisplaySize(WORLD_W, WORLD_H);
    groundImg.setDepth(-1000);

    // Enable smooth scaling
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

  /* ── PATH RASTERIZATION ──────────────────────────────────── */
  _rasterizePaths(paths) {
    const points = [];
    for (const p of paths) {
      for (let t = 0; t <= 1; t += 0.002) {
        points.push(bezierPoint(p, t));
      }
    }
    return points;
  }

  /* ── BUILDINGS ──────────────────────────────────────────── */
  _createBuildings(rng) {
    // Bake cottage texture from wall tiles
    const cw = COTTAGE_W * TILE;
    const ch = COTTAGE_H * TILE;
    const rt = this.add.renderTexture(0, 0, cw, ch);
    rt.setVisible(false);

    for (let row = 0; row < COTTAGE_H; row++) {
      for (let col = 0; col < COTTAGE_W; col++) {
        const frame = COTTAGE_TILES[row][col];
        rt.drawFrame('walls_floor', frame, col * TILE, row * TILE);
      }
    }
    rt.saveTexture('building_cottage');
    rt.destroy();

    // Place buildings near paths
    const buildingPositions = [
      { x: WORLD_W * 0.45, y: WORLD_H * 0.42 },
      { x: WORLD_W * 0.7,  y: WORLD_H * 0.35 },
    ];

    for (const pos of buildingPositions) {
      const bld = this.add.image(pos.x, pos.y, 'building_cottage');
      bld.setScale(3);
      bld.setOrigin(0.5, 0.85);
      bld.setDepth(pos.y);
      this.decorations.push(bld);

      // Base-only collision zone (bottom 25% of the building)
      const dispW = cw * 3;
      const dispH = ch * 3;
      const baseH = dispH * 0.25;
      const zone = this.add.zone(
        pos.x,
        pos.y - dispH * 0.15 + dispH * 0.5 - baseH / 2 + dispH * 0.3,
        dispW * 0.85,
        baseH,
      );
      this.physics.add.existing(zone, true);
      this.staticObjects.add(zone);
    }
  }

  /* ── TREES ──────────────────────────────────────────────── */
  _scatterTrees(noise, rng, pathPoints) {
    // Build path exclusion set (world coords, 48px grid)
    const pathExclude = new Set();
    for (const pt of pathPoints) {
      const gx = Math.floor(pt.x / 48);
      const gy = Math.floor(pt.y / 48);
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          pathExclude.add(`${gx + dx},${gy + dy}`);
    }

    const MARGIN = 80;
    let placed = 0;
    const maxTrees = 220;

    for (let attempt = 0; attempt < 5000 && placed < maxTrees; attempt++) {
      const x = MARGIN + rng() * (WORLD_W - MARGIN * 2);
      const y = MARGIN + rng() * (WORLD_H - MARGIN * 2);

      // Check noise density — trees only in "forest" areas
      const n = fbm(noise, (x / WORLD_W) * 6, (y / WORLD_H) * 6, 3);
      if (n < -0.05) continue;

      // Check path exclusion
      const gx = Math.floor(x / 48);
      const gy = Math.floor(y / 48);
      if (pathExclude.has(`${gx},${gy}`)) continue;

      // Exclude building zones
      if (this._nearBuilding(x, y, 180)) continue;

      const def = TREE_DEFS[Math.floor(rng() * TREE_DEFS.length)];
      const tree = this.add.image(x, y, def.key);
      const scale = def.w >= 128 ? 2 + rng() * 0.8 : 1.5 + rng() * 0.5;
      tree.setScale(scale);
      tree.setOrigin(0.5, 0.85);
      tree.setDepth(y);
      this.decorations.push(tree);

      // Base-only collision zone
      const colW = def.colR * scale * 1.5;
      const colH = def.colR * scale * 0.7;
      const zone = this.add.zone(x, y + def.h * scale * 0.15, colW, colH);
      this.physics.add.existing(zone, true);
      this.staticObjects.add(zone);

      placed++;
    }
  }

  /* ── ROCKS ──────────────────────────────────────────────── */
  _scatterRocks(noise, rng, pathPoints) {
    const pathExclude = new Set();
    for (const pt of pathPoints) {
      const gx = Math.floor(pt.x / 48);
      const gy = Math.floor(pt.y / 48);
      pathExclude.add(`${gx},${gy}`);
    }

    let placed = 0;
    const maxRocks = 100;

    for (let attempt = 0; attempt < 3000 && placed < maxRocks; attempt++) {
      const x = 60 + rng() * (WORLD_W - 120);
      const y = 60 + rng() * (WORLD_H - 120);

      const n = fbm(noise, (x / WORLD_W) * 8 + 100, (y / WORLD_H) * 8 + 100, 3);
      if (n > 0.2) continue;

      const gx = Math.floor(x / 48);
      const gy = Math.floor(y / 48);
      if (pathExclude.has(`${gx},${gy}`)) continue;
      if (this._nearBuilding(x, y, 150)) continue;

      const def = ROCK_DEFS[Math.floor(rng() * ROCK_DEFS.length)];
      const rock = this.add.image(x, y, def.key);
      const scale = 1.5 + rng() * 1.0;
      rock.setScale(scale);
      rock.setOrigin(0.5, 0.7);
      rock.setDepth(y);
      this.decorations.push(rock);

      if (def.col) {
        const cw = def.w * scale * 0.6;
        const ch = def.h * scale * 0.3;
        const zone = this.add.zone(x, y + def.h * scale * 0.1, cw, ch);
        this.physics.add.existing(zone, true);
        this.staticObjects.add(zone);
      }

      placed++;
    }
  }

  _nearBuilding(x, y, dist) {
    const bx1 = WORLD_W * 0.45, by1 = WORLD_H * 0.42;
    const bx2 = WORLD_W * 0.7,  by2 = WORLD_H * 0.35;
    const d1 = Math.abs(x - bx1) + Math.abs(y - by1);
    const d2 = Math.abs(x - bx2) + Math.abs(y - by2);
    return d1 < dist || d2 < dist;
  }

  /* ── PLAYER ─────────────────────────────────────────────── */
  _createPlayer() {
    const startX = WORLD_W / 2;
    const startY = WORLD_H / 2;

    this.knight = this.physics.add.sprite(startX, startY, 'knight_idle_1');
    this.knight.setScale(SPRITE_SCALE);
    this.knight.setCollideWorldBounds(true);
    this.knight.setDepth(startY);

    // Tight hitbox on feet
    const frameW = 128, frameH = 128;
    const bodyW = 22, bodyH = 14;
    this.knight.body.setSize(bodyW, bodyH);
    this.knight.body.setOffset((frameW - bodyW) / 2, frameH - bodyH - 8);

    // Create animations
    this.anims.create({
      key: 'knight_idle',
      frames: Array.from({ length: 12 }, (_, i) => ({ key: `knight_idle_${i + 1}` })),
      frameRate: 8,
      repeat: -1,
    });
    this.anims.create({
      key: 'knight_run',
      frames: Array.from({ length: 8 }, (_, i) => ({ key: `knight_run_${i + 1}` })),
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({
      key: 'knight_attack',
      frames: Array.from({ length: 5 }, (_, i) => ({ key: `knight_attack_${i}` })),
      frameRate: 12,
      repeat: 0,
    });

    this.knight.play('knight_idle');
    this.playerFacing = 'right';
  }

  /* ── ATMOSPHERE ─────────────────────────────────────────── */
  _createAtmosphere() {
    // Dust/ash particles following camera
    if (this.add.particles) {
      this.dustEmitter = this.add.particles(0, 0, 'knight_idle_1', {
        alpha: { start: 0.08, end: 0 },
        scale: { start: 0.03, end: 0.01 },
        tint: 0x888866,
        speed: { min: 5, max: 20 },
        lifespan: 4000,
        frequency: 400,
        quantity: 1,
        blendMode: 'ADD',
        follow: this.knight,
        followOffset: { x: 0, y: 0 },
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(-500, -400, 1000, 800),
        },
      });
      this.dustEmitter.setDepth(10000);
    }

    // Dark vignette overlay using a graphics object
    const vignette = this.add.graphics();
    vignette.setScrollFactor(0);
    vignette.setDepth(9999);
    const gw = this.cameras.main.width;
    const gh = this.cameras.main.height;
    // Darken edges
    vignette.fillStyle(0x000000, 0.3);
    vignette.fillRect(0, 0, gw, gh);
    // Cut center bright area
    const cx = gw / 2, cy = gh / 2;
    const gradient = vignette.createGeometryMask();
    // Simple approach: semi-transparent black border
    vignette.clear();
    for (let i = 0; i < 20; i++) {
      const alpha = (i / 20) * 0.35;
      vignette.lineStyle(8, 0x000000, alpha);
      vignette.strokeRect(i * 8, i * 8, gw - i * 16, gh - i * 16);
    }
  }

  /* ── FRUSTUM CULLING ────────────────────────────────────── */
  _updateCulling() {
    const cam = this.cameras.main;
    const pad = 200;
    const left   = cam.scrollX - pad;
    const right  = cam.scrollX + cam.width + pad;
    const top    = cam.scrollY - pad;
    const bottom = cam.scrollY + cam.height + pad;

    for (const obj of this.decorations) {
      const visible = obj.x > left && obj.x < right && obj.y > top && obj.y < bottom;
      obj.setVisible(visible);
      obj.setActive(visible);
    }
  }

  /* ── UPDATE ─────────────────────────────────────────────── */
  update(time, delta) {
    if (!this.knight) return;

    /* --- Input --- */
    const k = this.keys;
    const c = this.cursors;
    let vx = 0, vy = 0;

    if (k.A.isDown || c.left.isDown)  vx = -1;
    if (k.D.isDown || c.right.isDown) vx = 1;
    if (k.W.isDown || c.up.isDown)    vy = -1;
    if (k.S.isDown || c.down.isDown)  vy = 1;

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.knight.body.setVelocity(vx * PLAYER_SPEED, vy * PLAYER_SPEED);

    /* --- Animation --- */
    const moving = vx !== 0 || vy !== 0;
    if (moving) {
      if (this.knight.anims.currentAnim?.key !== 'knight_run') {
        this.knight.play('knight_run', true);
      }
      if (vx > 0) { this.knight.setFlipX(false); this.playerFacing = 'right'; }
      if (vx < 0) { this.knight.setFlipX(true);  this.playerFacing = 'left'; }
    } else {
      if (this.knight.anims.currentAnim?.key !== 'knight_idle') {
        this.knight.play('knight_idle', true);
      }
    }

    /* --- Depth sort --- */
    this.knight.setDepth(this.knight.y);
    // Decorations are mostly static; depth set at creation

    /* --- Frustum culling (throttled) --- */
    this._cullTimer += delta;
    if (this._cullTimer > 200) {
      this._cullTimer = 0;
      this._updateCulling();
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   REACT COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function GameMap() {
  const containerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      pixelArt: true,
      backgroundColor: '#0a0a08',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scene: [DarkForestScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
