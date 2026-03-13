// ============================================================
// COMPONENT: Difficulty Selection
// ============================================================
import React, { useState } from 'react';

const MODES = [
  {
    id: 'normal',
    name: 'Normal',
    subtitle: 'Smak Przetrwania',
    icon: '⚔️',
    color: 'border-green-700 hover:border-green-500',
    activeColor: 'border-green-500 bg-green-950/40',
    textColor: 'text-green-400',
    description: 'Standardowa rozgrywka. Śmierć oznacza powrót do miasta z 30% HP. Polecane dla nowych bohaterów.',
    features: [
      'Odrodzenie w mieście po śmierci',
      'Standardowe statystyki wrogów',
      'Normalny współczynnik EXP i złota',
    ],
  },
  {
    id: 'nightmare',
    name: 'Nightmare',
    subtitle: 'Noc bez Przebudzenia',
    icon: '🌑',
    color: 'border-red-700 hover:border-red-500',
    activeColor: 'border-red-500 bg-red-950/40',
    textColor: 'text-red-400',
    description: 'Wrogowie zadają 50% więcej obrażeń i mają więcej HP. Złoto i EXP wyższe. Tylko dla doświadczonych bohaterów.',
    features: [
      'Odrodzenie w mieście po śmierci',
      'Wrogowie: +50% HP i DMG',
      'EXP ×1.6 | Złoto ×2.0',
    ],
  },
  {
    id: 'hardcore',
    name: 'Hardcore',
    subtitle: 'Permadeath',
    icon: '💀',
    color: 'border-yellow-800 hover:border-yellow-600',
    activeColor: 'border-yellow-600 bg-yellow-950/40',
    textColor: 'text-yellow-400',
    description: 'Jedna śmierć — jeden koniec. Zapis zostaje usunięty. Dla tych, którzy chcą prawdziwego bólu.',
    features: [
      '⚠️ PERMADEATH — śmierć kończy grę',
      'Wrogowie: +25% HP i DMG',
      'EXP ×1.3 | Złoto ×1.5',
    ],
    warning: 'NIE MA ODWROTU. Śmierć NISZCZY zapis.',
  },
];

const DifficultySelect = ({ onSelect, onBack }) => {
  const [selected, setSelected] = useState('normal');
  const mode = MODES.find((m) => m.id === selected);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <button onClick={onBack} className="text-slate-600 hover:text-slate-400 text-sm mb-8 flex items-center gap-2">
          ← Powrót
        </button>

        <h1 className="font-cinzel text-3xl font-bold text-amber-500 text-center mb-2">Wybierz Trudność</h1>
        <p className="text-center text-slate-500 font-crimson mb-10">
          Twój wybór definiuje klimat rozgrywki. Nie ma opcji cofnięcia po starcie.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              className={`border rounded p-4 text-left transition-all duration-150 bg-slate-900 ${selected === m.id ? m.activeColor : m.color}`}
            >
              <div className="text-3xl mb-2">{m.icon}</div>
              <div className={`font-cinzel font-bold text-lg ${m.textColor}`}>{m.name}</div>
              <div className="text-slate-500 text-xs font-crimson">{m.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {mode && (
          <div className="panel mb-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{mode.icon}</span>
              <div>
                <div className={`font-cinzel font-bold text-xl ${mode.textColor}`}>{mode.name}</div>
                <div className="text-slate-500 text-sm font-crimson italic">{mode.subtitle}</div>
              </div>
            </div>
            <p className="text-slate-300 font-crimson mb-4">{mode.description}</p>
            <ul className="space-y-1">
              {mode.features.map((f, i) => (
                <li key={i} className="text-sm text-slate-400 flex items-center gap-2">
                  <span className="text-amber-600">•</span> {f}
                </li>
              ))}
            </ul>
            {mode.warning && (
              <div className="mt-4 border border-red-800 bg-red-950/40 rounded p-3 text-red-400 text-sm font-cinzel">
                ⚠️ {mode.warning}
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => onSelect(selected)}
          className="btn-divine w-full py-3 text-base"
        >
          Potwierdź — {mode?.name}
        </button>
      </div>
    </div>
  );
};

export default DifficultySelect;
