// ============================================================
// COMPONENT: NPC Dialogue System
// Supports both old NPCS dialogue trees and new ARPG NPC roles
// ============================================================
import React, { useState, useEffect } from 'react';
import { NPCS } from '../data/cities.js';

const DialogueSystem = ({ npcId, npcRole, npcLabel, cityId, dispatch }) => {
  // Try legacy NPC data first
  const npc = NPCS?.[npcId];
  const [nodeId, setNodeId] = useState('root');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setNodeId('root');
    setHistory([]);
  }, [npcId]);

  // ── New ARPG NPC flow (blacksmith/healer without legacy dialogue) ──
  if (!npc && (npcRole || npcLabel)) {
    const isBlacksmith = npcRole === 'blacksmith';
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-xl w-full">
          <div className="panel mb-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center text-3xl shrink-0">
              {isBlacksmith ? '\u2692\uFE0F' : '\uD83D\uDC9A'}
            </div>
            <div>
              <div className="font-cinzel text-lg font-bold text-amber-400">{npcLabel || (isBlacksmith ? 'Blacksmith' : 'Healer')}</div>
              <div className="text-slate-500 font-crimson text-sm capitalize">{npcRole} — {cityId}</div>
            </div>
          </div>
          <div className="panel mb-4 relative">
            <p className="font-crimson text-slate-200 text-base leading-relaxed">
              {isBlacksmith
                ? "Welcome, traveler. I can trade fine weapons and armor. Browse my wares?"
                : "Blessings upon you. I can restore your body and spirit for a small donation."}
            </p>
          </div>
          <div className="space-y-2">
            {isBlacksmith && (
              <button onClick={() => dispatch({ type: 'OPEN_SHOP' })}
                className="w-full text-left px-4 py-3 bg-slate-900 border border-slate-700 text-slate-300 font-crimson text-sm rounded hover:bg-slate-800 hover:border-amber-700 hover:text-amber-300 transition-all">
                <span className="text-amber-600 mr-2">1.</span>{'\u2692\uFE0F'} Browse Wares
              </button>
            )}
            {!isBlacksmith && (
              <button onClick={() => { dispatch({ type: 'HEAL_AT_HEALER' }); dispatch({ type: 'GOTO_SCREEN', screen: 'world_map' }); }}
                className="w-full text-left px-4 py-3 bg-slate-900 border border-slate-700 text-slate-300 font-crimson text-sm rounded hover:bg-slate-800 hover:border-green-700 hover:text-green-300 transition-all">
                <span className="text-green-600 mr-2">1.</span>{'\uD83D\uDC9A'} Heal &amp; Restore (20g)
              </button>
            )}
            <button onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'world_map' })}
              className="flex-none px-4 py-2 text-xs font-cinzel bg-slate-800 border border-slate-700 text-slate-500 rounded hover:text-slate-300 hover:border-slate-600 transition-all">
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Legacy NPC dialogue flow ──
  if (!npc) return null;

  const dialogue = npc.dialogue ?? {};
  const node = dialogue[nodeId];

  if (!node) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
        <div className="panel max-w-lg w-full text-center">
          <p className="text-slate-500 font-crimson mb-4">Koniec rozmowy.</p>
          <button
            onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
            className="btn-gothic px-6 py-2"
          >
            Zakończ rozmowę
          </button>
        </div>
      </div>
    );
  }

  function handleOption(option) {
    if (option.action) {
      dispatch({ type: 'ADVANCE_DIALOGUE', action: option.action, npcId });
    }
    if (option.next) {
      setHistory((h) => [...h, nodeId]);
      setNodeId(option.next);
    } else if (!option.action) {
      dispatch({ type: 'GOTO_SCREEN', screen: 'city' });
    }
  }

  function handleBack() {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setNodeId(prev);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        {/* NPC Header */}
        <div className="panel mb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center text-3xl shrink-0">
            {npc.icon ?? '🧑'}
          </div>
          <div>
            <div className="font-cinzel text-lg font-bold text-amber-400">{npc.name}</div>
            <div className="text-slate-500 font-crimson text-sm">{npc.title}</div>
          </div>
        </div>

        {/* Dialogue bubble */}
        <div className="panel mb-4 relative">
          {/* Corner accent */}
          <div className="absolute -top-2 left-8 w-4 h-4 bg-slate-900 border-t border-l border-red-900 rotate-45" />

          <p className="font-crimson text-slate-200 text-base leading-relaxed pt-1">
            {node.text}
          </p>
        </div>

        {/* Option buttons */}
        <div className="space-y-2">
          {(node.options ?? []).map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOption(opt)}
              className="w-full text-left px-4 py-3 bg-slate-900 border border-slate-700 text-slate-300 font-crimson text-sm rounded hover:bg-slate-800 hover:border-amber-700 hover:text-amber-300 transition-all active:scale-99"
            >
              <span className="text-amber-600 mr-2">{i + 1}.</span>
              {opt.text}
            </button>
          ))}

          <div className="flex gap-2 pt-1">
            {history.length > 0 && (
              <button
                onClick={handleBack}
                className="flex-none px-4 py-2 text-xs font-cinzel bg-slate-800 border border-slate-700 text-slate-500 rounded hover:text-slate-300 hover:border-slate-600 transition-all"
              >
                ← Wróć
              </button>
            )}
            <button
              onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
              className="flex-none px-4 py-2 text-xs font-cinzel bg-slate-800 border border-slate-700 text-slate-500 rounded hover:text-slate-300 hover:border-slate-600 transition-all"
            >
              Zakończ rozmowę
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DialogueSystem;
