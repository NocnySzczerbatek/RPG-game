// Zarządzanie NPC, meblami, dekoracjami, AI, culling
export function spawnNPCs(scene, rooms) {
  // Przykład: spawn NPC w losowych komnatach
  rooms.forEach((room, i) => {
    if (i % 2 === 0) {
      const npc = scene.physics.add.sprite(room.cx * 16, room.cy * 16, 'npc_blacksmith');
      npc.setDepth(room.cy * 16);
      scene.npcs = scene.npcs || [];
      scene.npcs.push(npc);
    }
  });
}
export function spawnFurniture(scene, rooms) {
  // Przykład: spawn mebli w komnatach
  rooms.forEach(room => {
    // ...
  });
}
export function updateCulling(scene, decorations) {
  const cam = scene.cameras.main;
  const pad = 200;
  const l = cam.scrollX - pad, r = cam.scrollX + cam.width + pad;
  const t = cam.scrollY - pad, b = cam.scrollY + cam.height + pad;
  decorations.forEach(obj => {
    const vis = obj.x > l && obj.x < r && obj.y > t && obj.y < b;
    obj.setVisible(vis);
    obj.setActive(vis);
  });
}
export function showDamagePopup(scene, x, y, dmg, isCrit) {
  const txt = scene.add.text(x, y - 40, `${dmg}${isCrit ? '!' : ''}`, {
    fontSize: isCrit ? '18px' : '14px',
    color: isCrit ? '#ffdd00' : '#fff',
    stroke: '#000', strokeThickness: 3,
  }).setOrigin(0.5).setDepth(10000);
  scene.tweens.add({ targets: txt, y: txt.y - 40, alpha: 0, duration: 800, onComplete: () => txt.destroy() });
}
