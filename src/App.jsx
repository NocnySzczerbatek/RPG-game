import { useLayoutEffect } from 'react';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameMap from './components/GameMap';
import Inventory from './components/Inventory';
import { createPortal } from 'react-dom';
import MainMenu, { CLASSES } from './components/MainMenu';
import DeathOverlay from './components/DeathOverlay';
import TradeWindow from './components/TradeWindow';
import { getItemValue as getItemValueTrade } from './components/TradeWindow';
import AdminPanel from './components/AdminPanel';
import SettingsMenu, { DEFAULT_BINDINGS } from './components/SettingsMenu';
import { ITEM_DB, LOOT_TABLE, RARITIES, TYPE_TO_SLOTS, SKILL_TREES, rollMobItem, rollBossItem, getItemValue, canClassEquip } from './data/ItemDatabase';
import { fetchIsAdmin } from './lib/supabase';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const EMPTY_EQUIPMENT = {
  head: null, torso: null, hands: null, legs: null, feet: null,
  neck: null, ring1: null, ring2: null,
  mainHand: null, offHand: null,
};

const BACKPACK_SIZE = 40;
const SAVE_KEY = 'godslayer_save';

/* ── Shop stock generation (level-scaled) ────────────────── */
function generateShopStock(playerLevel = 1) {
  const potions = ITEM_DB.filter(i => i.type === 'potion');
  const rarityForLevel = playerLevel < 3 ? ['common', 'magic'] : playerLevel < 6 ? ['magic', 'rare'] : ['magic', 'rare', 'legendary', 'mythic'];
  const eligible = ITEM_DB.filter(i => rarityForLevel.includes(i.rarity) && i.type !== 'potion');
  const scaled = eligible.map(i => {
    const bonus = Math.max(0, playerLevel - 2);
    const copy = { ...i };
    if (copy.dmg) copy.dmg = copy.dmg + Math.floor(bonus * 1.5);
    if (copy.def) copy.def = copy.def + Math.floor(bonus * 1.2);
    return copy;
  });
  const shuffled = [...scaled].sort(() => Math.random() - 0.5);
  return [...potions.slice(0, 3), ...shuffled.slice(0, 3)];
}

/* ═══════════════════════════════════════════════════════════════
   SAVE / LOAD
   ═══════════════════════════════════════════════════════════════ */
function saveGame(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch { /* full storage — silently fail */ }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function hasSaveFile() {
  return !!localStorage.getItem(SAVE_KEY);
}

/* ═══════════════════════════════════════════════════════════════
   APP
   ═══════════════════════════════════════════════════════════════ */
export default function App() {
  /* ── Player / inventory state ────────────────────────────── */
  const [inventoryOpen, setInventoryOpen] = useState(false);
  // Brutal DOM cleanup: remove duplicate inventory overlays
  useEffect(() => {
    if (inventoryOpen) {
      setTimeout(() => {
        // Try to find all inventory overlays by class or id
        const overlays = document.querySelectorAll('#single-inventory-container > div, .inventory-overlay');
        if (overlays.length > 1) {
          for (let i = 1; i < overlays.length; ++i) {
            overlays[i].parentNode && overlays[i].parentNode.removeChild(overlays[i]);
          }
        }
      }, 100);
    }
  }, [inventoryOpen]);
  /* ── Game-state machine: 'menu' | 'playing' | 'dead' ─────── */
  const [screen, setScreen] = useState('menu');
  const [hasSave, setHasSave] = useState(() => hasSaveFile());

  // Ensure inventory is closed when not playing (prevents black screen overlay)
  useEffect(() => {
    if (screen !== 'playing' && inventoryOpen) {
      setInventoryOpen(false);
    }
  }, [screen, inventoryOpen]);
  const [backpack, setBackpack] = useState(() => {
    const bp = new Array(BACKPACK_SIZE).fill(null);
    /* Starter items from ItemDatabase */
    const byId = (id) => { const it = ITEM_DB.find(i => i.id === id); return it ? { ...it } : null; };
    bp[0] = byId('sword_rusty');
    bp[1] = byId('dagger_enchanted');
    bp[2] = byId('dagger_blood');
    bp[3] = byId('sword_gods');
    bp[4] = byId('chest_leather');
    bp[5] = byId('chest_shadow');
    bp[6] = byId('chest_god');
    bp[7] = byId('helm_leather');
    bp[8] = byId('ring_bone');
    bp[9] = byId('ring_agony');
    bp[10] = byId('amulet_crown');
    bp[11] = byId('pot_hp_small');
    bp[12] = byId('pot_hp_med');
    bp[13] = byId('pot_mana_small');
    bp[14] = byId('shield_wood');
    bp[15] = byId('belt_cloth');
    bp[16] = byId('pants_torn');
    bp[17] = byId('boots_leather');
    bp[18] = byId('bow_short');
    return bp;
  });
  const [equipment, setEquipment] = useState({ ...EMPTY_EQUIPMENT });
  const [playerState, setPlayerState] = useState({});
  const [chosenClass, setChosenClass] = useState(null);
  const sceneRef = useRef(null);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [tradeNpcName, setTradeNpcName] = useState('Handlarz');
  const [shopStock, setShopStock] = useState(() => generateShopStock());
  const [zone, setZone] = useState('forest');
  const prevLevelRef = useRef(1);

  /* ── Skill tree state ───────────────────────────────────── */
  const [unlockedSkills, setUnlockedSkills] = useState([]);
  const [skillPoints, setSkillPoints] = useState(0);
  const [skillSlots, setSkillSlots] = useState({ q: null, w: null, e: null, r: null });

  /* ── Admin & Settings state ─────────────────────────────── */
  // DEV: true for local testing. In production, Supabase overrides this.
  const [isAdmin, setIsAdmin] = useState(true);
  const [adminOpen, setAdminOpen] = useState(false);

  // Fetch admin flag from Supabase profiles table on mount (overrides default)
  useEffect(() => {
    let cancelled = false;
    fetchIsAdmin().then(flag => { if (!cancelled && flag !== null) setIsAdmin(flag); });
    return () => { cancelled = true; };
  }, []);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [bindings, setBindings] = useState(() => {
    try { const s = localStorage.getItem('godslayer_bindings'); return s ? { ...DEFAULT_BINDINGS, ...JSON.parse(s) } : { ...DEFAULT_BINDINGS }; }
    catch { return { ...DEFAULT_BINDINGS }; }
  });
  const [musicVolume, setMusicVolume] = useState(() => {
    try { return Number(localStorage.getItem('godslayer_musicVol')) || 50; } catch { return 50; }
  });
  const [sfxVolume, setSfxVolume] = useState(() => {
    try { return Number(localStorage.getItem('godslayer_sfxVol')) || 70; } catch { return 70; }
  });

  const handleUpdateBinding = useCallback((key, value) => {
    setBindings(prev => {
      const next = { ...prev, [key]: value };
      try { localStorage.setItem('godslayer_bindings', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const handleMusicVolume = useCallback((v) => {
    setMusicVolume(v);
    try { localStorage.setItem('godslayer_musicVol', String(v)); } catch {}
  }, []);

  const handleSfxVolume = useCallback((v) => {
    setSfxVolume(v);
    try { localStorage.setItem('godslayer_sfxVol', String(v)); } catch {}
  }, []);

  /* ── Keyboard: bindings, tilde for admin, ESC for settings */
  // Debounce for inventory toggle
  const inventoryDebounceRef = useRef(0);
  useEffect(() => {
    const handler = (e) => {
      if (screen !== 'playing') return;
      const k = e.key;
      const code = e.code;

      // Admin console toggle: Backquote key (physical), or ; or / keys (if admin)
      if (isAdmin && (code === 'Backquote' || k === ';' || k === '/')) {
        e.preventDefault();
        e.stopPropagation();
        setAdminOpen(prev => !prev);
        return;
      }

      // ESC priority: trade → inventory → admin → toggle settings
      if (k === 'Escape') {
        if (tradeOpen) { setTradeOpen(false); return; }
        if (inventoryOpen) { setInventoryOpen(false); return; }
        if (adminOpen) { setAdminOpen(false); return; }
        setSettingsOpen(prev => !prev);
        return;
      }

      // Don't process other bindings while overlays are open
      if (adminOpen || settingsOpen) return;

      // Inventory toggle with debounce (200ms)
      if (k.toUpperCase() === bindings.inventory.toUpperCase()) {
        if (!tradeOpen) {
          e.stopImmediatePropagation();
          e.preventDefault();
          const now = Date.now();
          if (now - inventoryDebounceRef.current > 200) {
            setInventoryOpen(prev => !prev);
            inventoryDebounceRef.current = now;
          }
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [inventoryOpen, tradeOpen, adminOpen, settingsOpen, screen, bindings, isAdmin]);

  /* ── Pause Phaser when any overlay open ────────────────── */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const shouldPause = inventoryOpen || tradeOpen || adminOpen || settingsOpen;
    if (shouldPause) {
      scene.physics?.world?.pause();
      if (scene.input?.keyboard) scene.input.keyboard.enabled = false;
    } else {
      scene.physics?.world?.resume();
      if (scene.input?.keyboard) scene.input.keyboard.enabled = true;
    }
  }, [inventoryOpen, tradeOpen, adminOpen, settingsOpen]);

  /* ── Add item to backpack (from Phaser) ────────────────── */
  const addToBackpack = useCallback((item) => {
    setBackpack(prev => {
      const next = [...prev];
      const idx = next.findIndex(s => s === null);
      if (idx === -1) return prev;
      next[idx] = { ...item, id: Date.now() + Math.random() };
      return next;
    });
  }, []);

  /* ── Equip from backpack ───────────────────────────────── */
  const handleEquipItem = useCallback((backpackIndex) => {
    setBackpack(prev => {
      const item = prev[backpackIndex];
      if (!item) return prev;
      if (!canClassEquip(chosenClass?.id, item)) return prev; // class restriction
      const possibleSlots = TYPE_TO_SLOTS[item.type] || [];
      if (possibleSlots.length === 0) return prev;
      const nextPack = [...prev];
      setEquipment(prevEquip => {
        const nextEquip = { ...prevEquip };
        const targetSlot = possibleSlots.find(s => !nextEquip[s]) || possibleSlots[0];
        const displaced = nextEquip[targetSlot];
        nextEquip[targetSlot] = item;
        nextPack[backpackIndex] = displaced;
        return nextEquip;
      });
      return nextPack;
    });
  }, [chosenClass]);

  /* ── Unequip to backpack ───────────────────────────────── */
  const handleUnequipItem = useCallback((slotKey) => {
    setEquipment(prev => {
      const item = prev[slotKey];
      if (!item) return prev;
      setBackpack(prevPack => {
        const idx = prevPack.findIndex(s => s === null);
        if (idx === -1) return prevPack;
        const next = [...prevPack];
        next[idx] = item;
        return next;
      });
      return { ...prev, [slotKey]: null };
    });
  }, []);

  /* ── Consume potion ────────────────────────────────────── */
  const handleConsumePotion = useCallback((backpackIndex) => {
    setBackpack(prev => {
      const item = prev[backpackIndex];
      if (!item || item.type !== 'potion') return prev;
      const scene = sceneRef.current;
      if (scene?.playerData) {
        if (item.heal) scene.playerData.hp = Math.min(scene.playerData.maxHp, scene.playerData.hp + item.heal);
        if (item.manaRestore) scene.playerData.mana = Math.min(scene.playerData.maxMana, scene.playerData.mana + item.manaRestore);
      }
      const next = [...prev];
      next[backpackIndex] = null;
      return next;
    });
  }, []);

  /* ── Swap backpack items (for drag & drop) ─────────────── */
  const handleSwapBackpack = useCallback((fromIdx, toIdx) => {
    setBackpack(prev => {
      const next = [...prev];
      const tmp = next[fromIdx];
      next[fromIdx] = next[toIdx];
      next[toIdx] = tmp;
      return next;
    });
  }, []);

  /* ── Push equipment bonuses + visual data into Phaser ───── */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene?.playerData) return;
    let bonusDmg = 0, bonusDef = 0, bonusCrit = 0;
    let bestRarity = 'common';
    const rarityRank = { common: 0, magic: 1, rare: 2, legendary: 3, mythic: 4 };
    for (const item of Object.values(equipment)) {
      if (!item) continue;
      if (item.dmg) bonusDmg += item.dmg;
      if (item.def) bonusDef += item.def;
      if (item.critChance) bonusCrit += item.critChance;
      if ((rarityRank[item.rarity] || 0) > (rarityRank[bestRarity] || 0)) bestRarity = item.rarity;
    }
    scene.playerData._equipBonusDmg = bonusDmg;
    scene.playerData._equipBonusDef = bonusDef;
    scene.playerData._equipBonusCrit = bonusCrit;
    // Visual data for paperdoll
    scene._equipVisual = {
      mainHand: equipment.mainHand,
      offHand: equipment.offHand,
      torso: equipment.torso,
      head: equipment.head,
      bestRarity,
    };
    // Trigger visual update
    if (scene._updatePaperdoll) scene._updatePaperdoll();
  }, [equipment]);

  /* ── Auto-save every 15s while playing ─────────────────── */
  useEffect(() => {
    if (screen !== 'playing' || !chosenClass) return;
    const iv = setInterval(() => {
      const scene = sceneRef.current;
      if (!scene?.playerData) return;
      const pd = scene.playerData;
      saveGame({
        classId: chosenClass.id,
        level: pd.level, xp: pd.xp, xpToLevel: pd.xpToLevel,
        gold: pd.gold, baseDmg: pd.baseDmg, critChance: pd.critChance,
        maxHp: pd.maxHp, maxMana: pd.maxMana,
        backpack, equipment,
        stats: chosenClass.stats,
      });
      setHasSave(true);
    }, 15000);
    return () => clearInterval(iv);
  }, [screen, chosenClass, backpack, equipment]);

  /* ── Death detection ───────────────────────────────────── */
  useEffect(() => {
    if (screen !== 'playing') return;
    if (playerState.hp !== undefined && playerState.hp <= 0) {
      // Pause Phaser
      const scene = sceneRef.current;
      if (scene) {
        scene.physics?.world?.pause();
        if (scene.input?.keyboard) scene.input.keyboard.enabled = false;
      }
      setInventoryOpen(false);
      setScreen('dead');
    }
  }, [playerState.hp, screen]);

  /* ── Handle player death callback from Phaser ──────────── */
  const onPlayerDeath = useCallback(() => {
    setScreen('dead');
  }, []);

  /* ── Trade window open/close ────────────────────────────── */
  const onOpenTrade = useCallback((npcName) => {
    setTradeNpcName(npcName || 'Handlarz');
    setTradeOpen(true);
    setInventoryOpen(false);
  }, []);

  const onZoneChange = useCallback((z) => setZone(z), []);

  /* ── Buy from shop ─────────────────────────────────────── */
  const handleBuy = useCallback((shopIndex) => {
    const item = shopStock[shopIndex];
    if (!item) return;
    const price = getItemValueTrade(item);
    const scene = sceneRef.current;
    if (!scene?.playerData || scene.playerData.gold < price) return;
    scene.playerData.gold -= price;
    addToBackpack({ ...item, id: Date.now() + Math.random() });
  }, [shopStock, addToBackpack]);

  /* ── Sell item from backpack ────────────────────────────── */
  const handleSell = useCallback((backpackIndex) => {
    setBackpack(prev => {
      const item = prev[backpackIndex];
      if (!item) return prev;
      const sellPrice = Math.max(1, Math.floor(getItemValueTrade(item) * 0.25));
      const scene = sceneRef.current;
      if (scene?.playerData) scene.playerData.gold += sellPrice;
      const next = [...prev];
      next[backpackIndex] = null;
      return next;
    });
  }, []);

  /* ── Refresh shop on level up + grant skill point ────────── */
  useEffect(() => {
    const lvl = playerState.level || 1;
    if (lvl > prevLevelRef.current) {
      const gained = lvl - prevLevelRef.current;
      prevLevelRef.current = lvl;
      setShopStock(generateShopStock(lvl));
      setSkillPoints(prev => prev + gained);
    }
  }, [playerState.level]);

  /* ── Unlock skill handler ─────────────────────────────── */
  const handleUnlockSkill = useCallback((skillId) => {
    setSkillPoints(prev => {
      if (prev <= 0) return prev;
      setUnlockedSkills(us => {
        if (us.includes(skillId)) return us;
        return [...us, skillId];
      });
      return prev - 1;
    });
  }, []);

  /* ── Assign skill to Q/W/E/R slot ─────────────────────── */
  const handleAssignSlot = useCallback((slotKey, skillId) => {
    setSkillSlots(prev => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        if (next[k] === skillId) next[k] = null;
      }
      next[slotKey] = skillId;
      return next;
    });
  }, []);

  /* ── Admin: add gold ───────────────────────────────────── */
  const handleAdminAddGold = useCallback((amount) => {
    const scene = sceneRef.current;
    if (scene?.playerData) scene.playerData.gold += amount;
  }, []);

  /* ── Admin: add skill points ───────────────────────────── */
  const handleAdminAddSkillPoints = useCallback((n) => {
    setSkillPoints(prev => prev + n);
  }, []);

  /* ── Return to main menu from settings ─────────────────── */
  const handleReturnToMenu = useCallback(() => {
    // Save before quitting
    const scene = sceneRef.current;
    if (scene?.playerData && chosenClass) {
      const pd = scene.playerData;
      saveGame({
        classId: chosenClass.id,
        level: pd.level, xp: pd.xp, xpToLevel: pd.xpToLevel,
        gold: pd.gold, baseDmg: pd.baseDmg, critChance: pd.critChance,
        maxHp: pd.maxHp, maxMana: pd.maxMana,
        backpack, equipment,
        stats: chosenClass.stats,
      });
      setHasSave(true);
    }
    // Close all overlays and go to menu
    setInventoryOpen(false);
    setTradeOpen(false);
    setAdminOpen(false);
    setSettingsOpen(false);
    setScreen('menu');
  }, [chosenClass, backpack, equipment]);

  /* ── START GAME (from menu) ────────────────────────────── */
  const handleStartGame = useCallback((classData) => {
    console.log('[App] handleStartGame, class:', classData?.id);
    setChosenClass(classData);
    setBackpack(new Array(BACKPACK_SIZE).fill(null));
    setEquipment({ ...EMPTY_EQUIPMENT });
    setPlayerState({});
    setInventoryOpen(false);
    setScreen('playing');
  }, []);

  /* ── CONTINUE (load save) ──────────────────────────────── */
  const handleContinue = useCallback(() => {
    const save = loadGame();
    if (!save) return;
    const cls = CLASSES.find(c => c.id === save.classId) || CLASSES[0];
    const loaded = { ...cls, stats: { ...cls.stats, ...save.stats } };
    setChosenClass(loaded);
    setBackpack(save.backpack || new Array(BACKPACK_SIZE).fill(null));
    setEquipment(save.equipment || { ...EMPTY_EQUIPMENT });
    setPlayerState({});
    setInventoryOpen(false);
    setScreen('playing');
    // The save data will be injected into Phaser via the chosenClass + savedData pattern
    // Store save in ref so GameMap can read it
    savedDataRef.current = save;
  }, []);

  const savedDataRef = useRef(null);

  /* ── RESPAWN ───────────────────────────────────────────── */
  const handleRespawn = useCallback(() => {
    const scene = sceneRef.current;
    if (scene?.playerData) {
      const penalty = Math.floor((scene.playerData.gold || 0) * 0.10);
      scene.playerData.gold = Math.max(0, scene.playerData.gold - penalty);
      scene.playerData.hp = scene.playerData.maxHp;
      scene.playerData.mana = scene.playerData.maxMana;
      // Mercy invulnerability — 3 seconds
      scene._mercyTimer = 3000;
      // Teleport to Eldergrove hall (start building)
      if (scene.knight) {
        const hall = scene._startHouse || { x: 1200, y: 1140 };
        scene.knight.setPosition(hall.x, hall.y);
        scene.knight.body.setVelocity(0, 0);
        scene.knight.clearTint();
        scene.knight.setAlpha(1);
        scene.knight.play('hero_idle', true);
      }
      // Reset zone to forest (Eldergrove)
      scene._currentZone = 'forest';
      if (scene._onZoneChange) scene._onZoneChange('forest');
      scene._isDead = false;
      scene._attackTarget = null;
      scene._moveTarget = null;
      scene.physics?.world?.resume();
      if (scene.input?.keyboard) scene.input.keyboard.enabled = true;
      scene.cameras?.main?.flash(600, 200, 170, 50);
    }
    setScreen('playing');
  }, []);

  /* ── Player stats for inventory ────────────────────────── */
  const classStats = chosenClass?.stats || {};
  const playerStats = {
    str: classStats.str || 10,
    int: classStats.int || 8,
    dex: classStats.dex || 12,
    will: classStats.will || 8,
    baseDmg: playerState.baseDmg || classStats.baseDmg || 12,
    critChance: playerState.critChance || classStats.critChance || 0.15,
    def: classStats.def || 0,
    maxHp: playerState.maxHp || classStats.maxHp || 100,
    maxMana: playerState.maxMana || classStats.maxMana || 50,
    level: playerState.level || 1,
    xp: playerState.xp || 0,
    xpToLevel: playerState.xpToLevel || 100,
  };

  /* ═══════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════ */

  /* Menu screen */
  if (screen === 'menu') {
    return (
      <div className="w-full h-screen bg-black overflow-hidden">
        <MainMenu
          onStartGame={handleStartGame}
          hasSave={hasSave}
          onContinue={handleContinue}
        />
      </div>
    );
  }

  /* Playing or Dead — game is always mounted underneath */
  return (
    <div className="w-full h-screen bg-black overflow-hidden relative">
      <GameMap
        playerState={playerState}
        setPlayerState={setPlayerState}
        sceneRef={sceneRef}
        addToBackpack={addToBackpack}
        chosenClass={chosenClass}
        savedData={savedDataRef.current}
        onPlayerDeath={onPlayerDeath}
        onOpenTrade={onOpenTrade}
        onZoneChange={onZoneChange}
      />
      <div id="inventory-root"></div>
      {/* Inventory overlay via React Portal */}
      {inventoryOpen && screen === 'playing' && typeof window !== 'undefined' && document.getElementById('inventory-root')
        ? createPortal(
            <Inventory
              key="unique-inv"
              isOpen={true}
              onClose={() => setInventoryOpen(false)}
              backpack={backpack}
              equipment={equipment}
              playerStats={playerStats}
              onEquipItem={handleEquipItem}
              onUnequipItem={handleUnequipItem}
              onConsumePotion={handleConsumePotion}
              gold={playerState.gold || 0}
              classId={chosenClass?.id}
              onSwapBackpack={handleSwapBackpack}
              unlockedSkills={unlockedSkills}
              skillPoints={skillPoints}
              onUnlockSkill={handleUnlockSkill}
              skillSlots={skillSlots}
              onAssignSlot={handleAssignSlot}
            />,
            document.getElementById('inventory-root')
          )
        : null}
      {screen === 'dead' && (
        <DeathOverlay gold={playerState.gold || 0} onRespawn={handleRespawn} />
      )}
      {tradeOpen && screen === 'playing' && (
        <TradeWindow
          isOpen={true}
          onClose={() => setTradeOpen(false)}
          shopStock={shopStock}
          backpack={backpack}
          gold={playerState.gold || 0}
          onBuy={handleBuy}
          onSell={handleSell}
          npcName={tradeNpcName}
        />
      )}
      {isAdmin && (
        <AdminPanel
          isOpen={adminOpen && screen === 'playing'}
          onClose={() => setAdminOpen(false)}
          sceneRef={sceneRef}
          addToBackpack={addToBackpack}
          itemDb={ITEM_DB}
          onAddGold={handleAdminAddGold}
          onAddSkillPoints={handleAdminAddSkillPoints}
          isAdmin={isAdmin}
        />
      )}
      <SettingsMenu
        isOpen={settingsOpen && screen === 'playing'}
        onClose={() => setSettingsOpen(false)}
        onReturnToMenu={handleReturnToMenu}
        bindings={bindings}
        onUpdateBindings={handleUpdateBinding}
        musicVolume={musicVolume}
        sfxVolume={sfxVolume}
        onMusicVolume={handleMusicVolume}
        onSfxVolume={handleSfxVolume}
      />
    </div>
  );
}
