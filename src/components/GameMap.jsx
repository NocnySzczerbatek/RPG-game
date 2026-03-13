// ============================================================
// COMPONENT: Diablo-style 2D ARPG World Map (Phaser 3)
// Real DCSS tileset sprites, particle effects, atmospheric
// lighting, gothic dark fantasy aesthetic.
// ============================================================
import React, { useEffect, useRef, useState } from 'react';

// ── World ─────────────────────────────────────────────────
const WORLD_W = 4000;
const WORLD_H = 3200;
const PLAYER_SPEED = 200;
const INTERACT_RADIUS = 55;
const SPRITE_SCALE = 2.5;      // 32px tiles → 80px on screen
const TILE_SCALED = 32 * SPRITE_SCALE;

// ── Enemy spawns ──────────────────────────────────────────
const ENEMY_SPAWNS = [
  { x: 900,  y: 600,  enemyId: 'skeleton_guard',     label: 'Szkielet Strażnik',  isBoss: false, sprite: 'spr_skeleton_guard' },
  { x: 1400, y: 450,  enemyId: 'corrupted_hound',    label: 'Skaźony Kundel',     isBoss: false, sprite: 'spr_corrupted_hound' },
  { x: 650,  y: 1100, enemyId: 'ruin_crawler',        label: 'Pełzacz Ruin',       isBoss: false, sprite: 'spr_ruin_crawler' },
  { x: 1800, y: 900,  enemyId: 'fallen_knight',      label: 'Upadły Rycerz',      isBoss: false, sprite: 'spr_fallen_knight' },
  { x: 2500, y: 600,  enemyId: 'wraith_archer',      label: 'Łucznik-Widmo',      isBoss: false, sprite: 'spr_wraith_archer' },
  { x: 2200, y: 1500, enemyId: 'void_acolyte',       label: 'Akolita Pustki',     isBoss: false, sprite: 'spr_void_acolyte' },
  { x: 3100, y: 1100, enemyId: 'stone_sentinel',     label: 'Kamienny Strażnik',  isBoss: false, sprite: 'spr_stone_sentinel' },
  { x: 3300, y: 700,  enemyId: 'skeleton_guard',     label: 'Szkielet Strażnik',  isBoss: false, sprite: 'spr_skeleton_guard' },
  { x: 1200, y: 1700, enemyId: 'corrupted_hound',    label: 'Skaźony Kundel',     isBoss: false, sprite: 'spr_corrupted_hound' },
  { x: 2800, y: 1800, enemyId: 'fallen_knight',      label: 'Upadły Rycerz',      isBoss: false, sprite: 'spr_fallen_knight' },
  { x: 1900, y: 2400, enemyId: 'the_undying_warden', label: 'Nieśmiertelny Strażnik', isBoss: true, sprite: 'spr_boss_warden' },
];

// ── NPC positions ─────────────────────────────────────────
const NPC_DATA = [
  { x: 460, y: 340, id: 'merchant_goran', label: 'Goran — Kupiec', icon: '🏪' },
];

// ── Buildings ─────────────────────────────────────────────
const BUILDINGS = [
  { x: 320, y: 320, w: 120, h: 100, label: 'Sklep Gorana',    color: 0x5a3a1a, roofColor: 0x8b1a1a, spriteKey: 'spr_shop' },
  { x: 600, y: 200, w: 100, h: 80,  label: 'Dom Strażników',  color: 0x4a3a2a, roofColor: 0x6b4423, spriteKey: 'spr_door' },
  { x: 180, y: 600, w: 140, h: 90,  label: 'Kaplica',         color: 0x3a3a4a, roofColor: 0x444466, spriteKey: 'spr_altar' },
  { x: 550, y: 520, w: 90,  h: 70,  label: 'Zbrojownia',      color: 0x4a3020, roofColor: 0x7a2020, spriteKey: 'spr_shop_weapon' },
];

// ── Portals ───────────────────────────────────────────────
const PORTALS = [
  { x: 3800, y: 2900, label: 'Portal do Iglicza', targetCity: 'iglieze',  spriteKey: 'spr_portal_purple' },
  { x: 3800, y: 400,  label: 'Portal do Cytadeli', targetCity: 'cytadela', spriteKey: 'spr_portal_red' },
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

// ── Decorative placements ─────────────────────────────────
const COLUMNS = [
  [760,340],[1580,340],[2320,340],[3050,340],
  [350,800],[350,1300],[350,1800],[350,2300],
  [1800,700],[1800,1200],[2500,900],[2500,1400],
];

const STATUES = [
  [200,300],[540,170],[700,550],[1200,200],[2000,180],[2700,250],
];

const FOUNTAINS = [
  [420,500],[1600,500],[2600,1600],[1000,1800],
];

const CHESTS = [
  [1000,300],[2100,400],[3000,500],[1500,1500],[2500,2000],[800,2200],
];

// ── Sprite asset map ──────────────────────────────────────
const SPRITE_ASSETS = {
  spr_knight:           'assets/sprites/knight.png',
  spr_skeleton_guard:   'assets/sprites/skeleton_guard.png',
  spr_corrupted_hound:  'assets/sprites/corrupted_hound.png',
  spr_ruin_crawler:     'assets/sprites/ruin_crawler.png',
  spr_fallen_knight:    'assets/sprites/fallen_knight.png',
  spr_wraith_archer:    'assets/sprites/wraith_archer.png',
  spr_void_acolyte:     'assets/sprites/void_acolyte.png',
  spr_stone_sentinel:   'assets/sprites/stone_sentinel.png',
  spr_boss_warden:      'assets/sprites/boss_warden.png',
  spr_npc_merchant:     'assets/sprites/npc_merchant.png',
  spr_tree_1:           'assets/sprites/tree_1.png',
  spr_tree_2:           'assets/sprites/tree_2.png',
  spr_tree_3:           'assets/sprites/tree_3.png',
  spr_portal_purple:    'assets/sprites/portal_purple.png',
  spr_portal_red:       'assets/sprites/portal_red.png',
  spr_shop:             'assets/sprites/shop.png',
  spr_shop_weapon:      'assets/sprites/shop_weapon.png',
  spr_door:             'assets/sprites/door.png',
  spr_altar:            'assets/sprites/altar.png',
  spr_fountain:         'assets/sprites/fountain.png',
  spr_chest:            'assets/sprites/chest.png',
  spr_statue:           'assets/sprites/statue.png',
  spr_column:           'assets/sprites/column.png',
  spr_wall_0:           'assets/sprites/wall_0.png',
  spr_wall_1:           'assets/sprites/wall_1.png',
  spr_floor_0:          'assets/sprites/floor_0.png',
  spr_floor_1:          'assets/sprites/floor_1.png',
  spr_floor_2:          'assets/sprites/floor_2.png',
  spr_floor_3:          'assets/sprites/floor_3.png',
  spr_road:             'assets/sprites/road_tile.png',
  spr_torch_0:          'assets/sprites/torch_0.png',
  spr_torch_1:          'assets/sprites/torch_1.png',
  spr_torch_2:          'assets/sprites/torch_2.png',
  spr_torch_3:          'assets/sprites/torch_3.png',
  spr_torch_4:          'assets/sprites/torch_4.png',
};

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
    }

    preload() {
      for (const [key, path] of Object.entries(SPRITE_ASSETS)) {
        this.load.image(key, path);
      }
    }

    create() {
      // ── Tiled ground using real floor sprites ───────────
      const floorKeys = ['spr_floor_0','spr_floor_1','spr_floor_2','spr_floor_3'];
      for (let x = 0; x < WORLD_W; x += TILE_SCALED) {
        for (let y = 0; y < WORLD_H; y += TILE_SCALED) {
          const key = floorKeys[Math.floor(Math.random() * floorKeys.length)];
          this.add.image(x + TILE_SCALED / 2, y + TILE_SCALED / 2, key)
            .setScale(SPRITE_SCALE).setDepth(0);
        }
      }

      // ── Dark ambient overlay ────────────────────────────
      const ambientOverlay = this.add.graphics().setDepth(0.5);
      ambientOverlay.fillStyle(0x000000, 0.3);
      ambientOverlay.fillRect(0, 0, WORLD_W, WORLD_H);

      // ── Dirt roads using road tiles ─────────────────────
      for (let x = 200; x < 3700; x += TILE_SCALED) {
        this.add.image(x, 370, 'spr_road').setScale(SPRITE_SCALE).setDepth(1);
      }
      for (let y = 200; y < 3000; y += TILE_SCALED) {
        this.add.image(370, y, 'spr_road').setScale(SPRITE_SCALE).setDepth(1);
      }
      for (let y = 350; y < 2550; y += TILE_SCALED) {
        this.add.image(1820, y, 'spr_road').setScale(SPRITE_SCALE).setDepth(1);
      }
      for (let y = 350; y < 1150; y += TILE_SCALED) {
        this.add.image(2520, y, 'spr_road').setScale(SPRITE_SCALE).setDepth(1);
      }

      // ── Buildings with sprite overlays ──────────────────
      BUILDINGS.forEach(b => {
        const bg = this.add.graphics().setDepth(2);
        bg.fillStyle(0x222222, 0.5);
        bg.fillRect(b.x - 2, b.y + b.h - 4, b.w + 4, 8);
        bg.fillStyle(b.color);
        bg.fillRect(b.x, b.y, b.w, b.h);
        bg.fillStyle(0x000000, 0.2);
        bg.fillRect(b.x + 2, b.y + 2, b.w - 4, b.h - 4);
        bg.fillStyle(0xffcc66, 0.4);
        bg.fillRect(b.x + 10, b.y + 12, 12, 10);
        bg.fillRect(b.x + b.w - 22, b.y + 12, 12, 10);
        bg.lineStyle(1, 0x333333);
        bg.strokeRect(b.x + 10, b.y + 12, 12, 10);
        bg.strokeRect(b.x + b.w - 22, b.y + 12, 12, 10);
        bg.fillStyle(b.roofColor);
        bg.fillTriangle(b.x - 10, b.y, b.x + b.w / 2, b.y - 35, b.x + b.w + 10, b.y);
        bg.fillStyle(0x000000, 0.15);
        bg.fillTriangle(b.x - 10, b.y, b.x + b.w / 2, b.y - 35, b.x + b.w / 2, b.y);
        bg.fillStyle(0x555555);
        bg.fillRect(b.x + b.w - 25, b.y - 28, 10, 18);
        bg.fillStyle(0x666666);
        bg.fillRect(b.x + b.w - 27, b.y - 30, 14, 4);

        // Door sprite on building
        this.add.image(b.x + b.w / 2, b.y + b.h - 12, 'spr_door')
          .setScale(SPRITE_SCALE * 0.7).setDepth(2.5);

        // Building icon sprite
        const iconSpr = this.add.image(b.x + b.w / 2, b.y - 48, b.spriteKey)
          .setScale(SPRITE_SCALE * 0.8).setDepth(8);
        this.tweens.add({ targets: iconSpr, y: b.y - 52, duration: 1200, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        this.add.text(b.x + b.w / 2, b.y - 72, b.label, {
          fontSize: '11px', fontFamily: 'Cinzel, serif',
          color: '#aa8844', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5, 0.5).setDepth(8);
      });

      // ── Trees with real sprites ─────────────────────────
      const treeKeys = ['spr_tree_1', 'spr_tree_2', 'spr_tree_3'];
      TREES.forEach(([tx, ty]) => {
        const key = treeKeys[Math.floor(Math.random() * treeKeys.length)];
        const spr = this.add.image(tx, ty, key).setScale(SPRITE_SCALE).setDepth(2);
        spr.setTint(Phaser.Display.Color.GetColor(
          180 + Math.floor(Math.random() * 50),
          200 + Math.floor(Math.random() * 55),
          180 + Math.floor(Math.random() * 50)
        ));
      });

      // ── Rocks with wall sprites ─────────────────────────
      ROCKS.forEach(([rx, ry]) => {
        const key = Math.random() > 0.5 ? 'spr_wall_0' : 'spr_wall_1';
        this.add.image(rx, ry, key).setScale(SPRITE_SCALE * 0.8).setDepth(2)
          .setTint(0x888888);
      });

      // ── Columns ─────────────────────────────────────────
      COLUMNS.forEach(([cx, cy]) => {
        this.add.image(cx, cy, 'spr_column').setScale(SPRITE_SCALE).setDepth(2);
      });

      // ── Statues ─────────────────────────────────────────
      STATUES.forEach(([sx, sy]) => {
        this.add.image(sx, sy, 'spr_statue').setScale(SPRITE_SCALE).setDepth(2);
      });

      // ── Fountains ───────────────────────────────────────
      FOUNTAINS.forEach(([fx, fy]) => {
        const spr = this.add.image(fx, fy, 'spr_fountain').setScale(SPRITE_SCALE).setDepth(2);
        this.tweens.add({
          targets: spr, alpha: 0.7, duration: 800,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });
        const glow = this.add.graphics().setDepth(2.1);
        glow.fillStyle(0x4488ff, 0.12);
        glow.fillCircle(fx, fy, 30);
        this.tweens.add({ targets: glow, alpha: 0.3, duration: 1000, yoyo: true, repeat: -1 });
      });

      // ── Chests ──────────────────────────────────────────
      CHESTS.forEach(([cx, cy]) => {
        this.add.image(cx, cy, 'spr_chest').setScale(SPRITE_SCALE).setDepth(2);
        const glow = this.add.graphics().setDepth(1.9);
        glow.fillStyle(0xffaa33, 0.06);
        glow.fillCircle(cx, cy, 20);
        this.tweens.add({ targets: glow, alpha: 0.15, duration: 1500, yoyo: true, repeat: -1 });
      });

      // ── Skull & bone decorations ────────────────────────
      [[750,350],[1600,380],[2300,330],[3000,370],[1100,900],[2600,1300]].forEach(([sx,sy]) => {
        const sg = this.add.graphics().setDepth(1.5);
        sg.fillStyle(0xaaaaaa, 0.3);
        sg.fillCircle(sx, sy, 6);
        sg.fillRect(sx - 8, sy + 4, 16, 2);
        sg.fillRect(sx - 2, sy + 2, 4, 8);
      });

      // ── Torches along roads ─────────────────────────────
      const torchFrameKeys = ['spr_torch_0','spr_torch_1','spr_torch_2','spr_torch_3','spr_torch_4'];
      const torchPositions = [500, 900, 1300, 1700, 2100, 2500, 2900, 3300];
      torchPositions.forEach(tx => {
        const tg = this.add.graphics().setDepth(3);
        tg.fillStyle(0x4a3010); tg.fillRect(tx - 3, 320, 6, 35);

        const torchSpr = this.add.image(tx, 308, torchFrameKeys[0]).setScale(SPRITE_SCALE).setDepth(3.1);
        let frameIdx = 0;
        this.time.addEvent({
          delay: 150,
          loop: true,
          callback: () => {
            frameIdx = (frameIdx + 1) % torchFrameKeys.length;
            torchSpr.setTexture(torchFrameKeys[frameIdx]);
          },
        });

        const flame = this.add.graphics().setDepth(3.2);
        flame.fillStyle(0xff6600, 0.2); flame.fillCircle(tx, 316, 18);
        flame.fillStyle(0xff9933, 0.35); flame.fillCircle(tx, 316, 10);
        flame.fillStyle(0xffcc00, 0.6); flame.fillCircle(tx, 316, 4);
        this.tweens.add({
          targets: flame, alpha: 0.3,
          duration: 250 + Math.random() * 200,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        const lightPool = this.add.graphics().setDepth(0.8);
        lightPool.fillStyle(0xffaa33, 0.08);
        lightPool.fillCircle(tx, 360, 50);
        this.tweens.add({
          targets: lightPool, alpha: 0.04,
          duration: 400, yoyo: true, repeat: -1,
        });
      });

      // ── Portals with real sprites ───────────────────────
      PORTALS.forEach(p => {
        const portalSpr = this.add.image(p.x, p.y, p.spriteKey)
          .setScale(SPRITE_SCALE * 1.5).setDepth(5);
        this.tweens.add({
          targets: portalSpr,
          scaleX: SPRITE_SCALE * 1.7, scaleY: SPRITE_SCALE * 1.7,
          alpha: 0.6,
          duration: 900, yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        const pg = this.add.graphics().setDepth(4.9);
        const color = p.spriteKey === 'spr_portal_purple' ? 0x9933ff : 0xcc3333;
        pg.lineStyle(3, color, 0.5); pg.strokeCircle(p.x, p.y, 48);
        pg.fillStyle(color, 0.06); pg.fillCircle(p.x, p.y, 48);
        this.tweens.add({
          targets: pg, alpha: 0.2,
          duration: 700, yoyo: true, repeat: -1,
        });

        this.add.text(p.x, p.y + 55, p.label, {
          fontSize: '12px', fontFamily: 'Cinzel, serif',
          color: '#ddaaff', stroke: '#000000', strokeThickness: 4,
        }).setOrigin(0.5, 0).setDepth(8);

        this.portals.push({ x: p.x, y: p.y, targetCity: p.targetCity, radius: 50 });
      });

      // ── Spawn monsters with real sprites ────────────────
      ENEMY_SPAWNS.forEach(m => {
        const scale = m.isBoss ? SPRITE_SCALE * 1.8 : SPRITE_SCALE * 1.2;
        const sprite = this.physics.add.sprite(m.x, m.y, m.sprite)
          .setScale(scale).setDepth(6)
          .setInteractive({ cursor: 'pointer' });

        if (m.isBoss) sprite.setTint(0xff6666);

        const hpBg = this.add.graphics().setDepth(7);
        hpBg.fillStyle(0x000000, 0.7); hpBg.fillRect(-20, -8, 40, 6);
        hpBg.setPosition(m.x, m.y - (m.isBoss ? 55 : 35));

        const hpFill = this.add.graphics().setDepth(7.1);
        hpFill.fillStyle(m.isBoss ? 0xff2200 : 0xcc3333); hpFill.fillRect(-19, -7, 38, 4);
        hpFill.setPosition(m.x, m.y - (m.isBoss ? 55 : 35));

        const color = m.isBoss ? '#ff4444' : '#ff8866';
        const label = this.add.text(m.x, m.y - (m.isBoss ? 65 : 43), m.label, {
          fontSize: m.isBoss ? '12px' : '10px', fontFamily: 'Cinzel, serif',
          color, stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5, 0.5).setDepth(8);

        if (m.isBoss) {
          const bossTag = this.add.text(m.x, m.y - 78, '⚠ BOSS ⚠', {
            fontSize: '11px', fontFamily: 'Cinzel, serif',
            color: '#ff2222', stroke: '#000000', strokeThickness: 3,
          }).setOrigin(0.5, 0.5).setDepth(8);
          this.tweens.add({ targets: bossTag, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
        }

        this.tweens.add({
          targets: sprite,
          x: m.x + (Math.random() - 0.5) * 60,
          y: m.y + (Math.random() - 0.5) * 40,
          duration: 2000 + Math.random() * 2000,
          yoyo: true, repeat: -1, ease: 'Sine.easeInOut',
        });

        sprite.on('pointerdown', () => {
          if (this.busy) return;
          this._spriteClicked = true;
          this.attackTarget = { sprite, enemyId: m.enemyId, isBoss: m.isBoss, label };
          this._npcTarget = null;
          this.moveTarget = { x: sprite.x, y: sprite.y };
          this.isMoving = true;
          this._showClickRipple(sprite.x, sprite.y, 0xff4444);
        });

        this.monsters.push({ sprite, enemyId: m.enemyId, isBoss: m.isBoss, x: m.x, y: m.y, label, hpBg, hpFill, active: true });
      });

      // ── NPCs with real sprites ──────────────────────────
      NPC_DATA.forEach(n => {
        const sprite = this.physics.add.sprite(n.x, n.y, 'spr_npc_merchant')
          .setScale(SPRITE_SCALE * 1.1).setDepth(6)
          .setInteractive({ cursor: 'pointer' });

        const label = this.add.text(n.x, n.y - 40, n.label, {
          fontSize: '11px', fontFamily: 'Cinzel, serif',
          color: '#ffdd88', stroke: '#000000', strokeThickness: 3,
        }).setOrigin(0.5, 0.5).setDepth(8);

        const exMark = this.add.text(n.x, n.y - 54, '❗', {
          fontSize: '14px', stroke: '#000000', strokeThickness: 2,
        }).setOrigin(0.5, 0.5).setDepth(9);
        this.tweens.add({ targets: exMark, y: n.y - 60, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });

        sprite.on('pointerdown', () => {
          if (this.busy) return;
          this._spriteClicked = true;
          this.attackTarget = null;
          this.moveTarget = { x: n.x, y: n.y };
          this.isMoving = true;
          this._npcTarget = { sprite, npcId: n.id };
          this._showClickRipple(n.x, n.y, 0xffdd88);
        });

        this.npcs.push({ sprite, label, npcId: n.id });
      });

      // ── Knight (player) with real sprite ────────────────
      this.knight = this.physics.add.sprite(380, 400, 'spr_knight')
        .setScale(SPRITE_SCALE * 1.2).setDepth(10).setCollideWorldBounds(true);

      this._shadowObj = this.add.ellipse(0, 0, 36, 12, 0x000000, 0.4).setDepth(9);

      this.knightLabel = this.add.text(380, 360, playerName, {
        fontSize: '12px', fontFamily: 'Cinzel, serif',
        color: '#ffffff', stroke: '#000000', strokeThickness: 4,
      }).setOrigin(0.5, 1).setDepth(11);

      this.cursorGfx = this.add.graphics().setDepth(5);

      // ── Atmospheric particles ───────────────────────────
      this._createAtmosphericParticles(Phaser);

      // ── Physics & camera ────────────────────────────────
      this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
      this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
      this.cameras.main.startFollow(this.knight, true, 0.08, 0.08);
      this.cameras.main.setZoom(1.4);
      this.cameras.main.setBackgroundColor('#0a0a08');

      // ── Click-to-move ───────────────────────────────────
      this._spriteClicked = false;
      this.input.on('pointerdown', (ptr) => {
        if (this.busy) return;
        if (ptr.downElement && ptr.downElement.tagName !== 'CANVAS') return;
        if (this._spriteClicked) { this._spriteClicked = false; return; }
        this.attackTarget = null;
        this._npcTarget = null;
        this.moveTarget = { x: ptr.worldX, y: ptr.worldY };
        this.isMoving = true;
        this._showClickRipple(ptr.worldX, ptr.worldY, 0xffffff);
      });
    }

    // ── Atmospheric particle systems ──────────────────────
    _createAtmosphericParticles(Phaser) {
      // Ember texture
      const emberGfx = this.make.graphics({ add: false });
      emberGfx.fillStyle(0xff8833, 0.8);
      emberGfx.fillCircle(2, 2, 2);
      emberGfx.generateTexture('ember_particle', 4, 4);
      emberGfx.destroy();

      // Dust texture
      const dustGfx = this.make.graphics({ add: false });
      dustGfx.fillStyle(0xaa9977, 0.4);
      dustGfx.fillCircle(1, 1, 1);
      dustGfx.generateTexture('dust_particle', 3, 3);
      dustGfx.destroy();

      // Dark mist texture
      const mistGfx = this.make.graphics({ add: false });
      mistGfx.fillStyle(0x334455, 0.3);
      mistGfx.fillCircle(4, 4, 4);
      mistGfx.generateTexture('mist_particle', 8, 8);
      mistGfx.destroy();

      // Ember particles near torches
      [500, 900, 1300, 1700, 2100, 2500, 2900, 3300].forEach(tx => {
        this.add.particles(tx, 310, 'ember_particle', {
          speed: { min: 10, max: 30 },
          angle: { min: 240, max: 300 },
          lifespan: { min: 1000, max: 2500 },
          alpha: { start: 0.8, end: 0 },
          scale: { start: 1, end: 0.3 },
          quantity: 1,
          frequency: 300,
          blendMode: 'ADD',
        }).setDepth(3.5);
      });

      // Global floating dust
      this.add.particles(WORLD_W / 2, WORLD_H / 2, 'dust_particle', {
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Rectangle(-WORLD_W / 2, -WORLD_H / 2, WORLD_W, WORLD_H),
        },
        speed: { min: 5, max: 20 },
        angle: { min: 0, max: 360 },
        lifespan: { min: 3000, max: 6000 },
        alpha: { start: 0.3, end: 0 },
        scale: { start: 1.5, end: 0.5 },
        quantity: 1,
        frequency: 200,
      }).setDepth(3);

      // Boss area dark mist
      this.add.particles(1900, 2400, 'mist_particle', {
        emitZone: {
          type: 'random',
          source: new Phaser.Geom.Circle(0, 0, 200),
        },
        speed: { min: 3, max: 12 },
        angle: { min: 0, max: 360 },
        lifespan: { min: 3000, max: 5000 },
        alpha: { start: 0.4, end: 0 },
        scale: { start: 2, end: 4 },
        quantity: 1,
        frequency: 400,
      }).setDepth(3);
    }

    update() {
      if (!this.knight || this.busy) return;

      if (this.moveTarget && this.isMoving) {
        const tx = this.attackTarget ? this.attackTarget.sprite.x : this.moveTarget.x;
        const ty = this.attackTarget ? this.attackTarget.sprite.y : this.moveTarget.y;
        const dx = tx - this.knight.x;
        const dy = ty - this.knight.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(dx) > 2) this.knight.setFlipX(dx < 0);

        if (this.attackTarget && dist < INTERACT_RADIUS) {
          this.knight.setVelocity(0, 0);
          this.isMoving = false;
          this._triggerCombat(this.attackTarget);
          this.attackTarget = null;
          return;
        }

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

      const px = this.knight.x;
      const py = this.knight.y;
      if (this.knightLabel) this.knightLabel.setPosition(px, py - 35);
      if (this._shadowObj) this._shadowObj.setPosition(px, py + 20);

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
      this.cursorGfx.strokeCircle(wx, wy, 14);
      this.cursorGfx.fillStyle(color, 0.12);
      this.cursorGfx.fillCircle(wx, wy, 14);
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
    render: {
      antialias: false,
      pixelArt: true,
      roundPixels: true,
    },
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
      const Phaser = mod.default || mod;
      gameRef.current = launchPhaser(
        Phaser,
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

      {/* CSS fog of war vignette */}
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

      {/* Mini quest log */}
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
          {/* Health Orb */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, #cc2222, #660000 70%, #330000)',
              border: '3px solid #8b1a1a',
              boxShadow: '0 0 12px rgba(200,30,30,0.5), inset 0 0 10px rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
            }}>
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

          {/* Action bar */}
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

          {/* Mana Orb */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'radial-gradient(circle at 40% 40%, #2244cc, #001166 70%, #000833)',
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

      {/* Player info bar */}
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
