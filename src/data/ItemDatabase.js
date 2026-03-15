/* ═══════════════════════════════════════════════════════════════
   ITEM DATABASE — Diablo 4 style items with CraftPix icons
   ═══════════════════════════════════════════════════════════════ */

/* ── Asset paths ──────────────────────────────────────────── */
const A = 'assets/sprites';
const DAGGERS  = `${A}/craftpix-453751-free-game-icons-of-fantasy-daggers-pack-2/daggers/PNG`;
const MAGE_OUT = `${A}/craftpix-481272-free-game-icons-of-fantasy-mage-outfit-pack-7/Free-Game-Icons-of-Fantasy-Mage-Outfit-Pack-7/PNG`;
const KNIGHT   = `${A}/craftpix-591319-free-game-icons-of-fantasy-knight-armor-pack-11/Free-Game-Icons-of-Fantasy-Knight-Armor-Pack-11/PNG`;
const POTIONS  = `${A}/craftpix-net-128598-free-magic-potions-pixel-art-icons/PNG/Transperent`;
const BELTS    = `${A}/craftpix-net-872324-free-belt-rpg-pixel-art-icons/PNG/Transperent`;
const SHIELDS  = `${A}/craftpix-net-883583-free-shield-and-amulet-rpg-icons/PNG/Transperent`;
const BOWS     = `${A}/craftpix-net-996288-free-bow-and-crossbow-pixel-art-icons/PNG/Transperent`;

/* ── Rarity definitions ───────────────────────────────────── */
export const RARITIES = {
  common:    { color: '#9d9d9d', label: 'Pospolity',    weight: 60 },
  magic:     { color: '#4488ff', label: 'Magiczny',     weight: 25 },
  rare:      { color: '#ffdd44', label: 'Rzadki',       weight: 12 },
  legendary: { color: '#ff8800', label: 'Legendarny',   weight: 3  },
  mythic:    { color: '#ff44ff', label: 'Mityczny',     weight: 0  },
};

/* Mob-only weights (no legendary/mythic) */
export const MOB_WEIGHTS = { common: 60, magic: 28, rare: 12 };

/* ── Slot definitions ─────────────────────────────────────── */
export const SLOT_LABELS = {
  head:     'Hełm',
  torso:    'Napierśnik',
  legs:     'Spodnie',
  feet:     'Buty',
  mainHand: 'Broń 1',
  offHand:  'Broń 2',
  hands:    'Pas',
  neck:     'Amulet 1',
  ring1:    'Amulet 2',
};

/* Which slots an item type can go in */
export const TYPE_TO_SLOTS = {
  weapon:  ['mainHand', 'offHand'],
  dagger:  ['mainHand', 'offHand'],
  bow:     ['mainHand'],
  armor:   ['torso'],
  helmet:  ['head'],
  pants:   ['legs'],
  boots:   ['feet'],
  belt:    ['hands'],
  shield:  ['offHand'],
  amulet:  ['neck'],
  ring:    ['ring1'],
  potion:  [],
};

/* ── Class restrictions — which types each class CAN use ──── */
export const CLASS_ALLOWED_TYPES = {
  warrior: ['weapon', 'shield', 'armor', 'helmet', 'pants', 'boots', 'belt', 'amulet', 'ring', 'potion'],
  mage:    ['weapon', 'bow', 'armor', 'helmet', 'pants', 'boots', 'belt', 'amulet', 'ring', 'potion'],
  rogue:   ['dagger', 'bow', 'armor', 'helmet', 'pants', 'boots', 'belt', 'amulet', 'ring', 'potion'],
};

/** Check if a class can equip an item */
export function canClassEquip(classId, item) {
  if (!item || !classId) return true;
  const allowed = CLASS_ALLOWED_TYPES[classId];
  if (!allowed) return true;
  return allowed.includes(item.type);
}

/* ═══════════════════════════════════════════════════════════════
   FULL ITEM DATABASE
   ═══════════════════════════════════════════════════════════════ */
export const ITEM_DB = [
  /* ══════════ WEAPONS — Daggers ══════════════════════════════ */
  { id: 'dagger_rusty',    name: 'Zardzewiały Sztylet',   type: 'dagger', slot: 'mainHand', rarity: 'common',    icon: `${DAGGERS}/daggers (1).png`, dmg: 6 },
  { id: 'dagger_iron',     name: 'Żelazny Sztylet',       type: 'dagger', slot: 'mainHand', rarity: 'common',    icon: `${DAGGERS}/daggers (2).png`, dmg: 9 },
  { id: 'dagger_enchanted',name: 'Zaczarowany Sztylet',   type: 'dagger', slot: 'mainHand', rarity: 'magic',     icon: `${DAGGERS}/daggers (3).png`, dmg: 14, dex: 3 },
  { id: 'dagger_frost',    name: 'Sztylet Mrozu',         type: 'dagger', slot: 'mainHand', rarity: 'magic',     icon: `${DAGGERS}/daggers (4).png`, dmg: 12, int: 2, dex: 2 },
  { id: 'dagger_venom',    name: 'Jadowity Sztylet',      type: 'dagger', slot: 'mainHand', rarity: 'rare',      icon: `${DAGGERS}/daggers (5).png`, dmg: 20, dex: 5, critChance: 0.05 },
  { id: 'dagger_shadow',   name: 'Sztylet Cienia',        type: 'dagger', slot: 'mainHand', rarity: 'rare',      icon: `${DAGGERS}/daggers (6).png`, dmg: 22, str: 3, dex: 4, critChance: 0.04 },
  { id: 'dagger_blood',    name: 'Krwawy Sztylet',        type: 'dagger', slot: 'mainHand', rarity: 'legendary', icon: `${DAGGERS}/daggers (7).png`, dmg: 32, str: 6, dex: 8, critChance: 0.08 },
  { id: 'dagger_void',     name: 'Sztylet Pustki',        type: 'dagger', slot: 'mainHand', rarity: 'legendary', icon: `${DAGGERS}/daggers (8).png`, dmg: 36, int: 5, dex: 6, critChance: 0.07 },
  { id: 'dagger_godslayer',name: 'Bożobójca',             type: 'dagger', slot: 'mainHand', rarity: 'mythic',    icon: `${DAGGERS}/daggers (9).png`, dmg: 55, str: 10, dex: 14, critChance: 0.12 },
  { id: 'dagger_eternity', name: 'Ostrze Wieczności',     type: 'dagger', slot: 'mainHand', rarity: 'mythic',    icon: `${DAGGERS}/daggers (10).png`, dmg: 60, int: 12, dex: 10, will: 8, critChance: 0.10 },

  /* ══════════ WEAPONS — Bows ═════════════════════════════════ */
  { id: 'bow_short',    name: 'Krótki Łuk',          type: 'bow', slot: 'mainHand', rarity: 'common',    icon: `${BOWS}/Icon1.png`, dmg: 7, dex: 1 },
  { id: 'bow_hunting',  name: 'Łuk Myśliwski',       type: 'bow', slot: 'mainHand', rarity: 'common',    icon: `${BOWS}/Icon2.png`, dmg: 10 },
  { id: 'bow_elven',    name: 'Elfi Łuk',            type: 'bow', slot: 'mainHand', rarity: 'magic',     icon: `${BOWS}/Icon5.png`, dmg: 16, dex: 4, critChance: 0.03 },
  { id: 'bow_flame',    name: 'Łuk Płomieni',        type: 'bow', slot: 'mainHand', rarity: 'magic',     icon: `${BOWS}/Icon8.png`, dmg: 18, str: 2, int: 3 },
  { id: 'bow_dragon',   name: 'Smocży Łuk',          type: 'bow', slot: 'mainHand', rarity: 'rare',      icon: `${BOWS}/Icon12.png`, dmg: 26, dex: 6, critChance: 0.06 },
  { id: 'bow_shadow',   name: 'Łuk Cienia',          type: 'bow', slot: 'mainHand', rarity: 'rare',      icon: `${BOWS}/Icon15.png`, dmg: 24, dex: 5, will: 3, critChance: 0.05 },
  { id: 'bow_doom',     name: 'Łuk Zagłady',         type: 'bow', slot: 'mainHand', rarity: 'legendary', icon: `${BOWS}/Icon20.png`, dmg: 38, dex: 8, str: 5, critChance: 0.09 },
  { id: 'bow_celestial',name: 'Niebiański Łuk',      type: 'bow', slot: 'mainHand', rarity: 'mythic',    icon: `${BOWS}/Icon25.png`, dmg: 58, dex: 14, critChance: 0.14 },

  /* ══════════ WEAPON — Swords (emoji placeholders) ══════════ */
  { id: 'sword_rusty',   name: 'Zardzewiały Miecz',    type: 'weapon', slot: 'mainHand', rarity: 'common',    icon: null, dmg: 5 },
  { id: 'sword_iron',    name: 'Żelazny Topór',        type: 'weapon', slot: 'mainHand', rarity: 'common',    icon: null, dmg: 8 },
  { id: 'sword_enchant', name: 'Zaczarowane Ostrze',   type: 'weapon', slot: 'mainHand', rarity: 'magic',     icon: null, dmg: 14, str: 2 },
  { id: 'sword_frost',   name: 'Sztylet Mroźni',       type: 'weapon', slot: 'mainHand', rarity: 'magic',     icon: null, dmg: 12, dex: 3 },
  { id: 'sword_blood',   name: 'Krwawnik',             type: 'weapon', slot: 'mainHand', rarity: 'rare',      icon: null, dmg: 22, str: 5, critChance: 0.04 },
  { id: 'sword_void',    name: 'Rozszczepiciel',       type: 'weapon', slot: 'mainHand', rarity: 'rare',      icon: null, dmg: 20, int: 4, will: 3 },
  { id: 'sword_hell',    name: 'Piekielny Żniwiarz',   type: 'weapon', slot: 'mainHand', rarity: 'legendary', icon: null, dmg: 35, str: 8, critChance: 0.08 },
  { id: 'sword_demon',   name: 'Pogromca Demonów',     type: 'weapon', slot: 'mainHand', rarity: 'legendary', icon: null, dmg: 40, str: 6, dex: 4, critChance: 0.06 },
  { id: 'sword_gods',    name: 'Boża Kara',            type: 'weapon', slot: 'mainHand', rarity: 'mythic',    icon: null, dmg: 62, str: 14, critChance: 0.13 },

  /* ══════════ HELMETS — Knight Armor Pack ════════════════════ */
  { id: 'helm_leather',  name: 'Skórzany Kaptur',       type: 'helmet', slot: 'head', rarity: 'common',    icon: `${KNIGHT}/1.png`, def: 2 },
  { id: 'helm_chain',    name: 'Kolczuży Hełm',         type: 'helmet', slot: 'head', rarity: 'common',    icon: `${KNIGHT}/2.png`, def: 4 },
  { id: 'helm_iron',     name: 'Żelazny Hełm',          type: 'helmet', slot: 'head', rarity: 'magic',     icon: `${KNIGHT}/3.png`, def: 7, str: 2 },
  { id: 'helm_knight',   name: 'Hełm Rycerski',         type: 'helmet', slot: 'head', rarity: 'rare',      icon: `${KNIGHT}/4.png`, def: 12, str: 4, will: 2 },
  { id: 'helm_doom',     name: 'Korona Zagłady',        type: 'helmet', slot: 'head', rarity: 'legendary', icon: `${KNIGHT}/5.png`, def: 20, str: 6, int: 4, critChance: 0.04 },

  /* ══════════ CHEST ARMOR — Knight + Mage ═══════════════════ */
  { id: 'chest_leather',  name: 'Skórzana Kamizelka',    type: 'armor', slot: 'torso', rarity: 'common',    icon: `${KNIGHT}/6.png`, def: 3 },
  { id: 'chest_chain',    name: 'Kolczuga',              type: 'armor', slot: 'torso', rarity: 'magic',     icon: `${KNIGHT}/7.png`, def: 8, str: 2 },
  { id: 'chest_plate',    name: 'Zbroja Płytowa',        type: 'armor', slot: 'torso', rarity: 'rare',      icon: `${KNIGHT}/8.png`, def: 15, str: 4, dex: 2 },
  { id: 'chest_shadow',   name: 'Pancerz Cienia',        type: 'armor', slot: 'torso', rarity: 'legendary', icon: `${KNIGHT}/9.png`, def: 24, str: 6, will: 5 },
  { id: 'chest_titan',    name: 'Zbroja Tytana',         type: 'armor', slot: 'torso', rarity: 'legendary', icon: `${KNIGHT}/10.png`, def: 28, str: 8, dex: 3 },
  { id: 'chest_god',      name: 'Szata Upadłego Boga',  type: 'armor', slot: 'torso', rarity: 'mythic',    icon: `${MAGE_OUT}/1.png`, def: 45, str: 14, will: 10, dex: 6 },
  { id: 'chest_mage1',    name: 'Szata Adepta',          type: 'armor', slot: 'torso', rarity: 'common',    icon: `${MAGE_OUT}/2.png`, def: 2, int: 2 },
  { id: 'chest_mage2',    name: 'Szata Mag. Ognia',      type: 'armor', slot: 'torso', rarity: 'magic',     icon: `${MAGE_OUT}/3.png`, def: 5, int: 4 },
  { id: 'chest_mage3',    name: 'Szata Arcymaga',        type: 'armor', slot: 'torso', rarity: 'rare',      icon: `${MAGE_OUT}/4.png`, def: 12, int: 6, will: 4 },
  { id: 'chest_warlock',  name: 'Szata Czarnoksiężnika', type: 'armor', slot: 'torso', rarity: 'legendary', icon: `${MAGE_OUT}/5.png`, def: 22, int: 10, will: 8, critChance: 0.05 },

  /* ══════════ PANTS ══════════════════════════════════════════ */
  { id: 'pants_torn',     name: 'Podarte Spodnie',       type: 'pants', slot: 'legs', rarity: 'common',    icon: `${MAGE_OUT}/6.png`, def: 2 },
  { id: 'pants_heavy',    name: 'Ciężkie Nogawice',      type: 'pants', slot: 'legs', rarity: 'magic',     icon: `${MAGE_OUT}/7.png`, def: 5, str: 1 },
  { id: 'pants_knight',   name: 'Rycerskie Nogawice',    type: 'pants', slot: 'legs', rarity: 'rare',      icon: `${MAGE_OUT}/8.png`, def: 10, str: 3, dex: 2 },
  { id: 'pants_legendary',name: 'Spodnie Pogromcy',      type: 'pants', slot: 'legs', rarity: 'legendary', icon: `${MAGE_OUT}/9.png`, def: 18, str: 5, dex: 4 },

  /* ══════════ BOOTS ═════════════════════════════════════════ */
  { id: 'boots_leather',  name: 'Skórzane Buty',         type: 'boots', slot: 'feet', rarity: 'common',    icon: `${MAGE_OUT}/10.png`, def: 1, dex: 1 },
  { id: 'boots_iron',     name: 'Żelazne Buty',          type: 'boots', slot: 'feet', rarity: 'magic',     icon: `${KNIGHT}/11.png`,   def: 4, str: 1, dex: 2 },
  { id: 'boots_shadow',   name: 'Buty Cienia',           type: 'boots', slot: 'feet', rarity: 'rare',      icon: `${KNIGHT}/12.png`,   def: 8, dex: 5, critChance: 0.02 },
  { id: 'boots_titan',    name: 'Buty Tytana',           type: 'boots', slot: 'feet', rarity: 'legendary', icon: `${KNIGHT}/13.png`,   def: 14, str: 4, dex: 6, critChance: 0.03 },

  /* ══════════ BELTS ═════════════════════════════════════════ */
  { id: 'belt_cloth',     name: 'Szmacany Pas',          type: 'belt', slot: 'hands', rarity: 'common',    icon: `${BELTS}/Icon1.png`,  def: 1 },
  { id: 'belt_leather',   name: 'Skórzany Pas',          type: 'belt', slot: 'hands', rarity: 'common',    icon: `${BELTS}/Icon3.png`,  def: 2, str: 1 },
  { id: 'belt_chain',     name: 'Łańcuchowy Pas',        type: 'belt', slot: 'hands', rarity: 'magic',     icon: `${BELTS}/Icon5.png`,  def: 4, str: 2 },
  { id: 'belt_war',       name: 'Pas Wojenny',           type: 'belt', slot: 'hands', rarity: 'magic',     icon: `${BELTS}/Icon8.png`,  def: 5, str: 3, dex: 1 },
  { id: 'belt_demon',     name: 'Pas Demonów',           type: 'belt', slot: 'hands', rarity: 'rare',      icon: `${BELTS}/Icon12.png`, def: 9, str: 4, will: 3 },
  { id: 'belt_titan',     name: 'Pas Tytana',            type: 'belt', slot: 'hands', rarity: 'legendary', icon: `${BELTS}/Icon18.png`, def: 15, str: 7, dex: 4, critChance: 0.03 },
  { id: 'belt_godslayer', name: 'Pas Bożobójcy',         type: 'belt', slot: 'hands', rarity: 'mythic',    icon: `${BELTS}/Icon24.png`, def: 22, str: 12, dex: 8, will: 6 },

  /* ══════════ SHIELDS ═══════════════════════════════════════ */
  { id: 'shield_wood',    name: 'Drewniana Tarcza',      type: 'shield', slot: 'offHand', rarity: 'common',    icon: `${SHIELDS}/Icon1.png`,  def: 3 },
  { id: 'shield_iron',    name: 'Żelazna Tarcza',        type: 'shield', slot: 'offHand', rarity: 'common',    icon: `${SHIELDS}/Icon3.png`,  def: 5, str: 1 },
  { id: 'shield_kite',    name: 'Tarcza Latawcowa',      type: 'shield', slot: 'offHand', rarity: 'magic',     icon: `${SHIELDS}/Icon6.png`,  def: 8, str: 2, will: 1 },
  { id: 'shield_tower',   name: 'Tarcza Wieżowa',        type: 'shield', slot: 'offHand', rarity: 'rare',      icon: `${SHIELDS}/Icon10.png`, def: 14, str: 4, will: 3 },
  { id: 'shield_dragon',  name: 'Smocza Tarcza',         type: 'shield', slot: 'offHand', rarity: 'legendary', icon: `${SHIELDS}/Icon15.png`, def: 22, str: 6, will: 5, critChance: 0.02 },
  { id: 'shield_divine',  name: 'Boska Tarcza',          type: 'shield', slot: 'offHand', rarity: 'mythic',    icon: `${SHIELDS}/Icon20.png`, def: 35, str: 10, will: 10, dex: 5 },

  /* ══════════ AMULETS ═══════════════════════════════════════ */
  { id: 'amulet_bone',    name: 'Kościany Amulet',       type: 'amulet', slot: 'neck', rarity: 'common',    icon: `${SHIELDS}/Icon25.png`, will: 2 },
  { id: 'amulet_silver',  name: 'Srebrny Amulet',        type: 'amulet', slot: 'neck', rarity: 'common',    icon: `${SHIELDS}/Icon27.png`, int: 2, will: 1 },
  { id: 'amulet_focus',   name: 'Amulet Skupienia',      type: 'amulet', slot: 'neck', rarity: 'magic',     icon: `${SHIELDS}/Icon30.png`, int: 4, will: 2 },
  { id: 'amulet_soul',    name: 'Duszołap',              type: 'amulet', slot: 'neck', rarity: 'rare',      icon: `${SHIELDS}/Icon33.png`, str: 4, int: 4, def: 5 },
  { id: 'amulet_heart',   name: 'Serce Otchłani',        type: 'amulet', slot: 'neck', rarity: 'legendary', icon: `${SHIELDS}/Icon36.png`, str: 8, int: 8, def: 10, critChance: 0.05 },
  { id: 'amulet_crown',   name: 'Korona Bożobójcy',      type: 'amulet', slot: 'neck', rarity: 'mythic',    icon: `${SHIELDS}/Icon40.png`, str: 12, int: 12, will: 10, def: 15, critChance: 0.08 },

  /* ══════════ RINGS ═════════════════════════════════════════ */
  { id: 'ring_bone',      name: 'Kościany Pierścień',    type: 'ring', slot: 'ring1', rarity: 'common',    icon: `${SHIELDS}/Icon42.png`, str: 2 },
  { id: 'ring_focus',     name: 'Sygnet Skupienia',      type: 'ring', slot: 'ring1', rarity: 'magic',     icon: `${SHIELDS}/Icon44.png`, int: 4, will: 2 },
  { id: 'ring_agony',     name: 'Pierścień Agonii',      type: 'ring', slot: 'ring1', rarity: 'rare',      icon: `${SHIELDS}/Icon46.png`, critChance: 0.06, dex: 5 },
  { id: 'ring_death',     name: 'Pierścień Śmierci',     type: 'ring', slot: 'ring1', rarity: 'legendary', icon: `${SHIELDS}/Icon48.png`, critChance: 0.10, str: 6, dex: 6 },
  { id: 'ring_world',     name: 'Sygnet Światobórcy',    type: 'ring', slot: 'ring1', rarity: 'mythic',    icon: `${SHIELDS}/Icon25.png`, str: 15, dex: 12, critChance: 0.15 },

  /* ══════════ POTIONS ═══════════════════════════════════════ */
  { id: 'pot_hp_small',   name: 'Mikstura Zdrowia',      type: 'potion', slot: null, rarity: 'common',  icon: `${POTIONS}/Icon1.png`,  heal: 30 },
  { id: 'pot_hp_med',     name: 'Większa Mikstura Zdrowia', type: 'potion', slot: null, rarity: 'magic', icon: `${POTIONS}/Icon2.png`,  heal: 60 },
  { id: 'pot_hp_large',   name: 'Potężna Mikstura Zdrowia', type: 'potion', slot: null, rarity: 'rare',  icon: `${POTIONS}/Icon3.png`,  heal: 120 },
  { id: 'pot_mana_small', name: 'Mikstura Many',         type: 'potion', slot: null, rarity: 'common',  icon: `${POTIONS}/Icon5.png`,  manaRestore: 20 },
  { id: 'pot_mana_med',   name: 'Większa Mikstura Many', type: 'potion', slot: null, rarity: 'magic',   icon: `${POTIONS}/Icon6.png`,  manaRestore: 40 },
  { id: 'pot_mana_large', name: 'Potężna Mikstura Many', type: 'potion', slot: null, rarity: 'rare',    icon: `${POTIONS}/Icon7.png`,  manaRestore: 80 },
  { id: 'pot_rejuv',      name: 'Eliksir Odnowy',        type: 'potion', slot: null, rarity: 'rare',    icon: `${POTIONS}/Icon10.png`, heal: 50, manaRestore: 30 },
];

/* ── Skill icon paths ─────────────────────────────────────── */
const WARLOCK  = `${A}/craftpix-net-288458-free-rpg-warlock-skill-icons/PNG`;
const SWORDSMAN = `${A}/craftpix-net-495817-free-swordsman-skills-pixel-art-icons/PNG`;

export const SKILL_TREES = {
  warrior: {
    label: 'Wojownik',
    skills: [
      // Tier 1 — base
      { id: 'w_cleave',   name: 'Rozcięcie',    desc: 'Potężne cięcie stożkowe, 160% OBR.',     tier: 1, icon: `${SWORDSMAN}/Icon1.png`,  key: 'Q', manaCost: 10, cooldown: 2 },
      { id: 'w_bash',     name: 'Tarcz. Cios',   desc: 'Ogłuszenie na 1.5s, 120% OBR.',          tier: 1, icon: `${SWORDSMAN}/Icon3.png`,  key: 'W', manaCost: 10, cooldown: 3 },
      // Tier 2
      { id: 'w_whirl',    name: 'Wir Ostrzy',    desc: 'Kręcisz się zadając 60% OBR co trafienie.', tier: 2, icon: `${SWORDSMAN}/Icon5.png`, key: 'E', manaCost: 0, cooldown: 0, requires: ['w_cleave'] },
      { id: 'w_charge',   name: 'Szarża',         desc: 'Rzuć się na wroga, 200% OBR.',           tier: 2, icon: `${SWORDSMAN}/Icon7.png`,  key: 'E', manaCost: 15, cooldown: 4, requires: ['w_bash'] },
      // Tier 3
      { id: 'w_fury',     name: 'Bitewna Furia',  desc: '+60% OBR na 6s. Czerwona aura.',         tier: 3, icon: `${SWORDSMAN}/Icon10.png`, key: 'R', manaCost: 30, cooldown: 15, requires: ['w_whirl'] },
      { id: 'w_quake',    name: 'Trzęsienie',     desc: 'Uderz w ziemię — 300% OBR w obszarze.',  tier: 3, icon: `${SWORDSMAN}/Icon12.png`, key: 'R', manaCost: 35, cooldown: 18, requires: ['w_charge'] },
      // Tier 4 — passives
      { id: 'w_tough',    name: 'Hartowanie',      desc: '+20% HP, +10 DEF.', tier: 4, icon: `${SWORDSMAN}/Icon15.png`, passive: true, hpBonus: 0.2, defBonus: 10, requires: ['w_fury', 'w_quake'] },
      { id: 'w_crit',     name: 'Precyzja',        desc: '+8% szansy na krytyk.', tier: 4, icon: `${SWORDSMAN}/Icon18.png`, passive: true, critBonus: 0.08, requires: ['w_fury', 'w_quake'] },
    ],
  },
  mage: {
    label: 'Mag',
    skills: [
      { id: 'm_shard',    name: 'Lodowy Odłamek', desc: 'Pocisk w kierunku kursora, 140% OBR.',    tier: 1, icon: `${WARLOCK}/1.png`,  key: 'Q', manaCost: 12, cooldown: 1.2 },
      { id: 'm_pulse',    name: 'Arkana Fala',    desc: 'Rozszerzający się pierścień, 90% OBR.',   tier: 1, icon: `${WARLOCK}/3.png`,  key: 'W', manaCost: 14, cooldown: 3.5 },
      { id: 'm_frost',    name: 'Mroźna Nova',    desc: 'Zamrożenie wrogów na 2s, 80% OBR.',       tier: 2, icon: `${WARLOCK}/5.png`,  key: 'E', manaCost: 25, cooldown: 5, requires: ['m_shard'] },
      { id: 'm_fire',     name: 'Kula Ognia',     desc: 'Ognisty pocisk, 180% OBR + podpalenie.',  tier: 2, icon: `${WARLOCK}/8.png`,  key: 'E', manaCost: 20, cooldown: 3, requires: ['m_pulse'] },
      { id: 'm_meteor',   name: 'Burza Meteorów', desc: '3 meteory przy kursorze, 250% OBR każdy.',tier: 3, icon: `${WARLOCK}/12.png`, key: 'R', manaCost: 35, cooldown: 18, requires: ['m_frost'] },
      { id: 'm_vortex',   name: 'Wir Arkany',     desc: 'Wciąga wrogów i zadaje 200% OBR.',        tier: 3, icon: `${WARLOCK}/15.png`, key: 'R', manaCost: 30, cooldown: 15, requires: ['m_fire'] },
      { id: 'm_mastery',  name: 'Mistrzostwo',    desc: '-20% kosztu many na umiejętności.',        tier: 4, icon: `${WARLOCK}/20.png`, passive: true, manaReduce: 0.2, requires: ['m_meteor', 'm_vortex'] },
      { id: 'm_power',    name: 'Moc Żywiołów',   desc: '+15% OBR umiejętności.',                  tier: 4, icon: `${WARLOCK}/25.png`, passive: true, dmgBonus: 0.15, requires: ['m_meteor', 'm_vortex'] },
    ],
  },
  rogue: {
    label: 'Łotrzyk',
    skills: [
      { id: 'r_slash',    name: 'Podwójne Cięcie',desc: 'Podwójny cios — 70% OBR każdy, +15% krytyk.', tier: 1, icon: `${SWORDSMAN}/Icon20.png`, key: 'Q', manaCost: 8, cooldown: 0.8 },
      { id: 'r_smoke',    name: 'Bomba Dymna',    desc: 'Niewidzialność na 2.5s, wrogowie tracą cel.', tier: 1, icon: `${SWORDSMAN}/Icon22.png`, key: 'W', manaCost: 12, cooldown: 5 },
      { id: 'r_dash',     name: 'Cień. Zryw',     desc: 'Teleport 200px do kursora, OBR po drodze.',   tier: 2, icon: `${SWORDSMAN}/Icon25.png`, key: 'E', manaCost: 15, cooldown: 3, requires: ['r_slash'] },
      { id: 'r_trap',     name: 'Pułapka',        desc: 'Postaw pułapkę, 150% OBR + spowolnienie.',    tier: 2, icon: `${SWORDSMAN}/Icon28.png`, key: 'E', manaCost: 18, cooldown: 6, requires: ['r_smoke'] },
      { id: 'r_execute',  name: 'Egzekucja',      desc: 'Teleport za wroga, gwarancja krytyku 400% OBR.', tier: 3, icon: `${SWORDSMAN}/Icon30.png`, key: 'R', manaCost: 25, cooldown: 12, requires: ['r_dash'] },
      { id: 'r_barrage',  name: 'Grad Ostrzy',    desc: 'Wystrzel 8 noży w okręgu, 100% OBR każdy.',   tier: 3, icon: `${SWORDSMAN}/Icon33.png`, key: 'R', manaCost: 30, cooldown: 15, requires: ['r_trap'] },
      { id: 'r_evasion',  name: 'Unik',           desc: '+15% uniki, +10% krytyk.',                    tier: 4, icon: `${SWORDSMAN}/Icon36.png`, passive: true, critBonus: 0.10, requires: ['r_execute', 'r_barrage'] },
      { id: 'r_poison',   name: 'Trucizna',       desc: 'Ataki zadają dodatkowe OBR trucizną.',         tier: 4, icon: `${SWORDSMAN}/Icon38.png`, passive: true, dmgBonus: 0.12, requires: ['r_execute', 'r_barrage'] },
    ],
  },
};

/* ═══════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

/** Get items eligible for mob drops (common/magic/rare only) */
export function getMobLoot() {
  return ITEM_DB.filter(i => ['common', 'magic', 'rare'].includes(i.rarity));
}

/** Get items eligible for boss drops (legendary/mythic only) */
export function getBossLoot() {
  return ITEM_DB.filter(i => ['legendary', 'mythic'].includes(i.rarity));
}

/** Pick a random item by rarity using MOB_WEIGHTS */
export function rollMobItem() {
  const totalW = Object.values(MOB_WEIGHTS).reduce((s, w) => s + w, 0);
  let roll = Math.random() * totalW;
  let chosenRarity = 'common';
  for (const [rarity, w] of Object.entries(MOB_WEIGHTS)) {
    roll -= w;
    if (roll <= 0) { chosenRarity = rarity; break; }
  }
  const pool = ITEM_DB.filter(i => i.rarity === chosenRarity && i.type !== 'potion');
  if (pool.length === 0) return null;
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

/** Pick a boss drop (40% mythic, 60% legendary) */
export function rollBossItem() {
  const rarity = Math.random() < 0.4 ? 'mythic' : 'legendary';
  const pool = ITEM_DB.filter(i => i.rarity === rarity && i.type !== 'potion');
  if (pool.length === 0) return null;
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

/** Get item sell value */
export function getItemValue(item) {
  const mult = { common: 1, magic: 3, rare: 8, legendary: 25, mythic: 60 };
  const base = (item.dmg || 0) + (item.def || 0) * 2 + (item.str || 0) + (item.int || 0) + (item.dex || 0) + (item.will || 0);
  return Math.max(1, Math.floor(base * (mult[item.rarity] || 1)));
}

/** Default LOOT_TABLE for backward compat (used by shop) */
export const LOOT_TABLE = ITEM_DB.filter(i => i.type !== 'potion');
