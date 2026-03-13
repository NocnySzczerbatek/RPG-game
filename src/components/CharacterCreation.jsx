// ============================================================
// COMPONENT: Character Creation
// ============================================================
import React, { useState } from 'react';
import { CLASSES } from '../data/classes.js';

const StatBar = ({ label, value, max = 25 }) => {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
        <div className="h-full rounded-full bg-amber-600" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-amber-400 w-5 text-right">{value}</span>
    </div>
  );
};

const ClassCard = ({ cls, isSelected, onSelect }) => (
  <button
    onClick={() => onSelect(cls.id)}
    className={`border rounded p-4 text-left transition-all duration-150 bg-slate-900 hover:bg-slate-800 ${
      isSelected ? `${cls.borderColor} bg-slate-800` : 'border-slate-700'
    }`}
  >
    <div className="text-3xl mb-2">{cls.icon}</div>
    <div className={`font-cinzel font-bold ${isSelected ? cls.color : 'text-slate-300'}`}>
      {cls.name}
    </div>
    <div className="text-slate-500 text-xs font-cinzel">{cls.title}</div>
  </button>
);

const CharacterCreation = ({ difficulty, onConfirm, onBack }) => {
  const [name, setName] = useState('');
  const [selectedClass, setSelectedClass] = useState('warrior');
  const [nameError, setNameError] = useState('');

  const cls = CLASSES[selectedClass];

  const handleConfirm = () => {
    const trimmed = name.trim();
    if (!trimmed) { setNameError('Podaj imię bohatera.'); return; }
    if (trimmed.length < 2) { setNameError('Imię musi mieć co najmniej 2 znaki.'); return; }
    if (trimmed.length > 20) { setNameError('Imię może mieć maksymalnie 20 znaków.'); return; }
    onConfirm(trimmed, selectedClass);
  };

  const difficultyLabel = { normal: 'Normal', nightmare: 'Nightmare', hardcore: 'HARDCORE' };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="text-slate-600 hover:text-slate-400 text-sm mb-6 flex items-center gap-2">
          ← Powrót (trudność)
        </button>

        <div className="text-center mb-8">
          <h1 className="font-cinzel text-3xl font-bold text-amber-500 mb-1">Stwórz Bohatera</h1>
          <p className="text-slate-500 text-sm">
            Trudność: <span className="text-amber-400 font-cinzel">{difficultyLabel[difficulty] || difficulty}</span>
          </p>
        </div>

        {/* Name input */}
        <div className="panel mb-6">
          <label className="font-cinzel text-sm text-amber-500 mb-2 block">Imię Bohatera</label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setNameError(''); }}
            placeholder="Wpisz imię..."
            maxLength={20}
            className="w-full bg-slate-900 border border-red-900 rounded px-3 py-2 text-amber-300 font-crimson text-lg placeholder-slate-600 focus:outline-none focus:border-amber-600 transition-colors"
          />
          {nameError && <p className="text-red-400 text-xs mt-1 font-crimson">{nameError}</p>}
        </div>

        {/* Class selection */}
        <div className="panel mb-6">
          <h2 className="font-cinzel text-sm text-amber-500 mb-4">Wybierz Klasę</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Object.values(CLASSES).map((c) => (
              <ClassCard
                key={c.id}
                cls={c}
                isSelected={selectedClass === c.id}
                onSelect={setSelectedClass}
              />
            ))}
          </div>

          {/* Class details */}
          {cls && (
            <div className={`border rounded p-4 ${cls.borderColor} bg-slate-900/50`}>
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{cls.icon}</span>
                <div>
                  <h3 className={`font-cinzel font-bold text-xl ${cls.color}`}>{cls.name}</h3>
                  <p className="text-slate-500 text-xs font-cinzel">{cls.title}</p>
                  <p className="text-slate-300 font-crimson text-sm mt-2 italic">{cls.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Stats */}
                <div>
                  <p className="font-cinzel text-xs text-amber-500 mb-2 uppercase tracking-widest">Statystyki Bazowe</p>
                  <div className="space-y-1.5">
                    <StatBar label="Siła" value={cls.baseStats.strength} />
                    <StatBar label="Zwinność" value={cls.baseStats.agility} />
                    <StatBar label="Inteligencja" value={cls.baseStats.intelligence} />
                    <StatBar label="Wytrzymałość" value={cls.baseStats.endurance} />
                  </div>
                  <div className="mt-3 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">HP bazowe</span>
                      <span className="text-red-400">{cls.hpBase}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Mana bazowa</span>
                      <span className="text-blue-400">{cls.manaBase}</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <p className="font-cinzel text-xs text-amber-500 mb-2 uppercase tracking-widest">Zdolności</p>
                  <div className="space-y-2">
                    {cls.skills.slice(0, 3).map((skill) => (
                      <div key={skill.id} className="flex items-start gap-2">
                        <span className="text-sm">{skill.icon}</span>
                        <div>
                          <p className="text-xs text-amber-300 font-cinzel">{skill.name} <span className="text-slate-600">(Poz. {skill.learnLevel})</span></p>
                          <p className="text-xs text-slate-500 font-crimson">{skill.description.slice(0, 60)}...</p>
                        </div>
                      </div>
                    ))}
                    {cls.skills.length > 3 && (
                      <p className="text-xs text-slate-600 italic">+{cls.skills.length - 3} więcej zdolności...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Lore */}
              <div className="mt-4 border-t border-slate-800 pt-3">
                <p className="text-slate-500 font-crimson text-xs italic">{cls.lore}</p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleConfirm}
          disabled={!name.trim()}
          className="btn-divine w-full py-3 text-base disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ⚔️ Rozpocznij Przygodę — {cls?.name || ''}
        </button>
      </div>
    </div>
  );
};

export default CharacterCreation;
