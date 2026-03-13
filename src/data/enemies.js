// ============================================================
// DATABASE: ENEMIES & BOSSES
// ============================================================

export const ENEMIES = {
  // ─── BASTION NORMAL ───────────────────────────────────
  skeleton_guard: {
    id: 'skeleton_guard', name: 'Szkielet Strażnik', icon: '💀',
    hp: 60, maxHp: 60,
    attack: 12, defense: 5, agility: 8,
    expReward: 30, goldReward: [8, 18],
    loot: [
      { itemId: 'health_potion_small', chance: 0.2 },
      { itemId: 'bone_charm', chance: 0.1 },
    ],
    skills: [],
    description: 'Strażnik ruin — kości ożywione rozkazem boga, który już nie istnieje.',
    city: 'bastion',
    isBoss: false,
    enrageThreshold: null,
  },

  corrupted_hound: {
    id: 'corrupted_hound', name: 'Skaźony Kundel', icon: '🐺',
    hp: 80, maxHp: 80,
    attack: 18, defense: 3, agility: 16,
    expReward: 45, goldReward: [10, 22],
    loot: [
      { itemId: 'antidote', chance: 0.15 },
    ],
    skills: [
      { name: 'Wściekłe Gryzienie', manaCost: 0, cooldown: 2, damageMultiplier: 1.5, effects: [{ type: 'bleed', damage: 8, duration: 2, chance: 0.5 }] },
    ],
    description: 'Pieskie resztki — ożywione mrokiem, prowadzą się za zapachem strachu.',
    city: 'bastion',
    isBoss: false,
    enrageThreshold: null,
  },

  ruin_crawler: {
    id: 'ruin_crawler', name: 'Pełzacz Ruin', icon: '🦂',
    hp: 50, maxHp: 50,
    attack: 10, defense: 8, agility: 6,
    expReward: 25, goldReward: [5, 14],
    loot: [
      { itemId: 'shadow_crystal', chance: 0.05 },
    ],
    skills: [
      { name: 'Jadowity Kolec', manaCost: 0, cooldown: 2, damageMultiplier: 1.0, effects: [{ type: 'poison', damage: 10, duration: 3, chance: 0.6 }] },
    ],
    description: 'Ziemnowodny pełzacz żywiący się gruzem i zepsuciem.',
    city: 'bastion',
    isBoss: false,
    enrageThreshold: null,
  },

  fallen_knight: {
    id: 'fallen_knight', name: 'Upadły Rycerz', icon: '⚔️',
    hp: 130, maxHp: 130,
    attack: 22, defense: 14, agility: 10,
    expReward: 70, goldReward: [20, 40],
    loot: [
      { itemId: 'iron_helm', chance: 0.25 },
      { itemId: 'health_potion_medium', chance: 0.3 },
    ],
    skills: [
      { name: 'Charge', manaCost: 0, cooldown: 3, damageMultiplier: 1.8, effects: [{ type: 'stun', duration: 1, chance: 0.4 }] },
    ],
    description: 'Dawny rycerz Złotego Zakonu. Przysięgał chronić. Teraz niszczy.',
    city: 'bastion',
    isBoss: false,
    enrageThreshold: null,
  },

  // ─── BASTION BOSS ─────────────────────────────────────
  the_undying_warden: {
    id: 'the_undying_warden', name: 'Nieśmiertelny Strażnik', icon: '👁️',
    hp: 450, maxHp: 450,
    attack: 35, defense: 20, agility: 12,
    expReward: 250, goldReward: [80, 150],
    loot: [
      { itemId: 'gods_ether', chance: 1.0 },
      { itemId: 'bone_axe', chance: 0.4 },
      { itemId: 'darksteel_cuirass', chance: 0.3 },
    ],
    skills: [
      { name: 'Gniotący Cios', manaCost: 0, cooldown: 2, damageMultiplier: 2.0, effects: [{ type: 'stun', duration: 1, chance: 0.5 }] },
      { name: 'Krzyk Grozy', manaCost: 0, cooldown: 4, damageMultiplier: 0, effects: [{ type: 'enemy_debuff', stat: 'attack', value: -0.25, duration: 2 }] },
      { name: 'Niezłomne Ciało', manaCost: 0, cooldown: 5, damageMultiplier: 0, effects: [{ type: 'self_heal_flat', value: 60 }] },
    ],
    description: 'Strażnik Skarbca Bogów. Jego bóg umarł, ale rozkaz — nie. Przebywał w ruinach tysiąc lat, nie wiedząc, że jest już tylko echem.',
    city: 'bastion',
    isBoss: true,
    bossTitle: 'Pierwsza Pieczęć: Bastion',
    dialogue: {
      intro: 'INTRUZ. INTRUZ W SKARBCU. ROZKAZ: ELIMINACJA. [Oko wybucha czerwonym światłem.] ROZKAZ AKTYWNY. ROZKAZ WIECZNY.',
      enrage: '[Ciało Strażnika pęka — z wnętrza leje się złote światło, syczące i niebezpieczne.] PROTOKÓŁ KRWI — AKTYWACJA. ELIMINACJA PRZYSPIESZONA.',
      death: '[Boskie światło gaśnie. Strażnik pada jak bryła granitu.] ...rozkaz... wy...konany... [cicho]',
    },
    enrageThreshold: 0.3,
    enrageEffects: {
      attackMultiplier: 1.6,
      defenseMultiplier: 0.8,
      specialAttack: {
        name: 'Boska Kara',
        description: 'Ostatni protokół — 250% obrażeń i ignoruje 50% pancerza.',
        damageMultiplier: 2.5,
        armorPenetration: 0.5,
        cooldown: 2,
      },
    },
    mainQuestShard: true,
  },

  // ─── IGLICZE NORMAL ───────────────────────────────────
  wraith_archer: {
    id: 'wraith_archer', name: 'Łucznik-Widmo', icon: '👻',
    hp: 90, maxHp: 90,
    attack: 24, defense: 4, agility: 20,
    expReward: 65, goldReward: [18, 35],
    loot: [
      { itemId: 'mana_potion_small', chance: 0.25 },
    ],
    skills: [
      { name: 'Strzałа Cienia', manaCost: 0, cooldown: 2, damageMultiplier: 1.4, effects: [{ type: 'silence', duration: 1, chance: 0.3 }] },
    ],
    description: 'Duch łucznika, który nie może zaakceptować własnej śmierci.',
    city: 'iglieze',
    isBoss: false,
    enrageThreshold: null,
  },

  void_acolyte: {
    id: 'void_acolyte', name: 'Akolita Pustki', icon: '🌑',
    hp: 110, maxHp: 110,
    attack: 20, defense: 8, agility: 12,
    expReward: 80, goldReward: [22, 45],
    loot: [
      { itemId: 'shadow_crystal', chance: 0.15 },
      { itemId: 'mana_potion_large', chance: 0.2 },
    ],
    skills: [
      { name: 'Void Bolt', manaCost: 0, cooldown: 1, damageMultiplier: 1.3, effects: [] },
      { name: 'Energetyczne Wysysanie', manaCost: 0, cooldown: 3, damageMultiplier: 0.8, effects: [{ type: 'mana_drain', value: 20 }] },
    ],
    description: 'Kult Pustki rośnie wśród rozpaczy. Ten przyjął Pustkę do siebie dobrowolnie.',
    city: 'iglieze',
    isBoss: false,
    enrageThreshold: null,
  },

  stone_sentinel: {
    id: 'stone_sentinel', name: 'Kamienny Strażnik', icon: '🗿',
    hp: 180, maxHp: 180,
    attack: 28, defense: 22, agility: 5,
    expReward: 90, goldReward: [25, 50],
    loot: [
      { itemId: 'ancient_ore', chance: 0.2 },
      { itemId: 'health_potion_medium', chance: 0.3 },
    ],
    skills: [
      { name: 'Kamienna Pięść', manaCost: 0, cooldown: 3, damageMultiplier: 2.2, effects: [{ type: 'stun', duration: 1, chance: 0.6 }] },
    ],
    description: 'Konstrukt z czasów Panteonu. Stoi i broni czegoś, co dawno zniknęło.',
    city: 'iglieze',
    isBoss: false,
    enrageThreshold: null,
  },

  prophet_revenant: {
    id: 'prophet_revenant', name: 'Powracający Prorok', icon: '🔮',
    hp: 140, maxHp: 140,
    attack: 32, defense: 10, agility: 14,
    expReward: 100, goldReward: [30, 60],
    loot: [
      { itemId: 'grimoire_of_ruin', chance: 0.1 },
      { itemId: 'mage_circlet', chance: 0.15 },
    ],
    skills: [
      { name: 'Mroczna Przepowiednia', manaCost: 0, cooldown: 3, damageMultiplier: 1.8, effects: [{ type: 'bleed', damage: 12, duration: 3, chance: 0.5 }] },
      { name: 'Wróżiarski Trans', manaCost: 0, cooldown: 4, damageMultiplier: 0, effects: [{ type: 'self_buff', stat: 'attack', value: 0.5, duration: 2 }] },
    ],
    description: 'Prorok, który przewidział śmierć wszystkich oprócz siebie. Nie przyjął tego dobrze.',
    city: 'iglieze',
    isBoss: false,
    enrageThreshold: null,
  },

  // ─── IGLICZE BOSS ─────────────────────────────────────
  the_blind_oracle: {
    id: 'the_blind_oracle', name: 'Ślepa Wyroczynia', icon: '🔮',
    hp: 680, maxHp: 680,
    attack: 52, defense: 28, agility: 18,
    expReward: 450, goldReward: [150, 280],
    loot: [
      { itemId: 'gods_ether', chance: 1.0 },
      { itemId: 'frostweaver_staff', chance: 0.35 },
      { itemId: 'void_signet', chance: 0.25 },
    ],
    skills: [
      { name: 'Ślepota Wróżki', manaCost: 0, cooldown: 2, damageMultiplier: 1.6, effects: [{ type: 'blind', accuracy: -0.4, duration: 2 }] },
      { name: 'Kryształowe Wizje', manaCost: 0, cooldown: 3, damageMultiplier: 2.0, effects: [{ type: 'silence', duration: 1, chance: 0.6 }] },
      { name: 'Wieszcze Zaklęcie', manaCost: 0, cooldown: 5, damageMultiplier: 0, effects: [{ type: 'self_heal_flat', value: 100 }] },
    ],
    description: 'Była najpiękniejszą prorokinią Iglicza. Pustka zabrała jej oczy, ale zostawiła coś gorszego — wgląd absolutny. Teraz widzi wszystko, co jest, co było i czymś być.',
    city: 'iglieze',
    isBoss: true,
    bossTitle: 'Druga Pieczęć: Krypta Snów',
    dialogue: {
      intro: 'Widzę cię. Nawet bez oczu — widzę. Widzę twoją krew zanim ją przelelejesz. Widzę twój oddech zanim go weźmiesz. Widzę koniec zanim... [Odwraca głowę.] Nie powiem ci końca. To by zepsuło widowisko.',
      enrage: '[Czarne puste oczodoły zalewają się złotym światłem.] NIE WIDZĘ. NICZEGO NIE WIDZĘ! TY... TY ZŁAMAŁEŚ WIZJĘ! GINIE WSZYSTKO KIEDY TY... [Szaleje.]',
      death: '[Wyroczynia pada na kolana.] Widziałam... to widziałam. Kończyłam tu. Nie chciałam... ale widziałam. [Gaśnie spokojnie.]',
    },
    enrageThreshold: 0.35,
    enrageEffects: {
      attackMultiplier: 1.8,
      defenseMultiplier: 0.6,
      specialAttack: {
        name: 'Apokaliptyczna Wizja',
        description: 'Atak psychiczny oparty na absolutnej wiedzy — 300% obrażeń i Silence na 3 tury.',
        damageMultiplier: 3.0,
        armorPenetration: 0.3,
        effects: [{ type: 'silence', duration: 3, chance: 0.8 }],
        cooldown: 2,
      },
    },
    mainQuestShard: true,
  },

  // ─── CYTADELA NORMAL ──────────────────────────────────
  divine_automaton: {
    id: 'divine_automaton', name: 'Boski Automat', icon: '🤖',
    hp: 220, maxHp: 220,
    attack: 38, defense: 30, agility: 10,
    expReward: 130, goldReward: [40, 80],
    loot: [
      { itemId: 'ancient_ore', chance: 0.3 },
      { itemId: 'gods_ether', chance: 0.08 },
    ],
    skills: [
      { name: 'Laserowy Protokół', manaCost: 0, cooldown: 2, damageMultiplier: 1.6, effects: [] },
      { name: 'Pancerz Energetyczny', manaCost: 0, cooldown: 4, damageMultiplier: 0, effects: [{ type: 'self_buff', stat: 'defense', value: 0.5, duration: 2 }] },
    ],
    description: 'Mechaniczny konstrukt stworzony przez bogów do strzeżenia Cytadeli. Jego serce to odłamek boskiego metalu.',
    city: 'cytadela',
    isBoss: false,
    enrageThreshold: null,
  },

  god_remnant: {
    id: 'god_remnant', name: 'Szczątek Boga', icon: '✨',
    hp: 190, maxHp: 190,
    attack: 45, defense: 15, agility: 20,
    expReward: 150, goldReward: [45, 90],
    loot: [
      { itemId: 'gods_ether', chance: 0.2 },
      { itemId: 'ancient_ore', chance: 0.25 },
    ],
    skills: [
      { name: 'Boskie Lamentowanie', manaCost: 0, cooldown: 1, damageMultiplier: 1.3, effects: [{ type: 'bleed', damage: 15, duration: 3, chance: 0.4 }] },
      { name: 'Erupcja Bóstwa', manaCost: 0, cooldown: 3, damageMultiplier: 2.2, effects: [] },
    ],
    description: 'To, co pozostało z boga po pochłonięciu przez Pustkę — bezkształtne, szlochające, niebezpieczne.',
    city: 'cytadela',
    isBoss: false,
    enrageThreshold: null,
  },

  chaos_lich: {
    id: 'chaos_lich', name: 'Lich Chaosu', icon: '💀',
    hp: 260, maxHp: 260,
    attack: 55, defense: 18, agility: 15,
    expReward: 180, goldReward: [55, 100],
    loot: [
      { itemId: 'shadow_crystal', chance: 0.3 },
      { itemId: 'pendant_of_void', chance: 0.1 },
      { itemId: 'mana_potion_large', chance: 0.4 },
    ],
    skills: [
      { name: 'Smiertelna Magia', manaCost: 0, cooldown: 2, damageMultiplier: 1.9, effects: [{ type: 'poison', damage: 20, duration: 3, chance: 0.6 }] },
      { name: 'Wysysanie Duszy', manaCost: 0, cooldown: 3, damageMultiplier: 1.2, effects: [{ type: 'lifesteal', value: 0.5 }] },
    ],
    description: 'Nekromanta, który sprzedał siebie Pustce za nieśmiertelność. Nieśmiertelność taką jak ta — to nie był handel warty zachodu.',
    city: 'cytadela',
    isBoss: false,
    enrageThreshold: null,
  },

  fallen_seraph: {
    id: 'fallen_seraph', name: 'Upadły Serafin', icon: '😇',
    hp: 300, maxHp: 300,
    attack: 60, defense: 25, agility: 22,
    expReward: 200, goldReward: [60, 110],
    loot: [
      { itemId: 'gods_ether', chance: 0.3 },
      { itemId: 'executioner_sword', chance: 0.08 },
      { itemId: 'sunbreaker_plate', chance: 0.06 },
    ],
    skills: [
      { name: 'Boskie Ostrze', manaCost: 0, cooldown: 2, damageMultiplier: 2.0, effects: [] },
      { name: 'Skrzydłami Mroku', manaCost: 0, cooldown: 3, damageMultiplier: 1.5, effects: [{ type: 'stun', duration: 1, chance: 0.6 }] },
      { name: 'Anielska Aura', manaCost: 0, cooldown: 5, damageMultiplier: 0, effects: [{ type: 'self_heal_flat', value: 80 }] },
    ],
    description: 'Anioł boga słońca, który wyznał wierność Pustce, gdy zrozumiał, że bogom nie powinno się ufać.',
    city: 'cytadela',
    isBoss: false,
    enrageThreshold: null,
  },

  // ─── CYTADELA BOSS 1 ──────────────────────────────────
  the_last_god: {
    id: 'the_last_god', name: 'Ostatni Bóg', icon: '⛩️',
    hp: 1200, maxHp: 1200,
    attack: 90, defense: 45, agility: 30,
    expReward: 800, goldReward: [300, 500],
    loot: [
      { itemId: 'gods_ether', chance: 1.0 },
      { itemId: 'voidreaper', chance: 0.25 },
      { itemId: 'staff_of_collapsing_stars', chance: 0.2 },
      { itemId: 'sunbreaker_plate', chance: 0.3 },
      { itemId: 'helm_of_the_fallen_sun', chance: 0.2 },
    ],
    skills: [
      { name: 'Boskie Palenie', manaCost: 0, cooldown: 1, damageMultiplier: 1.8, effects: [] },
      { name: 'Grom Olimpu', manaCost: 0, cooldown: 3, damageMultiplier: 2.8, effects: [{ type: 'stun', duration: 1, chance: 0.7 }] },
      { name: 'Boska Tarcza', manaCost: 0, cooldown: 4, damageMultiplier: 0, effects: [{ type: 'self_buff', stat: 'defense', value: 0.8, duration: 2 }] },
      { name: 'Płomień Bóstwa', manaCost: 0, cooldown: 5, damageMultiplier: 3.5, effects: [{ type: 'bleed', damage: 30, duration: 3, chance: 0.8 }] },
    ],
    description: 'To nie jest "bóg". To jest to, co zostało z koncepcji boga — forma bez esencji, moc bez mądrości, siła bez celu. I właśnie dlatego jest tak niebezpieczne.',
    city: 'cytadela',
    isBoss: true,
    bossTitle: 'Czwarta Pieczęć: Tron Cytadeli',
    dialogue: {
      intro: '[Ogromna figura na złamanym tronie. Otwiera oczy — tysiąc oczu.] ...KTO... PRZYCHODZI DO... [głos jak trzęsienie ziemi] ...KOGO JA BYŁEM? POWIEDZ MI KIM BYŁEM. [Cisza pełna bólu i zniszczenia.]',
      enrage: '[50% HP. Trono rozrywa się. Z ciała Ostatniego Boga wybucha fioletowe płomienie.] PAMIĘTAM! PAMIĘTAM! BYŁEM KRÓLEM BOGÓW I TO TY... TY JESTEŚ TYM, CO MNIE ZABIŁO. CIĄGLE ZABIJA. NIGDY NIE UMRĘ!',
      death: '[Powoli opada.] ...pamiętam... imię... Au... Aurel... Aurelio... nie byłem taki jak on... on wiedział jak... a ja tylko... [nie kończy. Pada. Cisza.]',
    },
    enrageThreshold: 0.5,
    enrageEffects: {
      attackMultiplier: 2.0,
      defenseMultiplier: 0.7,
      specialAttack: {
        name: 'Boski Armagedon',
        description: 'Ostateczna moc upadłego króla — 400% obrażeń, ignoruje 60% pancerza i zadaje Bleed + Stun.',
        damageMultiplier: 4.0,
        armorPenetration: 0.6,
        effects: [
          { type: 'stun', duration: 1, chance: 0.9 },
          { type: 'bleed', damage: 40, duration: 3, chance: 1.0 },
        ],
        cooldown: 3,
      },
    },
    mainQuestShard: true,
  },

  // ─── CYTADELA BOSS 2 (FINAL) ──────────────────────────
  the_endless_void: {
    id: 'the_endless_void', name: 'Niegraniczona Pustka', icon: '🕳️',
    hp: 2500, maxHp: 2500,
    attack: 130, defense: 60, agility: 45,
    expReward: 2000, goldReward: [800, 1500],
    loot: [
      { itemId: 'gods_ether', chance: 1.0 },
      { itemId: 'ring_of_endless_night', chance: 0.5 },
      { itemId: 'godslayer_pendant', chance: 0.4 },
      { itemId: 'divine_ambrosia', chance: 0.6 },
    ],
    skills: [
      { name: 'Cień Nieskończoności', manaCost: 0, cooldown: 1, damageMultiplier: 2.0, effects: [] },
      { name: 'Pochłonięcie', manaCost: 0, cooldown: 2, damageMultiplier: 2.5, effects: [{ type: 'mana_drain', value: 40 }] },
      { name: 'Nicość', manaCost: 0, cooldown: 3, damageMultiplier: 3.5, effects: [{ type: 'silence', duration: 2, chance: 0.7 }] },
      { name: 'Anihilacja', manaCost: 0, cooldown: 5, damageMultiplier: 5.0, effects: [{ type: 'stun', duration: 2, chance: 0.8 }] },
    ],
    description: 'Pustka sama. Nie ma twarzy, nie ma ciała — jest brakiem wszystkiego i jednocześnie niszczy przez swoje istnienie. Końcowy antagonista historii, którą zaczął koniec bogów.',
    city: 'cytadela',
    isBoss: true,
    bossTitle: 'Piąta Pieczęć: Serce Pustki',
    dialogue: {
      intro: '[Ciemność wypełnia całą komnię. Z niej wyłania się coś, co jest brakiem.] ...jesteś tu. Wiedziałam, że przyjdziesz. Zebrałeś odłamki. Chcesz mnie zabić. Ale czy zastanowiłeś się, że może... chcę, żebyś to zrobił?',
      enrage: '[40% HP. Rzeczywistość pęka widocznie.] DOŚĆ ZABAWY. CZAS KOŃCA. [Cały pokój wypełnia się pulsującą ciemnością. Nie możesz uciec. Walczysz albo ginieresz.] KONIEC WSZYSTKIEGO. KONIEC CIEBIE.',
      death: '[Pustka pęka. Zaczyna mówić wszystkimi głosami naraz.] ...zapełniłeś mnie. Nie wiedziałam, że jestem pusta. Teraz... teraz jestem pełna. Czymś. Tobą. [Znika. Zostaje światło.]',
    },
    enrageThreshold: 0.4,
    enrageEffects: {
      attackMultiplier: 2.5,
      defenseMultiplier: 0.5,
      specialAttack: {
        name: 'Absolutna Nicość',
        description: 'Ostateczny atak Pustki — zadaje 35% maksymalnego HP gracza bezpośrednio, ignoruje wszelki pancerz.',
        damageMultiplier: 0,
        directHpPercent: 0.35,
        effects: [
          { type: 'silence', duration: 2, chance: 0.9 },
          { type: 'stun', duration: 1, chance: 0.6 },
        ],
        cooldown: 4,
      },
    },
    finalBoss: true,
    mainQuestShard: true,
  },
};

export const getEnemyById = (id) => {
  const e = ENEMIES[id];
  if (!e) return null;
  return { ...e, hp: e.maxHp };
};

export const getEnemiesByCity = (cityId) =>
  Object.values(ENEMIES).filter((e) => e.city === cityId && !e.isBoss);

export const getBossesByCity = (cityId) =>
  Object.values(ENEMIES).filter((e) => e.city === cityId && e.isBoss);

export const generateEnemyForBounty = (minLevel) => {
  const pools = [
    'skeleton_guard', 'corrupted_hound', 'ruin_crawler', 'fallen_knight',
    'wraith_archer', 'void_acolyte', 'stone_sentinel', 'prophet_revenant',
    'divine_automaton', 'god_remnant', 'chaos_lich', 'fallen_seraph',
  ];
  const idx = Math.min(
    Math.floor(minLevel / 5),
    pools.length - 1
  );
  const available = pools.slice(0, idx + 3);
  const pick = available[Math.floor(Math.random() * available.length)];
  const base = getEnemyById(pick);
  const levelScale = 1 + (minLevel - 1) * 0.15;
  return {
    ...base,
    hp: Math.floor(base.maxHp * levelScale),
    maxHp: Math.floor(base.maxHp * levelScale),
    attack: Math.floor(base.attack * levelScale),
    defense: Math.floor(base.defense * levelScale),
    expReward: Math.floor(base.expReward * levelScale),
    goldReward: base.goldReward.map((g) => Math.floor(g * levelScale)),
  };
};
