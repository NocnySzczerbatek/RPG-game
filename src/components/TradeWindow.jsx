import React from 'react';

/* ── Item value calculation ─────────────────────────────────── */
const RARITY_MULT = { common: 1, magic: 3, rare: 8, legendary: 20 };
const RARITY_COLORS = { common: '#999', magic: '#4488ff', rare: '#ffdd44', legendary: '#ff8800' };

export function getItemValue(item) {
  let v = 10 * (RARITY_MULT[item.rarity] || 1);
  if (item.dmg) v += item.dmg * 3;
  if (item.def) v += item.def * 4;
  if (item.str) v += item.str * 5;
  if (item.int) v += item.int * 5;
  if (item.dex) v += item.dex * 5;
  if (item.will) v += item.will * 5;
  if (item.critChance) v += item.critChance * 200;
  if (item.heal) v += item.heal;
  if (item.manaRestore) v += item.manaRestore;
  return Math.floor(v);
}

/* ═══════════════════════════════════════════════════════════════
   TRADE WINDOW
   ═══════════════════════════════════════════════════════════════ */
export default function TradeWindow({ isOpen, onClose, shopStock, backpack, gold, onBuy, onSell, npcName }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.7)',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 720, maxWidth: '95vw',
          background: 'linear-gradient(180deg, #1a1410 0%, #0d0a08 100%)',
          border: '2px solid #3a2a18', borderRadius: 8, padding: 24,
          fontFamily: "'Cinzel', serif", color: '#ccc',
          animation: 'invFadeIn 0.25s ease-out',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h2 style={{ margin: 0, color: '#c8a96e', fontSize: 22 }}>⚒ {npcName || 'Handlarz'}</h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#887755' }}>Kup towary lub sprzedaj swoje łupy</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ color: '#ffd700', fontSize: 16 }}>💰 {gold}</span>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid #554433', color: '#aa8866',
                padding: '4px 12px', cursor: 'pointer', borderRadius: 4, fontSize: 14,
              }}
            >✕</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {/* BUY section */}
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#88aa66', fontSize: 14, margin: '0 0 8px', borderBottom: '1px solid #332a1a', paddingBottom: 4 }}>
              NA SPRZEDAŻ
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 320, overflowY: 'auto' }}>
              {shopStock.map((item, i) => {
                const price = getItemValue(item);
                const canAfford = gold >= price;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: 4,
                      border: '1px solid #2a2218', opacity: canAfford ? 1 : 0.5,
                    }}
                  >
                    <div>
                      <span style={{ color: RARITY_COLORS[item.rarity] || '#ccc', fontSize: 13 }}>
                        {item.name}
                      </span>
                      <div style={{ fontSize: 10, color: '#776655' }}>
                        {item.dmg ? `+${item.dmg} DMG ` : ''}
                        {item.def ? `+${item.def} DEF ` : ''}
                        {item.heal ? `+${item.heal} HP ` : ''}
                        {item.manaRestore ? `+${item.manaRestore} MP ` : ''}
                        {item.str ? `+${item.str} STR ` : ''}
                        {item.int ? `+${item.int} INT ` : ''}
                        {item.dex ? `+${item.dex} DEX ` : ''}
                        {item.will ? `+${item.will} WIL ` : ''}
                        {item.critChance ? `+${Math.round(item.critChance * 100)}% CRIT ` : ''}
                      </div>
                    </div>
                    <button
                      onClick={() => canAfford && onBuy(i)}
                      style={{
                        background: canAfford ? '#2a3a1a' : '#1a1a1a',
                        border: '1px solid #445533', color: canAfford ? '#aad466' : '#555',
                        padding: '3px 10px', borderRadius: 3,
                        cursor: canAfford ? 'pointer' : 'default', fontSize: 12,
                      }}
                    >
                      {price} 💰
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SELL section */}
          <div style={{ flex: 1 }}>
            <h3 style={{ color: '#aa6644', fontSize: 14, margin: '0 0 8px', borderBottom: '1px solid #332a1a', paddingBottom: 4 }}>
              TWOJE PRZEDMIOTY (kliknij by sprzedać za 25%)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 320, overflowY: 'auto' }}>
              {backpack.map((item, i) => {
                if (!item) return null;
                const sellPrice = Math.max(1, Math.floor(getItemValue(item) * 0.25));
                return (
                  <div
                    key={i}
                    onClick={() => onSell(i)}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'rgba(255,255,255,0.03)', padding: '5px 10px', borderRadius: 4,
                      border: '1px solid #2a2218', cursor: 'pointer',
                      transition: 'border-color 0.15s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#554433'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2a2218'; }}
                  >
                    <span style={{ color: RARITY_COLORS[item.rarity] || '#ccc', fontSize: 13 }}>
                      {item.name}
                    </span>
                    <span style={{ color: '#ffd700', fontSize: 12 }}>+{sellPrice} 💰</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p style={{ textAlign: 'center', fontSize: 11, color: '#554433', marginTop: 14 }}>
          Naciśnij <span style={{ color: '#887755' }}>ESC</span> lub kliknij poza oknem aby zamknąć
        </p>
      </div>
    </div>
  );
}
