import React from 'react';
// Przykładowa lista mikstur (do podmiany na realne dane)
const potions = [
  { id: 1, name: 'Mikstura HP', price: 50, img: 'assets/sprites/potions/hp.png' },
  { id: 2, name: 'Mikstura Mana', price: 40, img: 'assets/sprites/potions/mana.png' },
];
export default function Shop({ gold, onBuy }) {
  return (
    <div className="shop-ui">
      <h2>Sklep z miksturami</h2>
      <div className="potions-list">
        {potions.map(p => (
          <div key={p.id} className="potion-item">
            <img src={p.img} alt={p.name} style={{width:32}} />
            <span>{p.name} ({p.price} zł)</span>
            <button disabled={gold < p.price} onClick={() => onBuy(p)} >Kup</button>
          </div>
        ))}
      </div>
      <div>Twoje złoto: {gold}</div>
    </div>
  );
}
