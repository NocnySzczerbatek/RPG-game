// ============================================================
// COMPONENT: Visual 2D World Map (Phaser.js)
// Point-and-click Diablo-style exploration with enemy encounters
// ============================================================
import React, { useEffect, useRef, useState } from 'react';
// Phaser is loaded dynamically inside useEffect so it never blocks
// the initial React render (fixes white-screen on startup with Vite).

// ── World dimensions ──────────────────────────────────────
const WORLD_W = 3200;
const WORLD_H = 2400;
const PLAYER_SPEED = 220; // pixels/second

// ── Enemy encounter markers ───────────────────────────────
// Uses IDs from src/data/enemies.js
const ENEMY_MARKERS = [
  { x: 580,  y: 380,  enemyId: 'skeleton_guard',    label: '💀 Szkielet Strażnik',    color: 0xffcc44, isBoss: false },
  { x: 1050, y: 620,  enemyId: 'corrupted_hound',   label: '🐺 Skaźony Kundel',       color: 0xff8844, isBoss: false },
  { x: 820,  y: 1100, enemyId: 'ruin_crawler',      label: '🦂 Pełzacz Ruin',         color: 0xaa44ff, isBoss: false },
  { x: 1550, y: 830,  enemyId: 'fallen_knight',     label: '⚔️ Upadły Rycerz',       color: 0xff6644, isBoss: false },
  { x: 2150, y: 550,  enemyId: 'wraith_archer',     label: '👻 Łucznik-Widmo',        color: 0x88aaff, isBoss: false },
  { x: 1900, y: 1450, enemyId: 'void_acolyte',      label: '🌑 Akolita Pustki',       color: 0x9933ff, isBoss: false },
  { x: 2650, y: 1200, enemyId: 'stone_sentinel',    label: '🗿 Kamienny Strażnik',    color: 0x999999, isBoss: false },
  { x: 1350, y: 1850, enemyId: 'the_undying_warden',label: '👁️ Nieśmiertelny Strażnik', color: 0xff2222, isBoss: true },
];

// ── Tree decoration positions ─────────────────────────────
const TREE_SPOTS = [
  [160,160],[240,310],[3000,180],[2880,330],[120,920],[200,1080],
  [1720,190],[1820,300],[2960,780],[3060,940],[360,1900],[490,2010],
  [1880,1520],[2010,1640],[2350,540],[2460,680],[720,1510],[830,1640],
  [1280,2010],[1200,2200],[2720,1680],[2830,1880],[520,2310],[640,2410],
  [420,680],[340,1350],[1700,1200],[2500,2000],[950,400],[3100,1400],
  [600,1700],[1100,2000],[2000,400],[2800,600],[400,2100],[1600,2200],
];

// ── Rock decoration positions ──────────────────────────────
const ROCK_SPOTS = [
  [700,250],[1300,450],[2000,800],[2700,400],[500,1300],[1800,650],
  [1100,1500],[2400,1100],[900,1800],[3000,700],[1500,2100],[2200,1700],
];

// =============================================================

const GameMap = ({ dispatch, player }) => {
  const containerRef = useRef(null);
  const gameRef      = useRef(null);
  const dispatchRef  = useRef(dispatch);
  const [loading, setLoading] = useState(true);
  useEffect(() => { dispatchRef.current = dispatch; }, [dispatch]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    let cancelled = false;

    import('phaser').then((PhaserModule) => {
      if (cancelled || !containerRef.current) return;
      const Phaser = PhaserModule.default;
      setLoading(false);
      constructor() {
        super({ key: 'GameScene' });
        this.playerSprite  = null;
        this.playerLabel   = null;
        this.moveTarget    = null;
        this.isMoving      = false;
        this.markers       = [];
        this.cursorGfx     = null;
        this.combatPending = false;
      }

      // ----------------------------------------------------------
      preload() {
        // All assets are generated programmatically in create()
      }

      // ----------------------------------------------------------
      create() {
        // ── 1. Grass tile texture ────────────────────────────
        const grassGfx = this.make.graphics({ add: false });
        grassGfx.fillStyle(0x2e7d20);
        grassGfx.fillRect(0, 0, 64, 64);
        // Blade variation
        grassGfx.fillStyle(0x20601a, 0.5);
        [[4,6,3,18],[18,2,2,14],[32,10,3,16],[46,4,2,12],[56,18,3,14],
         [10,40,2,16],[28,34,3,12],[50,44,2,10]].forEach(([x,y,w,h]) => {
          grassGfx.fillRect(x, y, w, h);
        });
        grassGfx.fillStyle(0x3a9a26, 0.3);
        grassGfx.fillCircle(24, 48, 8);
        grassGfx.fillCircle(48, 18, 6);
        grassGfx.generateTexture('grass', 64, 64);
        grassGfx.destroy();

        this.add.tileSprite(WORLD_W / 2, WORLD_H / 2, WORLD_W, WORLD_H, 'grass').setDepth(0);

        // ── 2. Dirt path ──────────────────────────────────────
        const road = this.add.graphics().setDepth(1);
        road.fillStyle(0xb8935a, 0.55);
        road.fillRect(250, 255, 2700, 55);   // main east-west road
        road.fillRect(275, 255, 55, 1700);   // branch south
        road.fillRect(1350, 255, 55, 1600);  // mid branch
        road.fillStyle(0xa07840, 0.3);
        road.fillRect(252, 257, 2696, 51);

        // ── 3. Trees ──────────────────────────────────────────
        TREE_SPOTS.forEach(([tx, ty]) => {
          const tg = this.add.graphics().setDepth(2);
          tg.fillStyle(0x5c3d1e);
          tg.fillRect(tx - 5, ty, 10, 22);           // trunk
          tg.fillStyle(0x0e4a08);
          tg.fillCircle(tx, ty - 2, 26);              // outer canopy shadow
          tg.fillStyle(0x186010);
          tg.fillCircle(tx, ty - 6, 22);              // main canopy
          tg.fillStyle(0x22881a);
          tg.fillCircle(tx - 8, ty - 16, 15);         // left cluster
          tg.fillCircle(tx + 8, ty - 16, 15);         // right cluster
          tg.fillStyle(0x30a824, 0.7);
          tg.fillCircle(tx, ty - 22, 11);             // top highlight
        });

        // ── 4. Rocks ─────────────────────────────────────────
        ROCK_SPOTS.forEach(([rx, ry]) => {
          const rg = this.add.graphics().setDepth(2);
          rg.fillStyle(0x666666);
          rg.fillEllipse(rx, ry, 28, 20);
          rg.fillStyle(0x888888);
          rg.fillEllipse(rx - 4, ry - 4, 18, 12);
          rg.fillStyle(0x444444);
          rg.fillEllipse(rx + 6, ry + 3, 12, 8);
        });

        // ── 5. Enemy markers ─────────────────────────────────
        ENEMY_MARKERS.forEach((m) => {
          const mg = this.add.graphics().setDepth(6);
          this._drawMarker(mg, m.x, m.y, m.color, m.isBoss);

          let labelText = m.label;
          const txt = this.add.text(m.x, m.y + 34, labelText, {
            fontSize: '11px',
            color: '#ffe8c0',
            stroke: '#000000',
            strokeThickness: 3,
          }).setOrigin(0.5, 0).setDepth(7);

          // Boss blink tag
          let bossTag = null;
          if (m.isBoss) {
            bossTag = this.add.text(m.x, m.y - 38, '⚠ BOSS ⚠', {
              fontSize: '11px',
              color: '#ff4444',
              stroke: '#000000',
              strokeThickness: 3,
            }).setOrigin(0.5, 0.5).setDepth(7);
            this.tweens.add({ targets: bossTag, alpha: 0.15, duration: 500, yoyo: true, repeat: -1 });
          }

          // Pulse tween on the graphics
          this.tweens.add({
            targets: mg,
            alpha: 0.55,
            duration: m.isBoss ? 600 : 900,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
          });

          this.markers.push({
            gfx: mg, txt, bossTag,
            x: m.x, y: m.y,
            enemyId: m.enemyId,
            isBoss: m.isBoss,
            active: true,
            triggerRadius: m.isBoss ? 45 : 38,
          });
        });

        // ── 6. Player sprite (generated texture) ─────────────
        const pg = this.make.graphics({ add: false });
        pg.fillStyle(0x4a9eff);
        pg.fillCircle(16, 16, 14);
        pg.lineStyle(2, 0x99ccff);
        pg.strokeCircle(16, 16, 14);
        pg.fillStyle(0xe8f4ff);
        pg.fillCircle(16, 10, 5);   // head
        pg.fillStyle(0x3a80dd);
        pg.fillRect(10, 18, 12, 9); // body
        pg.generateTexture('player_tex', 32, 32);
        pg.destroy();

        this.playerSprite = this.physics.add.sprite(280, 260, 'player_tex');
        this.playerSprite.setDepth(10);
        this.playerSprite.setCollideWorldBounds(true);

        // Shadow under player
        const shadow = this.add.ellipse(0, 0, 26, 10, 0x000000, 0.35).setDepth(9);
        this._shadowObj = shadow;

        // Player name label
        this.playerLabel = this.add.text(280, 238, player?.name ?? 'Bohater', {
          fontSize: '11px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 3,
        }).setOrigin(0.5, 1).setDepth(11);

        // ── 7. Click / cursor indicator ───────────────────────
        this.cursorGfx = this.add.graphics().setDepth(5);

        // ── 8. Physics world & camera ─────────────────────────
        this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
        this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);
        this.cameras.main.startFollow(this.playerSprite, true, 0.09, 0.09);
        this.cameras.main.setZoom(1.4);

        // ── 9. Click-to-move input ────────────────────────────
        this.input.on('pointerdown', (ptr) => {
          if (this.combatPending) return;
          this.moveTarget = { x: ptr.worldX, y: ptr.worldY };
          this.isMoving   = true;
          this._showClickRipple(ptr.worldX, ptr.worldY);
        });
      }

      // ----------------------------------------------------------
      update() {
        if (!this.playerSprite || this.combatPending) return;

        // ── Move player towards target ────────────────────────
        if (this.moveTarget && this.isMoving) {
          const dx   = this.moveTarget.x - this.playerSprite.x;
          const dy   = this.moveTarget.y - this.playerSprite.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 6) {
            this.playerSprite.setVelocity(0, 0);
            this.isMoving = false;
          } else {
            const ratio = PLAYER_SPEED / dist;
            this.playerSprite.setVelocity(dx * ratio, dy * ratio);
          }
        }

        // ── Keep label & shadow tracking the sprite ───────────
        const px = this.playerSprite.x;
        const py = this.playerSprite.y;
        if (this.playerLabel) this.playerLabel.setPosition(px, py - 20);
        if (this._shadowObj)  this._shadowObj.setPosition(px, py + 12);

        // ── Enemy collision check ─────────────────────────────
        for (let i = this.markers.length - 1; i >= 0; i--) {
          const m = this.markers[i];
          if (!m.active) continue;
          const dx = px - m.x;
          const dy = py - m.y;
          if (Math.sqrt(dx * dx + dy * dy) < m.triggerRadius) {
            this._triggerCombat(m, i);
            return;
          }
        }
      }

      // ----------------------------------------------------------
      // Private helpers
      // ----------------------------------------------------------
      _drawMarker(gfx, x, y, color, isBoss) {
        // Outer glow ring
        gfx.lineStyle(isBoss ? 4 : 3, color, 0.9);
        gfx.strokeCircle(x, y, isBoss ? 26 : 22);
        gfx.fillStyle(color, 0.2);
        gfx.fillCircle(x, y, isBoss ? 26 : 22);
        // Inner dot
        gfx.fillStyle(color, 1);
        gfx.fillCircle(x, y, isBoss ? 9 : 6);
        // Cross-hair tick marks for boss
        if (isBoss) {
          gfx.lineStyle(2, 0xff0000, 0.8);
          gfx.strokeRect(x - 3, y - 12, 6, 2);
          gfx.strokeRect(x - 3, y + 10, 6, 2);
          gfx.strokeRect(x - 12, y - 3, 2, 6);
          gfx.strokeRect(x + 10, y - 3, 2, 6);
        }
      }

      _showClickRipple(wx, wy) {
        this.cursorGfx.clear();
        this.cursorGfx.setAlpha(1);
        this.cursorGfx.setScale(1);
        this.cursorGfx.lineStyle(2, 0xffffff, 0.9);
        this.cursorGfx.strokeCircle(wx, wy, 10);
        this.cursorGfx.fillStyle(0xffffff, 0.2);
        this.cursorGfx.fillCircle(wx, wy, 10);
        this.tweens.add({
          targets: this.cursorGfx,
          alpha: 0,
          scaleX: 1.8,
          scaleY: 1.8,
          duration: 500,
          ease: 'Quad.easeOut',
          onComplete: () => {
            this.cursorGfx.clear();
            this.cursorGfx.setAlpha(1);
            this.cursorGfx.setScale(1);
          },
        });
      }

      _triggerCombat(marker, index) {
        this.combatPending = true;
        marker.active = false;
        this.playerSprite.setVelocity(0, 0);
        this.isMoving = false;
        this.moveTarget = null;

        // Destroy marker visuals
        marker.gfx.destroy();
        marker.txt.destroy();
        if (marker.bossTag) marker.bossTag.destroy();
        this.markers.splice(index, 1);

        // Dramatic camera flash then dispatch
        this.cameras.main.flash(300, 255, 60, 60);
        this.time.delayedCall(320, () => {
          dispatchRef.current({ type: 'START_COMBAT', enemyId: marker.enemyId, isBoss: marker.isBoss });
        });
      }
    }

    // ── Phaser game config ──────────────────────────────────
    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width:  containerRef.current.clientWidth  || window.innerWidth,
      height: containerRef.current.clientHeight || window.innerHeight,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false },
      },
      scene: GameScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      backgroundColor: '#2e7d20',
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []); // Run only once on mount — Phaser owns the lifecycle

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      {/* Phaser canvas mount point */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* ── Back to city button ────────────────────────────── */}
      <button
        onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
        style={{
          position: 'absolute',
          top: 14,
          left: 14,
          zIndex: 100,
          padding: '8px 18px',
          background: 'rgba(10, 16, 30, 0.88)',
          border: '1px solid rgba(100, 116, 139, 0.55)',
          color: '#cbd5e1',
          fontFamily: '"Cinzel", serif',
          fontSize: '13px',
          borderRadius: '6px',
          cursor: 'pointer',
          letterSpacing: '0.03em',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(148,163,184,0.9)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(100,116,139,0.55)')}
      >
        ← Wróć do Miasta
      </button>

      {/* ── Legend overlay ────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          right: 14,
          zIndex: 100,
          background: 'rgba(10, 16, 30, 0.85)',
          border: '1px solid rgba(100, 116, 139, 0.35)',
          borderRadius: '8px',
          padding: '10px 14px',
          color: '#94a3b8',
          fontSize: '12px',
          fontFamily: '"Crimson Text", serif',
          lineHeight: '1.7',
          minWidth: 210,
        }}
      >
        <div style={{ color: '#e2e8f0', marginBottom: 4, fontFamily: '"Cinzel", serif', fontSize: '13px' }}>
          Mapa Eksploracji
        </div>
        <div>🖱️ Kliknij — ustaw cel ruchu</div>
        <div>⚔️ Wejdź na znacznik — walka</div>
        <div style={{ color: '#ff8080', marginTop: 2 }}>⚠️ Czerwony — próba bossa</div>
      </div>
    </div>
  );
};

export default GameMap;
