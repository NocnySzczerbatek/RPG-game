// Walidacja i sanityzacja danych gracza
export function sanitizeNickname(nick) {
  return String(nick).replace(/[^a-zA-Z0-9_\- ]/g, '').slice(0, 20);
}
export function validatePlayerUpdate(prev, next) {
  if (next.gold - prev.gold > 100) return false;
  if (next.hp > prev.maxHp || next.hp < 0) return false;
  // Dodaj więcej reguł według potrzeb
  return true;
}
