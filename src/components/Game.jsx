// ============================================================
// COMPONENT: Game Orchestrator
// ============================================================
import React, { useReducer, useEffect, useCallback } from 'react';
import { gameReducer, createInitialGameState } from '../engine/gameReducer.js';
import { hasSave } from '../engine/saveSystem.js';

import HUD from './HUD.jsx';
import Notifications from './Notifications.jsx';
import TitleScreen from './TitleScreen.jsx';
import GameMap from './GameMap.jsx';
import DifficultySelect from './DifficultySelect.jsx';
import CharacterCreation from './CharacterCreation.jsx';
import CityView from './CityView.jsx';
import CombatView from './CombatView.jsx';
import WorldMap from './WorldMap.jsx';
import ShopView from './ShopView.jsx';
import ForgeView from './ForgeView.jsx';
import InventoryPanel from './InventoryPanel.jsx';
import QuestTracker from './QuestTracker.jsx';
import BountyBoard from './BountyBoard.jsx';
import DialogueSystem from './DialogueSystem.jsx';

// --- Game Over / Victory screens ---
const GameOver = ({ player, dispatch }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
    <div className="max-w-md w-full panel text-center border-red-800">
      <div className="text-6xl mb-4">💀</div>
      <h1 className="font-cinzel text-4xl font-bold text-red-400 mb-2">Śmierć</h1>
      <p className="text-slate-500 font-crimson text-base mb-6">
        {player?.name ?? 'Bohater'} poległ w ciemnościach. Jego imię przepadło razem z nim.
      </p>
      <button
        onClick={() => dispatch({ type: 'RESET_GAME' })}
        className="btn-gothic px-8 py-3"
      >
        Nowa Gra
      </button>
    </div>
  </div>
);

const Victory = ({ player, collectedShards, dispatch }) => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
    <div className="max-w-md w-full panel text-center border-amber-600 divine-glow">
      <div className="text-6xl mb-4">☀️</div>
      <h1 className="font-cinzel text-4xl font-bold text-amber-400 mb-2">Zwycięstwo!</h1>
      <p className="text-slate-300 font-crimson text-base mb-2">
        {player?.name ?? 'Bohater'} zebrał wszystkie {collectedShards} Odłamki Słońca.
      </p>
      <p className="text-slate-500 font-crimson text-sm mb-6 italic">
        Bogowie są martwi. Świt nadszedł.
      </p>
      <div className="flex gap-3 justify-center">
        <button
          onClick={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
          className="btn-gothic px-6 py-2"
        >
          Kontynuuj
        </button>
        <button
          onClick={() => dispatch({ type: 'RESET_GAME' })}
          className="px-6 py-2 bg-slate-800 border border-slate-700 text-slate-400 font-cinzel text-sm rounded hover:border-slate-600 transition-all"
        >
          Nowa Gra
        </button>
      </div>
    </div>
  </div>
);

// === MAIN GAME COMPONENT ===
const Game = () => {
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState());
  const saveExists = hasSave();

  // Auto-save on player state changes (except during combat)
  useEffect(() => {
    if (state.screen !== 'title' && state.screen !== 'difficulty' && state.screen !== 'character_creation' && state.player) {
      // Save is handled inside the reducer after key actions
    }
  }, [state.player?.hp, state.player?.gold, state.player?.level]);

  const s = state;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Always-present notifications */}
      <Notifications
        notifications={s.notifications ?? []}
        onDismiss={(id) => dispatch({ type: 'DISMISS_NOTIFICATION', id })}
      />

      {/* HUD — shown whenever player exists and not on title/creation/map screens */}
      {s.player && !['title', 'difficulty', 'character_creation', 'world_map'].includes(s.screen) && (
        <HUD
          player={s.player}
          currentCity={s.currentCity}
          collectedShards={Array.isArray(s.collectedShards) ? s.collectedShards.length : (s.collectedShards ?? 0)}
          onOpenInventory={() => dispatch({ type: 'OPEN_INVENTORY' })}
          onOpenMap={() => dispatch({ type: 'OPEN_WORLD_MAP' })}
          onOpenQuests={() => dispatch({ type: 'OPEN_QUEST_TRACKER' })}
        />
      )}

      {/* Screen Router */}
      {s.screen === 'title' && (
        <TitleScreen
          onNewGame={() => dispatch({ type: 'GOTO_SCREEN', screen: 'difficulty' })}
          onContinue={() => dispatch({ type: 'LOAD_GAME' })}
          onLoadGame={() => dispatch({ type: 'LOAD_GAME' })}
        />
      )}

      {s.screen === 'difficulty' && (
        <DifficultySelect
          onSelect={(diff) => dispatch({ type: 'SET_DIFFICULTY', difficulty: diff })}
          onBack={() => dispatch({ type: 'GOTO_SCREEN', screen: 'title' })}
        />
      )}

      {s.screen === 'character_creation' && (
        <CharacterCreation
          onConfirm={(name, playerClass) =>
            dispatch({ type: 'CREATE_CHARACTER', name, playerClass })
          }
          onBack={() => dispatch({ type: 'GOTO_SCREEN', screen: 'difficulty' })}
        />
      )}

      {s.screen === 'city' && s.player && (
        <CityView
          cityId={s.currentCity}
          player={s.player}
          mainQuestStage={s.mainQuestStage ?? 0}
          defeatedBosses={s.defeatedBosses ?? []}
          tutorialStep={s.tutorialStep ?? -1}
          dispatch={dispatch}
        />
      )}

      {s.screen === 'combat' && s.player && (
        <CombatView
          combatState={s.combat}
          player={s.player}
          dispatch={dispatch}
        />
      )}

      {s.screen === 'world_map' && s.player && (
        <GameMap
          dispatch={dispatch}
          player={s.player}
        />
      )}

      {s.screen === 'shop' && s.player && (
        <ShopView
          cityId={s.currentCity}
          player={s.player}
          merchantGold={typeof s.merchantGold === 'object' ? (s.merchantGold[s.currentCity] ?? 5000) : (s.merchantGold ?? 5000)}
          dispatch={dispatch}
          onClose={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
        />
      )}

      {s.screen === 'forge' && s.player && (
        <ForgeView
          player={s.player}
          dispatch={dispatch}
          onClose={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
        />
      )}

      {s.screen === 'inventory' && s.player && (
        <InventoryPanel
          player={s.player}
          dispatch={dispatch}
          onClose={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
        />
      )}

      {s.screen === 'quest_tracker' && s.player && (
        <QuestTracker
          mainQuestStage={s.mainQuestStage ?? 0}
          activeQuests={s.activeBounties?.filter(b => !b.completed) ?? []}
          completedQuests={s.completedQuests ?? []}
          onClose={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
        />
      )}

      {s.screen === 'bounty_board' && s.player && (
        <BountyBoard
          bounties={s.activeBounties ?? []}
          player={s.player}
          dispatch={dispatch}
          onClose={() => dispatch({ type: 'GOTO_SCREEN', screen: 'city' })}
        />
      )}

      {s.screen === 'dialogue' && s.player && (s.activeNpcId ?? s.currentNPC) && (
        <DialogueSystem
          npcId={s.activeNpcId ?? s.currentNPC}
          dispatch={dispatch}
        />
      )}

      {s.screen === 'game_over' && (
        <GameOver player={s.player} dispatch={dispatch} />
      )}

      {s.screen === 'victory' && (
        <Victory
          player={s.player}
          collectedShards={Array.isArray(s.collectedShards) ? s.collectedShards.length : (s.collectedShards ?? 5)}
          dispatch={dispatch}
        />
      )}
    </div>
  );
};

export default Game;
