// ============================================================
// COMPONENT: Diablo-style 2D ARPG World Map (Phaser 3)
// Dark gothic atmosphere, knight sprite, fog of war, NPC
// merchant, monster spawns, click-to-move, camera follow,
// portal transitions. Phaser loaded via dynamic import().
// ============================================================
import React, { useEffect, useRef, useState } from 'react';

// ── World ─────────────────────────────────────────────────
const WORLD_W = 4000;
const WORLD_H = 3200;
const PLAYER_SPEED = 200;
const INTERACT_RADIUS = 55;

// ── Enemy spawns ──────────────────────────────────────────
const ENEMY_SPAWNS = [
  { x: 900,  y: 600,  enemyId: 'skeleton_guard',     label: 'Szkielet Strażnik',  isBoss: false },
  { x: 1400, y: 450,  enemyId: 'corrupted_hound',    label: 'Skaźony Kundel',     isBoss: false },
  { x: 650,  y: 1100, enemyId: 'ruin_crawler',        label: 'Pełzacz Ruin',       isBoss: false },
  { x: 1800, y: 900,  enemyId: 'fallen_knight',      label: 'Upadły Rycerz',      isBoss: false },
  { x: 2500, y: 600,  enemyId: 'wraith_archer',      label: 'Łucznik-Widmo',      isBoss: false },
  { x: 2200, y: 1500, enemyId: 'void_acolyte',       label: 'Akolita Pustki',     isBoss: false },
  { x: 3100, y: 1100, enemyId: 'stone_sentinel',     label: 'Kamienny Strażnik',  isBoss: false },
  { x: 3300, y: 700,  enemyId: 'skeleton_guard',     label: 'Szkielet Strażnik',  isBoss: false },
  { x: 1200, y: 1700, enemyId: 'corrupted_hound',    label: 'Skaźony Kundel',     isBoss: false },
  { x: 2800, y: 1800, enemyId: 'fallen_knight',      label: 'Upadły Rycerz',      isBoss: false },
  { x: 1900, y: 2400, enemyId: 'the_undying_warden', label: 'Nieśmiertelny Strażnik', isBoss: true },
];

// ── NPC positions ─────────────────────────────────────────
const NPC_DATA = [
  { x: 400, y: 400, id: 'merchant_goran', label: 'Goran — Kupiec', icon: '🏪' },
];

// ── Buildings ─────────────────────────────────────────────
const BUILDINGS = [
  { x: 320, y: 320, w: 120, h: 100, label: 'Sklep Gorana',    color: 0x5a3a1a, roofColor: 0x8b1a1a },
  { x: 600, y: 200, w: 100, h: 80,  label: 'Dom Strażników',  color: 0x4a3a2a, roofColor: 0x6b4423 },
  { x: 180, y: 600, w: 140, h: 90,  label: 'Kaplica',         color: 0x3a3a4a, roofColor: 0x444466 },
  { x: 550, y: 520, w: 90,  h: 70,  label: 'Zbrojownia',      color: 0x4a3020, roofColor: 0x7a2020 },
];

// ── Portals ───────────────────────────────────────────────
const PORTALS = [
  { x: 3800, y: 2900, label: 'Portal do Iglicza', targetCity: 'iglieze',  color: 0x9933ff },
  { x: 3800, y: 400,  label: 'Portal do Cytadeli', targetCity: 'cytadela', color: 0xcc3333 },
];

// ── Tree & rock placements ────────────────────────────────
const TREES = [
  [100,150],[250,100],[3800,150],[3700,280],[80,900],[170,1050],
  [1700,150],[1850,260],[3500,750],[3600,900],[300,1850],[450,1970],
  [1900,1500],[2050,1620],[2400,500],[2500,650],[700,1480],[810,1610],
  [1250,1980],[1150,2150],[2750,1650],[2850,1850],[500,2280],[620,2380],
  [380,650],[300,1320],[1680,1170],[2530,1970],[920,370],[3150,1370],
  [580,1680],[1080,1970],[2050,360],[2830,560],[360,2070],[1580,2170],
  [3400,1600],[3500,2100],[3200,2400],[2600,2600],[1000,2600],[400,2800],
  [3700,1200],[3600,500],[3100,300],[2200,200],[1500,100],[800,2400],
];

const ROCKS = [
  [680,220],[1280,420],[2030,770],[2720,380],[480,1270],[1780,620],
  [1080,1470],[2420,1070],[880,1770],[3020,670],[1480,2070],[2220,1670],
  [3350,1900],[3100,2200],[2900,2500],[1600,2800],[600,2600],[200,2200],
];

// ── Helper: draw a procedural knight sprite texture ───────
function _makeKnightTexture(scene) {
  const g = scene.make.graphics({ add: false });
  const s = 48;
  // Boots
  g.fillStyle(0x3a2a1a); g.fillRect(14, 40, 8, 8); g.fillRect(26, 40, 8, 8);
  // Legs (chain mail)
  g.fillStyle(0x666680); g.fillRect(15, 30, 7, 12); g.fillRect(26, 30, 7, 12);
  // Torso (plate armor)
  g.fillStyle(0x888899); g.fillRect(12, 14, 24, 18);
  g.fillStyle(0x9999aa); g.fillRect(14, 16, 20, 14);
  // Belt
  g.fillStyle(0x6a4a2a); g.fillRect(12, 28, 24, 4);
  g.fillStyle(0xccaa44); g.fillRect(22, 28, 4, 4);
  // Shoulders (pauldrons)
  g.fillStyle(0x777788); g.fillEllipse(12, 16, 10, 8); g.fillEllipse(36, 16, 10, 8);
  // Arms
  g.fillStyle(0x888899); g.fillRect(6, 16, 6, 14); g.fillRect(36, 16, 6, 14);
  // Gauntlets
  g.fillStyle(0x666677); g.fillRect(6, 28, 6, 5); g.fillRect(36, 28, 6, 5);
  // Sword in right hand
  g.fillStyle(0xaaaacc); g.fillRect(40, 10, 3, 24);
  g.fillStyle(0xccccee); g.fillRect(40, 6, 3, 6);
  g.fillStyle(0x8a6a2a); g.fillRect(38, 30, 7, 3);
  // Shield in left hand
  g.fillStyle(0x8b1a1a); g.fillEllipse(6, 22, 12, 16);
  g.fillStyle(0xaa2222); g.fillEllipse(6, 22, 8, 12);
  g.lineStyle(1, 0xccaa44); g.strokeEllipse(6, 22, 12, 16);
  // Neck
  g.fillStyle(0xddbb99); g.fillRect(20, 10, 8, 6);
  // Head (helmet)
  g.fillStyle(0x777788); g.fillEllipse(24, 6, 16, 14);
  // Helmet visor
  g.fillStyle(0x555566); g.fillRect(18, 4, 12, 5);
  // Eyes (visor slits)
  g.fillStyle(0xff4444); g.fillRect(19, 5, 4, 2); g.fillRect(25, 5, 4, 2);
  // Helmet crest
  g.fillStyle(0xaa2222); g.fillRect(22, -2, 4, 6);
  g.generateTexture('knight', s, s);
  g.destroy();
}

// ── Helper: draw a monster sprite texture ─────────────────
function _makeMonsterTexture(scene) {
  const g = scene.make.graphics({ add: false });
  // Body
  g.fillStyle(0x442244); g.fillEllipse(16, 18, 24, 28);
  g.fillStyle(0x553355); g.fillEllipse(16, 16, 20, 22);
  // Eyes
  g.fillStyle(0xff0000); g.fillCircle(11, 12, 4); g.fillCircle(21, 12, 4);
  g.fillStyle(0xff4444); g.fillCircle(11, 12, 2); g.fillCircle(21, 12, 2);
  // Mouth
  g.fillStyle(0x220022); g.fillRect(10, 22, 12, 4);
  g.fillStyle(0xffffff); // Teeth
  for (let i = 0; i < 5; i++) g.fillRect(11 + i * 2, 22, 1, 2);
  // Claws
  g.fillStyle(0x885588);
  g.fillTriangle(2, 28, 6, 20, 0, 20);
  g.fillTriangle(30, 28, 26, 20, 32, 20);
  g.generateTexture('monster', 32, 32);
  g.destroy();
}

// ── Helper: draw boss monster texture ─────────────────────
function _makeBossTexture(scene) {
  const g = scene.make.graphics({ add: false });
  // Larger body
  g.fillStyle(0x661111); g.fillEllipse(24, 24, 40, 42);
  g.fillStyle(0x882222); g.fillEllipse(24, 22, 34, 36);
  // Horns
  g.fillStyle(0x331111);
  g.fillTriangle(8, 6, 14, 14, 2, 14);
  g.fillTriangle(40, 6, 34, 14, 46, 14);
  // Eyes
  g.fillStyle(0xffcc00); g.fillCircle(16, 18, 5); g.fillCircle(32, 18, 5);
  g.fillStyle(0xff0000); g.fillCircle(16, 18, 3); g.fillCircle(32, 18, 3);
  // Mouth
  g.fillStyle(0x330000); g.fillRect(14, 30, 20, 6);
  g.fillStyle(0xffffff);
  for (let i = 0; i < 7; i++) g.fillRect(15 + i * 2.5, 30, 1, 3);
  // Crown of fire
  g.fillStyle(0xff4400, 0.6);
  g.fillTriangle(14, 4, 18, 12, 10, 12);
  g.fillTriangle(24, 0, 28, 10, 20, 10);
  g.fillTriangle(34, 4, 38, 12, 30, 12);
  g.generateTexture('boss_monster', 48, 48);
  g.destroy();
}

// ── Helper: draw NPC texture ──────────────────────────────
function _makeNpcTexture(scene) {
  const g = scene.make.graphics({ add: false });
  // Robe
  g.fillStyle(0x8b6914); g.fillRect(8, 16, 16, 20);
  g.fillStyle(0xa07820); g.fillRect(10, 18, 12, 16);
  // Hood
  g.fillStyle(0x6a5010); g.fillEllipse(16, 10, 18, 16);
  // Face
  g.fillStyle(0xddbb88); g.fillEllipse(16, 10, 12, 10);
  // Eyes
  g.fillStyle(0x333333); g.fillCircle(13, 9, 2); g.fillCircle(19, 9, 2);
  // Bag
  g.fillStyle(0x5a3a1a); g.fillEllipse(26, 26, 10, 12);
  g.fillStyle(0x6a4a2a); g.fillEllipse(26, 24, 8, 8);
  // Feet
  g.fillStyle(0x4a3020); g.fillRect(10, 34, 5, 4); g.fillRect(18, 34, 5, 4);
  g.generateTexture('npc_merchant', 32, 38);
  g.destroy();
}

// ── Main Phaser launcher ──────────────────────────────────
function launchPhaser(Phaser, container, playerName, dispatchRef, playerDataRef) {
  class GameScene extends Phaser.Scene {
    constructor() {
      super({ key: 'GameScene' });
      this.knight       = null;
      this.knightLabel  = null;
      this.moveTarget   = null;
      this.isMoving     = false;
      this.monsters     = [];
      this.npcs         = [];
      this.portals      = [];
      this.cursorGfx    = null;
      this.busy         = false;
      this.attackTarget = null;
      this.fogSprite    = null;
    }

    preload() {}

    create() {
      // ── Dark ground tile ────────────────────────────────
      const groundGfx = this.make.graphics({ add: false });
      groundGfx.fillStyle(0x1a1a12);
      groundGfx.fillRect(0, 0, 64, 64);
      // Grass detail
      groundGfx.fillStyle(0x222218, 0.8);
      [[3,5,3,16],[17,1,2,12],[31,9,3,14],[45,3,2,10],[55,17,3,12],
       [9,39,2,14],[27,33,3,10],[49,43,2,8]].forEach(([x,y,w,h]) =>
        groundGfx.fillRect(x, y, w, h));
      groundGfx.fillStyle(0x2a2a1e, 0.4);
      groundGfx.fillCircle(22, 46, 6);
      groundGfx.fillCircle(46, 16, 5);
      groundGfx.generateTexture('dark_ground', 64, 64);
      groundGfx.destroy();

      this.add.tileSprite(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 'dark_ground').setDepth(0);

      // ── Dark ambient overlay on the ground ──────────────
      const ambientOverlay = this.add.graphics().setDepth(0.5);
      ambientOverlay.fillStyle(0x000000, 0.25);
      ambientOverlay.fillRect(0, 0, WORLD_W, WORLD_H);

      // ── Dirt paths ──────────────────────────────────────
      const road = this.add.graphics().setDepth(1);
      road.fillStyle(0x4a3828, 0.7);
      // Main horizontal road
      road.fillRect(200, 350, 3500, 50);
      // Main vertical road
      road.fillRect(350, 200, 50, 2800);
      // Branch to boss area
      road.fillRect(1800, 350, 50, 2200);
      // Branch east
      road.fillRect(2500, 350, 50, 800);
      // Road borders
      road.lineStyle(2, 0x3a2818, 0.5);
      road.strokeRect(200, 350, 3500, 50);
      road.strokeRect(350, 200, 50, 2800);

      // ── Stone cobbles on roads ──────────────────────────
      const cobble = this.add.graphics().setDepth(1.1);
      cobble.fillStyle(0x5a4838, 0.3);
      for (let x = 220; x < 3680; x += 30) {
        cobble.fillRect(x, 360, 12, 8);
        cobble.fillRect(x + 15, 375, 12, 8);
      }

      // ── Buildings ───────────────────────────────────────
      BUILDINGS.forEach(b => {
        const bg = this.add.graphics().setDepth(2);
        // Foundation
        bg.fillStyle(0x222222, 0.5);
        bg.fillRect(b.x - 2, b.y + b.h - 4, b.w + 4, 8);
        // Walls
        bg.fillStyle(b.color);
        bg.fillRect(b.x, b.y, b.w, b.h);
        // Wall detail
        bg.fillStyle(0x000000, 0.2);
        bg.fillRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
        // Door
        bg.fillStyle(0x3a2a1a);
        bg.fillRect(b.x + b.w / 2 - 8, b.y + b.h - 24, 16, 24);
        bg.fillStyle(0xccaa44);
        bg.fillCircle(b.x + b.w / 2 + 4, b.y + b.h - 12, 2);
        // Windows
        bg.fillStyle(0xffcc66, 0.4);
        bg.fillRect(b.x + 10, b.y + 12, 12, 10);
        bg.fillRect(b.x + b.w - 22, b.y + 12, 12, 10);
        // Window frame
        bg.lineStyle(1, 0x333333);
        bg.strokeRect(b.x + 10, b.y + 12, 12, 10);
        bg.strokeRect(b.x + b.w - 22, b.y + 12, 12, 10);
        // Roof
        bg.fillStyle(b.roofColor);
        bg.fillTriangle(b.x - 10, b.y, b.x + b.w / 2, b.y - 35, b.x + b.w + 10, b.y);
        // Roof shading
        bg.fillStyle(0x000000, 0.15);
        bg.fillTriangle(b.x - 10, b.y, b.x + b.w / 2, b.y - 35, b.x + b.w / 2, b.y);
        // Chimney
        bg.fillStyle(0x555555);
        bg.fillRect(b.x + b.w - 25, b.y - 28, 10, 18);
        bg.fillStyle(0x666666);
        bg.fillRect(b.x + b.w - 27, b.y - 30, 14, 4);

        // Building label
        this.add.text(b.x + b.w / 2, b.y - 42, b.label, {
          fontSize: '10px', fontFamily: 'Cinzel, serif',
          color: '#aa8844', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5, 0.5).setDepth(8);
      });

      // ── Dead trees (dark, gothic) ──────────────────────
      TREES.forEach(([tx, ty]) => {
        const tg = this.add.graphics().setDepth(2);
        // Trunk
        tg.fillStyle(0x2a1a0a); tg.fillRect(tx - 4, ty, 8, 26);
        // Branches (bare, twisted)
        tg.lineStyle(3, 0x3a2a1a);
        tg.lineBetween(tx, ty + 4, tx - 18, ty - 16);
        tg.lineBetween(tx, ty + 8, tx + 20, ty - 12);
        tg.lineBetween(tx - 18, ty - 16, tx - 28, ty - 22);
        tg.lineBetween(tx + 20, ty - 12, tx + 30, ty - 20);
        tg.lineStyle(2, 0x332210);
        tg.lineBetween(tx, ty, tx - 10, ty - 24);
        tg.lineBetween(tx, ty + 2, tx + 12, ty - 20);
        // Sparse dark foliage
        tg.fillStyle(0x1a3a0a, 0.6); tg.fillCircle(tx - 14, ty - 14, 12);
        tg.fillStyle(0x0e2a06, 0.5); tg.fillCircle(tx + 16, ty - 10, 10);
        tg.fillStyle(0x1a3a0a, 0.4); tg.fillCircle(tx, ty - 20, 14);
        // Roots
        tg.lineStyle(2, 0x2a1a0a, 0.5);
        tg.lineBetween(tx - 4, ty + 26, tx - 12, ty + 30);
        tg.lineBetween(tx + 4, ty + 26, tx + 10, ty + 30);
      });

      // ── Rocks ───────────────────────────────────────────
      ROCKS.forEach(([rx, ry]) => {
        const rg = this.add.graphics().setDepth(2);
        rg.fillStyle(0x444444); rg.fillEllipse(rx, ry, 30, 20);
        rg.fillStyle(0x555555); rg.fillEllipse(rx - 4, ry - 4, 20, 14);
        rg.fillStyle(0x333333); rg.fillEllipse(rx + 7, ry + 3, 14, 10);
        // Moss
        rg.fillStyle(0x2a3a1a, 0.4); rg.fillEllipse(rx - 6, ry - 2, 8, 6);
      });

      // ── Skull & bone decorations ────────────────────────
      [[750,350],[1600,380],[2300,330],[3000,370],[1100,900],[2600,1300]].forEach(([sx,sy]) => {
        const sg = this.add.graphics().setDepth(1.5);
        sg.fillStyle(0xaaaaaa, 0.3);
        sg.fillCircle(sx, sy, 6); // skull
        sg.fillRect(sx - 8, sy + 4, 16, 2); // bones
        sg.fillRect(sx - 2, sy + 2, 4, 8);
      });

      // ── Torches along roads ─────────────────────────────
      [500, 900, 1300, 1700, 2100, 2500, 2900, 3300].forEach(tx => {
        const tg = this.add.graphics().setDepth(3);
        // Post
        tg.fillStyle(0x4a3010); tg.fillRect(tx - 2, 320, 4, 30);
        // Flame glow
        const flame = this.add.graphics().setDepth(3.1);
        flame.fillStyle(0xff6600, 0.3); flame.fillCircle(tx, 316, 12);
        flame.fillStyle(0xff9933, 0.5); flame.fillCircle(tx, 316, 7);
        flame.fillStyle(0xffcc00, 0.8); flame.fillCircle(tx, 316, 3);
        // Flickering
        this.tweens.add({
          targets: flame, alpha: 0.4,
          duration: 300 + Math.random() * 200,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        // Ground light pool
        const lightPool = this.add.graphics().setDepth(0.8);
        lightPool.fillStyle(0xffaa33, 0.06);
        lightPool.fillCircle(tx, 350, 40);
      });

      // ── Portals ─────────────────────────────────────────
      PORTALS.forEach(p => {
        const pg = this.add.graphics().setDepth(5);
        // Outer ring
        pg.lineStyle(4, p.color, 0.8); pg.strokeCircle(p.x, p.y, 30);
        pg.lineStyle(2, p.color, 0.4); pg.strokeCircle(p.x, p.y, 36);
        // Inner swirl
        pg.fillStyle(p.color, 0.15); pg.fillCircle(p.x, p.y, 28);
        pg.fillStyle(p.color, 0.3); pg.fillCircle(p.x, p.y, 16);
        pg.fillStyle(0xffffff, 0.2); pg.fillCircle(p.x, p.y, 6);
        // Pulsate
        this.tweens.add({
          targets: pg, alpha: 0.4, scaleX: 0.95, scaleY: 0.95,
          duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        // Label
        this.add.text(p.x, p.y + 44, p.label, {
          fontSize: '11px', fontFamily: 'Cinzel, serif',
          color: '#ddaaff', stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5, 0).setDepth(8);

        this.portals.push({ x: p.x, y: p.y, targetCity: p.targetCity, radius: 40 });
      });

      // ── Generate textures ───────────────────────────────
      _makeKnightTexture(this);
      _makeMonsterTexture(this);
      _makeBossTexture(this);
      _makeNpcTexture(this);

      // ── Spawn monsters ──────────────────────────────────
      ENEMY_SPAWNS.forEach(m => {
        const tex = m.isBoss ? 'boss_monster' : 'monster';
        const sprite = this.physics.add.sprite(m.x, m.y, tex).setDepth(6).setInteractive({ cursor: 'pointer' });
        if (m.isBoss) sprite.setScale(1.3);

        // Health bar background
        const hpBg = this.add.graphics().setDepth(7);
        hpBg.fillStyle(0x000000, 0.7); hpBg.fillRect(-16, -8, 32, 5);
        hpBg.setPosition(m.x, m.y - (m.isBoss ? 40 : 26));

        // Health bar fill
        const hpFill = this.add.graphics().setDepth(7.1);
        hpFill.fillStyle(m.isBoss ? 0xff2200 : 0xcc3333); hpFill.fillRect(-15, -7, 30, 3);
        hpFill.setPosition(m.x, m.y - (m.isBoss ? 40 : 26));

        // Name label
        const color = m.isBoss ? '#ff4444' : '#ff8866';
        const label = this.add.text(m.x, m.y - (m.isBoss ? 50 : 34), m.label, {
          fontSize: m.isBoss ? '12px' : '10px', fontFamily: 'Cinzel, serif',
          color, stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5, 0.5).setDepth(8);

        if (m.isBoss) {
          const bossTag = this.add.text(m.x, m.y - 62, '⚠ BOSS ⚠', {
            fontSize: '11px', fontFamily: 'Cinzel, serif',
            color: '#ff2222', stroke: '#000000', strokeThickness: 3,
          }).setOrigin(0.5, 0.5).setDepth(8);
          this.tweens.add({ targets: bossTag, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
        }

        // Idle wander
        this.tweens.add({
          targets: sprite,
          x: m.x + (Math.random() - 0.5) * 60,
          y: m.y + (Math.random() - 0.5) * 40,
          duration: 2000 + Math.random() * 2000,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        // Click on monster → move towards it
        sprite.on('pointerdown', () => {
          if (this.busy) return;
          this.attackTarget = { sprite, enemyId: m.enemyId, isBoss: m.isBoss, label };
          this.moveTarget = { x: sprite.x, y: sprite.y };
          this.isMoving = true;
          this._showClickRipple(sprite.x, sprite.y, 0xff4444);
        });

        this.monsters.push({ sprite, enemyId: m.enemyId, isBoss: m.isBoss, x: m.x, y: m.y, label, hpBg, hpFill, active: true });
      });

      // ── NPCs ────────────────────────────────────────────
      NPC_DATA.forEach(n => {
        const sprite = this.physics.add.sprite(n.x, n.y, 'npc_merchant').setDepth(6).setInteractive({ cursor: 'pointer' });

        // Name
        const label = this.add.text(n.x, n.y - 30, n.label, {
          fontSize: '11px', fontFamily: 'Cinzel, serif',
          color: '#ffdd88', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5, 0.5).setDepth(8);

        // Exclamation mark (quest available feel)
        const exMark = this.add.text(n.x, n.y - 44, '❗', {
          fontSize: '14px', stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5, 0.5).setDepth(9);
        this.tweens.add({ targets: exMark, y: n.y - 50, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        sprite.on('pointerdown', () => {
          if (this.busy) return;
          this.moveTarget = { x: n.x, y: n.y };
          this.isMoving = true;
          this._npcTarget = { sprite, npcId: n.id };
          this._showClickRipple(n.x, n.y, 0xffdd88);
        });

        this.npcs.push({ sprite, label, npcId: n.id });
      });

      // ── Knight (player) ─────────────────────────────────
      this.knight = this.physics.add.sprite(380, 400, 'knight').setDepth(10).setCollideWorldBounds(true);
      this.knight.setScale(1.1);

      // Shadow
      this._shadowObj = this.add.ellipse(0, 0, 30, 10, 0x000000, 0.4).setDepth(9);

      // Player name label
      this.knightLabel = this.add.text(380, 370, playerName, {
        fontSize: '12px', fontFamily: 'Cinzel, serif',
        color: '#ffffff', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5, 1).setDepth(11);

      this.cursorGfx = this.add.graphics().setDepth(5);

      // ── Physics & camera ────────────────────────────────
      this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
      this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
      this.cameras.main.startFollow(this.knight, true, 0.08, 0.08);
      this.cameras.main.setZoom(1.4);
      this.cameras.main.setBackgroundColor('#0a0a08');

      // ── Click-to-move ───────────────────────────────────
      this.input.on('pointerdown', (ptr) => {
        if (this.busy) return;
        // Don't override if we clicked on a monster/NPC (handled by their own handler)
        if (ptr.downElement && ptr.downElement.tagName !== 'CANVAS') return;
        this.attackTarget = null;
        this._npcTarget = null;
        this.moveTarget = { x: ptr.worldX, y: ptr.worldY };
        this.isMoving = true;
        this._showClickRipple(ptr.worldX, ptr.worldY, 0xffffff);
      });
    }

    update() {
      if (!this.knight || this.busy) return;

      // ── Movement ────────────────────────────────────────
      if (this.moveTarget && this.isMoving) {
        const tx = this.attackTarget ? this.attackTarget.sprite.x : this.moveTarget.x;
        const ty = this.attackTarget ? this.attackTarget.sprite.y : this.moveTarget.y;
        const dx = tx - this.knight.x;
        const dy = ty - this.knight.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Flip knight based on movement direction
        if (Math.abs(dx) > 2) this.knight.setFlipX(dx < 0);

        // If attacking and close enough → trigger combat
        if (this.attackTarget && dist < INTERACT_RADIUS) {
          this.knight.setVelocity(0, 0);
          this.isMoving = false;
          this._triggerCombat(this.attackTarget);
          this.attackTarget = null;
          return;
        }

        // If near NPC → open trade
        if (this._npcTarget && dist < INTERACT_RADIUS) {
          this.knight.setVelocity(0, 0);
          this.isMoving = false;
          this._interactNPC(this._npcTarget);
          this._npcTarget = null;
          return;
        }

        if (dist < 6) {
          this.knight.setVelocity(0, 0);
          this.isMoving = false;
        } else {
          const r = PLAYER_SPEED / dist;
          this.knight.setVelocity(dx * r, dy * r);
        }
      }

      // ── Update position-tracking objects ─────────────────
      const px = this.knight.x;
      const py = this.knight.y;
      if (this.knightLabel) this.knightLabel.setPosition(px, py - 28);
      if (this._shadowObj) this._shadowObj.setPosition(px, py + 16);

      // ── Portal check ────────────────────────────────────
      for (const p of this.portals) {
        const dx = px - p.x;
        const dy = py - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < p.radius) {
          this._enterPortal(p);
          return;
        }
      }
    }

    _showClickRipple(wx, wy, color) {
      this.cursorGfx.clear();
      this.cursorGfx.setAlpha(1).setScale(1);
      this.cursorGfx.lineStyle(2, color, 0.9);
      this.cursorGfx.strokeCircle(wx, wy, 12);
      this.cursorGfx.fillStyle(color, 0.15);
      this.cursorGfx.fillCircle(wx, wy, 12);
      this.tweens.add({
        targets: this.cursorGfx,
        alpha: 0, scaleX: 2, scaleY: 2,
        duration: 500, ease: 'Quad.easeOut',
        onComplete: () => {
          if (this.cursorGfx) { this.cursorGfx.clear(); this.cursorGfx.setAlpha(1).setScale(1); }
        },
      });
    }

    _triggerCombat(target) {
      this.busy = true;
      this.knight.setVelocity(0, 0);
      this.isMoving = false;
      this.moveTarget = null;

      // Flash effect
      this.cameras.main.flash(400, 180, 40, 40);
      this.cameras.main.shake(200, 0.01);

      this.time.delayedCall(400, () => {
        dispatchRef.current({ type: 'START_COMBAT', enemyId: target.enemyId, isBoss: target.isBoss });
      });
    }

    _interactNPC(npc) {
      this.busy = true;
      this.knight.setVelocity(0, 0);
      this.isMoving = false;
      this.moveTarget = null;

      // Open shop
      this.time.delayedCall(100, () => {
        dispatchRef.current({ type: 'OPEN_SHOP' });
      });
    }

    _enterPortal(portal) {
      this.busy = true;
      this.knight.setVelocity(0, 0);
      this.isMoving = false;
      this.moveTarget = null;

      this.cameras.main.fadeOut(600, 0, 0, 0);
      this.time.delayedCall(650, () => {
        dispatchRef.current({ type: 'TRAVEL_TO_CITY', cityId: portal.targetCity });
      });
    }
  }

  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: container,
    width: container.clientWidth || window.innerWidth,
    height: container.clientHeight || window.innerHeight,
    physics: {
      default: 'arcade',
      arcade: { gravity: { y: 0 }, debug: false },
    },
    scene: GameScene,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    backgroundColor: '#0a0a08',
    pixelArt: true,
  });
}

// ── React component ───────────────────────────────────────
const GameMap = ({ dispatch, player }) => {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);
  const dispatchRef  = useRef(dispatch);
  const playerRef    = useRef(player);
  const [loading, setLoading] = useState(true);

  useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);
  useEffect(() => { playerRef.current = player; }, [player]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;
    let destroyed = false;

    import('phaser').then((mod) => {
      if (destroyed || !containerRef.current) return;
      gameRef.current = launchPhaser(
        mod.default,
        containerRef.current,
        player?.name ?? 'Bohater',
        dispatchRef,
        playerRef,
      );
      setLoading(false);
    }).catch((err) => {
      console.error('Phaser failed to load:', err);
    });

    return () => {
      destroyed = true;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#0a0a08' }}>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 200,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0a0a08', color: '#aa8844',
          fontFamily: '"Cinzel", serif', fontSize: '16px', gap: 12,
        }}>
          <div style={{ fontSize: 40 }}>⚔️</div>
          <div>Ładowanie świata…</div>
        </div>
      )}

      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* CSS fog of war vignette — lightweight dark edges */}
      {!loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 50% 50% at 50% 50%, transparent 0%, transparent 30%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.75) 75%, rgba(0,0,0,0.95) 100%)',
        }} />
      )}

      {/* Back to city button */}
      <button
        onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
        style={{
          position: 'absolute', top: 14, left: 14, zIndex: 100,
          padding: '8px 18px',
          background: 'rgba(10, 10, 8, 0.9)',
          border: '1px solid rgba(127, 29, 29, 0.6)',
          color: '#f59e0b',
          fontFamily: '"Cinzel", serif', fontSize: '13px',
          borderRadius: '4px', cursor: 'pointer',
          letterSpacing: '0.05em', transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = '#aa3333')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(127,29,29,0.6)')}
      >
        ← Wróć do Miasta
      </button>

      {/* Mini quest log (top-right) */}
      <div style={{
        position: 'absolute', top: 14, right: 14, zIndex: 100,
        background: 'rgba(10, 10, 8, 0.9)',
        border: '1px solid rgba(127, 29, 29, 0.5)',
        borderRadius: '4px', padding: '10px 14px',
        color: '#94a3b8', fontSize: '11px',
        fontFamily: '"Crimson Text", serif', lineHeight: '1.8',
        minWidth: 200, maxWidth: 240,
      }}>
        <div style={{ color: '#f59e0b', marginBottom: 6, fontFamily: '"Cinzel", serif', fontSize: '12px', letterSpacing: '0.08em' }}>
          📜 Cele
        </div>
        <div style={{ color: '#cbd5e1' }}>⚔️ Zabij potwory na mapie</div>
        <div style={{ color: '#cbd5e1' }}>🏪 Odwiedź kupca Gorana</div>
        <div style={{ color: '#886644' }}>🌀 Znajdź portale do nowych krain</div>
        <div style={{ color: '#ff6644', marginTop: 4 }}>💀 Pokonaj bossa na południu</div>
      </div>

      {/* Diablo-style bottom HUD */}
      {!loading && player && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 100,
          height: 80,
          background: 'linear-gradient(to top, rgba(10,10,8,0.95) 0%, rgba(10,10,8,0.85) 70%, transparent 100%)',
          borderTop: '1px solid rgba(127,29,29,0.4)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          padding: '0 20px 10px 20px',
        }}>
          {/* Health Orb (left) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: `radial-gradient(circle at 40% 40%, #cc2222, #660000 70%, #330000)`,
              border: '3px solid #8b1a1a',
              boxShadow: '0 0 12px rgba(200,30,30,0.5), inset 0 0 10px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Fill level based on HP */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${Math.max(0, Math.min(100, (player.hp / Math.max(1, player.maxHp)) * 100))}%`,
                background: 'radial-gradient(circle at 50% 80%, #ee3333, #aa1111)',
                transition: 'height 0.5s ease',
                borderRadius: '0 0 50% 50%',
              }} />
              <span style={{ position: 'relative', zIndex: 2, color: '#fff', fontSize: '13px', fontFamily: '"Cinzel", serif', fontWeight: 'bold', textShadow: '0 0 4px #000' }}>
                {player.hp}
              </span>
            </div>
            <span style={{ color: '#ff6666', fontSize: '10px', fontFamily: '"Cinzel", serif', marginTop: 2 }}>HP</span>
          </div>

          {/* Center — Action bar */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', paddingBottom: 4 }}>
            {['Q ⚔️', 'W ✨', 'E 🛡️', 'R 🔥'].map((skill, i) => (
              <div key={i} style={{
                width: 44, height: 44,
                background: 'rgba(30,20,10,0.9)',
                border: '1px solid rgba(127,29,29,0.6)',
                borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#aa8844', fontSize: '12px', fontFamily: '"Cinzel", serif',
                cursor: 'default',
                boxShadow: '0 0 4px rgba(0,0,0,0.5)',
              }}>
                {skill}
              </div>
            ))}
            <div style={{ width: 1, height: 36, background: 'rgba(127,29,29,0.4)', margin: '0 4px' }} />
            {['🧪', '🍖'].map((pot, i) => (
              <div key={`p${i}`} style={{
                width: 36, height: 36,
                background: 'rgba(30,20,10,0.9)',
                border: '1px solid rgba(100,80,40,0.5)',
                borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', cursor: 'default',
              }}>
                {pot}
              </div>
            ))}
          </div>

          {/* Mana Orb (right) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: `radial-gradient(circle at 40% 40%, #2244cc, #001166 70%, #000833)`,
              border: '3px solid #1a1a8b',
              boxShadow: '0 0 12px rgba(30,30,200,0.5), inset 0 0 10px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: `${Math.max(0, Math.min(100, (player.mana / Math.max(1, player.maxMana)) * 100))}%`,
                background: 'radial-gradient(circle at 50% 80%, #3355ee, #1122aa)',
                transition: 'height 0.5s ease',
                borderRadius: '0 0 50% 50%',
              }} />
              <span style={{ position: 'relative', zIndex: 2, color: '#fff', fontSize: '13px', fontFamily: '"Cinzel", serif', fontWeight: 'bold', textShadow: '0 0 4px #000' }}>
                {player.mana}
              </span>
            </div>
            <span style={{ color: '#6688ff', fontSize: '10px', fontFamily: '"Cinzel", serif', marginTop: 2 }}>MP</span>
          </div>
        </div>
      )}

      {/* Player info bar (above bottom HUD) */}
      {!loading && player && (
        <div style={{
          position: 'absolute', bottom: 82, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, display: 'flex', gap: 16, alignItems: 'center',
          background: 'rgba(10,10,8,0.85)',
          border: '1px solid rgba(127,29,29,0.3)',
          borderRadius: '4px', padding: '4px 16px',
          fontFamily: '"Cinzel", serif', fontSize: '11px',
        }}>
          <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{player.name}</span>
          <span style={{ color: '#666' }}>|</span>
          <span style={{ color: '#aa88ff' }}>Poz. {player.level}</span>
          <span style={{ color: '#666' }}>|</span>
          <span style={{ color: '#ffcc44' }}>💰 {player.gold}</span>
        </div>
      )}
    </div>
  );
};

export default GameMap;