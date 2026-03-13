// ============================================================
// ENGINE: TURN-BASED COMBAT SYSTEM
// ============================================================
import { CLASSES, getAttackDamage } from '../data/classes.js';

// ─── CONSTANTS ────────────────────────────────────────────
export const BASE_CRIT_CHANCE = 0.1;
export const BASE_CRIT_MULTIPLIER = 1.75;
export const BASE_DODGE_CHANCE = 0.05;

// ─── DIFFICULTY MULTIPLIERS ───────────────────────────────
const DIFFICULTY = {
  normal: { enemyDmgMult: 1.0, enemyHpMult: 1.0, expMult: 1.0, goldMult: 1.0 },
  hardcore: { enemyDmgMult: 1.25, enemyHpMult: 1.2, expMult: 1.3, goldMult: 1.5 },
  nightmare: { enemyDmgMult: 1.5, enemyHpMult: 1.4, expMult: 1.6, goldMult: 2.0 },
};

// ─── HELPERS ──────────────────────────────────────────────
export const rollChance = (chance) => Math.random() < chance;

export const randomBetween = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

const getEquipmentStats = (equipment, items) => {
  const stats = { attack: 0, defense: 0, intelligence: 0, agility: 0, strength: 0,
                  endurance: 0, manaBonus: 0, hpBonus: 0, critChance: 0, critDamage: 0,
                  dodgeBonus: 0, freezeChance: 0, skillCooldownReduction: 0 };
  for (const slot of Object.values(equipment)) {
    if (!slot) continue;
    const item = items[slot];
    if (!item || !item.stats) continue;
    for (const [k, v] of Object.entries(item.stats)) {
      if (k in stats) stats[k] += v;
    }
  }
  return stats;
};

// ─── DERIVE FULL COMBAT STATS FOR PLAYER ──────────────────
export const deriveCombatStats = (player, allItems) => {
  const eqStats = getEquipmentStats(player.equipment, allItems);
  const base = player.stats;
  const cls = CLASSES[player.class];

  const strength = base.strength + eqStats.strength;
  const agility = base.agility + eqStats.agility;
  const intelligence = base.intelligence + eqStats.intelligence;
  const endurance = base.endurance + eqStats.endurance;

  const attack = getAttackDamage({ ...player, stats: { strength, agility, intelligence } }) + eqStats.attack;
  const defense = Math.floor(endurance * 0.8 + eqStats.defense);
  const maxHp = player.maxHp + eqStats.hpBonus;
  const maxMana = player.maxMana + eqStats.manaBonus;
  const critChance = BASE_CRIT_CHANCE + eqStats.critChance;
  const critMultiplier = BASE_CRIT_MULTIPLIER + eqStats.critDamage;
  const dodgeChance = BASE_DODGE_CHANCE + eqStats.dodgeBonus + agility * 0.003;

  return { attack, defense, maxHp, maxMana, critChance, critMultiplier, dodgeChance,
           strength, agility, intelligence, endurance };
};

// ─── INIT COMBAT STATE ────────────────────────────────────
export const initCombat = (player, enemy, difficulty = 'normal', allItems = {}) => {
  const diff = DIFFICULTY[difficulty] || DIFFICULTY.normal;
  const playerStats = deriveCombatStats(player, allItems);

  const scaledEnemy = {
    ...enemy,
    hp: Math.floor(enemy.hp * diff.enemyHpMult),
    maxHp: Math.floor(enemy.maxHp * diff.enemyHpMult),
    attack: Math.floor(enemy.attack * diff.enemyDmgMult),
    defense: enemy.defense,
  };

  // Check for legendary armor passive — LastGodSlayer pendant etc
  const equipIds = Object.values(player.equipment).filter(Boolean);
  const hasSunbreakerPlate = equipIds.includes('sunbreaker_plate');
  const hasGodslayerPendant = equipIds.includes('godslayer_pendant');
  const hasVoidShroud = equipIds.includes('void_shroud');
  const hasGodsbane = equipIds.includes('godsbane');
  const hasEternalStaff = equipIds.includes('eternal_staff');
  const hasHelm = equipIds.includes('helm_of_the_fallen_sun');

  return {
    player: {
      hp: Math.min(player.hp, playerStats.maxHp),
      maxHp: playerStats.maxHp,
      mana: player.mana,
      maxMana: playerStats.maxMana,
      attack: playerStats.attack,
      defense: playerStats.defense,
      critChance: playerStats.critChance,
      critMultiplier: playerStats.critMultiplier,
      dodgeChance: playerStats.dodgeChance,
      statusEffects: [],
      skillCooldowns: {},
      buffs: {
        attackMult: 1.0,
        defenseMult: 1.0,
        shieldHp: 0,
        reflect: 0,
        fullDodge: false,
        nextAttackBonus: 0,
        guaranteedCrits: 0,
        lifestealNext: 0,
        silenced: false,
        frozen: false,
        stunned: false,
        regenPerTurn: hasSunbreakerPlate || hasVoidShroud ? 0 : 0,
        voidShroudAbsorb: hasVoidShroud ? 0.15 : 0,
        godsbaneActive: hasGodsbane,
        eternalStaffActive: hasEternalStaff,
        helmFreeSkillUsed: !hasHelm,
        godslayerPendantActive: hasGodslayerPendant,
      },
      passives: {
        lastStandUsed: false,
        reviveUsed: false,
        sunbreakerActive: hasSunbreakerPlate,
      },
    },
    enemy: {
      ...scaledEnemy,
      statusEffects: [],
      skillCooldowns: {},
      actionCooldown: 0,
      enraged: false,
      enrageSkillCooldown: 0,
      buffs: {
        attackMult: 1.0,
        defenseMult: 1.0,
        silenced: false,
        stunned: false,
        frozen: false,
      },
    },
    turn: 1,
    phase: 'player_turn', // 'player_turn' | 'enemy_turn' | 'finished'
    log: [],
    result: null,      // 'victory' | 'defeat'
    difficulty,
    difficultyMults: diff,
    xpEarned: 0,
    goldEarned: 0,
    lootEarned: [],
  };
};

// ─── PROCESS STATUS EFFECTS ───────────────────────────────
const processStatusEffects = (entity, entityName, log) => {
  const effects = [...(entity.statusEffects || [])];
  let totalDmg = 0;
  let totalHeal = 0;
  const remaining = [];

  for (const eff of effects) {
    if (eff.type === 'bleed' || eff.type === 'poison') {
      totalDmg += eff.damage;
      log.push({ type: 'dot', text: `${entityName} otrzymuje ${eff.damage} obrażeń od ${eff.type === 'bleed' ? 'Krwawienia' : 'Trucizny'}.`, value: eff.damage, effect: eff.type });
    }
    if (eff.type === 'regen') {
      totalHeal += eff.value;
      log.push({ type: 'heal', text: `${entityName} regeneruje ${eff.value} HP.`, value: eff.value });
    }
    const newDuration = eff.duration - 1;
    if (newDuration > 0) remaining.push({ ...eff, duration: newDuration });
  }

  return { dmg: totalDmg, heal: totalHeal, remaining };
};

// ─── APPLY DAMAGE ─────────────────────────────────────────
const applyDamage = (target, rawDmg, armorPenetration = 0, directHpPercent = 0) => {
  let dmg = rawDmg;

  if (directHpPercent > 0) {
    return Math.floor(target.maxHp * directHpPercent);
  }

  const effectiveDefense = Math.floor(target.defense * target.buffs.defenseMult * (1 - armorPenetration));
  dmg = Math.max(1, dmg - effectiveDefense);

  // Absorb (Void Shroud)
  if (target.buffs?.voidShroudAbsorb > 0) {
    const absorbed = Math.floor(dmg * target.buffs.voidShroudAbsorb);
    dmg = dmg - absorbed;
    // healed back — handled in combat consumer
  }

  return Math.max(1, dmg);
};

// ─── PLAYER NORMAL ATTACK ─────────────────────────────────
export const playerAttack = (state) => {
  if (state.phase !== 'player_turn') return state;

  const p = { ...state.player, buffs: { ...state.player.buffs } };
  const e = { ...state.enemy, buffs: { ...state.enemy.buffs } };
  const log = [...state.log];

  // Dodge check for enemy
  const enemyDodge = (e.agility || 8) * 0.003 + 0.02;
  if (rollChance(enemyDodge) && !e.buffs.stunned) {
    log.push({ type: 'miss', text: `${e.name} unika ataku!`, icon: '💨' });
    return finishPlayerTurn({ ...state, player: p, enemy: e, log });
  }

  let baseDmg = Math.floor(p.attack * p.buffs.attackMult);

  // Next attack bonus (Smoke Screen)
  if (p.buffs.nextAttackBonus > 0) {
    baseDmg = Math.floor(baseDmg * (1 + p.buffs.nextAttackBonus));
    p.buffs.nextAttackBonus = 0;
  }

  // Crit
  const critChance = p.buffs.guaranteedCrits > 0 ? 1.0 : p.critChance;
  const isCrit = rollChance(critChance);
  let finalDmg = isCrit ? Math.floor(baseDmg * p.critMultiplier) : baseDmg;

  // Godsbane bonus vs bosses
  if (p.buffs.godsbaneActive && e.isBoss) {
    finalDmg = Math.floor(finalDmg * 1.3);
  }

  // Godslayer pendant — skill armor ignore handled in skill attack
  if (p.buffs.guaranteedCrits > 0) p.buffs.guaranteedCrits--;

  const dmgDealt = applyDamage(e, finalDmg);

  // Ring of Endless Night — crit double hit
  if (isCrit && p.buffs.critDoubleHitChance && rollChance(0.25)) {
    const extraDmg = applyDamage(e, Math.floor(finalDmg * 0.6));
    e.hp = clamp(e.hp - extraDmg, 0, e.maxHp);
    log.push({ type: 'extra_hit', text: `Podwójne uderzenie! +${extraDmg} dodatkowe obrażenia!`, value: extraDmg });
  }

  // Reflect (Arcane Mirror)
  let reflectDmg = 0;
  if (e.buffs.reflect > 0) {
    reflectDmg = Math.floor(dmgDealt * e.buffs.reflect);
    p.hp = clamp(p.hp - reflectDmg, 0, p.maxHp);
    log.push({ type: 'reflect', text: `Odbicie: ${reflectDmg} obrażeń wraca do ciebie!`, value: reflectDmg });
  }

  e.hp = clamp(e.hp - dmgDealt, 0, e.maxHp);

  // Voidreaper passive — crit restores 8 mana
  const equippedWeapon = state.playerEquipment?.weapon;
  if (isCrit && equippedWeapon === 'voidreaper') {
    p.mana = clamp(p.mana + 8, 0, p.maxMana);
  }

  log.push({
    type: 'damage',
    text: isCrit
      ? `KRYTYK! Zadajesz ${dmgDealt} obrażeń!`
      : `Zadajesz ${dmgDealt} obrażeń.`,
    value: dmgDealt,
    isCrit,
    icon: isCrit ? '⚡' : '⚔️',
    target: 'enemy',
  });

  return finishPlayerTurn({ ...state, player: p, enemy: e, log });
};

// ─── PLAYER SKILL ATTACK ──────────────────────────────────
export const playerSkill = (state, skill) => {
  if (state.phase !== 'player_turn') return state;

  const p = { ...state.player, buffs: { ...state.player.buffs, statusEffects: [...(state.player.statusEffects || [])] } };
  const e = { ...state.enemy, buffs: { ...state.enemy.buffs }, statusEffects: [...(state.enemy.statusEffects || [])] };
  const log = [...state.log];

  if (p.buffs.silenced) {
    log.push({ type: 'fail', text: 'Jesteś uciszony! Nie możesz użyć zdolności.', icon: '🔇' });
    return state;
  }

  const cooldown = p.skillCooldowns[skill.id] || 0;
  if (cooldown > 0) {
    log.push({ type: 'fail', text: `${skill.name} jest na cooldownie (${cooldown} tur).`, icon: '⏳' });
    return state;
  }

  const manaCost = p.buffs.helmFreeSkillUsed === false ? 0 : (p.buffs.eternalStaffActive ? Math.floor(skill.manaCost * 0.6) : skill.manaCost);
  const isHelmFreeUse = !p.buffs.helmFreeSkillUsed;

  if (p.mana < manaCost && !isHelmFreeUse) {
    log.push({ type: 'fail', text: 'Za mało Many!', icon: '💙' });
    return state;
  }

  // Consume mana
  if (!isHelmFreeUse) {
    p.mana = clamp(p.mana - manaCost, 0, p.maxMana);
  } else {
    p.buffs.helmFreeSkillUsed = true;
  }

  // Set cooldown (with CDR from void_signet)
  const cdrReduction = state.playerEquipment?.ring === 'void_signet' ? 1 : 0;
  p.skillCooldowns = { ...p.skillCooldowns, [skill.id]: Math.max(0, skill.cooldown - cdrReduction) };

  log.push({ type: 'skill', text: `Używasz: ${skill.name}!`, icon: skill.icon || '✨' });

  let totalDmg = 0;

  // Handle each effect type
  for (const eff of (skill.effects || [])) {
    switch (eff.type) {
      case 'stun':
        if (rollChance(eff.chance)) {
          e.buffs.stunned = true;
          e.statusEffects.push({ type: 'stun', duration: eff.duration });
          log.push({ type: 'status', text: `${e.name} jest ogłuszony przez ${eff.duration} tur!`, icon: '💫' });
        }
        break;

      case 'bleed':
        if (rollChance(eff.chance)) {
          e.statusEffects.push({ type: 'bleed', damage: eff.damage, duration: eff.duration });
          log.push({ type: 'status', text: `${e.name} krwawi! ${eff.damage} obrażeń/tura przez ${eff.duration} tury.`, icon: '🩸' });
        }
        break;

      case 'poison':
        if (rollChance(eff.chance)) {
          e.statusEffects.push({ type: 'poison', damage: eff.damage, duration: eff.duration });
          log.push({ type: 'status', text: `${e.name} jest otruty! ${eff.damage} obrażeń/tura przez ${eff.duration} tury.`, icon: '☠️' });
        }
        break;

      case 'freeze':
        if (rollChance(eff.chance)) {
          e.buffs.frozen = true;
          e.statusEffects.push({ type: 'freeze', duration: eff.duration });
          log.push({ type: 'status', text: `${e.name} jest zamrożony na ${eff.duration} tur!`, icon: '❄️' });
        }
        break;

      case 'silence':
        if (rollChance(eff.chance)) {
          e.buffs.silenced = true;
          e.statusEffects.push({ type: 'silence', duration: eff.duration });
          log.push({ type: 'status', text: `${e.name} jest uciszony na ${eff.duration} tur!`, icon: '🔇' });
        }
        break;

      case 'self_buff':
        p.buffs.attackMult = p.buffs.attackMult * (1 + eff.value);
        p.statusEffects = [...(p.statusEffects || []), { type: 'self_buff', stat: eff.stat, originalMult: p.buffs.attackMult, value: eff.value, duration: eff.duration }];
        log.push({ type: 'buff', text: `Twój atak wzrasta o ${Math.round(eff.value * 100)}% przez ${eff.duration} tur.`, icon: '⬆️' });
        break;

      case 'enemy_debuff':
        if (eff.stat === 'attack') {
          e.buffs.attackMult = Math.max(0.2, e.buffs.attackMult + eff.value);
          e.statusEffects.push({ type: 'enemy_debuff', stat: 'attack', value: eff.value, duration: eff.duration });
          log.push({ type: 'debuff', text: `${e.name}: atak zmniejszony o ${Math.abs(Math.round(eff.value * 100))}%!`, icon: '⬇️' });
        }
        break;

      case 'reflect':
        p.buffs.reflect = eff.value;
        p.statusEffects = [...(p.statusEffects || []), { type: 'reflect', duration: eff.duration, value: eff.value }];
        log.push({ type: 'buff', text: `Tarczа refleksu aktywna — odbijasz ${Math.round(eff.value * 100)}% obrażeń przez ${eff.duration} tur.`, icon: '🪞' });
        break;

      case 'full_dodge':
        p.buffs.fullDodge = true;
        p.statusEffects = [...(p.statusEffects || []), { type: 'full_dodge', duration: eff.duration }];
        log.push({ type: 'buff', text: 'Zasłona dymu! Unikasz wszystkich ataków przez 1 turę.', icon: '💨' });
        break;

      case 'next_attack_bonus':
        p.buffs.nextAttackBonus = eff.value;
        log.push({ type: 'buff', text: `Następny atak zadaje +${Math.round(eff.value * 100)}% obrażeń.`, icon: '⚡' });
        break;

      case 'guaranteed_crit':
        p.buffs.guaranteedCrits = (p.buffs.guaranteedCrits || 0) + eff.attacks;
        log.push({ type: 'buff', text: `Następne ${eff.attacks} ataki są gwarantowanymi krytykami!`, icon: '🎯' });
        break;

      case 'shield':
        const shieldVal = Math.floor(e.buffs.intelligence * (eff.value || 0) * 2) || Math.floor(p.defense * (eff.value || 1));
        p.buffs.shieldHp = (p.buffs.shieldHp || 0) + (eff.scaleStat === 'intelligence' ? Math.floor((p.buffs.intelligence || 20) * eff.value) : shieldVal);
        log.push({ type: 'buff', text: `Tarcza absorpcji: ${p.buffs.shieldHp} HP.`, icon: '🛡️' });
        break;

      case 'lifesteal':
        // Will be applied post-damage
        p.buffs.lifestealNext = eff.value;
        break;

      case 'self_heal':
        const healAmount = Math.floor(p.maxHp * eff.value);
        p.hp = clamp(p.hp + healAmount, 0, p.maxHp);
        log.push({ type: 'heal', text: `Leczysz się za ${healAmount} HP!`, value: healAmount, icon: '💚' });
        break;

      case 'execute':
        if (e.hp / e.maxHp < eff.hpThreshold) {
          e.hp = 0;
          log.push({ type: 'execute', text: `ZABÓJSTWO! ${e.name} zostaje dobity!`, icon: '💀' });
        }
        break;

      case 'execute_bonus':
        // Handled in damage calc below
        break;

      case 'armor_penetration':
        // handled below
        break;

      case 'mana_drain':
        // for player skill — unlikely but handled
        break;

      case 'auto_crit_if_enemy_idle':
        // handled in damage calc
        break;

      default:
        break;
    }
  }

  // Deal damage if skill has multiplier
  if (skill.damageMultiplier > 0) {
    let baseDmg = Math.floor(p.attack * p.buffs.attackMult * skill.damageMultiplier);

    // Godslayer pendant: skill armor ignore
    const armorPen = (skill.effects || []).find((ef) => ef.type === 'armor_penetration')?.value || 0;
    const effectiveArmorPen = p.buffs.godslayerPendantActive ? Math.max(armorPen, 0.2) : armorPen;

    const isCrit = p.buffs.guaranteedCrits > 0 || rollChance(p.critChance);
    let finalDmg = isCrit ? Math.floor(baseDmg * p.critMultiplier) : baseDmg;

    // Execute bonus check
    const execBonus = (skill.effects || []).find((ef) => ef.type === 'execute_bonus');
    if (execBonus?.vsStatusEffect && e.statusEffects.length > 0) {
      finalDmg = Math.floor(finalDmg * (1 + execBonus.bonus));
    }

    // Godsbane bonus
    if (p.buffs.godsbaneActive) finalDmg = Math.floor(finalDmg * 1.2);
    if (p.buffs.eternalStaffActive) finalDmg = Math.floor(finalDmg * 1.2);

    const dmgDealt = applyDamage(e, finalDmg, effectiveArmorPen);
    e.hp = clamp(e.hp - dmgDealt, 0, e.maxHp);
    totalDmg = dmgDealt;

    // Lifesteal
    if (p.buffs.lifestealNext > 0) {
      const healed = Math.floor(dmgDealt * p.buffs.lifestealNext);
      p.hp = clamp(p.hp + healed, 0, p.maxHp);
      p.buffs.lifestealNext = 0;
      log.push({ type: 'heal', text: `Wysysasz ${healed} HP!`, value: healed, icon: '💜' });
    }

    // Eternal staff passive — crit heals 15% HP
    if (isCrit && p.buffs.eternalStaffActive) {
      const staffHeal = Math.floor(p.maxHp * 0.15);
      p.hp = clamp(p.hp + staffHeal, 0, p.maxHp);
      log.push({ type: 'heal', text: `Berło Wieczności leczy ${staffHeal} HP!`, value: staffHeal, icon: '✨' });
    }

    log.push({
      type: 'skill_damage',
      text: isCrit
        ? `KRYTYK! ${skill.name}: ${dmgDealt} obrażeń!`
        : `${skill.name}: ${dmgDealt} obrażeń.`,
      value: dmgDealt,
      isCrit,
      icon: skill.icon || '⚡',
      target: 'enemy',
    });
  }

  return finishPlayerTurn({ ...state, player: p, enemy: e, log });
};

// ─── PLAYER USE CONSUMABLE ────────────────────────────────
export const playerUseItem = (state, item) => {
  if (state.phase !== 'player_turn') return state;

  const p = { ...state.player, buffs: { ...state.player.buffs } };
  const log = [...state.log];

  if (!item.use) return state;
  const { type, value, effects: clearEffects, stat, duration } = item.use;

  switch (type) {
    case 'heal':
      const healAmt = Math.min(value, p.maxHp - p.hp);
      p.hp = clamp(p.hp + value, 0, p.maxHp);
      log.push({ type: 'heal', text: `Używasz ${item.name} — leczysz się za ${healAmt} HP.`, value: healAmt, icon: item.icon });
      break;
    case 'mana':
      const manaAmt = Math.min(value, p.maxMana - p.mana);
      p.mana = clamp(p.mana + value, 0, p.maxMana);
      log.push({ type: 'mana', text: `Używasz ${item.name} — odnawiasz ${manaAmt} Many.`, value: manaAmt, icon: item.icon });
      break;
    case 'cleanse':
      const before = (p.statusEffects || []).length;
      p.statusEffects = (p.statusEffects || []).filter((s) => !clearEffects.includes(s.type));
      const cleared = before - (p.statusEffects || []).length;
      log.push({ type: 'cleanse', text: `Używasz ${item.name} — usuwasz ${cleared} efektów statusu.`, icon: item.icon });
      break;
    case 'full_restore':
      p.hp = p.maxHp;
      p.mana = p.maxMana;
      p.statusEffects = [];
      log.push({ type: 'heal', text: `Używasz Ambrozję Bogów — pełna regeneracja HP i Many!`, icon: '✨' });
      break;
    case 'combat_buff':
      p.buffs.attackMult = p.buffs.attackMult * (1 + value);
      p.statusEffects = [...(p.statusEffects || []), { type: 'combat_buff', stat, value, duration }];
      log.push({ type: 'buff', text: `Używasz ${item.name} — ${stat} +${Math.round(value * 100)}% przez ${duration} tur!`, icon: item.icon });
      break;
    default:
      break;
  }

  return finishPlayerTurn({ ...state, player: p, log });
};

// ─── FINISH PLAYER TURN → CHECK ENEMY DEATH → ENEMY TURN ─
const finishPlayerTurn = (state) => {
  const e = state.enemy;

  // Check if enemy died
  if (e.hp <= 0) {
    return resolveVictory(state);
  }

  // Check for Enrage Phase
  let updatedEnemy = { ...e };
  if (
    e.isBoss &&
    !e.enraged &&
    e.enrageThreshold &&
    e.hp / e.maxHp <= e.enrageThreshold
  ) {
    updatedEnemy.enraged = true;
    updatedEnemy.buffs.attackMult *= e.enrageEffects?.attackMultiplier || 1.6;
    updatedEnemy.buffs.defenseMult *= e.enrageEffects?.defenseMultiplier || 0.8;
    const enrageLog = {
      type: 'enrage',
      text: e.dialogue?.enrage || `${e.name} wchodzi w FAZĘ WŚCIEKŁOŚCI!`,
      icon: '🔥',
    };
    return { ...state, enemy: updatedEnemy, log: [...state.log, enrageLog], phase: 'enemy_turn' };
  }

  return { ...state, enemy: updatedEnemy, phase: 'enemy_turn' };
};

// ─── ENEMY TURN ───────────────────────────────────────────
export const enemyTurn = (state) => {
  if (state.phase !== 'enemy_turn') return state;

  let p = { ...state.player, buffs: { ...state.player.buffs } };
  let e = { ...state.enemy, buffs: { ...state.enemy.buffs } };
  const log = [...state.log];

  // Process enemy status effects (dot damage)
  const enemyDotResult = processStatusEffects(e, e.name, log);
  e.hp = clamp(e.hp - enemyDotResult.dmg, 0, e.maxHp);
  e.statusEffects = enemyDotResult.remaining;

  // Remove expired stun/freeze/silence from enemy
  const removedBuffs = { stunned: false, frozen: false, silenced: false };
  for (const eff of (e.statusEffects || [])) {
    if (eff.type === 'stun' || eff.type === 'freeze') removedBuffs.stunned = true;
    if (eff.type === 'silence') removedBuffs.silenced = true;
  }
  e.buffs = { ...e.buffs, stunned: removedBuffs.stunned, frozen: removedBuffs.frozen, silenced: removedBuffs.silenced };

  // Check if enemy died from DoT
  if (e.hp <= 0) {
    return resolveVictory({ ...state, player: p, enemy: e, log });
  }

  // Enemy is stunned — loses turn
  if (e.buffs.stunned || e.buffs.frozen) {
    log.push({ type: 'skip', text: `${e.name} jest ogłuszony/zamrożony i traci turę!`, icon: '💫' });
    return finishEnemyTurn({ ...state, player: p, enemy: e, log });
  }

  // Player full dodge active
  if (p.buffs.fullDodge) {
    log.push({ type: 'dodge', text: `Unikasz ataku ${e.name} — zasłona dymu!`, icon: '💨' });
    p.buffs.fullDodge = false;
    return finishEnemyTurn({ ...state, player: p, enemy: e, log });
  }

  // Determine enemy action — skill or normal attack
  let chosenSkill = null;

  if (!e.buffs.silenced && e.skills && e.skills.length > 0) {
    // Try to use a skill based on cooldown availability
    const availableSkills = e.skills.filter((s) => {
      const cd = e.skillCooldowns?.[s.name] || 0;
      return cd <= 0;
    });

    // Boss enrage special attack
    if (e.enraged && e.enrageEffects?.specialAttack) {
      const ecd = e.enrageSkillCooldown || 0;
      if (ecd <= 0) {
        chosenSkill = {
          ...e.enrageEffects.specialAttack,
          name: e.enrageEffects.specialAttack.name,
          isEnrageSkill: true,
        };
        e.enrageSkillCooldown = e.enrageEffects.specialAttack.cooldown || 3;
      }
    }

    if (!chosenSkill && availableSkills.length > 0 && rollChance(0.45)) {
      chosenSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];
      e.skillCooldowns = { ...e.skillCooldowns, [chosenSkill.name]: chosenSkill.cooldown || 3 };
    }
  }

  // Reduce enrage skill cooldown
  if (e.enrageSkillCooldown > 0 && !chosenSkill?.isEnrageSkill) {
    e.enrageSkillCooldown--;
  }
  // Reduce regular skill cooldowns
  const newSkillCooldowns = { ...e.skillCooldowns };
  for (const key of Object.keys(newSkillCooldowns)) {
    if (newSkillCooldowns[key] > 0) newSkillCooldowns[key]--;
  }
  e.skillCooldowns = newSkillCooldowns;

  // Compute damage
  let rawDmg = Math.floor(e.attack * e.buffs.attackMult);
  let armorPen = 0;
  let directHpPercent = 0;

  if (chosenSkill) {
    rawDmg = Math.floor(rawDmg * (chosenSkill.damageMultiplier || 1));
    armorPen = chosenSkill.armorPenetration || 0;
    directHpPercent = chosenSkill.directHpPercent || 0;
    log.push({ type: 'enemy_skill', text: `${e.name} używa: ${chosenSkill.name}!`, icon: '⚔️' });

    // Apply skill effects on player
    for (const eff of (chosenSkill.effects || [])) {
      if (eff.type === 'stun' && rollChance(eff.chance || 0.4)) {
        p.statusEffects = [...(p.statusEffects || []), { type: 'stun', duration: eff.duration }];
        p.buffs.stunned = true;
        log.push({ type: 'status', text: 'Jesteś ogłuszony!', icon: '💫' });
      }
      if (eff.type === 'bleed' && rollChance(eff.chance || 0.4)) {
        p.statusEffects = [...(p.statusEffects || []), { type: 'bleed', damage: eff.damage, duration: eff.duration }];
        log.push({ type: 'status', text: `Krwawisz! ${eff.damage}/tura przez ${eff.duration} tur.`, icon: '🩸' });
      }
      if (eff.type === 'poison' && rollChance(eff.chance || 0.4)) {
        p.statusEffects = [...(p.statusEffects || []), { type: 'poison', damage: eff.damage, duration: eff.duration }];
        log.push({ type: 'status', text: `Jesteś otruty! ${eff.damage}/tura przez ${eff.duration} tur.`, icon: '☠️' });
      }
      if (eff.type === 'silence' && rollChance(eff.chance || 0.4)) {
        p.statusEffects = [...(p.statusEffects || []), { type: 'silence', duration: eff.duration }];
        p.buffs.silenced = true;
        log.push({ type: 'status', text: 'Jesteś uciszony! Nie możesz używać zdolności.', icon: '🔇' });
      }
      if (eff.type === 'blind') {
        p.statusEffects = [...(p.statusEffects || []), { type: 'blind', duration: eff.duration, accuracy: eff.accuracy }];
        log.push({ type: 'status', text: `Jesteś oślepiony! Celność -${Math.abs(Math.round(eff.accuracy * 100))}%`, icon: '🌑' });
      }
      if (eff.type === 'self_heal_flat') {
        e.hp = clamp(e.hp + eff.value, 0, e.maxHp);
        log.push({ type: 'enemy_heal', text: `${e.name} leczy się za ${eff.value} HP!`, value: eff.value, icon: '💚' });
      }
      if (eff.type === 'self_buff') {
        e.buffs.attackMult *= (1 + eff.value);
        log.push({ type: 'enemy_buff', text: `${e.name} wzmacnia się!`, icon: '⬆️' });
      }
      if (eff.type === 'mana_drain') {
        const drained = Math.min(eff.value, p.mana);
        p.mana = clamp(p.mana - drained, 0, p.maxMana);
        log.push({ type: 'mana_drain', text: `${e.name} wysysa ${drained} Many!`, icon: '💙' });
      }
    }
  }

  // Skip damage if it was a pure buff/heal skill
  if (!chosenSkill || (chosenSkill.damageMultiplier > 0 || chosenSkill.directHpPercent > 0)) {
    // Player evasion
    const playerDodge = p.dodgeChance;
    const blindPenalty = (p.statusEffects || []).find((s) => s.type === 'blind')?.accuracy || 0;
    if (chosenSkill?.damageMultiplier === 0 && !chosenSkill?.directHpPercent) {
      // pure effect skill — no damage
    } else if (rollChance(playerDodge)) {
      log.push({ type: 'dodge', text: 'Unikasz ataku!', icon: '💨' });
    } else {
      // Reflect
      if (p.buffs.reflect > 0) {
        const reflectDmg = Math.floor(rawDmg * p.buffs.reflect);
        e.hp = clamp(e.hp - reflectDmg, 0, e.maxHp);
        log.push({ type: 'reflect', text: `Odbicie! ${reflectDmg} obrażeń wraca do ${e.name}!`, icon: '🪞' });
        rawDmg = Math.floor(rawDmg * (1 - p.buffs.reflect));
      }

      // Shield absorption
      let finalReceivedDmg;
      if (directHpPercent > 0) {
        finalReceivedDmg = Math.floor(p.maxHp * directHpPercent);
      } else {
        finalReceivedDmg = applyDamage(p, rawDmg, armorPen);
      }

      if (p.buffs.shieldHp > 0) {
        const absorbed = Math.min(p.buffs.shieldHp, finalReceivedDmg);
        finalReceivedDmg -= absorbed;
        p.buffs.shieldHp -= absorbed;
        log.push({ type: 'shield', text: `Tarcza pochłania ${absorbed} obrażeń! (${p.buffs.shieldHp} pozostało)`, icon: '🛡️' });
      }

      // Void Shroud absorb-heal
      if (p.buffs.voidShroudAbsorb > 0) {
        const absorbedHeal = Math.floor(finalReceivedDmg * p.buffs.voidShroudAbsorb);
        p.hp = clamp(p.hp + absorbedHeal, 0, p.maxHp);
        finalReceivedDmg = Math.floor(finalReceivedDmg * (1 - p.buffs.voidShroudAbsorb));
      }

      p.hp = clamp(p.hp - finalReceivedDmg, 0, p.maxHp);

      log.push({
        type: 'damage',
        text: `${e.name} zadaje ci ${finalReceivedDmg} obrażeń!`,
        value: finalReceivedDmg,
        icon: '🩸',
        target: 'player',
      });

      // Check Last Stand (Warrior passive)
      if (
        state.playerClass === 'warrior' &&
        !p.passives.lastStandUsed &&
        p.hp / p.maxHp < 0.3 &&
        p.hp > 0
      ) {
        p.buffs.damageAbsorb = 0.5;
        p.statusEffects = [...(p.statusEffects || []), { type: 'damage_absorb', value: 0.5, duration: 2 }];
        p.passives.lastStandUsed = true;
        log.push({ type: 'passive', text: 'OSTATNI BASTION! Absorbujesz 50% obrażeń przez 2 tury!', icon: '🔥' });
      }

      // Sunbreaker plate regen when hp < 50%
      if (p.passives.sunbreakerActive && p.hp / p.maxHp < 0.5) {
        p.hp = clamp(p.hp + 12, 0, p.maxHp);
        log.push({ type: 'passive', text: 'Pancerz Łamacza Słońca: +12 HP regeneracji!', icon: '⬆️' });
      }
    }
  }

  // Check player death — Paladin Revive passive
  if (p.hp <= 0) {
    if (state.playerClass === 'paladin' && !p.passives.reviveUsed) {
      const reviveHp = Math.floor(p.maxHp * 0.4);
      p.hp = reviveHp;
      p.passives.reviveUsed = true;
      log.push({ type: 'passive', text: `ZMARTWYCHWSTANIE! Wracasz z ${reviveHp} HP!`, icon: '✨' });
    } else {
      return resolveDefeat({ ...state, player: p, enemy: e, log });
    }
  }

  return finishEnemyTurn({ ...state, player: p, enemy: e, log });
};

// ─── FINISH ENEMY TURN → ADVANCE TURN ─────────────────────
const finishEnemyTurn = (state) => {
  let p = { ...state.player, buffs: { ...state.player.buffs } };
  const e = { ...state.enemy };

  // Process player status effects at end of round
  const playerDotResult = processStatusEffects(p, 'Ty', state.log);
  const newLog = [...state.log, ...playerDotResult.dmg > 0 || playerDotResult.heal > 0 ? [] : []];
  p.hp = clamp(p.hp - playerDotResult.dmg + playerDotResult.heal, 0, p.maxHp);
  p.statusEffects = playerDotResult.remaining;

  if (p.hp <= 0) {
    if (state.playerClass === 'paladin' && !p.passives.reviveUsed) {
      const reviveHp = Math.floor(p.maxHp * 0.4);
      p.hp = reviveHp;
      p.passives.reviveUsed = true;
    } else {
      return resolveDefeat({ ...state, player: p, enemy: e, log: newLog });
    }
  }

  // Decrease player skill cooldowns
  const newCooldowns = { ...p.skillCooldowns };
  for (const key of Object.keys(newCooldowns)) {
    if (newCooldowns[key] > 0) newCooldowns[key]--;
  }
  p.skillCooldowns = newCooldowns;

  // Expire buffs — reflect
  const reflectEff = (p.statusEffects || []).find((s) => s.type === 'reflect');
  if (!reflectEff) p.buffs.reflect = 0;

  // Mana regen (small)
  const manaRegen = state.playerClass === 'mage' ? 8 : 3;
  p.mana = clamp(p.mana + manaRegen, 0, p.maxMana);

  return { ...state, player: p, enemy: e, log: newLog, turn: state.turn + 1, phase: 'player_turn' };
};

// ─── RESOLVE VICTORY ──────────────────────────────────────
const resolveVictory = (state) => {
  const e = state.enemy;
  const diff = state.difficultyMults;
  const log = [...state.log];

  const xp = Math.floor(e.expReward * diff.expMult);
  const gold = Math.floor(randomBetween(e.goldReward[0], e.goldReward[1]) * diff.goldMult);

  const loot = [];
  for (const drop of (e.loot || [])) {
    if (rollChance(drop.chance)) {
      loot.push(drop.itemId);
    }
  }

  log.push({ type: 'victory', text: `Zwycięstwo! +${xp} EXP, +${gold} złota.`, icon: '🏆' });
  if (loot.length > 0) {
    log.push({ type: 'loot', text: `Łup: ${loot.length} przedmioty!`, icon: '💎' });
  }

  return { ...state, phase: 'finished', result: 'victory', log, xpEarned: xp, goldEarned: gold, lootEarned: loot };
};

// ─── RESOLVE DEFEAT ────────────────────────────────────────
const resolveDefeat = (state) => {
  const log = [...state.log, { type: 'defeat', text: 'Poległeś... Powracasz do miasta.', icon: '💀' }];
  return { ...state, phase: 'finished', result: 'defeat', log };
};

// ─── EXPÉRIENCE & LEVEL UP ─────────────────────────────────
export const EXP_TABLE = Array.from({ length: 30 }, (_, i) => Math.floor(100 * Math.pow(1.35, i)));

export const checkLevelUp = (player) => {
  const updates = { ...player };
  let leveled = false;
  while (updates.exp >= EXP_TABLE[updates.level - 1]) {
    updates.exp -= EXP_TABLE[updates.level - 1];
    updates.level++;
    leveled = true;

    // Stat recomputation handled in gameReducer.js::applyLevelUp()
  }
  return { player: updates, leveled };
};

export const getExpToNext = (level) => EXP_TABLE[Math.min(level - 1, EXP_TABLE.length - 1)];
