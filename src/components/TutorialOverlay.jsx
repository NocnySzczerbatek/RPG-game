// ============================================================
// COMPONENT: Interactive Tutorial Overlay
// 3-step guide for new players — QWER skills, Minimap, Main Quest
// ============================================================
import React, { useState, useEffect } from 'react';

const STEPS = [
  {
    title: 'Combat Skills',
    icon: '⚔️',
    content: 'Use Q, W, E, R keys to cast your class skills. Each skill aims toward your cursor. Left-click for basic attacks, right-click to move.',
    highlight: 'bottom-center',
    tip: 'Each class has unique skills — experiment to find devastating combos!',
  },
  {
    title: 'World Map',
    icon: '🗺️',
    content: 'Press M to open the full World Map. It shows all cities, boss locations, and your position. The minimap is always visible in the top-right corner.',
    highlight: 'top-right',
    tip: 'Visit different biomes to discover stronger enemies and better loot.',
  },
  {
    title: 'Your Quest Begins',
    icon: '📜',
    content: 'Visit Quest Boards in any city to accept quests. Kill monsters, collect items, and earn gold and experience. Press F near NPCs to interact.',
    highlight: 'right-side',
    tip: 'Defeat biome bosses to collect Shards of the Sun and save the world!',
  },
];

export default function TutorialOverlay({ onComplete }) {
  const [step, setStep] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    setFadeIn(true);
    const t = setTimeout(() => setFadeIn(false), 300);
    return () => clearTimeout(t);
  }, [step]);

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="fixed inset-0 z-[300] bg-black/70 backdrop-blur-sm flex items-center justify-center">

      {/* Spotlight hints */}
      {current.highlight === 'bottom-center' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 h-20 border-2 border-amber-400/50 rounded-xl animate-pulse pointer-events-none" />
      )}
      {current.highlight === 'top-right' && (
        <div className="absolute top-2 right-2 w-[180px] h-[180px] border-2 border-amber-400/50 rounded-xl animate-pulse pointer-events-none" />
      )}
      {current.highlight === 'right-side' && (
        <div className="absolute top-28 right-2 w-56 h-44 border-2 border-amber-400/50 rounded-xl animate-pulse pointer-events-none" />
      )}

      {/* Tutorial Card */}
      <div className={`max-w-md w-full mx-4 bg-gray-950 border-2 border-amber-800 rounded-2xl p-8 shadow-2xl shadow-amber-900/20 transition-opacity duration-300 ${fadeIn ? 'opacity-0' : 'opacity-100'}`}>

        {/* Step indicator */}
        <div className="flex justify-center gap-2 mb-6">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-amber-400' : i < step ? 'w-4 bg-amber-700' : 'w-4 bg-gray-700'}`} />
          ))}
        </div>

        {/* Icon & Title */}
        <div className="text-center mb-4">
          <div className="text-5xl mb-3">{current.icon}</div>
          <h3 className="font-cinzel text-2xl text-amber-400 font-bold">{current.title}</h3>
        </div>

        {/* Content */}
        <p className="font-crimson text-gray-300 text-base text-center mb-4 leading-relaxed">
          {current.content}
        </p>

        {/* Tip */}
        <div className="bg-amber-900/20 border border-amber-800/40 rounded-lg px-4 py-2 mb-6">
          <p className="font-crimson text-amber-200/80 text-sm text-center italic">
            💡 {current.tip}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {step > 0 ? (
            <button onClick={() => setStep(s => s - 1)}
              className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 font-cinzel text-sm hover:bg-gray-700 transition-all">
              ← Back
            </button>
          ) : <div />}

          {isLast ? (
            <button onClick={onComplete}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 border border-amber-500 rounded-lg text-white font-cinzel text-sm font-bold hover:from-amber-600 hover:to-amber-500 transition-all shadow-lg shadow-amber-900/30">
              ⚔️ Start Your Journey
            </button>
          ) : (
            <button onClick={() => setStep(s => s + 1)}
              className="px-5 py-2 bg-amber-900/50 border border-amber-700 rounded-lg text-amber-400 font-cinzel text-sm hover:bg-amber-800/50 transition-all">
              Next →
            </button>
          )}
        </div>

        {/* Skip */}
        <button onClick={onComplete}
          className="w-full mt-3 text-center text-xs text-gray-600 hover:text-gray-400 font-crimson transition-colors">
          Skip Tutorial
        </button>
      </div>
    </div>
  );
}
