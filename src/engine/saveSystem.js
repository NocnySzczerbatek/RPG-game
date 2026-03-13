// ============================================================
// ENGINE: SAVE SYSTEM (localStorage)
// ============================================================

const SAVE_KEY = 'godslayer_save_v1';
const SETTINGS_KEY = 'godslayer_settings_v1';

export const saveGame = (gameState) => {
  try {
    const saveData = {
      version: 1,
      timestamp: Date.now(),
      player: gameState.player,
      currentCity: gameState.currentCity,
      quests: gameState.quests,
      difficulty: gameState.difficulty,
      merchantGold: gameState.merchantGold,
      unlockedCities: gameState.unlockedCities,
      defeatedBosses: gameState.defeatedBosses,
      mainQuestStage: gameState.mainQuestStage,
      collectedShards: gameState.collectedShards,
      gameCompleted: gameState.gameCompleted,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
    return true;
  } catch (e) {
    console.error('Save failed:', e);
    return false;
  }
};

export const loadGame = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.version || data.version !== 1) return null;
    return data;
  } catch (e) {
    console.error('Load failed:', e);
    return null;
  }
};

export const deleteSave = () => {
  try {
    localStorage.removeItem(SAVE_KEY);
    return true;
  } catch (e) {
    return false;
  }
};

export const hasSave = () => {
  return !!localStorage.getItem(SAVE_KEY);
};

export const saveSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {}
};

export const loadSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
};

export const formatSaveDate = (timestamp) => {
  if (!timestamp) return 'Nieznana data';
  const d = new Date(timestamp);
  return d.toLocaleDateString('pl-PL', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};
