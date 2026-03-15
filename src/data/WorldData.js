/* ═══════════════════════════════════════════════════════════════
   WORLD DATA — Cities, Roads, NPCs, Building Blueprints
   ═══════════════════════════════════════════════════════════════ */

export const WORLD_SIZE = 6000;

/* ── 6 City definitions ────────────────────────────────────── */
export const CITIES = [
  {
    id: 'eldergrove', name: 'Eldergrove', x: 1200, y: 1200,
    radius: 340, style: 'village', biome: 'forest',
    desc: 'Spokojne miasteczko, bezpieczna przystań dla podróżników.',
    buildings: [
      { type: 'house_large', ox: -80, oy: -60 },
      { type: 'house_small', ox: 80, oy: -40 },
      { type: 'house_small', ox: -60, oy: 80 },
      { type: 'forge', ox: 100, oy: 90 },
      { type: 'well', ox: 0, oy: 10 },
      { type: 'house_large', ox: -120, oy: 30 },
    ],
    npcs: [
      { role: 'blacksmith', ox: 115, oy: 65, label: 'Kowal Thorn' },
      { role: 'merchant', ox: -100, oy: -85, label: 'Uzdrowiciel Lira' },
      { role: 'quest', ox: -30, oy: -55, label: 'Stary Aethor' },
      { role: 'quest', ox: 65, oy: -15, label: 'Zwiadowca Mira' },
    ],
  },
  {
    id: 'sunhold', name: 'Sunhold', x: 3600, y: 900,
    radius: 320, style: 'fortress', biome: 'plains',
    desc: 'Forteca wojowników na wzgórzach.',
    buildings: [
      { type: 'castle', ox: 0, oy: -30 },
      { type: 'house_large', ox: -100, oy: 50 },
      { type: 'house_small', ox: 90, oy: 70 },
      { type: 'forge', ox: -80, oy: 90 },
      { type: 'watchtower', ox: 130, oy: -50 },
    ],
    npcs: [
      { role: 'blacksmith', ox: -65, oy: 65, label: 'Kowal Garen' },
      { role: 'merchant', ox: -110, oy: 25, label: 'Handlarz Felix' },
      { role: 'quest', ox: 20, oy: -55, label: 'Kapitan Aldros' },
      { role: 'quest', ox: 90, oy: 45, label: 'Mag Obrońca Yara' },
    ],
  },
  {
    id: 'ironpeak', name: 'Ironpeak', x: 5000, y: 3000,
    radius: 300, style: 'mountain', biome: 'barren',
    desc: 'Miasteczko górnicze, pełne rud i minersów.',
    buildings: [
      { type: 'house_large', ox: -60, oy: -50 },
      { type: 'house_small', ox: 70, oy: -30 },
      { type: 'forge', ox: 0, oy: 80 },
      { type: 'house_small', ox: -100, oy: 50 },
      { type: 'campfire', ox: 40, oy: 20 },
    ],
    npcs: [
      { role: 'blacksmith', ox: 15, oy: 55, label: 'Kowalka Brenna' },
      { role: 'merchant', ox: -75, oy: -75, label: 'Aptekarz Dolin' },
      { role: 'quest', ox: 55, oy: -5, label: 'Górnik Kael' },
      { role: 'quest', ox: -80, oy: 25, label: 'Badacz Ronen' },
    ],
  },
  {
    id: 'shadowfen', name: 'Shadowfen', x: 1500, y: 4500,
    radius: 310, style: 'swamp', biome: 'swamp',
    desc: 'Mroczna osada na bagnach, dom wiedźm i łotrzyków.',
    buildings: [
      { type: 'house_small', ox: -50, oy: -50 },
      { type: 'house_small', ox: 70, oy: -30 },
      { type: 'house_large', ox: -90, oy: 50 },
      { type: 'forge', ox: 80, oy: 70 },
      { type: 'campfire', ox: 0, oy: 10 },
    ],
    npcs: [
      { role: 'blacksmith', ox: 95, oy: 45, label: 'Kowal Morven' },
      { role: 'merchant', ox: -60, oy: -75, label: 'Znachor Ilsa' },
      { role: 'quest', ox: 55, oy: -5, label: 'Strażnik Fenn' },
      { role: 'quest', ox: -70, oy: 25, label: 'Czarodziejka Vex' },
      { role: 'quest', ox: 10, oy: -40, label: 'Złodziej Pip' },
    ],
  },
  {
    id: 'havenreach', name: 'Havenreach', x: 3000, y: 3200,
    radius: 350, style: 'market', biome: 'forest',
    desc: 'Wielki targ handlowy w sercu lasu.',
    buildings: [
      { type: 'house_large', ox: -100, oy: -60 },
      { type: 'house_large', ox: 100, oy: -40 },
      { type: 'house_small', ox: -80, oy: 60 },
      { type: 'house_small', ox: 60, oy: 80 },
      { type: 'well', ox: 0, oy: 0 },
      { type: 'forge', ox: 120, oy: 60 },
    ],
    npcs: [
      { role: 'blacksmith', ox: 135, oy: 35, label: 'Kowal Dorin' },
      { role: 'merchant', ox: -115, oy: -85, label: 'Kupiec Sarina' },
      { role: 'quest', ox: 85, oy: -15, label: 'Łowca Kira' },
      { role: 'quest', ox: -60, oy: 35, label: 'Bard Luken' },
    ],
  },
  {
    id: 'duskwall', name: 'Duskwall', x: 4800, y: 5200,
    radius: 300, style: 'ruins', biome: 'barren',
    desc: 'Opuszczone ruiny na skraju świata, brama do Krypty.',
    buildings: [
      { type: 'house_small', ox: -50, oy: -40 },
      { type: 'castle', ox: 60, oy: -20 },
      { type: 'forge', ox: -80, oy: 60 },
      { type: 'campfire', ox: 30, oy: 40 },
    ],
    npcs: [
      { role: 'blacksmith', ox: -65, oy: 35, label: 'Kowal Ashen' },
      { role: 'merchant', ox: -60, oy: -65, label: 'Wiedźma Nyx' },
      { role: 'quest', ox: 45, oy: -45, label: 'Strażnik Krypty' },
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
export const BUILDING_DEFS = {
  house_large:  { key: 'bld_house',     w: 64, h: 64, colH: 0.35, scale: 2.5 },
  house_small:  { key: 'bld_cottage',   w: 112, h: 96, colH: 0.25, scale: 3.0 },
  castle:       { key: 'bld_castle_sq', w: 64, h: 64, colH: 0.4,  scale: 2.5 },
  forge:        { key: 'bld_campfire',  w: 32, h: 32, colH: 0.3,  scale: 2.0 },
  well:         { key: 'bld_well',      w: 32, h: 32, colH: 0.5,  scale: 2.0 },
  watchtower:   { key: 'bld_tower',     w: 32, h: 64, colH: 0.3,  scale: 2.2 },
  campfire:     { key: 'bld_camp',      w: 32, h: 32, colH: 0,    scale: 2.0 },
};
