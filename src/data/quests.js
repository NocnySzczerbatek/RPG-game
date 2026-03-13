// ============================================================
// DATABASE: QUEST SYSTEM — Main Quest + Bounty Board
// ============================================================
import { generateEnemyForBounty } from './enemies.js';

// ─── MAIN QUEST: "Odłamki Słońca" ─────────────────────────
export const MAIN_QUESTS = [
  {
    id: 'mq0',
    stage: 0,
    title: 'Pierwsze Kroki w Popiołach',
    description:
      'Kapitan Lyra potrzebuje kogoś do oczyszczenia Dolnych Ruin Bastionu. Szybkie zadanie dla nowicjusza — i szansa, by pokazać na co cię stać.',
    objectives: [
      { id: 'obj0_1', text: 'Wejdź do Dolnych Ruin (stoczyć walkę z wrogiem w Bastionie)', type: 'combat', target: 'bastion', count: 1, current: 0 },
      { id: 'obj0_2', text: 'Porozmawiaj ze Starym Jasnowidzącym', type: 'talk', target: 'old_seer', done: false },
    ],
    rewards: { exp: 200, gold: 80, items: ['health_potion_medium'] },
    npcGiver: 'captain_lyra',
    city: 'bastion',
    nextStage: 1,
    dialogueTrigger: 'main_quest',
    tutorialStage: true,
  },
  {
    id: 'mq1',
    stage: 1,
    title: 'Pieczęć Pierwsza: Strażnik Bastionu',
    description:
      'Stary Jasnowidzący ujawnił prawdę o Odłamkach Słońca. Pierwszy z nich strzeże Nieśmiertelny Strażnik głęboko w Ruinach. Musisz go pokonać.',
    objectives: [
      { id: 'obj1_1', text: 'Pokonaj Nieśmiertelnego Strażnika (Boss: Bastion)', type: 'boss_kill', target: 'the_undying_warden', done: false },
    ],
    rewards: { exp: 500, gold: 200, items: ['health_potion_large', 'mana_potion_large'] },
    npcGiver: 'captain_lyra',
    city: 'bastion',
    nextStage: 2,
    shardReward: 'shard_bastion',
  },
  {
    id: 'mq2',
    stage: 2,
    title: 'Droga do Iglicza',
    description:
      'Posiadasz pierwszy Odłamek Słońca. Duch Bibliotekarza w Igliczu wie, gdzie znaleźć drugi. Podróżuj do Iglicza i odkryj jego tajemnice.',
    objectives: [
      { id: 'obj2_1', text: 'Dotrzyj do Iglicza', type: 'visit_city', target: 'iglieze', done: false },
      { id: 'obj2_2', text: 'Porozmawiaj z Duchem Bibliotekarza', type: 'talk', target: 'ghost_librarian', done: false },
    ],
    rewards: { exp: 300, gold: 150 },
    city: 'iglieze',
    nextStage: 3,
  },
  {
    id: 'mq3',
    stage: 3,
    title: 'Pieczęć Druga: Krypta Snów',
    description:
      'Ślepa Wyroczynia strzeże drugiego Odłamka Słońca w Krypcie Snów. Jej siła jest nieprzewidywalna — ale twój los jest jasny.',
    objectives: [
      { id: 'obj3_1', text: 'Pokonaj Ślepą Wyrocznię (Boss: Iglicze)', type: 'boss_kill', target: 'the_blind_oracle', done: false },
    ],
    rewards: { exp: 900, gold: 350, items: ['elixir_of_wrath'] },
    city: 'iglieze',
    nextStage: 4,
    shardReward: 'shard_iglieze',
  },
  {
    id: 'mq4',
    stage: 4,
    title: 'Cytadela Czeka',
    description:
      'Dwa Odłamki w twoich rękach. Bogini Astra przechowuje informację o czwartym — ale najpierw musisz pokonać Ostatniego Boga w Cytadeli.',
    objectives: [
      { id: 'obj4_1', text: 'Dotrzyj do Cytadeli', type: 'visit_city', target: 'cytadela', done: false },
      { id: 'obj4_2', text: 'Porozmawiaj z Astrą, Upadłą Boginią', type: 'talk', target: 'fallen_goddess', done: false },
      { id: 'obj4_3', text: 'Pokonaj 5 wrogów w Cytadeli', type: 'combat', target: 'cytadela', count: 5, current: 0 },
    ],
    rewards: { exp: 600, gold: 250 },
    city: 'cytadela',
    nextStage: 5,
  },
  {
    id: 'mq5',
    stage: 5,
    title: 'Pieczęć Czwarta: Tron Cytadeli',
    description:
      'Ostatni Bóg na złamanym tronie. Trzy Odłamki masz — czwarty wita cię za plecami demona bóstwa. Walcz.',
    objectives: [
      { id: 'obj5_1', text: 'Pokonaj Ostatniego Boga (Boss: Cytadela)', type: 'boss_kill', target: 'the_last_god', done: false },
    ],
    rewards: { exp: 1800, gold: 600, items: ['divine_ambrosia'] },
    city: 'cytadela',
    nextStage: 6,
    shardReward: 'shard_cytadela',
  },
  {
    id: 'mq6',
    stage: 6,
    title: 'Koniec Wszystkich Rzeczy',
    description:
      'Cztery Odłamki w twoich rękach. Milcząca Wyrocznia powiedziała, że piąty się objawi, gdy stajesz przed Pustką z pragnieniem zwycięstwa. To jest czas.',
    objectives: [
      { id: 'obj6_1', text: 'Porozmawiaj z Milczącą Wyrocznią', type: 'talk', target: 'silent_oracle', done: false },
      { id: 'obj6_2', text: 'Pokonaj Nieskończoną Pustkę (Ostateczny Boss)', type: 'boss_kill', target: 'the_endless_void', done: false },
    ],
    rewards: { exp: 5000, gold: 2000, items: ['divine_ambrosia', 'divine_ambrosia'] },
    city: 'cytadela',
    nextStage: 7,
    finalStage: true,
    shardReward: 'shard_finale',
  },
];

// ─── BOUNTY BOARD — nieskończony generator ─────────────────
const BOUNTY_TEMPLATES = [
  {
    type: 'kill_enemies',
    titleFn: (count, enemy) => `Polowanie: ${count}× ${enemy.name}`,
    descFn: (count, enemy, city) =>
      `Ziemia ${city} wymaga oczyszczenia. Wyeliminuj ${count} ${enemy.name}. Łowcy czeka złoto.`,
    objectiveFn: (count, enemy, city) => [
      { id: 'b_kill', text: `Pokonaj ${count}× ${enemy.name}`, type: 'combat', target: city, count, current: 0 },
    ],
    rewardFn: (level, count) => ({
      exp: Math.floor(60 * count * (1 + level * 0.12)),
      gold: Math.floor(40 * count * (1 + level * 0.12)),
    }),
  },
  {
    type: 'collect_gold',
    titleFn: () => 'Zbiórka Łupów',
    descFn: (count) => `Nikt nie pyta skąd masz złoto — pytamy tylko ile. Zbierz ${count} złotych monet z wrogów.`,
    objectiveFn: (count) => [
      { id: 'b_gold', text: `Zdobądź ${count} złota z wrogów`, type: 'collect_gold', count, current: 0 },
    ],
    rewardFn: (level, count) => ({
      exp: Math.floor(40 * (1 + level * 0.1)),
      gold: Math.floor(count * 0.6),
      items: level >= 5 ? ['health_potion_medium'] : ['health_potion_small'],
    }),
  },
  {
    type: 'survive_fights',
    titleFn: (count) => `${count} Walk Bez Odpoczynku`,
    descFn: (count) => `Musisz stoczyć ${count} walk bez korzystania z miast pomiędzy nimi. Liczy się wytrzymałość.`,
    objectiveFn: (count) => [
      { id: 'b_survive', text: `Wygraj ${count} walk z rzędu`, type: 'consecutive_wins', count, current: 0 },
    ],
    rewardFn: (level, count) => ({
      exp: Math.floor(80 * count * (1 + level * 0.15)),
      gold: Math.floor(60 * count * (1 + level * 0.15)),
      items: level >= 8 ? ['elixir_of_wrath'] : ['health_potion_medium'],
    }),
  },
];

const CITY_NAMES = { bastion: 'Bastionu', iglieze: 'Iglicza', cytadela: 'Cytadeli' };

export const generateBounties = (playerLevel, currentCity, count = 3) => {
  const bounties = [];
  const cities = ['bastion', 'iglieze', 'cytadela'];
  const availableCities = cities.filter((c) => {
    if (c === 'iglieze' && playerLevel < 5) return false;
    if (c === 'cytadela' && playerLevel < 10) return false;
    return true;
  });

  for (let i = 0; i < count; i++) {
    const template = BOUNTY_TEMPLATES[Math.floor(Math.random() * BOUNTY_TEMPLATES.length)];
    const city = availableCities[Math.floor(Math.random() * availableCities.length)];
    const enemy = generateEnemyForBounty(playerLevel);
    const killCount = Math.floor(Math.random() * 3) + 2;
    const goldCount = Math.floor((150 + playerLevel * 30) * (Math.random() * 0.5 + 0.75));

    const count_param = template.type === 'collect_gold' ? goldCount : killCount;

    bounties.push({
      id: `bounty_${Date.now()}_${i}`,
      type: 'bounty',
      title: template.titleFn(count_param, enemy, CITY_NAMES[city]),
      description: template.descFn(count_param, enemy, CITY_NAMES[city]),
      objectives: template.objectiveFn(count_param, enemy, city),
      rewards: template.rewardFn(playerLevel, count_param),
      city,
      difficulty: playerLevel < 5 ? 'Łatwe' : playerLevel < 10 ? 'Umiarkowane' : 'Trudne',
      timeLimit: null,
      isBounty: true,
    });
  }
  return bounties;
};

export const getMainQuestForStage = (stage) =>
  MAIN_QUESTS.find((q) => q.stage === stage) || null;

export const checkQuestObjective = (quest, event) => {
  if (!quest || !quest.objectives) return quest;
  const updated = { ...quest, objectives: quest.objectives.map((obj) => ({ ...obj })) };

  for (const obj of updated.objectives) {
    if (obj.done) continue;

    if (obj.type === 'combat' && event.type === 'combat_win' && event.city === obj.target) {
      obj.current = (obj.current || 0) + 1;
      if (obj.current >= obj.count) obj.done = true;
    }
    if (obj.type === 'boss_kill' && event.type === 'boss_kill' && event.enemyId === obj.target) {
      obj.done = true;
    }
    if (obj.type === 'talk' && event.type === 'talk' && event.npcId === obj.target) {
      obj.done = true;
    }
    if (obj.type === 'visit_city' && event.type === 'visit_city' && event.cityId === obj.target) {
      obj.done = true;
    }
    if (obj.type === 'collect_gold' && event.type === 'gold_earned') {
      obj.current = (obj.current || 0) + event.amount;
      if (obj.current >= obj.count) obj.done = true;
    }
    if (obj.type === 'consecutive_wins' && event.type === 'combat_win') {
      obj.current = (obj.current || 0) + 1;
      if (obj.current >= obj.count) obj.done = true;
    }
  }
  return updated;
};

export const isQuestComplete = (quest) =>
  quest?.objectives?.every((o) => o.done) ?? false;
