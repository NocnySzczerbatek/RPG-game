// ============================================================
// COMPONENT: Quest Tracker + Journal
// ============================================================
import React, { useState } from 'react';
import { MAIN_QUESTS } from '../data/quests.js';

const ObjectiveRow = ({ obj }) => {
  const done = obj.progress >= obj.required;
  return (
    <div className={`flex items-start gap-2 text-xs font-crimson py-1 ${done ? 'text-slate-600 line-through' : 'text-slate-300'}`}>
      <span className={`mt-0.5 shrink-0 ${done ? 'text-green-500' : 'text-amber-500'}`}>{done ? '✓' : '○'}</span>
      <span>{obj.description}</span>
      {obj.required > 1 && (
        <span className="ml-auto shrink-0 text-slate-500">
          {Math.min(obj.progress, obj.required)}/{obj.required}
        </span>
      )}
    </div>
  );
};

const QuestTracker = ({ mainQuestStage, activeQuests, completedQuests, onClose }) => {
  const [tab, setTab] = useState('active');
  const currentMQ = MAIN_QUESTS[mainQuestStage];

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-cinzel text-2xl font-bold text-amber-500">📜 Dziennik Zadań</h1>
          <button onClick={onClose} className="btn-gothic text-xs px-3 py-1.5">← Zamknij</button>
        </div>

        {/* Main Quest Card */}
        {currentMQ && (
          <div className="panel mb-6 border border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-500 font-cinzel text-xs uppercase tracking-widest">Misja Główna</span>
            </div>
            <div className="font-cinzel text-lg font-bold text-amber-300 mb-1">{currentMQ.title}</div>
            <p className="text-slate-400 font-crimson text-sm mb-4">{currentMQ.description}</p>

            <div className="space-y-0.5">
              {(currentMQ.objectives ?? []).map((obj, i) => (
                <ObjectiveRow key={i} obj={obj} />
              ))}
            </div>

            {currentMQ.rewards && (
              <div className="mt-4 border-t border-slate-800 pt-3 flex flex-wrap gap-3 text-xs font-crimson text-slate-400">
                <span>Nagroda:</span>
                {currentMQ.rewards.exp > 0 && <span className="text-blue-400">✨ +{currentMQ.rewards.exp} EXP</span>}
                {currentMQ.rewards.gold > 0 && <span className="text-yellow-400">🪙 +{currentMQ.rewards.gold} złota</span>}
                {currentMQ.rewards.items?.map((it) => (
                  <span key={it} className="text-amber-300">📦 {it}</span>
                ))}
                {currentMQ.shardReward && <span className="text-yellow-200">☀️ Odłamek Słońca</span>}
              </div>
            )}
          </div>
        )}

        {mainQuestStage >= MAIN_QUESTS.length && (
          <div className="panel mb-6 border border-green-700 text-center py-6">
            <div className="font-cinzel text-xl font-bold text-green-400 mb-2">✨ Kampania Ukończona!</div>
            <p className="text-slate-500 font-crimson text-sm">Bóg-Slay odłamki zebrane. Śmierć bogów nastała.</p>
          </div>
        )}

        {/* Side Quests + Bounties */}
        <div className="flex gap-2 mb-4">
          {['active', 'completed'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-cinzel text-xs px-4 py-2 rounded border transition-all ${
                tab === t
                  ? 'border-amber-600 text-amber-400 bg-amber-950/30'
                  : 'border-slate-700 text-slate-500 hover:border-slate-600'
              }`}
            >
              {t === 'active' ? '📋 Aktywne' : '✅ Ukończone'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {tab === 'active' && (activeQuests ?? []).length === 0 && (
            <div className="panel text-center py-8 text-slate-600 font-crimson text-sm">
              Brak aktywnych zleceń bocznych. Odwiedź Tablicę Zleceń.
            </div>
          )}
          {tab === 'completed' && (completedQuests ?? []).length === 0 && (
            <div className="panel text-center py-8 text-slate-600 font-crimson text-sm">
              Żadnego zadania jeszcze nie ukończono.
            </div>
          )}
          {(tab === 'active' ? (activeQuests ?? []) : (completedQuests ?? [])).map((quest) => (
            <div key={quest.id} className={`panel ${tab === 'completed' ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-1">
                <div className="font-cinzel text-sm font-bold text-amber-400">{quest.title}</div>
                {tab === 'completed' && <span className="text-green-400 text-xs font-cinzel">✓ Ukończono</span>}
              </div>
              <p className="text-slate-500 font-crimson text-xs mb-2">{quest.description}</p>
              {quest.objectives?.map((obj, i) => <ObjectiveRow key={i} obj={obj} />)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestTracker;
