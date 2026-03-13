// ============================================================
// DATABASE: ITEMS (50+ items across all rarities)
// ============================================================

export const RARITIES = {
  common: { label: 'Zwykły', color: 'text-slate-300', border: 'border-slate-600', bgGlow: '' },
  rare: { label: 'Rzadki', color: 'text-blue-300', border: 'border-blue-700', bgGlow: 'shadow-blue-900' },
  epic: { label: 'Epicki', color: 'text-purple-300', border: 'border-purple-700', bgGlow: 'shadow-purple-900' },
  legendary: { label: 'Legendarny', color: 'text-amber-400', border: 'border-amber-600', bgGlow: 'shadow-amber-900' },
  divine: { label: 'Boski', color: 'text-yellow-200', border: 'border-yellow-300', bgGlow: 'shadow-yellow-500' },
};

export const ITEMS = {
  // ─── WEAPONS ─────────────────────────────────────────────
  rusted_longsword: {
    id: 'rusted_longsword', name: 'Zardzewiały Miecz', icon: '⚔️', type: 'weapon',
    rarity: 'common', slot: 'weapon', value: 10,
    stats: { attack: 8 },
    description: 'Podniesiony z błota przy murze Bastionu. Lepsza od pięści — ledwo.',
  },
  iron_daggers: {
    id: 'iron_daggers', name: 'Żelazne Sztylety', icon: '🗡️', type: 'weapon',
    rarity: 'common', slot: 'weapon', value: 14,
    stats: { attack: 7, agility: 3 },
    description: 'Lekkie jak kłamstwo, równie niebezpieczne.',
  },
  apprentice_staff: {
    id: 'apprentice_staff', name: 'Laska Ucznia', icon: '🪄', type: 'weapon',
    rarity: 'common', slot: 'weapon', value: 12,
    stats: { attack: 5, intelligence: 6 },
    description: 'Drewno ze Spalonego Gaju. Wciąż trzyma odrobinę magii.',
  },
  consecrated_mace: {
    id: 'consecrated_mace', name: 'Konsekrowany Buzdygan', icon: '🔨', type: 'weapon',
    rarity: 'common', slot: 'weapon', value: 14,
    stats: { attack: 10, intelligence: 3 },
    description: 'Poświęcony przez kapłana, który już nie żyje.',
  },
  bone_axe: {
    id: 'bone_axe', name: 'Topór z Kości Boga', icon: '🪓', type: 'weapon',
    rarity: 'rare', slot: 'weapon', value: 180,
    stats: { attack: 22, strength: 5 },
    description: 'Wykuta z kości upadłego boga ziemi. Cięcia nigdy się nie goją normalnie.',
  },
  shadow_blades: {
    id: 'shadow_blades', name: 'Ostrza Cienia', icon: '🗡️', type: 'weapon',
    rarity: 'rare', slot: 'weapon', value: 200,
    stats: { attack: 18, agility: 8, critChance: 0.1 },
    description: 'Wykute w ciemności. Atakują z dwóch stron jednocześnie.',
  },
  grimoire_of_ruin: {
    id: 'grimoire_of_ruin', name: 'Grimuar Zguby', icon: '📖', type: 'weapon',
    rarity: 'rare', slot: 'weapon', value: 220,
    stats: { attack: 12, intelligence: 14, manaBonus: 30 },
    description: 'Zapisano w nim jedno zaklęcie, które Bóg Wiedzy zakazał.',
  },
  executioner_sword: {
    id: 'executioner_sword', name: 'Miecz Kata', icon: '⚔️', type: 'weapon',
    rarity: 'epic', slot: 'weapon', value: 550,
    stats: { attack: 38, strength: 10, critDamage: 0.3 },
    description: 'Przeprowadził ostatnią egzekucję w Pantaonie. Lubi swoją pracę.',
  },
  frostweaver_staff: {
    id: 'frostweaver_staff', name: 'Laska Tkaczki Lodu', icon: '🧊', type: 'weapon',
    rarity: 'epic', slot: 'weapon', value: 600,
    stats: { attack: 28, intelligence: 22, manaBonus: 50, freezeChance: 0.15 },
    description: 'Zamraża krew w żyłach bez dotykania ciała.',
  },
  voidreaper: {
    id: 'voidreaper', name: 'Kosiarz Pustki', icon: '🌌', type: 'weapon',
    rarity: 'legendary', slot: 'weapon', value: 2200,
    stats: { attack: 68, strength: 18, agility: 12, critChance: 0.2, critDamage: 0.5 },
    description: 'Ostrze, które istnieje pół-sekundy przed twoim uderzeniem.',
    legendaryEffect: 'Każdy cios krytyczny regeneruje 8 Many.',
  },
  staff_of_collapsing_stars: {
    id: 'staff_of_collapsing_stars', name: 'Laska Konających Gwiazd', icon: '⭐', type: 'weapon',
    rarity: 'legendary', slot: 'weapon', value: 2500,
    stats: { attack: 55, intelligence: 38, manaBonus: 80, critDamage: 0.6 },
    description: 'Każde zaklęcie spala kawałek gwiazdy, która już nie istnieje.',
    legendaryEffect: 'Zaklęcia kosztują 25% mniej Many.',
  },
  godsbane: {
    id: 'godsbane', name: 'Zabójca Bogów', icon: '☄️', type: 'weapon',
    rarity: 'divine', slot: 'weapon', value: 9999,
    stats: { attack: 110, strength: 30, agility: 25, intelligence: 25, critChance: 0.3, critDamage: 1.0 },
    description: 'Broń, która zabiła ostatniego boga. Pamięta każde uderzenie.',
    legendaryEffect: 'Wszystkie zdolności zadają +20% obrażeń. Bossowie otrzymują +30% dmg.',
    craftOnly: true,
  },
  eternal_staff: {
    id: 'eternal_staff', name: 'Berło Wieczności', icon: '🌟', type: 'weapon',
    rarity: 'divine', slot: 'weapon', value: 9999,
    stats: { attack: 90, intelligence: 60, manaBonus: 150, critDamage: 0.8 },
    description: 'Wykute z pierwszego słowa, jakie bogowie wypowiedzieli po stworzeniu świata.',
    legendaryEffect: 'Zaklęcia kosztują 40% mniej Many. Krytyki leczą 15% HP.',
    craftOnly: true,
  },

  // ─── ARMOR ─────────────────────────────────────────────
  tattered_robes: {
    id: 'tattered_robes', name: 'Obszarpane Szaty', icon: '👘', type: 'armor',
    rarity: 'common', slot: 'armor', value: 8,
    stats: { defense: 4, intelligence: 2 },
    description: 'Skrojone dla kogoś trzy rozmiary większego.',
  },
  chainmail_vest: {
    id: 'chainmail_vest', name: 'Kolczuga', icon: '🥋', type: 'armor',
    rarity: 'common', slot: 'armor', value: 20,
    stats: { defense: 14, endurance: 3 },
    description: 'Rząd żelaznych ogniw. Każde z nich to historia porażki.',
  },
  shadow_wraps: {
    id: 'shadow_wraps', name: 'Owijki Cienia', icon: '🩱', type: 'armor',
    rarity: 'common', slot: 'armor', value: 12,
    stats: { defense: 8, agility: 5 },
    description: 'Tkanina wchłania światło i hałas.',
  },
  worn_platemail: {
    id: 'worn_platemail', name: 'Wyszczerbiona Zbroja', icon: '🛡️', type: 'armor',
    rarity: 'common', slot: 'armor', value: 22,
    stats: { defense: 16, endurance: 5 },
    description: 'Nosi ją ktoś, kto przeżył więcej, niż powinien.',
  },
  darksteel_cuirass: {
    id: 'darksteel_cuirass', name: 'Kirys z Ciemnostali', icon: '⚫', type: 'armor',
    rarity: 'rare', slot: 'armor', value: 250,
    stats: { defense: 28, endurance: 8, strength: 4 },
    description: 'Ciemnostal nie rdzewieje. Jej właściciele — tak.',
  },
  spellwoven_mantle: {
    id: 'spellwoven_mantle', name: 'Płaszcz Zaklęć', icon: '🔵', type: 'armor',
    rarity: 'rare', slot: 'armor', value: 260,
    stats: { defense: 16, intelligence: 10, manaBonus: 35 },
    description: 'Utkany ze skrystalizowanych inkantacji.',
  },
  phantom_leathers: {
    id: 'phantom_leathers', name: 'Skóry Widma', icon: '👻', type: 'armor',
    rarity: 'epic', slot: 'armor', value: 620,
    stats: { defense: 24, agility: 15, dodgeBonus: 0.12 },
    description: 'Skrojone ze skóry cienia, który już nie rzuca cienia.',
  },
  sunbreaker_plate: {
    id: 'sunbreaker_plate', name: 'Pancerz Łamacza Słońca', icon: '🌑', type: 'armor',
    rarity: 'legendary', slot: 'armor', value: 2800,
    stats: { defense: 55, endurance: 22, strength: 15, hpBonus: 100 },
    description: 'Nosili go rycerze, którzy zdecydowali że słońce świeci za jasno.',
    legendaryEffect: 'Gdy HP < 50% — regenerujesz 12 HP na turę.',
  },
  void_shroud: {
    id: 'void_shroud', name: 'Całun Pustki', icon: '🕳️', type: 'armor',
    rarity: 'divine', slot: 'armor', value: 9999,
    stats: { defense: 80, endurance: 35, agility: 20, hpBonus: 200, dodgeBonus: 0.2 },
    description: 'Strój boga, który zrezygnował z bycia bogiem.',
    legendaryEffect: 'Absorbujesz 15% każdego otrzymanego obrażenia jako HP.',
    craftOnly: true,
  },

  // ─── HELMETS ─────────────────────────────────────────────
  leather_coif: {
    id: 'leather_coif', name: 'Skórzany Czepiec', icon: '🎩', type: 'helmet',
    rarity: 'common', slot: 'helmet', value: 10,
    stats: { defense: 5 },
    description: 'Chroni głowę przed deszczem. I niczym więcej.',
  },
  iron_helm: {
    id: 'iron_helm', name: 'Żelazny Hełm', icon: '⛑️', type: 'helmet',
    rarity: 'common', slot: 'helmet', value: 18,
    stats: { defense: 10, endurance: 2 },
    description: 'Ciężki jak sumienie.',
  },
  mage_circlet: {
    id: 'mage_circlet', name: 'Diadem Maga', icon: '💍', type: 'helmet',
    rarity: 'rare', slot: 'helmet', value: 200,
    stats: { defense: 8, intelligence: 10, manaBonus: 25 },
    description: 'Skupia myśli. Rozgania inne.',
  },
  crown_of_ash: {
    id: 'crown_of_ash', name: 'Korona z Popiołu', icon: '👑', type: 'helmet',
    rarity: 'epic', slot: 'helmet', value: 700,
    stats: { defense: 18, intelligence: 18, strength: 8 },
    description: 'Popiół koronowanego boga, sprasowany i ukoronowany.',
  },
  helm_of_the_fallen_sun: {
    id: 'helm_of_the_fallen_sun', name: 'Hełm Upadłego Słońca', icon: '🌞', type: 'helmet',
    rarity: 'legendary', slot: 'helmet', value: 3000,
    stats: { defense: 40, intelligence: 25, strength: 20, critChance: 0.15 },
    description: 'Wykuty w ostatnim promieniu słońca, które gasło.',
    legendaryEffect: 'Pierwsze użycie każdej umiejętności w walce jest darmowe (0 mana).',
  },

  // ─── RINGS ─────────────────────────────────────────────
  copper_band: {
    id: 'copper_band', name: 'Miedziana Obrączka', icon: '🔵', type: 'ring',
    rarity: 'common', slot: 'ring', value: 8,
    stats: { defense: 2, strength: 1 },
    description: 'Ktoś ją zgubił. Możliwe że bóg.',
  },
  ring_of_blood: {
    id: 'ring_of_blood', name: 'Pierścień Krwi', icon: '🔴', type: 'ring',
    rarity: 'rare', slot: 'ring', value: 180,
    stats: { strength: 8, critChance: 0.08 },
    description: 'Zapieczętowany krwią ofiary. Czyja krew — nieznane.',
  },
  void_signet: {
    id: 'void_signet', name: 'Sygnet Pustki', icon: '⚫', type: 'ring',
    rarity: 'epic', slot: 'ring', value: 650,
    stats: { intelligence: 18, manaBonus: 40, skillCooldownReduction: 1 },
    description: 'Otwiera usta pustki, gdy szepczesz zaklęcia.',
  },
  ring_of_endless_night: {
    id: 'ring_of_endless_night', name: 'Pierścień Nieskończonej Nocy', icon: '🌙', type: 'ring',
    rarity: 'legendary', slot: 'ring', value: 2400,
    stats: { agility: 22, critChance: 0.18, critDamage: 0.4 },
    description: 'Noc nie ma końca. Ani ból.',
    legendaryEffect: 'Krytycy mają 25% szans na podwójny cios.',
  },

  // ─── AMULETS ─────────────────────────────────────────────
  bone_charm: {
    id: 'bone_charm', name: 'Kostna Zawieszka', icon: '🦴', type: 'amulet',
    rarity: 'common', slot: 'amulet', value: 10,
    stats: { endurance: 3, hpBonus: 10 },
    description: 'Kość małego boga. Nadal ciepła.',
  },
  amulet_of_the_martyr: {
    id: 'amulet_of_the_martyr', name: 'Amulet Męczennika', icon: '✡️', type: 'amulet',
    rarity: 'rare', slot: 'amulet', value: 220,
    stats: { endurance: 10, hpBonus: 40, defense: 5 },
    description: 'Noszony przez tego, kto umarł zamiast boga. Pomocy nie udzielono.',
  },
  pendant_of_void: {
    id: 'pendant_of_void', name: 'Wisiorek Pustki', icon: '🕳️', type: 'amulet',
    rarity: 'epic', slot: 'amulet', value: 700,
    stats: { intelligence: 20, manaBonus: 60 },
    description: 'Zawiera pustkę zamkniętą w szkle. Szkło pęka.',
  },
  godslayer_pendant: {
    id: 'godslayer_pendant', name: 'Wisiorек Pogromcy Bogów', icon: '⚡', type: 'amulet',
    rarity: 'legendary', slot: 'amulet', value: 3200,
    stats: { strength: 20, intelligence: 20, agility: 15, critDamage: 0.5 },
    description: 'Nosił go pierwszy, który zabił boga. I ostatni.',
    legendaryEffect: 'Obrażenia od umiejętności ignorują 20% pancerza.',
  },

  // ─── CONSUMABLES ─────────────────────────────────────────
  health_potion_small: {
    id: 'health_potion_small', name: 'Mały Eliksir Zdrowia', icon: '🧪', type: 'consumable',
    rarity: 'common', value: 25,
    stats: {},
    description: 'Leczy 60 HP. Smakuje jak rozpuszczona nadzieja.',
    use: { type: 'heal', value: 60 },
  },
  health_potion_medium: {
    id: 'health_potion_medium', name: 'Eliksir Zdrowia', icon: '🧪', type: 'consumable',
    rarity: 'rare', value: 80,
    stats: {},
    description: 'Leczy 150 HP. Ktoś włożył w to staranie.',
    use: { type: 'heal', value: 150 },
  },
  health_potion_large: {
    id: 'health_potion_large', name: 'Wielki Eliksir Zdrowia', icon: '💊', type: 'consumable',
    rarity: 'epic', value: 200,
    stats: {},
    description: 'Leczy 400 HP. Distylat z krwi półboga.',
    use: { type: 'heal', value: 400 },
  },
  mana_potion_small: {
    id: 'mana_potion_small', name: 'Mały Eliksir Many', icon: '🔷', type: 'consumable',
    rarity: 'common', value: 20,
    stats: {},
    description: 'Odnawia 40 Many. Cuchnie spalonym ołowiem.',
    use: { type: 'mana', value: 40 },
  },
  mana_potion_large: {
    id: 'mana_potion_large', name: 'Wielki Eliksir Many', icon: '💎', type: 'consumable',
    rarity: 'rare', value: 90,
    stats: {},
    description: 'Odnawia 120 Many. Destylat skroplonych snów.',
    use: { type: 'mana', value: 120 },
  },
  antidote: {
    id: 'antidote', name: 'Antidotum', icon: '💉', type: 'consumable',
    rarity: 'common', value: 30,
    stats: {},
    description: 'Usuwa Truciznę i Krwawienie.',
    use: { type: 'cleanse', effects: ['poison', 'bleed'] },
  },
  elixir_of_wrath: {
    id: 'elixir_of_wrath', name: 'Eliksir Gniewu', icon: '🌋', type: 'consumable',
    rarity: 'epic', value: 350,
    stats: {},
    description: 'Zwiększa ATK o 50% przez 5 tur walki.',
    use: { type: 'combat_buff', stat: 'attack', value: 0.5, duration: 5 },
  },
  divine_ambrosia: {
    id: 'divine_ambrosia', name: 'Ambrozja Bogów', icon: '✨', type: 'consumable',
    rarity: 'divine', value: 2000,
    stats: {},
    description: 'Leczy 100% HP i Many. Smakuje jak utracona nieśmiertelność.',
    use: { type: 'full_restore' },
  },

  // ─── CRAFTING MATERIALS ─────────────────────────────────
  gods_ether: {
    id: 'gods_ether', name: 'Eter Bóstwa', icon: '💫', type: 'material',
    rarity: 'divine', value: 500,
    stats: {},
    description: 'Pozostałość duszy upadłego boga. Kowal w Cytadeli wie, co z tym zrobić.',
    dropFrom: 'boss',
  },
  ancient_ore: {
    id: 'ancient_ore', name: 'Pradawna Ruda', icon: '⚙️', type: 'material',
    rarity: 'epic', value: 300,
    stats: {},
    description: 'Wykopana spod fundamentów ruin Panteonu.',
    dropFrom: 'elite',
  },
  shadow_crystal: {
    id: 'shadow_crystal', name: 'Kryształ Cienia', icon: '💜', type: 'material',
    rarity: 'rare', value: 150,
    stats: {},
    description: 'Skamieniałe ciemności. Reaguje na dotyk.',
    dropFrom: 'elite',
  },
};

export const getItemById = (id) => ITEMS[id] || null;

export const SHOP_INVENTORY = {
  bastion: [
    'health_potion_small', 'health_potion_medium', 'mana_potion_small', 'antidote',
    'rusted_longsword', 'iron_daggers', 'chainmail_vest', 'leather_coif', 'copper_band', 'bone_charm',
  ],
  iglieze: [
    'health_potion_medium', 'health_potion_large', 'mana_potion_large', 'antidote', 'elixir_of_wrath',
    'bone_axe', 'shadow_blades', 'grimoire_of_ruin', 'darksteel_cuirass', 'spellwoven_mantle',
    'mage_circlet', 'ring_of_blood',
  ],
  cytadela: [
    'health_potion_large', 'mana_potion_large', 'elixir_of_wrath', 'divine_ambrosia',
    'executioner_sword', 'frostweaver_staff', 'phantom_leathers', 'crown_of_ash',
    'void_signet', 'amulet_of_the_martyr', 'pendant_of_void', 'ancient_ore', 'shadow_crystal',
  ],
};

export const FORGE_RECIPES = [
  {
    id: 'craft_godsbane',
    name: 'Wykucie: Zabójca Bogów',
    result: 'godsbane',
    ingredients: [
      { itemId: 'voidreaper', qty: 1 },
      { itemId: 'gods_ether', qty: 3 },
      { itemId: 'ancient_ore', qty: 2 },
    ],
    goldCost: 5000,
    description: 'Stopiona broń Pustki z esencją trzech bóstw. Ktoś musiał umrzeć, żeby zebrać te składniki.',
  },
  {
    id: 'craft_eternal_staff',
    name: 'Wykucie: Berło Wieczności',
    result: 'eternal_staff',
    ingredients: [
      { itemId: 'staff_of_collapsing_stars', qty: 1 },
      { itemId: 'gods_ether', qty: 3 },
      { itemId: 'shadow_crystal', qty: 2 },
    ],
    goldCost: 5000,
    description: 'Pióro i słowo splecione w oręż ostateczny.',
  },
  {
    id: 'craft_void_shroud',
    name: 'Wykucie: Całun Pustki',
    result: 'void_shroud',
    ingredients: [
      { itemId: 'sunbreaker_plate', qty: 1 },
      { itemId: 'gods_ether', qty: 2 },
      { itemId: 'shadow_crystal', qty: 3 },
    ],
    goldCost: 4000,
    description: 'Ochrona doskonała — bo nic, co martwe, nie ma czego chronić.',
  },
];
