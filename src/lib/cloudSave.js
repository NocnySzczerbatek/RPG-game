// ============================================================
// Cloud Save Service — Supabase DB + LocalStorage fallback
// ============================================================
import { supabase, isSupabaseConfigured } from './supabase.js';

// ── Character CRUD ────────────────────────────────────────

/** Fetch all characters for the current user */
export async function fetchCharacters(userId) {
  if (!isSupabaseConfigured() || !userId) return [];
  const { data, error } = await supabase
    .from('characters')
    .select('id, name, class, level, created_at, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) { console.error('[CloudSave] fetchCharacters:', error.message); return []; }
  return data ?? [];
}

/** Create a new character row, returns the new character object */
export async function createCharacter(userId, name, playerClass) {
  if (!isSupabaseConfigured() || !userId) return null;
  const { data, error } = await supabase
    .from('characters')
    .insert({ user_id: userId, name, class: playerClass, level: 1, game_state: {} })
    .select()
    .single();
  if (error) { console.error('[CloudSave] createCharacter:', error.message); return null; }
  return data;
}

/** Delete a character */
export async function deleteCharacter(characterId) {
  if (!isSupabaseConfigured()) return false;
  const { error } = await supabase.from('characters').delete().eq('id', characterId);
  if (error) { console.error('[CloudSave] deleteCharacter:', error.message); return false; }
  return true;
}

/** Load full game state for a character */
export async function loadCloudSave(characterId) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();
  if (error) { console.error('[CloudSave] loadCloudSave:', error.message); return null; }
  return data;
}

/** Save full game state for a character */
export async function saveToCloud(characterId, gameState) {
  if (!isSupabaseConfigured() || !characterId) return false;
  const payload = {
    level: gameState.player?.level ?? 1,
    name: gameState.player?.name ?? 'Hero',
    class: gameState.player?.class ?? 'warrior',
    game_state: {
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
      activeBounties: gameState.activeBounties,
      completedQuests: gameState.completedQuests,
    },
  };
  const { error } = await supabase
    .from('characters')
    .update(payload)
    .eq('id', characterId);
  if (error) { console.error('[CloudSave] saveToCloud:', error.message); return false; }
  return true;
}

// ── Auth helpers ──────────────────────────────────────────

export async function signInWithGoogle() {
  if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  return { data, error: error?.message };
}

export async function signInWithDiscord() {
  if (!isSupabaseConfigured()) return { error: 'Supabase not configured' };
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: { redirectTo: window.location.origin },
  });
  return { data, error: error?.message };
}

export async function signOut() {
  if (!isSupabaseConfigured()) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return { data: { subscription: { unsubscribe: () => {} } } };
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });
}
