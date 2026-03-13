// ============================================================
// COMPONENT: Bounty Board
// ============================================================
import React from 'react';

const BountyBoard = ({ bounties, player, dispatch, onClose }) => {
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-cinzel text-2xl font-bold text-amber-500">📋 Tablica Zleceń</h1>
          <div className="flex gap-2">
            <button
              onClick={() => dispatch({ type: 'REFRESH_BOUNTIES' })}
              className="px-3 py-1.5 text-xs font-cinzel bg-slate-800 border border-slate-700 text-slate-400 rounded hover:border-slate-600 hover:text-slate-300 transition-all"
              title="Odśwież zlecenia (kosztuje 50 złota)"
            >
              🔄 Odśwież (50🪙)
            </button>
            <button onClick={onClose} className="btn-gothic text-xs px-3 py-1.5">← Wróć</button>
          </div>
        </div>

        <div className="panel mb-4">
          <p className="text-slate-500 font-crimson italic text-sm text-center">
            "Każdy martwy wróg to jeden krok bliżej do odkupienia. Każde zlecenie — srebrne w kieszeni."
          </p>
        </div>

        {(!bounties || bounties.length === 0) ? (
          <div className="panel text-center py-12 text-slate-600 font-crimson text-sm">
            Brak aktywnych zleceń. Wróć później lub odśwież tablicę.
          </div>
        ) : (
          <div className="space-y-4">
            {bounties.map((bounty) => {
              const progress = bounty.objectives?.[0]?.progress ?? 0;
              const required = bounty.objectives?.[0]?.required ?? 1;
              const pct = Math.min(100, (progress / required) * 100);
              const isComplete = progress >= required;

              return (
                <div
                  key={bounty.id}
                  className={`panel border transition-all ${
                    isComplete
                      ? 'border-green-700 bg-green-950/10'
                      : 'border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-cinzel text-amber-400 font-bold text-sm">{bounty.title}</div>
                      <div className="text-slate-500 font-crimson text-xs">
                        Poz. {bounty.level ?? player.level} {bounty.city ? `• ${bounty.city}` : ''}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {bounty.rewards?.gold > 0 && (
                        <span className="text-yellow-400 font-cinzel text-xs">🪙 +{bounty.rewards.gold}</span>
                      )}
                      {bounty.rewards?.exp > 0 && (
                        <span className="text-blue-400 font-cinzel text-xs">✨ +{bounty.rewards.exp} EXP</span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 font-crimson text-xs mb-3">{bounty.description}</p>

                  {/* Objective progress */}
                  {(bounty.objectives ?? []).map((obj, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between text-xs font-crimson mb-1">
                        <span className={isComplete ? 'text-green-400 line-through' : 'text-slate-400'}>{obj.description}</span>
                        <span className="text-slate-500">{Math.min(obj.progress, obj.required)}/{obj.required}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded overflow-hidden">
                        <div
                          className={`h-full rounded transition-all ${isComplete ? 'bg-green-600' : 'bg-amber-600'}`}
                          style={{ width: `${(Math.min(obj.progress, obj.required) / obj.required) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}

                  {isComplete && (
                    <button
                      onClick={() => dispatch({ type: 'CLAIM_BOUNTY', bountyId: bounty.id })}
                      className="mt-2 w-full py-2 bg-green-900/50 border border-green-700 text-green-300 font-cinzel text-xs rounded hover:bg-green-800/50 transition-all active:scale-95"
                    >
                      ✓ Odbierz Nagrodę
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default BountyBoard;
