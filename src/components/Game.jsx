// ============================================================
// COMPONENT: Game Orchestrator
// Auth flow → Character Select → Game
// ============================================================
import React, { useReducer, useEffect, useState, useCallback, useRef } from 'react';
import { gameReducer, createInitialGameState } from '../engine/gameReducer.js';
import { hasSave } from '../engine/saveSystem.js';
import { onAuthStateChange, signOut, getCurrentUser, saveToCloud, loadCloudSave, createCharacter as createCloudCharacter } from '../lib/cloudSave.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

import HUD from './HUD.jsx';
import Notifications from './Notifications.jsx';
import TitleScreen from './TitleScreen.jsx';
import LoginScreen from './LoginScreen.jsx';
import CharacterSelect from './CharacterSelect.jsx';
import GameMap from './GameMap.jsx';
import DifficultySelect from './DifficultySelect.jsx';
import CharacterCreation from './CharacterCreation.jsx';
import CityView from './CityView.jsx';
import CombatView from './CombatView.jsx';
import WorldMap from './WorldMap.jsx';
import ShopView from './ShopView.jsx';
import ForgeView from './ForgeView.jsx';
import InventoryPanel from './InventoryPanel.jsx';
import SkillTree from './SkillTree.jsx';
import QuestTracker from './QuestTracker.jsx';
import BountyBoard from './BountyBoard.jsx';
import DialogueSystem from './DialogueSystem.jsx';
import BigMap from './BigMap.jsx';
import TutorialOverlay from './TutorialOverlay.jsx';

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
  // ── Auth state ──
  const [authPhase, setAuthPhase] = useState('loading'); // loading | login | character_select | playing
  const [user, setUser] = useState(null);
  const [activeCharacterId, setActiveCharacterId] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [showBigMap, setShowBigMap] = useState(false);
  const [bigMapPlayerPos, setBigMapPlayerPos] = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

  // ── Game state ──
  const [state, dispatch] = useReducer(gameReducer, createInitialGameState());
  const stateRef = useRef(state);
  stateRef.current = state;
  const charIdRef = useRef(null);
  charIdRef.current = activeCharacterId;

  // ── Listen for Supabase auth changes ──
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthPhase('login');
      return;
    }
    // Check existing session on mount
    getCurrentUser().then((u) => {
      if (u) { setUser(u); setAuthPhase('character_select'); }
      else setAuthPhase('login');
    });
    // Subscribe to auth changes (handles OAuth redirect)
    const { data: { subscription } } = onAuthStateChange((u) => {
      setUser(u);
      if (u) setAuthPhase('character_select');
      else { setAuthPhase('login'); setActiveCharacterId(null); setOfflineMode(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Cloud auto-save every 60 seconds ──
  useEffect(() => {
    if (offlineMode || !activeCharacterId || authPhase !== 'playing') return;
    const interval = setInterval(() => {
      const s = stateRef.current;
      if (s.player) saveToCloud(charIdRef.current, s);
    }, 60000);
    return () => clearInterval(interval);
  }, [offlineMode, activeCharacterId, authPhase]);

  // ── Save on page unload / logout ──
  useEffect(() => {
    const handleUnload = () => {
      if (!offlineMode && charIdRef.current && stateRef.current.player) {
        // Use sendBeacon for reliable save on close
        saveToCloud(charIdRef.current, stateRef.current);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [offlineMode]);

  // ── Handlers ──
  const handlePlayOffline = () => {
    setOfflineMode(true);
    setAuthPhase('playing');
    // Start from title screen in offline mode (existing flow)
  };

  const handleSelectCharacter = async (char) => {
    // Load full game state from Supabase
    const full = await loadCloudSave(char.id);
    if (full?.game_state && full.game_state.player) {
      dispatch({ type: 'LOAD_CLOUD_SAVE', payload: full.game_state });
    } else {
      // Character exists but no save data yet → go to world_map with defaults
      dispatch({ type: 'GOTO_SCREEN', screen: 'title' });
    }
    setActiveCharacterId(char.id);
    setAuthPhase('playing');
  };

  const handleCreateNewFromSelect = () => {
    // Go into character_creation flow, but we track cloud character
    setActiveCharacterId('pending_creation');
    setAuthPhase('playing');
    // Start fresh from difficulty selection
    dispatch({ type: 'RESET_GAME' });
    dispatch({ type: 'GOTO_SCREEN', screen: 'difficulty' });
  };

  const handleLogout = async () => {
    // Save before logout
    if (activeCharacterId && stateRef.current.player) {
      await saveToCloud(activeCharacterId, stateRef.current);
    }
    await signOut();
    setUser(null);
    setActiveCharacterId(null);
    setOfflineMode(false);
    setAuthPhase('login');
    dispatch({ type: 'RESET_GAME' });
  };

  // ── Wrap dispatch to create cloud character after CREATE_CHARACTER ──
  const gameDispatch = useCallback((action) => {
    // Intercept BigMap toggle — don't pass to reducer
    if (action.type === 'TOGGLE_BIG_MAP') {
      setBigMapPlayerPos(action.playerPos || null);
      setShowBigMap(prev => !prev);
      return;
    }

    dispatch(action);

    // After character creation, create cloud entry & show tutorial
    if (action.type === 'CREATE_CHARACTER') {
      setShowTutorial(true);
      if (user && activeCharacterId === 'pending_creation') {
        createCloudCharacter(user.id, action.name, action.playerClass).then((newChar) => {
          if (newChar) setActiveCharacterId(newChar.id);
        });
      }
    }
  }, [user, activeCharacterId]);

  // ── Render phases ──
  if (authPhase === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⚙️</div>
          <p className="font-cinzel text-amber-400">Ładowanie...</p>
        </div>
      </div>
    );
  }

  if (authPhase === 'login') {
    return <LoginScreen onLoginSuccess={() => {}} onPlayOffline={handlePlayOffline} />;
  }

  if (authPhase === 'character_select' && user) {
    return (
      <CharacterSelect
        user={user}
        onSelectCharacter={handleSelectCharacter}
        onCreateNew={handleCreateNewFromSelect}
        onLogout={handleLogout}
      />
    );
  }

  // ── authPhase === 'playing' ──
  const s = state;
  const d = offlineMode ? dispatch : gameDispatch;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Always-present notifications */}
      <Notifications
        notifications={s.notifications ?? []}
        onDismiss={(id) => d({ type: 'DISMISS_NOTIFICATION', id })}
      />

      {/* Cloud save / user indicator */}
      {user && !offlineMode && !['title','difficulty','character_creation'].includes(s.screen) && (
        <div className="fixed top-0 right-0 z-[60] flex items-center gap-2 px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-bl-lg border-l border-b border-slate-700/50">
          <span className="text-[10px] text-green-500">☁</span>
          <span className="text-[10px] text-slate-500 font-crimson truncate max-w-[100px]">{user.email || 'Cloud'}</span>
          <button onClick={handleLogout} className="text-[10px] text-slate-600 hover:text-red-400 font-cinzel">⏏</button>
        </div>
      )}

      {/* HUD — shown whenever player exists and not on title/creation/map screens */}
      {s.player && !['title', 'difficulty', 'character_creation', 'world_map'].includes(s.screen) && (
        <HUD
          player={s.player}
          currentCity={s.currentCity}
          collectedShards={Array.isArray(s.collectedShards) ? s.collectedShards.length : (s.collectedShards ?? 0)}
          onOpenInventory={() => d({ type: 'OPEN_INVENTORY' })}
          onOpenMap={() => d({ type: 'OPEN_WORLD_MAP' })}
          onOpenQuests={() => d({ type: 'OPEN_QUEST_TRACKER' })}
        />
      )}

      {/* Screen Router */}
      {s.screen === 'title' && (
        <TitleScreen
          onNewGame={() => d({ type: 'GOTO_SCREEN', screen: 'difficulty' })}
          onContinue={() => d({ type: 'LOAD_GAME' })}
          onLoadGame={() => d({ type: 'LOAD_GAME' })}
        />
      )}

      {s.screen === 'difficulty' && (
        <DifficultySelect
          onSelect={(diff) => d({ type: 'SET_DIFFICULTY', difficulty: diff })}
          onBack={() => d({ type: 'GOTO_SCREEN', screen: 'title' })}
        />
      )}

      {s.screen === 'character_creation' && (
        <CharacterCreation
          onConfirm={(name, playerClass) =>
            d({ type: 'CREATE_CHARACTER', name, playerClass })
          }
          onBack={() => d({ type: 'GOTO_SCREEN', screen: 'difficulty' })}
        />
      )}

      {s.screen === 'city' && s.player && (
        <CityView
          cityId={s.currentCity}
          player={s.player}
          mainQuestStage={s.mainQuestStage ?? 0}
          defeatedBosses={s.defeatedBosses ?? []}
          tutorialStep={s.tutorialStep ?? -1}
          dispatch={d}
        />
      )}

      {s.screen === 'combat' && s.player && (
        <CombatView
          combatState={s.combat}
          player={s.player}
          dispatch={d}
        />
      )}

      {s.screen === 'world_map' && s.player && (
        <GameMap
          dispatch={d}
          player={s.player}
        />
      )}

      {/* Full-screen World Map overlay (M key) */}
      {showBigMap && s.screen === 'world_map' && (
        <BigMap playerPos={bigMapPlayerPos} onClose={() => setShowBigMap(false)} />
      )}

      {/* Tutorial overlay for new characters */}
      {showTutorial && s.screen === 'world_map' && (
        <TutorialOverlay onComplete={() => setShowTutorial(false)} />
      )}

      {s.screen === 'shop' && s.player && (
        <ShopView
          cityId={s.currentCity}
          player={s.player}
          merchantGold={typeof s.merchantGold === 'object' ? (s.merchantGold[s.currentCity] ?? 5000) : (s.merchantGold ?? 5000)}
          dispatch={d}
          onClose={() => d({ type: 'GOTO_SCREEN', screen: 'city' })}
        />
      )}

      {s.screen === 'forge' && s.player && (
        <ForgeView
          player={s.player}
          dispatch={d}
          onClose={() => d({ type: 'GOTO_SCREEN', screen: 'city' })}
        />
      )}

      {s.screen === 'inventory' && s.player && (
        <InventoryPanel
          player={s.player}
          dispatch={d}
          onClose={() => d({ type: 'GOTO_SCREEN', screen: 'world_map' })}
        />
      )}

      {s.screen === 'skill_tree' && s.player && (
        <SkillTree
          player={s.player}
          dispatch={d}
          onClose={() => d({ type: 'GOTO_SCREEN', screen: 'world_map' })}
        />
      )}

      {s.screen === 'quest_tracker' && s.player && (
        <QuestTracker
          mainQuestStage={s.mainQuestStage ?? 0}
          activeQuests={s.activeBounties?.filter(b => !b.completed) ?? []}
          completedQuests={s.completedQuests ?? []}
          onClose={() => d({ type: 'GOTO_SCREEN', screen: 'city' })}
        />
      )}

      {s.screen === 'bounty_board' && s.player && (
        <BountyBoard
          bounties={s.activeBounties ?? []}
          player={s.player}
          dispatch={d}
          onClose={() => d({ type: 'GOTO_SCREEN', screen: 'city' })}
        />
      )}

      {s.screen === 'dialogue' && s.player && (s.activeNpcId ?? s.currentNPC) && (
        <DialogueSystem
          npcId={s.activeNpcId ?? s.currentNPC}
          npcRole={s.currentNPCRole}
          npcLabel={s.currentNPCLabel}
          cityId={s.currentCity}
          dispatch={d}
        />
      )}

      {s.screen === 'game_over' && (
        <GameOver player={s.player} dispatch={d} />
      )}

      {s.screen === 'victory' && (
        <Victory
          player={s.player}
          collectedShards={Array.isArray(s.collectedShards) ? s.collectedShards.length : (s.collectedShards ?? 5)}
          dispatch={d}
        />
      )}
    </div>
  );
};

export default Game;
