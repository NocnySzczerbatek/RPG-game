import React, { useState, useEffect, useRef } from 'react';

const FONT = "'Cinzel', 'Palatino Linotype', 'Book Antiqua', serif";
const SPRITES = 'assets/sprites/craftpix-891165-assassin-mage-viking-free-pixel-art-game-heroes/PNG';

/* ═══════════════════════════════════════════════════════════════
   CLASS DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */
const CLASSES = [
  {
    id: 'warrior',
    name: 'Warrior',
    subtitle: 'The Unyielding',
    desc: 'A mountain of steel and fury. Masters devastating melee strikes and shrugs off blows that would fell lesser men.',
    sprite: `${SPRITES}/Knight/Idle/idle1.png`,
    idleFrames: 12,
    idlePath: `${SPRITES}/Knight/Idle`,
    idlePrefix: 'idle',
    color: '#cc6633',
    glow: 'rgba(200,100,50,0.35)',
    stats: {
      str: 18, int: 10, dex: 10, will: 8,
      hp: 120, maxHp: 120, mana: 35, maxMana: 35,
      baseDmg: 15, critChance: 0.10, def: 5,
    },
    focus: 'Physical Damage & Armor',
  },
  {
    id: 'mage',
    name: 'Mage',
    subtitle: 'The Netherseer',
    desc: 'Wields arcane forces torn from the rift between worlds. Fragile in body, but devastating in destruction.',
    sprite: `${SPRITES}/Mage/Idle/idle1.png`,
    idleFrames: 14,
    idlePath: `${SPRITES}/Mage/Idle`,
    idlePrefix: 'idle',
    color: '#6644cc',
    glow: 'rgba(100,68,200,0.35)',
    stats: {
      str: 6, int: 18, dex: 10, will: 14,
      hp: 80, maxHp: 80, mana: 70, maxMana: 70,
      baseDmg: 10, critChance: 0.18, def: 2,
    },
    focus: 'Mana & Critical Strikes',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    subtitle: 'The Phantom',
    desc: 'A shadow that strikes before the scream. Combines lethal speed with precision to dismantle foes before they react.',
    sprite: `${SPRITES}/Rogue/Idle/idle1.png`,
    idleFrames: 17,
    idlePath: `${SPRITES}/Rogue/Idle`,
    idlePrefix: 'idle',
    color: '#33aa55',
    glow: 'rgba(50,170,85,0.35)',
    stats: {
      str: 12, int: 8, dex: 14, will: 10,
      hp: 95, maxHp: 95, mana: 50, maxMana: 50,
      baseDmg: 12, critChance: 0.20, def: 3,
    },
    focus: 'Attack Speed & Dodge',
  },
];

/* ═══════════════════════════════════════════════════════════════
   ANIMATED SPRITE (idle cycling)
   ═══════════════════════════════════════════════════════════════ */
function AnimatedSprite({ cls, size = 180, active }) {
  const [frame, setFrame] = useState(1);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!active) { setFrame(1); return; }
    intervalRef.current = setInterval(() => {
      setFrame(f => (f % cls.idleFrames) + 1);
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [active, cls]);

  return (
    <img
      src={`${cls.idlePath}/${cls.idlePrefix}${frame}.png`}
      alt={cls.name}
      style={{
        width: size, height: size,
        imageRendering: 'pixelated',
        filter: active
          ? `drop-shadow(0 0 16px ${cls.glow}) drop-shadow(0 0 30px ${cls.glow})`
          : 'brightness(0.5) saturate(0.3)',
        transition: 'filter 0.4s ease',
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════════════════
   STAT BAR
   ═══════════════════════════════════════════════════════════════ */
function StatBar({ label, value, max = 20, color }) {
  const pct = Math.min(1, value / max) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
      <span style={{
        fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#9a8a6a',
        width: 85, textAlign: 'right', letterSpacing: 1,
        textTransform: 'uppercase',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
      }}>{label}</span>
      <div style={{
        flex: 1, height: 10,
        background: 'rgba(0,0,0,0.6)',
        border: '1px solid #1a1208',
        borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%',
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 0.4s ease',
          boxShadow: `0 0 6px ${color}44`,
        }} />
      </div>
      <span style={{
        fontFamily: FONT, fontSize: 14, fontWeight: 700, color: '#d4c89a',
        width: 28, textAlign: 'center',
        textShadow: '0 1px 2px rgba(0,0,0,0.8)',
      }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MONSTER SILHOUETTES (background decorations)
   ═══════════════════════════════════════════════════════════════ */
const MONSTERS_PATH = 'assets/sprites/craftpix-561178-free-rpg-monster-sprites-pixel-art/PNG';
const BG_MONSTERS = [
  { src: `${MONSTERS_PATH}/dragon/Idle1.png`, x: '3%', y: '60%', size: 220, flip: false },
  { src: `${MONSTERS_PATH}/demon/Idle1.png`, x: '88%', y: '55%', size: 160, flip: true },
  { src: `${MONSTERS_PATH}/medusa/Idle1.png`, x: '7%', y: '20%', size: 120, flip: false },
  { src: `${MONSTERS_PATH}/small_dragon/Idle1.png`, x: '90%', y: '18%', size: 110, flip: true },
  { src: `${MONSTERS_PATH}/lizard/Idle1.png`, x: '15%', y: '82%', size: 100, flip: false },
  { src: `${MONSTERS_PATH}/demon/Idle2.png`, x: '82%', y: '80%', size: 130, flip: true },
];

/* ═══════════════════════════════════════════════════════════════
   FLICKERING PARTICLES (campfire embers)
   ═══════════════════════════════════════════════════════════════ */
function Embers() {
  const [particles] = useState(() =>
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: 5 + Math.random() * 90,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 6,
      size: 1 + Math.random() * 3,
    }))
  );
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            bottom: -10,
            left: `${p.left}%`,
            width: p.size, height: p.size,
            borderRadius: '50%',
            background: `hsl(${20 + Math.random() * 25}, 90%, ${50 + Math.random() * 30}%)`,
            boxShadow: `0 0 ${p.size * 2}px rgba(255,120,20,0.4)`,
            animation: `emberRise ${p.duration}s ${p.delay}s infinite linear`,
            opacity: 0,
          }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TAB PANELS
   ═══════════════════════════════════════════════════════════════ */
const TABS = [
  { id: 'story', label: '📜 Historia' },
  { id: 'tutorial', label: '⚔ Samouczek' },
  { id: 'login', label: '🔑 Logowanie' },
];

function StoryPanel() {
  return (
    <div style={{ padding: '16px 20px', lineHeight: 1.7 }}>
      <h3 style={{
        fontFamily: FONT, fontSize: 20, fontWeight: 700, color: '#c9a84c', margin: '0 0 12px',
        letterSpacing: 2, textTransform: 'uppercase',
        textShadow: '0 0 10px rgba(200,160,60,0.3), 0 1px 3px rgba(0,0,0,0.8)',
      }}>Mroczna Historia Świata</h3>
      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: '#b0a080', marginBottom: 12, lineHeight: 1.7 }}>
        Dawno temu bogowie stworzyli świat Aethermoor — krainę zieloną i pełną magii. Lecz jeden z nich,
        <span style={{ color: '#cc4444' }}> Vaelthor Rozdzieracz</span>, zapragnął władzy absolutnej.
        Otworzył Bramę Otchłani, wypuszczając na świat hordy demonów, smoków i nieumarłych.
      </p>
      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: '#b0a080', marginBottom: 12, lineHeight: 1.7 }}>
        Wielkie królestwa upadły. Elfy schroniły się w ruinach. Ludzie walczą o przetrwanie w Mrocznym Lesie.
        Jedyną nadzieją jest
        <span style={{ color: '#c9a84c' }}> God-Slayer</span> — śmiertelnik zdolny pokonać upadłego boga.
      </p>
      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: '#b0a080', marginBottom: 12, lineHeight: 1.7 }}>
        Twoja podróż zaczyna się w opustoszałym lesie. Zbieraj łupy, rozwijaj postać, pokonuj potwory
        i zejdź do <span style={{ color: '#aa88ff' }}>Zapomnianej Krypty</span>, by zmierzyć się z
        <span style={{ color: '#ff4444' }}> Drakulem Nieśmiertelnym</span> — pierwszym ze sług Vaelthora.
      </p>
      <div style={{
        marginTop: 14, padding: '10px 14px',
        background: 'rgba(200,160,60,0.06)', border: '1px solid rgba(200,160,60,0.15)',
        borderRadius: 4,
      }}>
        <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: '#7a6a3e', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
          Pełna historia pojawi się wkrótce...
        </div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: '#8a7a5a' }}>
          Kolejne rozdziały, postacie fabularne i questy pojawią się w przyszłych aktualizacjach.
        </div>
      </div>
    </div>
  );
}

function TutorialPanel() {
  const tips = [
    { icon: '🖱️', title: 'Poruszanie', desc: 'Kliknij LPM na ziemię, by się poruszać.' },
    { icon: '⚔️', title: 'Atak', desc: 'Kliknij LPM na wroga, by do niego podejść i zaatakować.' },
    { icon: '🔥', title: 'Umiejętności', desc: 'Q, W (PPM), E, R — każda klasa ma 4 unikalne skille.' },
    { icon: '📦', title: 'Ekwipunek', desc: 'Klawisz I otwiera ekwipunek. PPM aby założyć/zdjąć przedmiot.' },
    { icon: '💰', title: 'Handel', desc: 'Naciśnij E przy NPC w wiosce, by handlować.' },
    { icon: '🚪', title: 'Portal', desc: 'Naciśnij E przy portalu, by wejść do Zapomnianej Krypty.' },
    { icon: '💀', title: 'Śmierć', desc: 'Po śmierci odrodzisz się w wiosce z 2s nieśmiertelnością.' },
    { icon: '🐉', title: 'Boss', desc: 'Smok Drakul czeka w krypcie. Ma 2 fazy — uważaj na oddech ognia!' },
  ];
  return (
    <div style={{ padding: '16px 20px' }}>
      <h3 style={{
        fontFamily: FONT, fontSize: 20, fontWeight: 700, color: '#c9a84c', margin: '0 0 14px',
        letterSpacing: 2, textTransform: 'uppercase',
        textShadow: '0 0 10px rgba(200,160,60,0.3), 0 1px 3px rgba(0,0,0,0.8)',
      }}>Jak Grać</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {tips.map((t, i) => (
          <div key={i} style={{
            display: 'flex', gap: 10, alignItems: 'flex-start',
            padding: '10px 12px',
            background: 'rgba(20,16,10,0.5)',
            border: '1px solid rgba(42,26,8,0.3)',
            borderRadius: 4,
          }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{t.icon}</span>
            <div>
              <div style={{ fontFamily: FONT, fontSize: 14, color: '#d4c49a', fontWeight: 700, marginBottom: 3, textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>{t.title}</div>
              <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 500, color: '#9a8a6a', lineHeight: 1.5 }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LoginPanel() {
  return (
    <div style={{ padding: '16px 20px' }}>
      <h3 style={{
        fontFamily: FONT, fontSize: 20, fontWeight: 700, color: '#c9a84c', margin: '0 0 14px',
        letterSpacing: 2, textTransform: 'uppercase',
        textShadow: '0 0 10px rgba(200,160,60,0.3), 0 1px 3px rgba(0,0,0,0.8)',
      }}>Zaloguj się</h3>
      <p style={{ fontFamily: FONT, fontSize: 14, fontWeight: 500, color: '#9a8a6a', marginBottom: 18, lineHeight: 1.6 }}>
        Logowanie pozwoli zapisywać postęp w chmurze i rywalizować z innymi graczami.
      </p>

      {/* Google login */}
      <button style={{
        width: '100%', padding: '12px 20px', marginBottom: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff',
        background: 'linear-gradient(180deg, #4285f4, #3367d6)',
        border: '1px solid #2a5db8', borderRadius: 4, cursor: 'pointer',
        letterSpacing: 1,
        boxShadow: '0 2px 8px rgba(66,133,244,0.3)',
        transition: 'all 0.2s',
        opacity: 0.7,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Zaloguj przez Google
      </button>

      {/* Discord login */}
      <button style={{
        width: '100%', padding: '12px 20px', marginBottom: 16,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#fff',
        background: 'linear-gradient(180deg, #5865f2, #4752c4)',
        border: '1px solid #3c45a5', borderRadius: 4, cursor: 'pointer',
        letterSpacing: 1,
        boxShadow: '0 2px 8px rgba(88,101,242,0.3)',
        transition: 'all 0.2s',
        opacity: 0.7,
      }}>
        <svg width="20" height="15" viewBox="0 0 71 55" fill="white">
          <path d="M60.1 4.9A58.5 58.5 0 0045.4.2a.2.2 0 00-.2.1 40.7 40.7 0 00-1.8 3.7 54 54 0 00-16.2 0A39 39 0 0025.4.3a.2.2 0 00-.2-.1A58.4 58.4 0 0010.5 5C1.5 18.6-1 31.8.3 44.8v.2a58.9 58.9 0 0017.7 9 .2.2 0 00.3-.1 42 42 0 003.6-5.9.2.2 0 00-.1-.3 38.8 38.8 0 01-5.5-2.7.2.2 0 01 0-.4c.4-.3.7-.6 1.1-.8a.2.2 0 01.2 0 42 42 0 0035.6 0 .2.2 0 01.2 0l1.1.9a.2.2 0 010 .3 36 36 0 01-5.5 2.7.2.2 0 00-.1.3 47 47 0 003.6 5.9.2.2 0 00.2 0A58.7 58.7 0 0070.7 45v-.1c1.6-16.8-2.8-31.4-11.6-44.3zM23.7 36.7c-3.8 0-7-3.5-7-7.9s3.1-7.8 7-7.8 7.1 3.5 7 7.8c0 4.4-3.1 7.9-7 7.9zm25.9 0c-3.8 0-7-3.5-7-7.9s3.1-7.8 7-7.8 7.1 3.5 7 7.8c0 4.4-3.1 7.9-7 7.9z"/>
        </svg>
        Zaloguj przez Discord
      </button>

      <div style={{
        padding: '10px 14px',
        background: 'rgba(200,160,60,0.06)', border: '1px solid rgba(200,160,60,0.15)',
        borderRadius: 4,
      }}>
        <div style={{ fontFamily: FONT, fontSize: 12, fontWeight: 600, color: '#7a6a3e', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>
          Już wkrótce
        </div>
        <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: '#8a7a5a', lineHeight: 1.5 }}>
          Logowanie zostanie aktywowane w późniejszej aktualizacji. Na razie graj jako gość — postęp zapisywany jest lokalnie.
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN MENU COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function MainMenu({ onStartGame, hasSave, onContinue }) {
  const [selected, setSelected] = useState(0);
  const [hoverStart, setHoverStart] = useState(false);
  const [activeTab, setActiveTab] = useState('story');

  const cls = CLASSES[selected];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'radial-gradient(ellipse at 50% 90%, #1a0e04 0%, #080402 50%, #020101 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      overflow: 'auto',
      padding: '20px 0',
    }}>
      {/* Embers */}
      <Embers />

      {/* Animated vignette */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        boxShadow: 'inset 0 0 150px rgba(0,0,0,0.95), inset 0 0 60px rgba(0,0,0,0.8)',
        animation: 'vigFlicker 3s ease-in-out infinite alternate', zIndex: 0,
      }} />

      {/* Monster silhouettes */}
      {BG_MONSTERS.map((m, i) => (
        <img
          key={i}
          src={m.src}
          alt=""
          style={{
            position: 'fixed', left: m.x, top: m.y,
            width: m.size, height: m.size,
            imageRendering: 'pixelated',
            filter: 'brightness(0.08) saturate(0.2)',
            transform: m.flip ? 'scaleX(-1)' : 'none',
            opacity: 0.4, pointerEvents: 'none', zIndex: 0,
          }}
        />
      ))}

      {/* ═══ TITLE ═══ */}
      <div style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginBottom: 14, flexShrink: 0 }}>
        <h1 style={{
          fontFamily: FONT, fontSize: 54, fontWeight: 700,
          color: '#c9a84c',
          textShadow: '0 0 20px rgba(200,160,60,0.4), 0 0 60px rgba(200,160,60,0.15), 0 2px 4px rgba(0,0,0,0.8)',
          letterSpacing: 8, textTransform: 'uppercase', margin: 0,
        }}>God-Slayer</h1>
        <p style={{
          fontFamily: FONT, fontSize: 15, fontWeight: 600, color: '#7a6a3e',
          letterSpacing: 5, textTransform: 'uppercase', marginTop: 4,
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}>Rise from Ashes</p>
      </div>

      {/* ═══ MAIN LAYOUT: two columns ═══ */}
      <div style={{
        display: 'flex', gap: 14,
        position: 'relative', zIndex: 2,
        maxWidth: '95vw', width: 1100, flexShrink: 0,
      }}>

        {/* ════ LEFT COLUMN: Class selector + Hero + Stats ════ */}
        <div style={{
          flex: '0 0 660px',
          background: 'linear-gradient(180deg, rgba(14,10,6,0.95), rgba(8,6,4,0.98))',
          border: '1px solid #2a1a08', borderRadius: 6,
          boxShadow: '0 0 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex',
        }}>

          {/* ── Class selector ────────────────────────── */}
          <div style={{
            width: 170, padding: '16px 0',
            borderRight: '1px solid #1a1208',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
          }}>
            <div style={{
              fontFamily: FONT, fontSize: 12, fontWeight: 700, color: '#8a7a4e',
              letterSpacing: 2, textTransform: 'uppercase',
              padding: '0 14px 8px', borderBottom: '1px solid rgba(42,26,8,0.4)',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}>Wybierz Klasę</div>

            {CLASSES.map((c, i) => (
              <div
                key={c.id}
                onClick={() => setSelected(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 12px', cursor: 'pointer',
                  background: selected === i ? `linear-gradient(90deg, ${c.color}15, transparent)` : 'transparent',
                  borderLeft: selected === i ? `3px solid ${c.color}` : '3px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <img src={c.sprite} alt={c.name} style={{
                  width: 36, height: 36, imageRendering: 'pixelated',
                  filter: selected === i ? 'none' : 'brightness(0.4) saturate(0.2)',
                  transition: 'filter 0.3s',
                }} />
                <div>
                  <div style={{
                    fontFamily: FONT, fontSize: 15, fontWeight: 700,
                    color: selected === i ? c.color : '#6a5a34', transition: 'color 0.2s',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  }}>{c.name}</div>
                  <div style={{
                    fontFamily: FONT, fontSize: 10, fontWeight: 500, color: '#6a5a34',
                    letterSpacing: 1, textTransform: 'uppercase',
                  }}>{c.subtitle}</div>
                </div>
              </div>
            ))}

            {/* Buttons */}
            <div style={{ marginTop: 'auto', padding: '10px 12px', borderTop: '1px solid rgba(42,26,8,0.4)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button
                onClick={() => onStartGame(cls)}
                onMouseEnter={() => setHoverStart(true)}
                onMouseLeave={() => setHoverStart(false)}
                style={{
                  width: '100%', padding: '10px 0',
                  fontFamily: FONT, fontSize: 14, fontWeight: 700,
                  color: hoverStart ? '#fff' : '#c9a84c',
                  background: hoverStart
                    ? `linear-gradient(180deg, ${cls.color}33, ${cls.color}11)`
                    : 'linear-gradient(180deg, rgba(30,22,10,0.9), rgba(16,12,6,0.95))',
                  border: `2px solid ${hoverStart ? cls.color : '#3a2a10'}`,
                  borderRadius: 4, cursor: 'pointer',
                  letterSpacing: 2, textTransform: 'uppercase',
                  boxShadow: hoverStart ? `0 0 20px ${cls.glow}, inset 0 0 10px ${cls.glow}` : '0 0 10px rgba(0,0,0,0.5)',
                  transition: 'all 0.25s ease',
                }}
              >Rozpocznij Grę</button>

              {hasSave && (
                <button
                  onClick={onContinue}
                  style={{
                    width: '100%', padding: '8px 0',
                    fontFamily: FONT, fontSize: 13, fontWeight: 700,
                    color: '#bbb', background: 'rgba(20,16,10,0.9)',
                    border: '1px solid #2a2a2a', borderRadius: 4, cursor: 'pointer',
                    letterSpacing: 2, textTransform: 'uppercase', transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#ddd'; e.currentTarget.style.borderColor = '#555'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#2a2a2a'; }}
                >↻ Kontynuuj</button>
              )}
            </div>
          </div>

          {/* ── Hero preview ────────────────────────── */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'space-between',
            position: 'relative', padding: '14px 14px 12px',
            overflow: 'hidden',
          }}>
            {/* Description at top, separate from orb */}
            <p style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 600, color: '#a09070',
              textAlign: 'center', lineHeight: 1.6,
              maxWidth: 220, margin: 0,
              textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              flexShrink: 0,
            }}>{cls.desc}</p>

            {/* Orb + sprite centered */}
            <div style={{
              position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 170, height: 170, flexShrink: 0,
            }}>
              <div style={{
                position: 'absolute', width: 170, height: 170, borderRadius: '50%',
                background: `radial-gradient(circle, ${cls.glow}, transparent 70%)`,
                animation: 'heroGlow 3s ease-in-out infinite alternate',
              }} />
              <AnimatedSprite cls={cls} size={140} active={true} />
            </div>

            {/* Name + focus below orb */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{
                fontFamily: FONT, fontSize: 22, fontWeight: 700,
                color: cls.color, letterSpacing: 4,
                textShadow: `0 0 14px ${cls.glow}, 0 2px 4px rgba(0,0,0,0.8)`,
              }}>{cls.name}</div>
              <div style={{
                fontFamily: FONT, fontSize: 13, fontWeight: 600, color: cls.color,
                textShadow: `0 0 8px ${cls.glow}`, marginTop: 4,
                letterSpacing: 1,
              }}>⚡ {cls.focus}</div>
            </div>
          </div>

          {/* ── Stats ────────────────────────── */}
          <div style={{
            width: 200, padding: '16px 14px',
            borderLeft: '1px solid #1a1208',
            display: 'flex', flexDirection: 'column', flexShrink: 0,
          }}>
            <div style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#8a7a4e',
              letterSpacing: 2, textTransform: 'uppercase',
              paddingBottom: 6, borderBottom: '1px solid rgba(42,26,8,0.4)', marginBottom: 8,
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}>Atrybuty</div>

            <StatBar label="Siła" value={cls.stats.str} color="#cc6633" />
            <StatBar label="Intelekt" value={cls.stats.int} color="#6644cc" />
            <StatBar label="Zręczność" value={cls.stats.dex} color="#33aa55" />
            <StatBar label="Wola" value={cls.stats.will} color="#aa8833" />

            <div style={{
              fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#8a7a4e',
              letterSpacing: 2, textTransform: 'uppercase',
              padding: '10px 0 6px', borderBottom: '1px solid rgba(42,26,8,0.4)', marginBottom: 6,
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}>Walka</div>

            <StatBar label="Zdrowie" value={cls.stats.hp} max={150} color="#cc2222" />
            <StatBar label="Mana" value={cls.stats.mana} max={80} color="#4466cc" />
            <StatBar label="Obrażenia" value={cls.stats.baseDmg} max={20} color="#dd6644" />
            <StatBar label="Krytyk %" value={Math.round(cls.stats.critChance * 100)} max={25} color="#ee5555" />
            <StatBar label="Pancerz" value={cls.stats.def} max={10} color="#6688aa" />
          </div>
        </div>

        {/* ════ RIGHT COLUMN: Story / Tutorial / Login ════ */}
        <div style={{
          flex: 1, minWidth: 0,
          background: 'linear-gradient(180deg, rgba(14,10,6,0.95), rgba(8,6,4,0.98))',
          border: '1px solid #2a1a08', borderRadius: 6,
          boxShadow: '0 0 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Tab bar */}
          <div style={{
            display: 'flex', borderBottom: '1px solid rgba(42,26,8,0.5)',
            background: 'rgba(20,16,10,0.6)',
          }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  flex: 1, padding: '12px 8px',
                  fontFamily: FONT, fontSize: 14, fontWeight: 700,
                  color: activeTab === t.id ? '#c9a84c' : '#7a6a3e',
                  background: activeTab === t.id
                    ? 'linear-gradient(180deg, rgba(200,160,60,0.08), transparent)'
                    : 'transparent',
                  border: 'none', borderBottom: activeTab === t.id ? '2px solid #c9a84c' : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.2s',
                  letterSpacing: 1,
                }}
              >{t.label}</button>
            ))}
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 'story' && <StoryPanel />}
            {activeTab === 'tutorial' && <TutorialPanel />}
            {activeTab === 'login' && <LoginPanel />}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 12, fontFamily: FONT, fontSize: 9,
        color: '#2a2018', letterSpacing: 3,
        textTransform: 'uppercase', position: 'relative', zIndex: 2,
        flexShrink: 0,
      }}>
        God-Slayer v0.1 — Ciemność czeka na twój wybór
      </div>
    </div>
  );
}

/* Export class defs for use in other modules */
export { CLASSES };
