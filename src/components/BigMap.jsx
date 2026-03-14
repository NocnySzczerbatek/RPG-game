// ============================================================
// COMPONENT: Full-Screen World Map Overlay
// Renders organic noise-based biome shapes via canvas
// ============================================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BIOMES, CITIES, CITY_NPCS, BIOME_BOSSES, WORLD_W, WORLD_H, getBiomeAt } from './GameMap.jsx';

const MAP_SCALE = 0.14;
const MAP_W = WORLD_W * MAP_SCALE;
const MAP_H = WORLD_H * MAP_SCALE;
const CANVAS_RES = 250; // render resolution (upscaled via CSS)

const BIOME_COLORS_RGB = {
  forest:   [45, 90, 30],
  desert:   [138, 117, 64],
  ice:      [74, 106, 138],
  volcanic: [90, 26, 10],
  swamp:    [42, 58, 26],
  mountain: [74, 74, 74],
};

export default function BigMap({ playerPos, onClose }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 });
  const canvasRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'm' || e.key === 'M' || e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Render organic biome map on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = CANVAS_RES, ch = CANVAS_RES;
    canvas.width = cw; canvas.height = ch;
    const imageData = ctx.createImageData(cw, ch);
    const data = imageData.data;
    const stepX = WORLD_W / cw, stepY = WORLD_H / ch;

    for (let py = 0; py < ch; py++) {
      for (let px = 0; px < cw; px++) {
        const wx = px * stepX, wy = py * stepY;
        const { primary, secondary, blend } = getBiomeAt(wx, wy);
        const pc = BIOME_COLORS_RGB[primary.id] || [40, 60, 20];
        const sc = BIOME_COLORS_RGB[secondary.id] || pc;
        const i = (py * cw + px) * 4;
        const b = Math.min(blend * 0.7, 1);
        data[i]     = Math.floor(pc[0] * (1 - b) + sc[0] * b);
        data[i + 1] = Math.floor(pc[1] * (1 - b) + sc[1] * b);
        data[i + 2] = Math.floor(pc[2] * (1 - b) + sc[2] * b);
        data[i + 3] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (e.button !== 0) return;
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.x),
      y: dragStart.current.oy + (e.clientY - dragStart.current.y),
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const px = (playerPos?.x ?? CITIES[0].x) * MAP_SCALE;
  const py = (playerPos?.y ?? CITIES[0].y) * MAP_SCALE;

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center"
      onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>

      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[210] text-center">
        <h2 className="font-cinzel text-2xl text-amber-400 font-bold drop-shadow-lg">World of Eldoria</h2>
        <p className="font-crimson text-sm text-gray-400 mt-1">Press M or Esc to close &bull; Drag to pan</p>
      </div>

      <button onClick={onClose}
        className="absolute top-4 right-4 z-[210] w-10 h-10 rounded-full border border-amber-800 bg-gray-950/80 text-amber-400 hover:bg-gray-900 font-cinzel text-xl">
        ✕
      </button>

      <div className="relative overflow-hidden rounded-xl border-2 border-amber-900/60 shadow-2xl"
        style={{ width: Math.min(MAP_W + 40, window.innerWidth - 40), height: Math.min(MAP_H + 40, window.innerHeight - 100) }}
        onMouseDown={handleMouseDown}>

        <div className="absolute" style={{ left: offset.x + 20, top: offset.y + 20, width: MAP_W, height: MAP_H, cursor: dragging ? 'grabbing' : 'grab' }}>

          {/* Organic biome canvas */}
          <canvas ref={canvasRef} className="absolute inset-0 rounded" style={{ width: MAP_W, height: MAP_H, imageRendering: 'auto' }} />

          {/* Biome labels at centers */}
          {BIOMES.map(b => (
            <span key={b.id} className="absolute font-cinzel text-[10px] text-white/60 drop-shadow font-bold select-none pointer-events-none"
              style={{ left: b.cx * MAP_SCALE - 30, top: b.cy * MAP_SCALE - 6 }}>
              {b.name}
            </span>
          ))}

          {/* Roads between nearby cities */}
          <svg className="absolute inset-0 pointer-events-none" width={MAP_W} height={MAP_H}>
            {CITIES.map((c, i) =>
              CITIES.slice(i + 1).filter(c2 => Math.hypot(c2.x - c.x, c2.y - c.y) < 2800).map(c2 => (
                <line key={`${c.id}-${c2.id}`}
                  x1={c.x * MAP_SCALE} y1={c.y * MAP_SCALE}
                  x2={c2.x * MAP_SCALE} y2={c2.y * MAP_SCALE}
                  stroke="#8a7755" strokeWidth="2" opacity="0.5" strokeDasharray="4 4" />
              ))
            )}
          </svg>

          {/* Boss markers at biome centers */}
          {Object.entries(BIOME_BOSSES).map(([biomeId, boss]) => {
            const biome = BIOMES.find(b => b.id === biomeId);
            if (!biome) return null;
            const bx = biome.cx * MAP_SCALE;
            const by = biome.cy * MAP_SCALE;
            return (
              <div key={biomeId} className="absolute group" style={{ left: bx - 10, top: by - 10 }}>
                <div className="w-5 h-5 rounded-full bg-red-900 border-2 border-red-500 flex items-center justify-center text-[10px] animate-pulse cursor-default">
                  💀
                </div>
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block w-28 p-1.5 bg-gray-950 border border-red-800 rounded text-[10px] text-center z-[220]">
                  <div className="font-cinzel text-red-400 font-bold">{boss.name}</div>
                  <div className="text-gray-500 font-crimson">HP: {boss.hp}</div>
                </div>
              </div>
            );
          })}

          {/* City markers */}
          {CITIES.map(city => (
            <div key={city.id} className="absolute group" style={{ left: city.x * MAP_SCALE - 12, top: city.y * MAP_SCALE - 12 }}>
              <div className="w-6 h-6 rounded bg-amber-800 border-2 border-amber-400 flex items-center justify-center text-[11px] shadow-lg shadow-amber-900/50 cursor-default">
                🏰
              </div>
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block w-32 p-1.5 bg-gray-950 border border-amber-800 rounded text-[10px] text-center z-[220]">
                <div className="font-cinzel text-amber-400 font-bold">{city.name}</div>
                <div className="text-gray-500 font-crimson italic">{city.subtitle}</div>
              </div>
              <div className="absolute top-full mt-0.5 left-1/2 -translate-x-1/2 font-cinzel text-[8px] text-amber-300/80 whitespace-nowrap drop-shadow select-none">{city.name}</div>
            </div>
          ))}

          {/* Quest NPC markers */}
          {CITY_NPCS.filter(n => n.role === 'questgiver').map(npc => (
            <div key={npc.id} className="absolute" style={{ left: npc.x * MAP_SCALE - 5, top: npc.y * MAP_SCALE - 5 }}>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 border border-yellow-300" title={`Quest Board - ${npc.cityId}`} />
            </div>
          ))}

          {/* Player marker */}
          <div className="absolute z-[215]" style={{ left: px - 8, top: py - 8 }}>
            <div className="w-4 h-4 rounded-full bg-green-400 border-2 border-white shadow-lg shadow-green-400/60 animate-pulse" />
            <div className="absolute top-full mt-0.5 left-1/2 -translate-x-1/2 font-cinzel text-[9px] text-green-300 whitespace-nowrap drop-shadow font-bold select-none">You</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[210] flex items-center gap-4 bg-gray-950/90 border border-amber-900/50 rounded-lg px-4 py-2">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-400 border border-white" />
          <span className="text-[10px] text-gray-400 font-crimson">You</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px]">🏰</span>
          <span className="text-[10px] text-gray-400 font-crimson">City</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px]">💀</span>
          <span className="text-[10px] text-gray-400 font-crimson">Boss</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500 border border-yellow-300" />
          <span className="text-[10px] text-gray-400 font-crimson">Quest</span>
        </div>
      </div>
    </div>
  );
}
