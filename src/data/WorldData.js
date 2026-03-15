/* ═══════════════════════════════════════════════════════════════
   WORLD DATA — Cities, Roads, NPCs, Building Blueprints
   ═══════════════════════════════════════════════════════════════ */

export const WORLD_SIZE = 6000;

/* ── 6 City definitions ────────────────────────────────────── */
/* NPCs are now INSIDE buildings (npcLabel field). No outdoor NPC arrays. */
export const CITIES = [
  {
    id: 'eldergrove', name: 'Eldergrove', x: 1200, y: 1200,
    radius: 460, style: 'village', biome: 'forest',
    desc: 'Spokojne miasteczko, bezpieczna przystań dla podróżników.',
    buildings: [
      { type: 'hall', ox: 0, oy: -60, room: 'Karczma', npcLabel: 'Karczmarz Bogdan' },
      { type: 'hut', ox: -280, oy: -180, room: 'Sypialnia', npcLabel: 'Stary Aethor' },
      { type: 'hut', ox: 280, oy: -160, room: 'Sklep', npcLabel: 'Kupiec Lira' },
      { type: 'hut', ox: -260, oy: 160, room: 'Biblioteka', npcLabel: 'Skryba Mira' },
      { type: 'hut', ox: 270, oy: 180, room: 'Kuźnia', npcLabel: 'Kowal Thorn' },
      { type: 'well', ox: 0, oy: 80 },
    ],
  },
  {
    id: 'sunhold', name: 'Sunhold', x: 3600, y: 900,
    radius: 440, style: 'fortress', biome: 'plains',
    desc: 'Forteca wojowników na wzgórzach.',
    buildings: [
      { type: 'hall', ox: 0, oy: -50, room: 'Karczma', npcLabel: 'Karczmarz Aldric' },
      { type: 'hut', ox: -270, oy: 140, room: 'Kuźnia', npcLabel: 'Kowal Garen' },
      { type: 'hut', ox: 270, oy: 160, room: 'Sypialnia', npcLabel: 'Kapitan Yara' },
      { type: 'hut', ox: -260, oy: -170, room: 'Sklep', npcLabel: 'Handlarz Felix' },
      { type: 'watchtower', ox: 280, oy: -170 },
    ],
  },
  {
    id: 'ironpeak', name: 'Ironpeak', x: 5000, y: 3000,
    radius: 420, style: 'mountain', biome: 'barren',
    desc: 'Miasteczko górnicze, pełne rud i minersów.',
    buildings: [
      { type: 'hall', ox: 0, oy: -50, room: 'Karczma', npcLabel: 'Karczmarz Dolin' },
      { type: 'hut', ox: -270, oy: -160, room: 'Sypialnia', npcLabel: 'Górnik Kael' },
      { type: 'hut', ox: 270, oy: -150, room: 'Kuźnia', npcLabel: 'Kowalka Brenna' },
      { type: 'hut', ox: -260, oy: 170, room: 'Biblioteka', npcLabel: 'Badacz Ronen' },
    ],
  },
  {
    id: 'shadowfen', name: 'Shadowfen', x: 1500, y: 4500,
    radius: 430, style: 'swamp', biome: 'swamp',
    desc: 'Mroczna osada na bagnach, dom wiedźm i łotrzyków.',
    buildings: [
      { type: 'hall', ox: 0, oy: -50, room: 'Karczma', npcLabel: 'Znachorka Ilsa' },
      { type: 'hut', ox: -270, oy: -160, room: 'Sklep', npcLabel: 'Handlarz Vex' },
      { type: 'hut', ox: 270, oy: -150, room: 'Sypialnia', npcLabel: 'Strażnik Fenn' },
      { type: 'hut', ox: 260, oy: 170, room: 'Kuźnia', npcLabel: 'Kowal Morven' },
    ],
  },
  {
    id: 'havenreach', name: 'Havenreach', x: 3000, y: 3200,
    radius: 470, style: 'market', biome: 'forest',
    desc: 'Wielki targ handlowy w sercu lasu.',
    buildings: [
      { type: 'hall', ox: 0, oy: -60, room: 'Karczma', npcLabel: 'Karczmarz Luken' },
      { type: 'hut', ox: -290, oy: -180, room: 'Sklep', npcLabel: 'Kupiec Sarina' },
      { type: 'hut', ox: 290, oy: -160, room: 'Sypialnia', npcLabel: 'Łowca Kira' },
      { type: 'hut', ox: -280, oy: 170, room: 'Biblioteka', npcLabel: 'Bard Elion' },
      { type: 'hut', ox: 280, oy: 190, room: 'Kuźnia', npcLabel: 'Kowal Dorin' },
      { type: 'well', ox: 0, oy: 80 },
    ],
  },
  {
    id: 'duskwall', name: 'Duskwall', x: 4800, y: 5200,
    radius: 420, style: 'ruins', biome: 'barren',
    desc: 'Opuszczone ruiny na skraju świata, brama do Krypty.',
    buildings: [
      { type: 'hall', ox: 0, oy: -50, room: 'Karczma', npcLabel: 'Karczmarz Nyx' },
      { type: 'hut', ox: -270, oy: 150, room: 'Kuźnia', npcLabel: 'Kowal Ashen' },
      { type: 'hut', ox: 270, oy: -160, room: 'Biblioteka', npcLabel: 'Strażnik Krypty' },
    ],
  },
];

/* ── Roads connecting cities ──────────────────────────────── */
export const ROADS = [
  ['eldergrove', 'sunhold'],
  ['eldergrove', 'havenreach'],
  ['sunhold', 'ironpeak'],
  ['havenreach', 'ironpeak'],
  ['havenreach', 'shadowfen'],
  ['eldergrove', 'shadowfen'],
  ['ironpeak', 'duskwall'],
  ['havenreach', 'duskwall'],
];

/* ── Portal (near Duskwall) ──────────────────────────────── */
export const PORTAL_POS = { x: 5100, y: 5400 };

/* ── Enemy zone density: how many of each type per zone ──── */
export const ENEMY_ZONES = [
  // Safe zone around Eldergrove (fewer enemies)
  { cx: 1200, cy: 1200, r: 700, types: { slime: 4 } },
  // Forest band (Eldergrove – Havenreach)
  { cx: 2100, cy: 2200, r: 900, types: { orc: 10, slime: 8 } },
  // Northern plains (Sunhold area)
  { cx: 3600, cy: 1400, r: 800, types: { orc: 8, demon: 3 } },
  // Eastern mountains (Ironpeak)
  { cx: 4800, cy: 3200, r: 700, types: { demon: 6, orc: 5 } },
  // Swamp (Shadowfen)
  { cx: 1500, cy: 4200, r: 800, types: { slime: 12, orc: 4, demon: 2 } },
  // Dark wastes (Duskwall)
  { cx: 4600, cy: 5000, r: 800, types: { demon: 8, orc: 6 } },
];

/* ── Asset paths ─────────────────────────────────────────── */
export const SUMMER_TILES = 'assets/sprites/craftpix-net-381103-free-simple-summer-top-down-vector-tileset/PNG';
export const GUILD_TILES  = 'assets/sprites/craftpix-net-189780-free-top-down-pixel-art-guild-hall-asset-pack/PNG';
export const DUNGEON_TILES = 'assets/sprites/craftpix-net-169442-free-2d-top-down-pixel-dungeon-asset-pack/PNG';

/* ── Building type → sprite key mapping ──────────────────── */
// House sprite is 480x640 natively. Player is 128x128 at scale 1.6 = ~200px.
// Buildings must be visually larger than the player.
export const BUILDING_DEFS = {
  hall:        { key: 'bld_house', scale: 0.52, enterable: true, floorW: 200, floorH: 160 },
  hut:         { key: 'bld_house', scale: 0.38, enterable: true, floorW: 150, floorH: 120 },
  well:        { key: 'bld_well',  scale: 0.55, enterable: false, colR: 30 },
  watchtower:  { key: 'bld_tower', scale: 0.45, enterable: false, colR: 35 },
};

/* ── Room type definitions — furniture along walls, center clear ── */
// npcRole: determines what the indoor NPC does (trade opens shop, quest gives dialogue)
export const ROOM_TYPES = [
  {
    name: 'Sypialnia', npcRole: 'quest', npcName: 'Mieszkaniec',
    furniture: [
      // North wall
      { type: 'bed', ox: -55, oy: -55 },
      { type: 'candle', ox: -30, oy: -58 },
      // East wall
      { type: 'shelf', ox: 60, oy: -25 },
      { type: 'shelf', ox: 60, oy: 15 },
      // West wall
      { type: 'chest', ox: -60, oy: 20 },
      // South wall (near door)
      { type: 'barrel', ox: 50, oy: 45 },
    ],
  },
  {
    name: 'Karczma', npcRole: 'trade', npcName: 'Karczmarz',
    furniture: [
      // Counter across middle — NPC stands behind it
      { type: 'counter', ox: 0, oy: -15 },
      // North wall
      { type: 'barrel', ox: -60, oy: -50 },
      { type: 'barrel', ox: 60, oy: -50 },
      // East wall
      { type: 'shelf', ox: 60, oy: 10 },
      // West wall
      { type: 'barrel', ox: -60, oy: 15 },
      // Candle on counter
      { type: 'candle', ox: -20, oy: -15 },
    ],
  },
  {
    name: 'Sklep', npcRole: 'trade', npcName: 'Kupiec',
    furniture: [
      // Counter — NPC stands behind
      { type: 'counter', ox: 0, oy: -10 },
      // North wall — shelves
      { type: 'shelf', ox: -55, oy: -50 },
      { type: 'shelf', ox: 55, oy: -50 },
      // East wall
      { type: 'chest', ox: 60, oy: 15 },
      // West wall
      { type: 'barrel', ox: -60, oy: 25 },
      { type: 'candle', ox: 0, oy: -20 },
    ],
  },
  {
    name: 'Kuźnia', npcRole: 'trade', npcName: 'Kowal',
    furniture: [
      // North wall — forge area
      { type: 'anvil', ox: -30, oy: -50 },
      { type: 'forge_fire', ox: 35, oy: -50 },
      // Counter across middle
      { type: 'counter', ox: 0, oy: -5 },
      // East wall
      { type: 'barrel', ox: 60, oy: 15 },
      // West wall
      { type: 'barrel', ox: -60, oy: 20 },
      { type: 'chest', ox: -55, oy: -20 },
    ],
  },
  {
    name: 'Biblioteka', npcRole: 'quest', npcName: 'Skryba',
    furniture: [
      // North wall — shelves
      { type: 'shelf', ox: -55, oy: -50 },
      { type: 'shelf', ox: 0, oy: -55 },
      { type: 'shelf', ox: 55, oy: -50 },
      // East wall
      { type: 'chest', ox: 60, oy: 25 },
      // West wall
      { type: 'table_small', ox: -55, oy: 10 },
      { type: 'candle', ox: -50, oy: 0 },
      // Chair near table (not blocking center)
      { type: 'chair', ox: -40, oy: 15 },
    ],
  },
];
