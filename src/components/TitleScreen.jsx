// ============================================================
// COMPONENT: Title Screen
// ============================================================
import React from 'react';
import { hasSave, formatSaveDate, loadGame } from '../engine/saveSystem.js';

const TitleScreen = ({ onNewGame, onLoadGame, onContinue }) => {
  const saveExists = hasSave();
  const saveData = saveExists ? loadGame() : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background embers */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-600 opacity-40 animate-pulsate"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative border top */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent mb-16" />

      <div className="flex flex-col items-center gap-2 mb-12 relative z-10">
        <div className="text-6xl mb-4 animate-pulsate">☄️</div>
        <h1 className="font-cinzel text-5xl font-black text-amber-500 text-center tracking-widest leading-tight drop-shadow-2xl">
          GOD-SLAYER
        </h1>
        <h2 className="font-cinzel text-2xl font-semibold text-red-400 text-center tracking-[0.4em] uppercase">
          Rise from Ashes
        </h2>
        <div className="w-64 h-px bg-gradient-to-r from-transparent via-red-800 to-transparent mt-4" />
        <p className="font-crimson text-slate-400 text-center text-lg italic mt-2 max-w-md px-4">
          "Bogowie nie umarli z własnej woli. Ktoś ich zabił.<br />
          Teraz na tronie siedzi Pustka — i czeka na ciebie."
        </p>
      </div>

      <div className="flex flex-col gap-4 items-center relative z-10 w-full max-w-xs px-4">
        <button
          onClick={onNewGame}
          className="btn-divine w-full py-3 text-base"
        >
          ⚔️ Nowa Gra
        </button>

        {saveExists && (
          <button
            onClick={onContinue}
            className="btn-gothic w-full py-3 text-base"
          >
            📜 Kontynuuj
            {saveData && (
              <span className="block text-xs text-slate-500 font-normal normal-case tracking-normal mt-1">
                {saveData.player?.name} — Poziom {saveData.player?.level} — {formatSaveDate(saveData.timestamp)}
              </span>
            )}
          </button>
        )}

        {saveExists && (
          <button
            onClick={() => {
              if (window.confirm('Czy na pewno chcesz wczytać zapis?')) onLoadGame();
            }}
            className="text-xs text-slate-600 hover:text-slate-400 underline"
          >
            Wczytaj zapis z LocalStorage
          </button>
        )}
      </div>

      {/* Lore section */}
      <div className="mt-16 max-w-lg px-6 relative z-10">
        <div className="gothic-border rounded p-4 text-center">
          <p className="font-crimson text-slate-500 text-sm italic">
            "W Dniu Ciemności w Południe, czternastu Wielkich Bogów zamilkło na zawsze.
            Niebo zgasło. Pustka sięgnęła po ziemię. A ty — ostatni — wstajesz."
          </p>
        </div>
      </div>

      {/* Difficulty hint */}
      <div className="mt-8 text-xs text-slate-700 font-cinzel tracking-widest relative z-10">
        MROCZNE FANTASY • TURN-BASED RPG • 2026
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent mt-16" />
    </div>
  );
};

export default TitleScreen;
