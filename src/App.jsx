import React, { useState, useCallback, useEffect, useRef } from 'react';
import GameMap, { LOOT_TABLE, RARITIES } from './components/GameMap';
import Inventory from './components/Inventory';
import MainMenu, { CLASSES } from './components/MainMenu';
import DeathOverlay from './components/DeathOverlay';
import TradeWindow from './components/TradeWindow';
import { getItemValue } from './components/TradeWindow';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const TYPE_TO_SLOTS = {
  weapon:  ['mainHand'],
  armor:   ['torso', 'head', 'hands', 'legs', 'feet'],
  shield:  ['offHand'],
  amulet:  ['neck'],
  ring:    ['ring1', 'ring2'],
  potion:  [],
};

const EMPTY_EQUIPMENT = {
  head: null, torso: null, hands: null, legs: null, feet: null,
  neck: null, ring1: null, ring2: null,
  mainHand: null, offHand: null,
};

const BACKPACK_SIZE = 40;
const SAVE_KEY = 'godslayer_save';

/* ── Shop stock generation ────────────────────────────────── */
function generateShopStock() {
  const potions = [
    { name: 'Health Potion', type: 'potion', rarity: 'common', heal: 30 },
    { name: 'Greater Heal',  type: 'potion', rarity: 'magic',  heal: 60 },
    { name: 'Mana Potion',   type: 'potion', rarity: 'common', manaRestore: 20 },
  ];
  const eligible = LOOT_TABLE.filter(i => i.rarity === 'magic' || i.rarity === 'rare');
  const shuffled = [...eligible].sort(() => Math.random() - 0.5);
  return [...potions, ...shuffled.slice(0, 3)];
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
  /* ── Game-state machine: 'menu' | 'playing' | 'dead' ─────── */
  const [screen, setScreen] = useState('menu');
  const [hasSave, setHasSave] = useState(() => hasSaveFile());

  /* ── Player / inventory state ────────────────────────────── */
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [backpack, setBackpack] = useState(() => new Array(BACKPACK_SIZE).fill(null));
  const [equipment, setEquipment] = useState({ ...EMPTY_EQUIPMENT });
  const [playerState, setPlayerState] = useState({});
  const [chosenClass, setChosenClass] = useState(null);
  const sceneRef = useRef(null);
  const [tradeOpen, setTradeOpen] = useState(false);
  const [shopStock, setShopStock] = useState(() => generateShopStock());
  const [zone, setZone] = useState('forest');
  const prevLevelRef = useRef(1);

  /* ── Keyboard: I toggles inventory, ESC closes ─────────── */
  useEffect(() => {
    const handler = (e) => {
      if (screen !== 'playing') return;
      if (e.key === 'i' || e.key === 'I') { if (!tradeOpen) setInventoryOpen(prev => !prev); }
      if (e.key === 'Escape') {
        if (tradeOpen) setTradeOpen(false);
        else if (inventoryOpen) setInventoryOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [inventoryOpen, tradeOpen, screen]);

  /* ── Pause Phaser when inventory open ──────────────────── */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const shouldPause = inventoryOpen || tradeOpen;
    if (shouldPause) {
      scene.physics?.world?.pause();
      if (scene.input?.keyboard) scene.input.keyboard.enabled = false;
    } else {
      scene.physics?.world?.resume();
      if (scene.input?.keyboard) scene.input.keyboard.enabled = true;
    }
  }, [inventoryOpen, tradeOpen]);

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
  }, []);

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

  /* ── Push equipment bonuses into Phaser ────────────────── */
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene?.playerData) return;
    let bonusDmg = 0, bonusDef = 0, bonusCrit = 0;
    for (const item of Object.values(equipment)) {
      if (!item) continue;
      if (item.dmg) bonusDmg += item.dmg;
      if (item.def) bonusDef += item.def;
      if (item.critChance) bonusCrit += item.critChance;
    }
    scene.playerData._equipBonusDmg = bonusDmg;
    scene.playerData._equipBonusDef = bonusDef;
    scene.playerData._equipBonusCrit = bonusCrit;
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
  const onOpenTrade = useCallback(() => {
    setTradeOpen(true);
    setInventoryOpen(false);
  }, []);

  const onZoneChange = useCallback((z) => setZone(z), []);

  /* ── Buy from shop ─────────────────────────────────────── */
  const handleBuy = useCallback((shopIndex) => {
    const item = shopStock[shopIndex];
    if (!item) return;
    const price = getItemValue(item);
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
      const sellPrice = Math.max(1, Math.floor(getItemValue(item) * 0.25));
      const scene = sceneRef.current;
      if (scene?.playerData) scene.playerData.gold += sellPrice;
      const next = [...prev];
      next[backpackIndex] = null;
      return next;
    });
  }, []);

  /* ── Refresh shop on level up ───────────────────────────── */
  useEffect(() => {
    const lvl = playerState.level || 1;
    if (lvl > prevLevelRef.current) {
      prevLevelRef.current = lvl;
      setShopStock(generateShopStock());
    }
  }, [playerState.level]);

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
      // Teleport to Eldergrove (center of map, near buildings)
      if (scene.knight) {
        scene.knight.setPosition(2000, 2000);
        scene.knight.body.setVelocity(0, 0);
        scene.knight.clearTint();
        scene.knight.setAlpha(1);
        scene.knight.play('hero_idle', true);
      }
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
    <div className="w-full h-screen bg-black overflow-hidden">
      <GameMap
        playerState={playerState}
        setPlayerState={setPlayerState}
        sceneRef={sceneRef}
        addToBackpack={addToBackpack}
        inventoryOpen={inventoryOpen}
        setInventoryOpen={setInventoryOpen}
        chosenClass={chosenClass}
        savedData={savedDataRef.current}
        onPlayerDeath={onPlayerDeath}
        onOpenTrade={onOpenTrade}
        onZoneChange={onZoneChange}
      />
      {/* MiniMap now handled by Phaser camera — React MiniMap removed to avoid overlap */}
      <Inventory
        isOpen={inventoryOpen && screen === 'playing'}
        onClose={() => setInventoryOpen(false)}
        backpack={backpack}
        equipment={equipment}
        playerStats={playerStats}
        onEquipItem={handleEquipItem}
        onUnequipItem={handleUnequipItem}
        onConsumePotion={handleConsumePotion}
        gold={playerState.gold || 0}
      />
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
        />
      )}
    </div>
  );
}
