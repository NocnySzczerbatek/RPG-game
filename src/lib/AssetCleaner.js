// Czyszczenie assetów i pamięci Phaser
export function cleanScene(scene) {
  scene.children.list.forEach(obj => obj.destroy && obj.destroy());
  scene.tweens && scene.tweens.killAll();
  if (scene.textures && scene.textures.list) {
    Object.keys(scene.textures.list).forEach(key => {
      if (key !== '__DEFAULT' && key !== '__MISSING') scene.textures.remove(key);
    });
  }
}
