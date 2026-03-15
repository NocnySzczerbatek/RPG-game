// Proceduralne generowanie lochów do ai-RPG
export function generate(level = 1, seed = 42) {
  // Prosty generator lochu: zwraca layout, komnaty, poziom trudności
  const TILE_S = 16;
  const MAP_W = 150, MAP_H = 150;
  const layout = Array.from({ length: MAP_H }, () => new Uint8Array(MAP_W));
  const chambers = [];
  const NUM_CHAMBERS = 8 + Math.floor(level * 0.5);
  let rng = mulberry32(seed);
  for (let i = 0; i < NUM_CHAMBERS; i++) {
    const rw = 8 + Math.floor(rng() * 10);
    const rh = 8 + Math.floor(rng() * 10);
    const rx = 4 + Math.floor(rng() * (MAP_W - rw - 8));
    const ry = 4 + Math.floor(rng() * (MAP_H - rh - 8));
    let overlap = false;
    for (const c of chambers) {
      if (rx < c.x + c.w + 2 && rx + rw + 2 > c.x && ry < c.y + c.h + 2 && ry + rh + 2 > c.y) { overlap = true; break; }
    }
    if (overlap) continue;
    chambers.push({ x: rx, y: ry, w: rw, h: rh, cx: rx + Math.floor(rw / 2), cy: ry + Math.floor(rh / 2) });
    for (let dy = 0; dy < rh; dy++) for (let dx = 0; dx < rw; dx++) {
      layout[ry + dy][rx + dx] = 1;
    }
  }
  // Korytarze
  for (let i = 0; i < chambers.length - 1; i++) {
    const a = chambers[i], b = chambers[i + 1];
    let x = a.cx, y = a.cy;
    while (x !== b.cx) { if (layout[y][x] === 0) layout[y][x] = 2; x += x < b.cx ? 1 : -1; }
    while (y !== b.cy) { if (layout[y][x] === 0) layout[y][x] = 2; y += y < b.cy ? 1 : -1; }
  }
  return { layout, chambers, level };
}
// Prosty RNG
function mulberry32(a) { return function() { var t = a += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; } }
// Skalowanie HP potworów
export function scaleMonsterHP(baseHP, dungeonLevel) {
  return Math.round(baseHP * Math.pow(1.2, dungeonLevel - 1));
}
