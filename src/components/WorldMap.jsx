// ============================================================
// COMPONENT: World Map & Teleport
// ============================================================
import React from 'react';
import { CITIES } from '../data/cities.js';

const CITY_POSITIONS = {
  bastion: { x: 20, y: 65 },
  iglieze: { x: 55, y: 30 },
  cytadela: { x: 80, y: 70 },
};

const WorldMap = ({ currentCity, unlockedCities, mainQuestStage, collectedShards, onTravel, onBack }) => {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-cinzel text-2xl font-bold text-amber-500">Mapa Świata</h1>
          <button onClick={onBack} className="btn-gothic text-xs px-3 py-1.5">← Powrót</button>
        </div>

        <div className="panel mb-6">
          <p className="text-slate-500 font-crimson text-sm italic mb-4">
            "Trzy miasta ocalały. Reszta to popiół i milczenie."
          </p>

          {/* Map SVG */}
          <div className="relative w-full" style={{ paddingBottom: '55%' }}>
            <div className="absolute inset-0 rounded overflow-hidden bg-gradient-to-br from-slate-900 via-stone-950 to-slate-950 border border-red-950">
              {/* Map labels and visual elements */}
              <svg viewBox="0 0 100 60" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                {/* Road connections */}
                <path d="M 20 65 Q 37 47 55 30" stroke="#3f3f3f" strokeWidth="0.5" fill="none" strokeDasharray="2,1" />
                <path d="M 55 30 Q 67 50 80 70" stroke="#3f3f3f" strokeWidth="0.5" fill="none" strokeDasharray="2,1" />
                <path d="M 20 65 Q 50 68 80 70" stroke="#3f3f3f" strokeWidth="0.5" fill="none" strokeDasharray="2,1" />

                {/* Dark terrain spots */}
                {[
                  [35, 50], [45, 42], [62, 58], [70, 42], [30, 38],
                  [52, 55], [68, 32], [22, 48], [78, 50], [40, 28],
                ].map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r={1.5} fill="#1a1a2e" opacity="0.6" />
                ))}

                {/* City nodes */}
                {Object.values(CITIES).map((city) => {
                  const pos = CITY_POSITIONS[city.id];
                  if (!pos) return null;
                  const unlocked = unlockedCities.includes(city.id);
                  const isCurrent = currentCity === city.id;

                  return (
                    <g key={city.id}>
                      {/* Glow ring for current city */}
                      {isCurrent && (
                        <circle cx={pos.x} cy={pos.y} r={4} fill="none" stroke="#f59e0b" strokeWidth="0.5" opacity="0.6" />
                      )}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={2.5}
                        fill={isCurrent ? '#f59e0b' : unlocked ? '#7f1d1d' : '#1e293b'}
                        stroke={isCurrent ? '#fbbf24' : unlocked ? '#991b1b' : '#334155'}
                        strokeWidth="0.5"
                      />
                      <text
                        x={pos.x}
                        y={pos.y + 5}
                        textAnchor="middle"
                        fill={isCurrent ? '#f59e0b' : unlocked ? '#e2e8f0' : '#475569'}
                        fontSize="2.5"
                        fontFamily="Cinzel"
                      >
                        {city.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* City cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.values(CITIES).map((city) => {
            const unlocked = unlockedCities.includes(city.id);
            const isCurrent = currentCity === city.id;

            return (
              <div
                key={city.id}
                className={`border rounded p-4 bg-slate-900 transition-all ${
                  isCurrent
                    ? 'border-amber-600'
                    : unlocked
                    ? 'border-red-900 hover:border-red-700'
                    : 'border-slate-800 opacity-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{city.icon}</span>
                  <div>
                    <div className="font-cinzel font-bold text-amber-400 text-sm">{city.name}</div>
                    <div className="text-slate-600 text-xs">{city.subtitle}</div>
                  </div>
                </div>

                <p className="text-slate-500 font-crimson text-xs mb-3 line-clamp-2">{city.description}</p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {city.shop && <span className="text-xs bg-slate-800 border border-slate-700 text-slate-400 rounded px-1.5 py-0.5">🏪 Sklep</span>}
                  {city.forge && <span className="text-xs bg-amber-950 border border-amber-800 text-amber-400 rounded px-1.5 py-0.5">⚒️ Kuźnia</span>}
                  {city.questBoard && <span className="text-xs bg-purple-950 border border-purple-800 text-purple-400 rounded px-1.5 py-0.5">📋 Zlecenia</span>}
                </div>

                {isCurrent ? (
                  <div className="text-center text-amber-500 text-xs font-cinzel py-1">
                    ▶ Jesteś tutaj
                  </div>
                ) : unlocked ? (
                  <button
                    onClick={() => onTravel(city.id)}
                    className="btn-gothic w-full text-xs py-1.5"
                  >
                    Podróżuj → {city.name}
                  </button>
                ) : (
                  <div className="text-center text-slate-600 text-xs font-cinzel py-1">
                    🔒 Zablokowane
                    {city.id === 'iglieze' && <span className="block">Ukończ Misję 2</span>}
                    {city.id === 'cytadela' && <span className="block">Ukończ Misję 4</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Shard tracker */}
        <div className="panel mt-6">
          <h3 className="font-cinzel text-sm text-amber-500 mb-3">Odłamki Słońca</h3>
          <div className="flex gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded border-2 flex items-center justify-center text-lg transition-all ${
                  i < collectedShards
                    ? 'border-yellow-400 bg-yellow-900/40 divine-glow'
                    : 'border-slate-700 bg-slate-900 opacity-40'
                }`}
              >
                {i < collectedShards ? '☀️' : '○'}
              </div>
            ))}
          </div>
          <p className="text-slate-500 font-crimson text-xs mt-2">
            {collectedShards === 0 && 'Żadnego odłamka nie zebrano jeszcze.'}
            {collectedShards > 0 && collectedShards < 5 && `Zebrano ${collectedShards} z 5 Odłamków Słońca.`}
            {collectedShards === 5 && '✨ Wszystkie Odłamki Słońca zebrane!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
