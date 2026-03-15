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
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '3px 0' }}>
      <span style={{
        fontFamily: FONT, fontSize: 10, color: '#7a6a4a',
        width: 70, textAlign: 'right', letterSpacing: 1,
        textTransform: 'uppercase',
      }}>{label}</span>
      <div style={{
        flex: 1, height: 8,
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
        fontFamily: FONT, fontSize: 11, color: '#c4b88a',
        width: 24, textAlign: 'center',
      }}>{value}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   FLICKERING PARTICLES (campfire embers)
   ═══════════════════════════════════════════════════════════════ */
function Embers() {
  const [particles] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: 15 + Math.random() * 70,
      delay: Math.random() * 8,
      duration: 4 + Math.random() * 6,
      size: 1 + Math.random() * 3,
      drift: (Math.random() - 0.5) * 40,
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
   MAIN MENU COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function MainMenu({ onStartGame, hasSave, onContinue }) {
  const [selected, setSelected] = useState(0);
  const [hoverStart, setHoverStart] = useState(false);

  const cls = CLASSES[selected];

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'radial-gradient(ellipse at 50% 80%, #1a0e04 0%, #080402 50%, #020101 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Embers */}
      <Embers />

      {/* Animated vignette flicker */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        boxShadow: 'inset 0 0 150px rgba(0,0,0,0.95), inset 0 0 60px rgba(0,0,0,0.8)',
        animation: 'vigFlicker 3s ease-in-out infinite alternate',
      }} />

      {/* Title */}
      <div style={{ marginBottom: 6, textAlign: 'center', position: 'relative', zIndex: 2 }}>
        <h1 style={{
          fontFamily: FONT, fontSize: 42, fontWeight: 700,
          color: '#c9a84c',
          textShadow: '0 0 20px rgba(200,160,60,0.4), 0 0 60px rgba(200,160,60,0.15), 0 2px 4px rgba(0,0,0,0.8)',
          letterSpacing: 6,
          textTransform: 'uppercase',
          margin: 0,
        }}>God-Slayer</h1>
        <p style={{
          fontFamily: FONT, fontSize: 12, color: '#5a4a2e',
          letterSpacing: 4, textTransform: 'uppercase', marginTop: 2,
        }}>Rise from Ashes</p>
      </div>

      {/* Main container */}
      <div style={{
        display: 'flex', gap: 0,
        background: 'linear-gradient(180deg, rgba(14,10,6,0.95), rgba(8,6,4,0.98))',
        border: '1px solid #2a1a08',
        borderRadius: 6,
        boxShadow: '0 0 60px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        position: 'relative', zIndex: 2,
        maxWidth: '94vw',
      }}>

        {/* ── LEFT: Class selector ────────────────────────── */}
        <div style={{
          width: 200, padding: '20px 0',
          borderRight: '1px solid #1a1208',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            fontFamily: FONT, fontSize: 9, color: '#5a4a2e',
            letterSpacing: 2, textTransform: 'uppercase',
            padding: '0 16px 10px', borderBottom: '1px solid rgba(42,26,8,0.4)',
          }}>Choose Your Path</div>

          {CLASSES.map((c, i) => (
            <div
              key={c.id}
              onClick={() => setSelected(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                cursor: 'pointer',
                background: selected === i
                  ? `linear-gradient(90deg, ${c.color}15, transparent)`
                  : 'transparent',
                borderLeft: selected === i ? `3px solid ${c.color}` : '3px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <img
                src={c.sprite}
                alt={c.name}
                style={{
                  width: 40, height: 40,
                  imageRendering: 'pixelated',
                  filter: selected === i ? 'none' : 'brightness(0.4) saturate(0.2)',
                  transition: 'filter 0.3s',
                }}
              />
              <div>
                <div style={{
                  fontFamily: FONT, fontSize: 13, fontWeight: 600,
                  color: selected === i ? c.color : '#4a3a24',
                  transition: 'color 0.2s',
                }}>{c.name}</div>
                <div style={{
                  fontFamily: FONT, fontSize: 8, color: '#4a3a24',
                  letterSpacing: 1, textTransform: 'uppercase',
                }}>{c.subtitle}</div>
              </div>
            </div>
          ))}

          {/* Continue button */}
          {hasSave && (
            <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid rgba(42,26,8,0.4)' }}>
              <button
                onClick={onContinue}
                style={{
                  width: '100%', padding: '10px 0',
                  fontFamily: FONT, fontSize: 12, fontWeight: 600,
                  color: '#aaa', background: 'rgba(20,16,10,0.9)',
                  border: '1px solid #2a2a2a',
                  borderRadius: 4, cursor: 'pointer',
                  letterSpacing: 2, textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = '#ddd'; e.currentTarget.style.borderColor = '#555'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#2a2a2a'; }}
              >
                ↻ Continue
              </button>
            </div>
          )}
        </div>

        {/* ── CENTER: Hero preview ────────────────────────── */}
        <div style={{
          width: 280, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          position: 'relative', padding: '24px 16px',
        }}>
          {/* Radial glow behind hero */}
          <div style={{
            position: 'absolute',
            width: 200, height: 200,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${cls.glow}, transparent 70%)`,
            animation: 'heroGlow 3s ease-in-out infinite alternate',
          }} />

          <AnimatedSprite cls={cls} size={180} active={true} />

          <div style={{
            fontFamily: FONT, fontSize: 20, fontWeight: 700,
            color: cls.color, letterSpacing: 3,
            textShadow: `0 0 12px ${cls.glow}`,
            marginTop: 8,
          }}>{cls.name}</div>

          <p style={{
            fontFamily: FONT, fontSize: 10, color: '#6a5a3a',
            textAlign: 'center', lineHeight: 1.6,
            maxWidth: 240, marginTop: 8,
          }}>{cls.desc}</p>

          {/* Start button */}
          <button
            onClick={() => onStartGame(cls)}
            onMouseEnter={() => setHoverStart(true)}
            onMouseLeave={() => setHoverStart(false)}
            style={{
              marginTop: 20, padding: '12px 40px',
              fontFamily: FONT, fontSize: 14, fontWeight: 700,
              color: hoverStart ? '#fff' : '#c9a84c',
              background: hoverStart
                ? `linear-gradient(180deg, ${cls.color}33, ${cls.color}11)`
                : 'linear-gradient(180deg, rgba(30,22,10,0.9), rgba(16,12,6,0.95))',
              border: `2px solid ${hoverStart ? cls.color : '#3a2a10'}`,
              borderRadius: 4, cursor: 'pointer',
              letterSpacing: 3, textTransform: 'uppercase',
              boxShadow: hoverStart
                ? `0 0 20px ${cls.glow}, inset 0 0 10px ${cls.glow}`
                : '0 0 10px rgba(0,0,0,0.5)',
              transition: 'all 0.25s ease',
            }}
          >
            Start Journey
          </button>
        </div>

        {/* ── RIGHT: Stats ────────────────────────────────── */}
        <div style={{
          width: 220, padding: '20px 16px',
          borderLeft: '1px solid #1a1208',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            fontFamily: FONT, fontSize: 9, color: '#5a4a2e',
            letterSpacing: 2, textTransform: 'uppercase',
            paddingBottom: 8, borderBottom: '1px solid rgba(42,26,8,0.4)',
            marginBottom: 10,
          }}>Attributes</div>

          <StatBar label="Strength" value={cls.stats.str} color="#cc6633" />
          <StatBar label="Intellect" value={cls.stats.int} color="#6644cc" />
          <StatBar label="Dexterity" value={cls.stats.dex} color="#33aa55" />
          <StatBar label="Willpower" value={cls.stats.will} color="#aa8833" />

          <div style={{
            fontFamily: FONT, fontSize: 9, color: '#5a4a2e',
            letterSpacing: 2, textTransform: 'uppercase',
            padding: '12px 0 8px', borderBottom: '1px solid rgba(42,26,8,0.4)',
            marginBottom: 8,
          }}>Combat</div>

          <StatBar label="Health" value={cls.stats.hp} max={150} color="#cc2222" />
          <StatBar label="Mana" value={cls.stats.mana} max={80} color="#4466cc" />
          <StatBar label="Damage" value={cls.stats.baseDmg} max={20} color="#dd6644" />
          <StatBar label="Crit %" value={Math.round(cls.stats.critChance * 100)} max={25} color="#ee5555" />
          <StatBar label="Armor" value={cls.stats.def} max={10} color="#6688aa" />

          <div style={{
            marginTop: 'auto', padding: '10px 0 0',
            borderTop: '1px solid rgba(42,26,8,0.3)',
          }}>
            <div style={{
              fontFamily: FONT, fontSize: 8, color: '#4a3a24',
              letterSpacing: 1, textTransform: 'uppercase',
              marginBottom: 4,
            }}>Focus</div>
            <div style={{
              fontFamily: FONT, fontSize: 11, color: cls.color,
              textShadow: `0 0 6px ${cls.glow}`,
            }}>{cls.focus}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 16, fontFamily: FONT, fontSize: 9,
        color: '#2a2018', letterSpacing: 3,
        textTransform: 'uppercase', position: 'relative', zIndex: 2,
      }}>
        The darkness awaits your choice
      </div>
    </div>
  );
}

/* Export class defs for use in other modules */
export { CLASSES };
