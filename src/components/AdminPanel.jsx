import React, { useState, useRef, useEffect } from 'react';

const FONT = "'Fira Code', 'Consolas', monospace";

const HELP_TEXT = [
  '/give [item_id]  — dodaj przedmiot do plecaka',
  '/gold [ilość]    — dodaj złoto',
  '/god             — tryb boga (nieśmiertelność + nieskończona mana)',
  '/tp [x] [y]     — teleportuj na współrzędne',
  '/level [n]       — ustaw poziom',
  '/skillpoints [n] — dodaj punkty umiejętności',
  '/clear           — wyczyść konsolę',
  '/help            — wyświetl komendy',
];

export default function AdminPanel({
  isOpen, onClose, sceneRef, addToBackpack, itemDb, onAddGold, onAddSkillPoints,
  isAdmin,
}) {
  // Security: never render for non-admins
  if (!isAdmin) return null;
  const [log, setLog] = useState(() => ['[ADMIN] Konsola aktywna. Wpisz /help']);
  const [input, setInput] = useState('');
  const [godMode, setGodMode] = useState(false);
  const inputRef = useRef(null);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [isOpen]);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // God mode tick — keep HP/Mana full
  useEffect(() => {
    if (!godMode) return;
    const iv = setInterval(() => {
      const scene = sceneRef?.current;
      if (scene?.playerData) {
        scene.playerData.hp = scene.playerData.maxHp;
        scene.playerData.mana = scene.playerData.maxMana;
      }
    }, 100);
    return () => clearInterval(iv);
  }, [godMode, sceneRef]);

  const pushLog = (msg) => setLog(prev => [...prev.slice(-80), msg]);

  const execute = (cmd) => {
    if (!isAdmin) {
      console.warn('Unauthorized access attempt');
      return;
    }
    const trimmed = cmd.trim();
    if (!trimmed) return;
    pushLog(`> ${trimmed}`);

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();

    switch (command) {
      case '/help':
        HELP_TEXT.forEach(l => pushLog(l));
        break;

      case '/clear':
        setLog(['[ADMIN] Wyczyszczono.']);
        break;

      case '/give': {
        const id = parts[1];
        if (!id) { pushLog('[BŁĄD] Użyj: /give [item_id]'); break; }
        const item = itemDb.find(i => i.id === id);
        if (!item) { pushLog(`[BŁĄD] Nie znaleziono: "${id}"`); break; }
        addToBackpack({ ...item });
        pushLog(`[OK] Dodano: ${item.name} (${item.rarity})`);
        break;
      }

      case '/gold': {
        const amt = parseInt(parts[1], 10);
        if (isNaN(amt)) { pushLog('[BŁĄD] Użyj: /gold [ilość]'); break; }
        const scene = sceneRef?.current;
        if (scene?.playerData) {
          scene.playerData.gold = Math.max(0, (scene.playerData.gold || 0) + amt);
          onAddGold?.(amt);
          pushLog(`[OK] Złoto ${amt >= 0 ? '+' : ''}${amt} (teraz: ${scene.playerData.gold})`);
        } else { pushLog('[BŁĄD] Brak sceny.'); }
        break;
      }

      case '/god':
        setGodMode(prev => {
          const next = !prev;
          pushLog(`[OK] Tryb boga: ${next ? 'WŁĄCZONY' : 'WYŁĄCZONY'}`);
          return next;
        });
        break;

      case '/tp': {
        const x = parseInt(parts[1], 10);
        const y = parseInt(parts[2], 10);
        if (isNaN(x) || isNaN(y)) { pushLog('[BŁĄD] Użyj: /tp [x] [y]'); break; }
        const scene = sceneRef?.current;
        if (scene?.knight) {
          scene.knight.setPosition(x, y);
          scene.knight.body.setVelocity(0, 0);
          pushLog(`[OK] Teleportowano do (${x}, ${y})`);
        } else { pushLog('[BŁĄD] Brak gracza.'); }
        break;
      }

      case '/level': {
        const lvl = parseInt(parts[1], 10);
        if (isNaN(lvl) || lvl < 1) { pushLog('[BŁĄD] Użyj: /level [n]'); break; }
        const scene = sceneRef?.current;
        if (scene?.playerData) {
          scene.playerData.level = lvl;
          pushLog(`[OK] Poziom ustawiony na ${lvl}`);
        } else { pushLog('[BŁĄD] Brak sceny.'); }
        break;
      }

      case '/skillpoints': {
        const pts = parseInt(parts[1], 10);
        if (isNaN(pts)) { pushLog('[BŁĄD] Użyj: /skillpoints [n]'); break; }
        onAddSkillPoints?.(pts);
        pushLog(`[OK] Dodano ${pts} punktów umiejętności`);
        break;
      }

      default:
        pushLog(`[BŁĄD] Nieznana komenda: ${command}. Wpisz /help`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      execute(input);
      setInput('');
    }
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      onClose();
    }
    // Semicolon closes console only when input is empty (so you can type ; in commands)
    if (e.key === ';' && !input) {
      e.preventDefault();
      onClose();
    }
    e.stopPropagation();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 320, zIndex: 250,
        background: 'linear-gradient(180deg, rgba(8,6,4,0.97) 0%, rgba(12,10,6,0.95) 100%)',
        borderBottom: '2px solid #3a2a10',
        boxShadow: '0 4px 30px rgba(0,0,0,0.8)',
        display: 'flex', flexDirection: 'column',
        fontFamily: FONT, fontSize: 12, color: '#b0ff80',
        animation: 'adminSlideIn 0.15s ease-out',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '4px 12px',
        background: 'rgba(200,160,60,0.08)',
        borderBottom: '1px solid #2a1e0a',
      }}>
        <span style={{ color: '#c9a84c', fontWeight: 700, fontSize: 11, letterSpacing: 1 }}>
          ⚡ KONSOLA ADMINA {godMode && <span style={{ color: '#ff4444', marginLeft: 8 }}>[ GOD MODE ]</span>}
        </span>
        <span style={{ color: '#4a3a18', fontSize: 10 }}>~ aby zamknąć</span>
      </div>

      {/* Log */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '6px 12px',
        scrollbarWidth: 'thin', scrollbarColor: '#3a2a10 transparent',
      }}>
        {log.map((line, i) => (
          <div key={i} style={{
            padding: '1px 0', lineHeight: 1.4,
            color: line.startsWith('[BŁĄD]') ? '#ff5544'
              : line.startsWith('[OK]') ? '#66ff66'
              : line.startsWith('>') ? '#c9a84c'
              : '#889977',
          }}>{line}</div>
        ))}
        <div ref={logEndRef} />
      </div>

      {/* Input */}
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '4px 12px 8px',
        borderTop: '1px solid #2a1e0a',
        gap: 6,
      }}>
        <span style={{ color: '#c9a84c', fontWeight: 700 }}>{'>'}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="/help"
          style={{
            flex: 1, background: 'rgba(0,0,0,0.4)', border: '1px solid #2a1e0a',
            borderRadius: 2, padding: '4px 8px',
            fontFamily: FONT, fontSize: 12, color: '#b0ff80',
            outline: 'none',
          }}
        />
      </div>

      <style>{`
        @keyframes adminSlideIn {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
