// ============================================================
// ENGINE: GAME STATE REDUCER
// ============================================================
import { CLASSES, computePlayerStats, getAvailableSkills } from '../data/classes.js';
import { ITEMS, SHOP_INVENTORY } from '../data/items.js';
import { CITIES } from '../data/cities.js';
import { getEnemyById, getEnemiesByCity, getBossesByCity, generateEnemyForBounty } from '../data/enemies.js';
import { MAIN_QUESTS, generateBounties, checkQuestObjective, isQuestComplete, getMainQuestForStage } from '../data/quests.js';
import { initCombat, playerAttack, playerSkill, playerUseItem, enemyTurn, getExpToNext, EXP_TABLE } from './combat.js';
import { saveGame, loadGame } from './saveSystem.js';

// ─── INITIAL STATE ────────────────────────────────────────
export const createInitialPlayer = (name, playerClass, difficulty) => {
  const cls = CLASSES[playerClass];
  const stats = computePlayerStats(playerClass, 1);
  const startingEq = cls.startingEquipment;

  return {
    name,
    class: playerClass,
    level: 1,
    exp: 0,
    expToNext: EXP_TABLE[0],
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    mana: stats.maxMana,
    maxMana: stats.maxMana,
    stats: {
      strength: stats.strength,
      agility: stats.agility,
      intelligence: stats.intelligence,
      endurance: stats.endurance,
    },
    inventory: [
      { id: 'health_potion_small', instanceId: `item_${Date.now()}_1` },
      { id: 'health_potion_small', instanceId: `item_${Date.now()}_2` },
      { id: 'mana_potion_small', instanceId: `item_${Date.now()}_3` },
    ],
    equipment: {
      weapon: startingEq.weapon || null,
      armor: startingEq.armor || null,
      helmet: null,
      ring: null,
      amulet: null,
    },
    gold: difficulty === 'hardcore' ? 50 : 100,
    statusEffects: [],
    skillCooldowns: {},
  };
};

export const createInitialGameState = () => ({
  screen: 'title',           // title | difficulty | character_creation | city | combat | world_map | shop | forge | inventory | quest_tracker | dialogue | bounty_board | game_over | victory
  player: null,
  difficulty: 'normal',
  currentCity: 'bastion',
  currentNPC: null,
  currentDialogueNode: 'greeting',
  combat: null,
  currentEnemy: null,
  shopCity: 'bastion',
  merchantGold: { bastion: 1000, iglieze: 1500, cytadela: 2000 },
  unlockedCities: ['bastion'],
  defeatedBosses: [],
  mainQuestStage: 0,
  activeMainQuest: null,
  completedQuests: [],
  activeBounties: [],
  collectedShards: [],
  gameCompleted: false,
  notifications: [],
  tutorialStep: 0,
  tutorialCompleted: false,
  lastSaveTime: null,
  pendingLevelUp: false,
});

// ─── HELPERS ──────────────────────────────────────────────
const addNotification = (state, message, type = 'info') => ({
  ...state,
  notifications: [
    ...state.notifications.slice(-4),
    { id: Date.now(), message, type },
  ],
});

const generateInstanceId = () => `item_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

const addItemToInventory = (inventory, itemId) => [
  ...inventory,
  { id: itemId, instanceId: generateInstanceId() },
];

const removeItemFromInventory = (inventory, instanceId) =>
  inventory.filter((i) => i.instanceId !== instanceId);

const applyLevelUp = (player) => {
  let p = { ...player };
  let leveled = false;
  const events = [];

  while (p.exp >= (EXP_TABLE[p.level - 1] || 99999)) {
    p.exp -= EXP_TABLE[p.level - 1];
    p.level += 1;
    leveled = true;

    const newStats = computePlayerStats(p.class, p.level);
    const hpGain = newStats.maxHp - p.maxHp;
    const manaGain = newStats.maxMana - p.maxMana;

    p = {
      ...p,
      maxHp: newStats.maxHp,
      maxMana: newStats.maxMana,
      hp: Math.min(p.hp + Math.floor(hpGain * 0.5), newStats.maxHp),
      mana: Math.min(p.mana + Math.floor(manaGain * 0.5), newStats.maxMana),
      stats: {
        strength: newStats.strength,
        agility: newStats.agility,
        intelligence: newStats.intelligence,
        endurance: newStats.endurance,
      },
      expToNext: EXP_TABLE[p.level - 1] || 99999,
    };
    events.push({ type: 'level_up', level: p.level });
  }
  p.expToNext = EXP_TABLE[p.level - 1] || 99999;
  return { player: p, leveled, events };
};

// ─── REDUCER ──────────────────────────────────────────────
export const gameReducer = (state, action) => {
  switch (action.type) {

    // ── NAVIGATION ─────────────────────────────────────────
    case 'GOTO_SCREEN':
      return { ...state, screen: action.screen };

    case 'SET_DIFFICULTY':
      return { ...state, difficulty: action.difficulty, screen: 'character_creation' };

    // ── CHARACTER CREATION ─────────────────────────────────
    case 'CREATE_CHARACTER': {
      const { name, playerClass } = action;
      const player = createInitialPlayer(name, playerClass, state.difficulty);
      const mainQuest = getMainQuestForStage(0);
      const savedState = {
        ...state,
        player,
        screen: 'city',
        currentCity: 'bastion',
        activeMainQuest: mainQuest,
        mainQuestStage: 0,
        activeBounties: generateBounties(1, 'bastion', 3),
        notifications: [{ id: Date.now(), message: `Witaj, ${name}! Twoja legenda się zaczyna.`, type: 'info' }],
        tutorialStep: 0,
        tutorialCompleted: false,
      };
      saveGame(savedState);
      return savedState;
    }

    // ── LOAD GAME ──────────────────────────────────────────
    case 'LOAD_GAME': {
      const save = loadGame();
      if (!save) return state;
      return {
        ...createInitialGameState(),
        ...save,
        screen: 'city',
        notifications: [{ id: Date.now(), message: 'Gra wczytana!', type: 'success' }],
        combat: null,
        currentNPC: null,
      };
    }

    // ── CITY NAVIGATION ────────────────────────────────────
    case 'TRAVEL_TO_CITY': {
      const { cityId } = action;
      const city = CITIES[cityId];
      if (!city) return state;
      if (!state.unlockedCities.includes(cityId)) {
        return addNotification(state, `${city.name} jest zablokowane.`, 'error');
      }

      // Check quest objective: visit_city
      let updatedMQ = state.activeMainQuest
        ? checkQuestObjective(state.activeMainQuest, { type: 'visit_city', cityId })
        : state.activeMainQuest;
      let updatedBounties = state.activeBounties;
      let updatedCompleted = state.completedQuests;
      let newStage = state.mainQuestStage;
      let newMQ = updatedMQ;
      let notifications = state.notifications;

      if (updatedMQ && isQuestComplete(updatedMQ)) {
        const result = completeMainQuest(state, updatedMQ);
        newStage = result.stage;
        newMQ = result.quest;
        updatedCompleted = result.completed;
        notifications = [...notifications, { id: Date.now(), message: `Misja ukończona: ${updatedMQ.title}!`, type: 'quest' }];
      }

      const newState = {
        ...state,
        currentCity: cityId,
        screen: 'city',
        activeMainQuest: newMQ,
        mainQuestStage: newStage,
        completedQuests: updatedCompleted,
        activeBounties: updatedBounties,
        notifications,
      };
      saveGame(newState);
      return newState;
    }

    // ── COMBAT ─────────────────────────────────────────────
    case 'START_COMBAT': {
      const { enemyId, isBoss } = action;
      const enemyBase = getEnemyById(enemyId);
      if (!enemyBase) return state;

      const combatState = initCombat(
        state.player,
        enemyBase,
        state.difficulty,
        ITEMS,
      );
      combatState.playerClass = state.player.class;
      combatState.playerEquipment = state.player.equipment;

      return {
        ...state,
        screen: 'combat',
        combat: combatState,
        currentEnemy: enemyBase,
      };
    }

    case 'COMBAT_PLAYER_ATTACK': {
      if (!state.combat || state.combat.phase !== 'player_turn') return state;
      const afterAttack = playerAttack(state.combat);
      if (afterAttack.phase === 'finished') {
        return handleCombatFinished(state, afterAttack);
      }
      const afterEnemy = enemyTurn(afterAttack);
      if (afterEnemy.phase === 'finished') {
        return handleCombatFinished(state, afterEnemy);
      }
      return { ...state, combat: afterEnemy };
    }

    case 'COMBAT_PLAYER_SKILL': {
      if (!state.combat || state.combat.phase !== 'player_turn') return state;
      const afterSkill = playerSkill(state.combat, action.skill);
      if (afterSkill.phase === 'finished') {
        return handleCombatFinished(state, afterSkill);
      }
      const afterEnemy = enemyTurn(afterSkill);
      if (afterEnemy.phase === 'finished') {
        return handleCombatFinished(state, afterEnemy);
      }
      return { ...state, combat: afterEnemy };
    }

    case 'COMBAT_USE_ITEM': {
      if (!state.combat || state.combat.phase !== 'player_turn') return state;
      const item = ITEMS[action.itemId];
      if (!item) return state;
      // Remove item from inventory first
      const instanceId = state.player.inventory.find((i) => i.id === action.itemId)?.instanceId;
      if (!instanceId) return state;
      const newInventory = removeItemFromInventory(state.player.inventory, instanceId);
      const updatedPlayer = { ...state.player, inventory: newInventory };
      const combatWithUpdatedPlayer = {
        ...state.combat,
        player: { ...state.combat.player, hp: state.combat.player.hp, mana: state.combat.player.mana },
      };
      const afterItem = playerUseItem(combatWithUpdatedPlayer, item);
      if (afterItem.phase === 'finished') {
        return handleCombatFinished({ ...state, player: updatedPlayer }, afterItem);
      }
      const afterEnemy = enemyTurn(afterItem);
      if (afterEnemy.phase === 'finished') {
        return handleCombatFinished({ ...state, player: updatedPlayer }, afterEnemy);
      }
      return { ...state, player: updatedPlayer, combat: afterEnemy };
    }

    case 'COMBAT_FLEE': {
      // 40% chance to flee
      const canFlee = Math.random() < 0.4;
      if (!state.combat) return state;
      if (canFlee) {
        const hpLoss = Math.floor(state.player.hp * 0.1);
        const player = { ...state.player, hp: Math.max(1, state.player.hp - hpLoss) };
        return addNotification(
          { ...state, screen: 'city', combat: null, player },
          `Uciekasz z walki, tracąc ${hpLoss} HP.`,
          'warning'
        );
      } else {
        // Failed flee — enemy attacks
        const afterEnemy = enemyTurn({ ...state.combat, phase: 'enemy_turn' });
        if (afterEnemy.phase === 'finished') {
          return handleCombatFinished(state, afterEnemy);
        }
        return addNotification(
          { ...state, combat: { ...afterEnemy, phase: 'player_turn' } },
          'Ucieczka nie powiodła się!',
          'error'
        );
      }
    }

    case 'RETURN_FROM_COMBAT':
      return {
        ...state,
        screen: 'city',
        combat: null,
        currentEnemy: null,
      };

    // ── SHOP ───────────────────────────────────────────────
    case 'OPEN_SHOP':
      return { ...state, screen: 'shop', shopCity: state.currentCity };

    case 'BUY_ITEM': {
      const item = ITEMS[action.itemId];
      if (!item) return state;
      if (state.player.gold < item.value) {
        return addNotification(state, 'Za mało złota!', 'error');
      }
      const newPlayer = {
        ...state.player,
        gold: state.player.gold - item.value,
        inventory: addItemToInventory(state.player.inventory, action.itemId),
      };
      const newState = { ...state, player: newPlayer };
      saveGame(newState);
      return addNotification(newState, `Kupiono: ${item.name}`, 'success');
    }

    case 'SELL_ITEM': {
      const instance = state.player.inventory.find((i) => i.instanceId === action.instanceId);
      if (!instance) return state;
      const item = ITEMS[instance.id];
      if (!item) return state;
      const sellPrice = Math.floor(item.value * 0.4);
      const city = state.currentCity;
      const merchantGold = state.merchantGold[city];

      if (merchantGold < sellPrice) {
        return addNotification(state, 'Kupiec nie ma już złota!', 'error');
      }

      const newMerchantGold = { ...state.merchantGold, [city]: merchantGold - sellPrice };
      const newPlayer = {
        ...state.player,
        gold: state.player.gold + sellPrice,
        inventory: removeItemFromInventory(state.player.inventory, action.instanceId),
      };
      const newState = { ...state, player: newPlayer, merchantGold: newMerchantGold };
      saveGame(newState);
      return addNotification(newState, `Sprzedano: ${item.name} za ${sellPrice} złota`, 'success');
    }

    // ── EQUIPMENT ──────────────────────────────────────────
    case 'EQUIP_ITEM': {
      const instance = state.player.inventory.find((i) => i.instanceId === action.instanceId);
      if (!instance) return state;
      const item = ITEMS[instance.id];
      if (!item || !item.slot) return state;

      const currentEquipped = state.player.equipment[item.slot];
      let newInventory = removeItemFromInventory(state.player.inventory, action.instanceId);

      // Unequip current item back to inventory
      if (currentEquipped) {
        newInventory = addItemToInventory(newInventory, currentEquipped);
      }

      const newPlayer = {
        ...state.player,
        equipment: { ...state.player.equipment, [item.slot]: instance.id },
        inventory: newInventory,
      };

      // Recompute maxHp/maxMana from equipment
      const eqBonus = computeEquipmentBonuses(newPlayer.equipment);
      const baseStats = computePlayerStats(newPlayer.class, newPlayer.level);
      newPlayer.maxHp = baseStats.maxHp + (eqBonus.hpBonus || 0);
      newPlayer.maxMana = baseStats.maxMana + (eqBonus.manaBonus || 0);
      newPlayer.hp = Math.min(newPlayer.hp, newPlayer.maxHp);
      newPlayer.mana = Math.min(newPlayer.mana, newPlayer.maxMana);

      const newState = { ...state, player: newPlayer };
      saveGame(newState);
      return addNotification(newState, `Założono: ${item.name}`, 'success');
    }

    case 'UNEQUIP_ITEM': {
      const { slot } = action;
      const itemId = state.player.equipment[slot];
      if (!itemId) return state;

      const newPlayer = {
        ...state.player,
        equipment: { ...state.player.equipment, [slot]: null },
        inventory: addItemToInventory(state.player.inventory, itemId),
      };
      const newState = { ...state, player: newPlayer };
      saveGame(newState);
      return addNotification(newState, `Zdjęto: ${ITEMS[itemId]?.name || itemId}`, 'info');
    }

    // ── FORGE ──────────────────────────────────────────────
    case 'OPEN_FORGE':
      return { ...state, screen: 'forge' };

    case 'CRAFT_ITEM': {
      const { recipe } = action;
      if (!recipe) return state;

      // Verify city
      if (state.currentCity !== 'cytadela') {
        return addNotification(state, 'Kuźnia dostępna tylko w Cytadeli!', 'error');
      }

      // Verify gold
      if (state.player.gold < recipe.goldCost) {
        return addNotification(state, `Potrzebujesz ${recipe.goldCost} złota!`, 'error');
      }

      // Verify ingredients
      let newInventory = [...state.player.inventory];
      for (const ing of recipe.ingredients) {
        let remaining = ing.qty;
        const toRemove = [];
        for (const invItem of newInventory) {
          if (invItem.id === ing.itemId && remaining > 0) {
            toRemove.push(invItem.instanceId);
            remaining--;
          }
        }
        if (remaining > 0) {
          const missing = ITEMS[ing.itemId]?.name || ing.itemId;
          return addNotification(state, `Brakuje: ${ing.qty}× ${missing}`, 'error');
        }
        newInventory = newInventory.filter((i) => !toRemove.includes(i.instanceId));
      }

      // Craft
      newInventory = addItemToInventory(newInventory, recipe.result);
      const resultItem = ITEMS[recipe.result];
      const newPlayer = {
        ...state.player,
        gold: state.player.gold - recipe.goldCost,
        inventory: newInventory,
      };
      const newState = { ...state, player: newPlayer };
      saveGame(newState);
      return addNotification(newState, `Wykuto: ${resultItem?.name || recipe.result}!`, 'divine');
    }

    // ── DIALOGUE ───────────────────────────────────────────
    case 'START_DIALOGUE': {
      const { npcId } = action;
      let newState = {
        ...state,
        screen: 'dialogue',
        currentNPC: npcId,
        currentDialogueNode: 'greeting',
      };

      // Check quest objective: talk
      if (state.activeMainQuest) {
        const updated = checkQuestObjective(state.activeMainQuest, { type: 'talk', npcId });
        newState.activeMainQuest = updated;
        if (isQuestComplete(updated)) {
          const result = completeMainQuest(state, updated);
          newState.mainQuestStage = result.stage;
          newState.activeMainQuest = result.quest;
          newState.completedQuests = result.completed;
          newState.unlockedCities = applyQuestRewards(state, updated).unlockedCities;
          newState.notifications = [
            ...state.notifications,
            { id: Date.now(), message: `Misja ukończona: ${updated.title}!`, type: 'quest' },
          ];
        }
      }
      return newState;
    }

    case 'ADVANCE_DIALOGUE': {
      const { nodeId, action: dialogueAction } = action;
      if (dialogueAction === 'close') {
        return { ...state, screen: 'city', currentNPC: null, currentDialogueNode: 'greeting' };
      }
      if (dialogueAction === 'open_shop') {
        return { ...state, screen: 'shop', shopCity: state.currentCity };
      }
      if (dialogueAction === 'open_forge') {
        return { ...state, screen: 'forge' };
      }
      if (dialogueAction === 'accept_quest_tutorial' || dialogueAction === 'start_main_quest') {
        return {
          ...state,
          screen: 'city',
          currentNPC: null,
          currentDialogueNode: 'greeting',
        };
      }
      if (dialogueAction === 'accept_quest_iglieze') {
        return {
          ...state,
          screen: 'city',
          currentNPC: null,
          currentDialogueNode: 'greeting',
        };
      }
      if (nodeId) {
        return { ...state, currentDialogueNode: nodeId };
      }
      return { ...state, screen: 'city', currentNPC: null };
    }

    // ── QUEST ──────────────────────────────────────────────
    case 'OPEN_QUEST_TRACKER':
      return { ...state, screen: 'quest_tracker' };

    case 'OPEN_BOUNTY_BOARD':
      return { ...state, screen: 'bounty_board' };

    case 'REFRESH_BOUNTIES': {
      if (state.player?.gold < 50) return addNotification(state, 'Za mało złota! Potrzebujesz 50.', 'error');
      const newBounties = generateBounties(state.player?.level || 1, state.currentCity, 3);
      return addNotification(
        { ...state, activeBounties: newBounties, player: { ...state.player, gold: state.player.gold - 50 } },
        'Tablica ogłoszeń odświeżona!',
        'info'
      );
    }

    case 'CLAIM_BOUNTY': {
      const bounty = (state.activeBounties ?? []).find((b) => b.id === action.bountyId);
      if (!bounty) return state;
      const allDone = (bounty.objectives ?? []).every((o) => o.progress >= o.required);
      if (!allDone) return addNotification(state, 'Zlecenie nie zostało jeszcze ukończone!', 'error');

      let newPlayer = { ...state.player };
      if (bounty.rewards?.gold) newPlayer.gold = (newPlayer.gold ?? 0) + bounty.rewards.gold;
      if (bounty.rewards?.exp) {
        newPlayer.exp = (newPlayer.exp ?? 0) + bounty.rewards.exp;
        const lvResult = applyLevelUp(newPlayer);
        newPlayer = lvResult.player;
      }

      const remaining = (state.activeBounties ?? []).filter((b) => b.id !== action.bountyId);
      const completed = [...(state.completedQuests ?? []), { ...bounty, completed: true }];

      return addNotification(
        { ...state, player: newPlayer, activeBounties: remaining, completedQuests: completed },
        `Zlecenie ukończone! +${bounty.rewards?.gold ?? 0} złota, +${bounty.rewards?.exp ?? 0} EXP`,
        'quest'
      );
    }

    // ── INVENTORY ──────────────────────────────────────────
    case 'OPEN_INVENTORY':
      return { ...state, screen: 'inventory' };

    case 'USE_ITEM_OUTSIDE_COMBAT': {
      // Support both instanceId and itemId lookups
      const instance = action.instanceId
        ? state.player.inventory.find((i) => i.instanceId === action.instanceId)
        : state.player.inventory.find((i) => i.id === action.itemId);
      if (!instance) return addNotification(state, 'Przedmiot nie znaleziony!', 'error');
      const item = ITEMS[instance.id];
      if (!item?.use) return addNotification(state, 'Nie można tego użyć tutaj!', 'error');

      let newPlayer = { ...state.player };
      const { type, value } = item.use;

      if (type === 'heal') {
        const healed = Math.min(value, newPlayer.maxHp - newPlayer.hp);
        newPlayer.hp = Math.min(newPlayer.hp + value, newPlayer.maxHp);
        newPlayer.inventory = removeItemFromInventory(newPlayer.inventory, action.instanceId);
        return addNotification({ ...state, player: newPlayer }, `Leczysz się za ${healed} HP.`, 'success');
      }
      if (type === 'mana') {
        const restored = Math.min(value, newPlayer.maxMana - newPlayer.mana);
        newPlayer.mana = Math.min(newPlayer.mana + value, newPlayer.maxMana);
        newPlayer.inventory = removeItemFromInventory(newPlayer.inventory, action.instanceId);
        return addNotification({ ...state, player: newPlayer }, `Odnawiasz ${restored} Many.`, 'success');
      }
      if (type === 'full_restore') {
        newPlayer.hp = newPlayer.maxHp;
        newPlayer.mana = newPlayer.maxMana;
        newPlayer.inventory = removeItemFromInventory(newPlayer.inventory, action.instanceId);
        return addNotification({ ...state, player: newPlayer }, 'Pełna regeneracja!', 'divine');
      }
      return addNotification(state, 'Tego nie można użyć poza walką.', 'error');
    }

    // ── WORLD MAP ──────────────────────────────────────────
    case 'OPEN_WORLD_MAP':
      return { ...state, screen: 'world_map' };

    // ── DISMISS NOTIFICATION ───────────────────────────────
    case 'DISMISS_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };

    // ── GAME OVER / RESET ─────────────────────────────────
    case 'GAME_OVER':
      if (state.difficulty === 'hardcore') {
        // Permadeath — delete save
        return { ...createInitialGameState(), screen: 'title' };
      }
      // Respawn with 30% HP in current city
      return {
        ...state,
        screen: 'city',
        player: {
          ...state.player,
          hp: Math.floor(state.player.maxHp * 0.3),
          statusEffects: [],
          skillCooldowns: {},
        },
        combat: null,
        notifications: [{ id: Date.now(), message: 'Poległeś... Budzisz się w mieście.', type: 'error' }],
      };

    case 'RESET_GAME':
      return { ...createInitialGameState(), screen: 'title' };

    default:
      return state;
  }
};

// ─── HELPERS ──────────────────────────────────────────────
const completeMainQuest = (state, quest) => {
  const nextStage = quest.nextStage;
  const nextQuest = getMainQuestForStage(nextStage);

  let unlockedCities = [...(state.unlockedCities || ['bastion'])];
  if (nextStage >= 2 && !unlockedCities.includes('iglieze')) unlockedCities.push('iglieze');
  if (nextStage >= 4 && !unlockedCities.includes('cytadela')) unlockedCities.push('cytadela');

  return {
    stage: nextStage,
    quest: nextQuest || null,
    completed: [...(state.completedQuests || []), quest.id],
    unlockedCities,
  };
};

const applyQuestRewards = (state, quest) => {
  let unlockedCities = [...(state.unlockedCities || ['bastion'])];
  if (quest.nextStage >= 2) unlockedCities = [...new Set([...unlockedCities, 'iglieze'])];
  if (quest.nextStage >= 4) unlockedCities = [...new Set([...unlockedCities, 'cytadela'])];
  return { unlockedCities };
};

const computeEquipmentBonuses = (equipment) => {
  const bonus = { hpBonus: 0, manaBonus: 0 };
  for (const itemId of Object.values(equipment)) {
    if (!itemId) continue;
    const item = ITEMS[itemId];
    if (!item?.stats) continue;
    if (item.stats.hpBonus) bonus.hpBonus += item.stats.hpBonus;
    if (item.stats.manaBonus) bonus.manaBonus += item.stats.manaBonus;
  }
  return bonus;
};

const handleCombatFinished = (state, combatResult) => {
  const { result, xpEarned, goldEarned, lootEarned } = combatResult;

  if (result === 'defeat') {
    if (state.difficulty === 'hardcore') {
      return {
        ...state,
        screen: 'game_over',
        combat: combatResult,
        player: { ...state.player, hp: 0 },
      };
    }
    return {
      ...state,
      screen: 'city',
      combat: combatResult,
      player: {
        ...state.player,
        hp: Math.floor(state.player.maxHp * 0.3),
        statusEffects: [],
        skillCooldowns: {},
      },
      notifications: [...state.notifications, { id: Date.now(), message: 'Poległeś... Budzisz się w mieście.', type: 'error' }],
    };
  }

  // Victory
  let newPlayer = {
    ...state.player,
    hp: combatResult.player.hp,
    mana: combatResult.player.mana,
    statusEffects: combatResult.player.statusEffects || [],
    skillCooldowns: combatResult.player.skillCooldowns || {},
    exp: state.player.exp + xpEarned,
    gold: state.player.gold + goldEarned,
  };

  // Add loot
  let newInventory = [...newPlayer.inventory];
  for (const itemId of lootEarned) {
    newInventory = addItemToInventory(newInventory, itemId);
  }
  newPlayer.inventory = newInventory;

  // Level up check
  const { player: leveledPlayer, leveled, events } = applyLevelUp(newPlayer);
  newPlayer = leveledPlayer;

  // Check quest objectives
  const enemyId = state.currentEnemy?.id;
  const isBoss = state.currentEnemy?.isBoss;
  let updatedMQ = state.activeMainQuest;
  let updatedBounties = state.activeBounties.map((b) => ({ ...b, objectives: [...b.objectives] }));
  let newStage = state.mainQuestStage;
  let newMQ = updatedMQ;
  let completedQ = state.completedQuests;
  let defeatedBosses = state.defeatedBosses;
  let collectedShards = state.collectedShards;
  let notifications = [...state.notifications];
  let unlockedCities = [...state.unlockedCities];

  // Normal combat objective
  if (updatedMQ) {
    updatedMQ = checkQuestObjective(updatedMQ, { type: 'combat_win', city: state.currentCity });
    if (isBoss && enemyId) {
      updatedMQ = checkQuestObjective(updatedMQ, { type: 'boss_kill', enemyId });
    }
    if (isQuestComplete(updatedMQ)) {
      const qResult = completeMainQuest(state, updatedMQ);
      newStage = qResult.stage;
      newMQ = qResult.quest;
      completedQ = qResult.completed;
      unlockedCities = qResult.unlockedCities;
      notifications.push({ id: Date.now() + 1, message: `Misja ukończona: ${updatedMQ.title}! Zdobyto ${updatedMQ.rewards?.exp || 0} EXP i ${updatedMQ.rewards?.gold || 0} złota.`, type: 'quest' });

      // Add quest rewards
      newPlayer.exp += updatedMQ.rewards?.exp || 0;
      newPlayer.gold += updatedMQ.rewards?.gold || 0;
      if (updatedMQ.rewards?.items) {
        for (const itemId of updatedMQ.rewards.items) {
          newPlayer.inventory = addItemToInventory(newPlayer.inventory, itemId);
        }
      }

      // Collect shards
      if (updatedMQ.shardReward) {
        collectedShards = [...collectedShards, updatedMQ.shardReward];
        notifications.push({ id: Date.now() + 2, message: `Odłamek Słońca zdobyty! (${collectedShards.length}/5)`, type: 'divine' });
      }
    } else {
      newMQ = updatedMQ;
    }
  }

  // Bounty update
  updatedBounties = updatedBounties.map((bounty) => {
    let updated = checkQuestObjective(bounty, { type: 'combat_win', city: state.currentCity });
    updated = checkQuestObjective(updated, { type: 'gold_earned', amount: goldEarned });
    if (isQuestComplete(updated) && !updated.completed) {
      notifications.push({ id: Date.now() + 3, message: `Zlecenie ukończone: ${bounty.title}!`, type: 'quest' });
      newPlayer.exp += bounty.rewards?.exp || 0;
      newPlayer.gold += bounty.rewards?.gold || 0;
      return { ...updated, completed: true };
    }
    return updated;
  });

  if (isBoss && enemyId) {
    defeatedBosses = [...defeatedBosses, enemyId];
    notifications.push({ id: Date.now() + 4, message: `Boss pokonany: ${state.currentEnemy.name}!`, type: 'legendary' });
  }

  if (leveled) {
    notifications.push({ id: Date.now() + 5, message: `AWANS! Poziom ${newPlayer.level}!`, type: 'level_up' });
    // Re-apply level up after quest bonuses
    const { player: finalPlayer } = applyLevelUp(newPlayer);
    newPlayer = finalPlayer;
  }

  // Check final boss
  let gameCompleted = state.gameCompleted;
  if (enemyId === 'the_endless_void') {
    gameCompleted = true;
    notifications.push({ id: Date.now() + 10, message: 'PUSTKA POKONANA! Świat jest uratowany!', type: 'divine' });
  }

  const newState = {
    ...state,
    player: newPlayer,
    screen: 'combat',
    combat: combatResult,
    activeMainQuest: newMQ,
    mainQuestStage: newStage,
    completedQuests: completedQ,
    activeBounties: updatedBounties,
    defeatedBosses,
    collectedShards,
    unlockedCities,
    notifications,
    gameCompleted,
  };

  saveGame(newState);
  return newState;
};
