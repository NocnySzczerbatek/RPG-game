// ============================================================
// COMPONENT: Character Select Screen
// Shows the player's characters after logging in,
// allows selecting one to play or creating a new one.
// ============================================================
import React, { useState, useEffect } from 'react';
import { fetchCharacters, deleteCharacter } from '../lib/cloudSave.js';

const CLASS_META = {
  warrior: { icon: '⚔️', color: 'text-red-400', name: 'Wojownik' },
  mage:    { icon: '🔮', color: 'text-blue-400', name: 'Mag' },
  paladin: { icon: '🛡️', color: 'text-yellow-400', name: 'Paladyn' },
  ninja:   { icon: '🗡️', color: 'text-green-400', name: 'Ninja' },
};

const CharacterSelect = ({ user, onSelectCharacter, onCreateNew, onLogout }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchCharacters(user.id).then((chars) => {
      setCharacters(chars);
      setLoading(false);
    });
  }, [user]);

  const handleDelete = async (charId, charName) => {
    if (!window.confirm(`Czy na pewno chcesz usunąć postać "${charName}"? Ta operacja jest nieodwracalna.`)) return;
    setDeleting(charId);
    const ok = await deleteCharacter(charId);
    if (ok) setCharacters((prev) => prev.filter((c) => c.id !== charId));
    setDeleting(null);
  };

  const formatDate = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleDateString('pl-PL', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const userEmail = user?.email || user?.user_metadata?.full_name || 'Gracz';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background embers */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-600 opacity-30 animate-pulsate"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent mb-8" />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-center gap-2 mb-8">
        <h1 className="font-cinzel text-3xl font-bold text-amber-500 tracking-wider">Wybierz Postać</h1>
        <div className="flex items-center gap-3">
          {avatarUrl && <img src={avatarUrl} alt="" className="w-8 h-8 rounded-full border border-amber-700" />}
          <span className="text-sm text-slate-400 font-crimson">{userEmail}</span>
          <button onClick={onLogout} className="text-xs text-slate-600 hover:text-red-400 underline font-cinzel transition-colors">
            Wyloguj
          </button>
        </div>
      </div>

      {/* Character list */}
      <div className="relative z-10 w-full max-w-lg">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-3xl animate-spin mb-3">⚙️</div>
            <p className="text-slate-500 font-crimson">Ładowanie postaci...</p>
          </div>
        ) : (
          <>
            {characters.length === 0 ? (
              <div className="text-center py-10 bg-slate-900/60 border border-slate-800 rounded-xl">
                <div className="text-5xl mb-4">🏰</div>
                <p className="font-crimson text-slate-400 text-lg mb-2">Nie masz jeszcze żadnych postaci.</p>
                <p className="font-crimson text-slate-600 text-sm">Stwórz swoją pierwszą postać i rozpocznij przygodę!</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                {characters.map((char) => {
                  const meta = CLASS_META[char.class] || CLASS_META.warrior;
                  return (
                    <button
                      key={char.id}
                      onClick={() => onSelectCharacter(char)}
                      className="w-full flex items-center gap-4 p-4 bg-slate-900/80 border border-slate-700 hover:border-amber-700 rounded-xl transition-all group text-left"
                    >
                      <div className="text-3xl w-12 h-12 flex items-center justify-center bg-slate-800 rounded-lg border border-slate-700 group-hover:border-amber-800 transition-colors">
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-cinzel text-lg text-slate-200 group-hover:text-amber-400 transition-colors truncate">
                          {char.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`font-cinzel ${meta.color}`}>{meta.name}</span>
                          <span className="text-amber-400 font-cinzel">Lv.{char.level}</span>
                          <span className="text-slate-600 font-crimson">{formatDate(char.updated_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 group-hover:text-amber-500 font-cinzel transition-colors">GRAJ →</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(char.id, char.name); }}
                          disabled={deleting === char.id}
                          className="p-1.5 text-slate-700 hover:text-red-500 transition-colors rounded"
                          title="Usuń postać"
                        >
                          {deleting === char.id ? '⏳' : '🗑️'}
                        </button>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {characters.length < 5 && (
              <button
                onClick={onCreateNew}
                className="w-full mt-4 py-3 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-800/60 text-amber-400 font-cinzel text-sm rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <span className="text-xl">✦</span> Stwórz Nową Postać
              </button>
            )}
            {characters.length >= 5 && (
              <p className="text-xs text-slate-600 text-center font-crimson mt-3">Osiągnięto limit 5 postaci.</p>
            )}
          </>
        )}
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent mt-12" />
    </div>
  );
};

export default CharacterSelect;
