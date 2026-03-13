// ============================================================
// DATABASE: CHARACTER CLASSES
// ============================================================

export const CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Wojownik',
    title: 'Strażnik Ruin',
    description:
      'Zahartowany w bojach koloss opancerzony w złamanej wierze. Kiedy bogowie upadli, Wojownicy stali się ostatnią linią obrony — i pierwszą do wyrzucenia na pożarcie.',
    icon: '⚔️',
    color: 'text-red-400',
    borderColor: 'border-red-700',
    baseStats: {
      strength: 18,
      agility: 10,
      intelligence: 6,
      endurance: 16,
    },
    statGrowth: {
      strength: 3.2,
      agility: 1.5,
      intelligence: 0.8,
      endurance: 2.8,
    },
    hpBase: 140,
    hpPerLevel: 18,
    manaBase: 30,
    manaPerLevel: 4,
    skills: [
      {
        id: 'shield_bash',
        name: 'Tarcza Zagłady',
        description: 'Roztrzaskuje wrogowi kości — 150% dmg + Ogłuszenie na 1 turę',
        manaCost: 10,
        cooldown: 2,
        damageMultiplier: 1.5,
        effects: [{ type: 'stun', duration: 1, chance: 0.7 }],
        learnLevel: 1,
        icon: '🛡️',
      },
      {
        id: 'battle_cry',
        name: 'Okrzyk Bojowy',
        description: 'Zwiększa własny ATK o 40% przez 3 tury. Przerażenie wroga -15% celności.',
        manaCost: 15,
        cooldown: 4,
        damageMultiplier: 0,
        effects: [
          { type: 'self_buff', stat: 'attack', value: 0.4, duration: 3 },
          { type: 'enemy_debuff', stat: 'accuracy', value: -0.15, duration: 3 },
        ],
        learnLevel: 3,
        icon: '📯',
      },
      {
        id: 'whirlwind',
        name: 'Wicher Śmierci',
        description: 'Atak wirujący — 120% obrażeń z szansą na krwawienie (15 dmg/tura przez 3 tury)',
        manaCost: 20,
        cooldown: 3,
        damageMultiplier: 1.2,
        effects: [{ type: 'bleed', damage: 15, duration: 3, chance: 0.65 }],
        learnLevel: 6,
        icon: '🌪️',
      },
      {
        id: 'last_stand',
        name: 'Ostatni Bastion',
        description: 'Gdy HP < 30% — absorbujesz 50% dmg przez 2 tury. Pasywnie aktywuje się raz na walkę.',
        manaCost: 0,
        cooldown: 99,
        damageMultiplier: 0,
        effects: [{ type: 'damage_absorb', value: 0.5, duration: 2, triggerHpPercent: 0.3 }],
        learnLevel: 10,
        icon: '🔥',
        passive: true,
      },
      {
        id: 'titans_blow',
        name: 'Cios Tytana',
        description: 'Kolosalny atak — 220% dmg. Ignoruje 40% pancerza wroga. CD: 5 tur.',
        manaCost: 35,
        cooldown: 5,
        damageMultiplier: 2.2,
        effects: [{ type: 'armor_penetration', value: 0.4 }],
        learnLevel: 15,
        icon: '💥',
      },
    ],
    startingEquipment: {
      weapon: 'rusted_longsword',
      armor: 'chainmail_vest',
    },
    lore: 'Przed upadkiem Panteonu, Wojownicy przysięgali wierność bogom. Teraz przysięgają tylko sobie — i stali się przez to jeszcze groźniejsi.',
  },

  mage: {
    id: 'mage',
    name: 'Mag',
    title: 'Lamentujący Wieszcz',
    description:
      'Uczony, który sprzedał wspomnienia za fragmenty boskiej mocy. Każde zaklęcie kosztuje go kawałek tożsamości — ale kto jeszcze pamięta, kim był?',
    icon: '🔮',
    color: 'text-blue-400',
    borderColor: 'border-blue-700',
    baseStats: {
      strength: 6,
      agility: 10,
      intelligence: 22,
      endurance: 8,
    },
    statGrowth: {
      strength: 0.8,
      agility: 1.5,
      intelligence: 3.8,
      endurance: 1.2,
    },
    hpBase: 70,
    hpPerLevel: 8,
    manaBase: 120,
    manaPerLevel: 16,
    skills: [
      {
        id: 'void_bolt',
        name: 'Bełt Pustki',
        description: 'Strzelba z przeszytej nicości — INT × 1.4 obrażeń. Ignoruje magiczną odporność.',
        manaCost: 8,
        cooldown: 0,
        damageMultiplier: 1.4,
        scaleStat: 'intelligence',
        effects: [],
        learnLevel: 1,
        icon: '🌑',
      },
      {
        id: 'frost_nova',
        name: 'Nova Mrozu',
        description: 'Eksplozja lodowej energii — INT × 1.2 + Zamrożenie na 1 turę (wróg traci akcję).',
        manaCost: 18,
        cooldown: 3,
        damageMultiplier: 1.2,
        scaleStat: 'intelligence',
        effects: [{ type: 'freeze', duration: 1, chance: 0.6 }],
        learnLevel: 3,
        icon: '❄️',
      },
      {
        id: 'arcane_mirror',
        name: 'Arkanowe Zwierciadło',
        description: 'Odbija 60% dmg przy następnym ataku fizycznym wroga. Aktywne 2 tury.',
        manaCost: 22,
        cooldown: 4,
        damageMultiplier: 0,
        effects: [{ type: 'reflect', value: 0.6, duration: 2 }],
        learnLevel: 6,
        icon: '🪞',
      },
      {
        id: 'soul_drain',
        name: 'Spijanie Duszy',
        description: 'Wysysa życiodajną esencję — INT × 0.9 dmg + odzyskujesz 40% zadanych obrażeń jako HP.',
        manaCost: 25,
        cooldown: 3,
        damageMultiplier: 0.9,
        scaleStat: 'intelligence',
        effects: [{ type: 'lifesteal', value: 0.4 }],
        learnLevel: 10,
        icon: '💜',
      },
      {
        id: 'apocalypse',
        name: 'Apokalipsa',
        description: 'Ostatni rozdział cywilizacji — INT × 3.5 dmg. 50% szans na Silence (wróg traci umiejętności na 2 tury).',
        manaCost: 60,
        cooldown: 6,
        damageMultiplier: 3.5,
        scaleStat: 'intelligence',
        effects: [{ type: 'silence', duration: 2, chance: 0.5 }],
        learnLevel: 15,
        icon: '☄️',
      },
    ],
    startingEquipment: {
      weapon: 'apprentice_staff',
      armor: 'tattered_robes',
    },
    lore: 'Biblioteka Bogów spłonęła. Mag uratował tylko jedno — zaklęcie, które bóg-ogień rzucił, ginąc. Teraz nosi je w oczach.',
  },

  paladin: {
    id: 'paladin',
    name: 'Paladyn',
    title: 'Stróż Złamanej Przysięgi',
    description:
      'Kapłan-wojownik, którego bóg umarł w jego ramionach. Modły nie docierają nigdzie — a mimo to Paladyn wstaje z kolan każdego ranka z mieczem w dłoni.',
    icon: '✝️',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-700',
    baseStats: {
      strength: 14,
      agility: 9,
      intelligence: 12,
      endurance: 14,
    },
    statGrowth: {
      strength: 2.4,
      agility: 1.4,
      intelligence: 2.0,
      endurance: 2.2,
    },
    hpBase: 110,
    hpPerLevel: 14,
    manaBase: 70,
    manaPerLevel: 10,
    skills: [
      {
        id: 'holy_strike',
        name: 'Święty Cios',
        description: 'Miecz przepojony dogasającą boską iskrą — (STR + INT) × 1.1 obrażeń. Leczy 10% zadanych dmg.',
        manaCost: 10,
        cooldown: 1,
        damageMultiplier: 1.1,
        scaleStat: 'both',
        effects: [{ type: 'lifesteal', value: 0.1 }],
        learnLevel: 1,
        icon: '⚡',
      },
      {
        id: 'divine_shield',
        name: 'Boska Tarcza',
        description: 'Powołuje tarczę ze zestwardniałej wiary — absorbujesz dmg równy 2× INT przez 2 tury.',
        manaCost: 20,
        cooldown: 4,
        damageMultiplier: 0,
        effects: [{ type: 'shield', value: 2, scaleStat: 'intelligence', duration: 2 }],
        learnLevel: 3,
        icon: '🛡️',
      },
      {
        id: 'judgment',
        name: 'Sąd Ostateczny',
        description: 'Wyrok Pustych Niebios — (STR + INT) × 1.8. Wrogowie z aktywnym efektem statusu otrzymują +50% dmg.',
        manaCost: 28,
        cooldown: 4,
        damageMultiplier: 1.8,
        scaleStat: 'both',
        effects: [{ type: 'execute_bonus', vsStatusEffect: true, bonus: 0.5 }],
        learnLevel: 6,
        icon: '⚖️',
      },
      {
        id: 'resurrection_light',
        name: 'Światło Zmartwychwstania',
        description: 'Jednorazowe w walce: jeśli HP = 0, wracasz z 40% HP. Pasywna zdolność.',
        manaCost: 0,
        cooldown: 99,
        damageMultiplier: 0,
        effects: [{ type: 'revive', hpPercent: 0.4, oncePerBattle: true }],
        learnLevel: 10,
        icon: '✨',
        passive: true,
      },
      {
        id: 'armageddon_prayer',
        name: 'Modlitwa Armagedonu',
        description: 'Ostatni płomień zgasłego boga — (STR + INT) × 3.0 + leczysz się za 25% maks. HP.',
        manaCost: 55,
        cooldown: 6,
        damageMultiplier: 3.0,
        scaleStat: 'both',
        effects: [{ type: 'self_heal', value: 0.25, scaleStat: 'maxHp' }],
        learnLevel: 15,
        icon: '🌟',
      },
    ],
    startingEquipment: {
      weapon: 'consecrated_mace',
      armor: 'worn_platemail',
    },
    lore: 'Ostatni paladyn Zakonu Złotego Słońca nie złożył broni, gdy niebo zgasło. Nikt nie wie, czy to odwaga, czy szaleństwo.',
  },

  ninja: {
    id: 'ninja',
    name: 'Ninja',
    title: 'Cień w Epoce Popiołu',
    description:
      'Zabójca bogów. Nie walczy twarzą w twarz — bo jest martwy, zanim zdążysz to zrozumieć. Jego gildię wycięto, gdy przetargował informacje po której stronie nie-świętej wojny stać.',
    icon: '🌘',
    color: 'text-purple-400',
    borderColor: 'border-purple-700',
    baseStats: {
      strength: 12,
      agility: 22,
      intelligence: 10,
      endurance: 8,
    },
    statGrowth: {
      strength: 1.8,
      agility: 3.5,
      intelligence: 1.2,
      endurance: 1.5,
    },
    hpBase: 85,
    hpPerLevel: 10,
    manaBase: 60,
    manaPerLevel: 8,
    skills: [
      {
        id: 'shadow_strike',
        name: 'Cios z Cienia',
        description: 'AGI × 1.6 obrażeń. Jeśli wróg nie atakował w tej turze — automatycznie cios krytyczny.',
        manaCost: 8,
        cooldown: 0,
        damageMultiplier: 1.6,
        scaleStat: 'agility',
        effects: [{ type: 'auto_crit_if_enemy_idle' }],
        learnLevel: 1,
        icon: '🗡️',
      },
      {
        id: 'smoke_screen',
        name: 'Zasłona Dymu',
        description: 'Unikasz wszystkich ataków przez 1 turę + następny twój atak zadaje +80% dmg.',
        manaCost: 15,
        cooldown: 3,
        damageMultiplier: 0,
        effects: [
          { type: 'full_dodge', duration: 1 },
          { type: 'next_attack_bonus', value: 0.8 },
        ],
        learnLevel: 3,
        icon: '💨',
      },
      {
        id: 'poison_blades',
        name: 'Ostrza Trucizny',
        description: 'Zatruwa wrogowi krew — AGI × 1.0 dmg + 25 trucizny/tura przez 4 tury.',
        manaCost: 20,
        cooldown: 3,
        damageMultiplier: 1.0,
        scaleStat: 'agility',
        effects: [{ type: 'poison', damage: 25, duration: 4, chance: 1.0 }],
        learnLevel: 6,
        icon: '☠️',
      },
      {
        id: 'phantom_step',
        name: 'Krok Widma',
        description: 'Teleportacja za plecy wroga — następne 2 ataki mają 100% szansy na krytyk i +30% dmg.',
        manaCost: 25,
        cooldown: 5,
        damageMultiplier: 0,
        effects: [{ type: 'guaranteed_crit', attacks: 2 }, { type: 'attack_bonus', value: 0.3, attacks: 2 }],
        learnLevel: 10,
        icon: '👻',
      },
      {
        id: 'death_sentence',
        name: 'Wyrok Śmierci',
        description: 'AGI × 4.0 obrażeń. Jeśli wróg ma < 25% HP — natychmiastowe dobicie.',
        manaCost: 50,
        cooldown: 6,
        damageMultiplier: 4.0,
        scaleStat: 'agility',
        effects: [{ type: 'execute', hpThreshold: 0.25 }],
        learnLevel: 15,
        icon: '💀',
      },
    ],
    startingEquipment: {
      weapon: 'iron_daggers',
      armor: 'shadow_wraps',
    },
    lore: 'Imię jego mistrza jest wymazane z każdego zapisu. Szkoła Trzeciego Oka nie istnieje na żadnej mapie. Ninja jest jedynym, który wie, że kiedyś istniała.',
  },
};

export const getClassById = (id) => CLASSES[id] || null;

export const computePlayerStats = (playerClass, level) => {
  const cls = CLASSES[playerClass];
  if (!cls) return null;
  const stats = {};
  for (const [stat, base] of Object.entries(cls.baseStats)) {
    stats[stat] = Math.floor(base + cls.statGrowth[stat] * (level - 1));
  }
  const hp = cls.hpBase + cls.hpPerLevel * (level - 1);
  const mana = cls.manaBase + cls.manaPerLevel * (level - 1);
  return { ...stats, maxHp: hp, maxMana: mana };
};

export const getAttackDamage = (player) => {
  const cls = CLASSES[player.class];
  if (!cls) return 10;
  const { strength, agility, intelligence } = player.stats;
  if (player.class === 'mage') return Math.floor(intelligence * 1.1);
  if (player.class === 'ninja') return Math.floor(agility * 1.1);
  if (player.class === 'paladin') return Math.floor((strength + intelligence) * 0.6);
  return Math.floor(strength * 1.1);
};

export const getAvailableSkills = (player) =>
  CLASSES[player.class].skills.filter((s) => s.learnLevel <= player.level);
