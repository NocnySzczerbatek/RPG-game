// ============================================================
// COMPONENT: Main Menu — Dark Fantasy ARPG Cinematic Menu
// Three-column layout: Lore | Main | Character/Auth
// ============================================================
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { signInWithGoogle, signInWithDiscord, fetchCharacters, getCurrentUser } from '../lib/cloudSave.js';
import { isSupabaseConfigured } from '../lib/supabase.js';
import { hasSave, loadGame, formatSaveDate } from '../engine/saveSystem.js';

// ── Sprite paths ──
const SP = 'assets/sprites/';

const CLASS_META = {
  warrior: { icon: '⚔️', color: 'text-red-400', name: 'Wojownik' },
  mage:    { icon: '🔮', color: 'text-blue-400', name: 'Mag' },
  paladin: { icon: '🛡️', color: 'text-yellow-400', name: 'Paladyn' },
  ninja:   { icon: '🗡️', color: 'text-green-400', name: 'Ninja' },
};

// ── Ember particles (fire) ──
function EmberField() {
  const embers = useMemo(() =>
    Array.from({ length: 35 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 2 + Math.random() * 4,
      dur: `${6 + Math.random() * 10}s`,
      delay: `${Math.random() * 8}s`,
      drift: `${-40 + Math.random() * 80}px`,
      color: Math.random() > 0.5 ? '#f59e0b' : '#dc2626',
    })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {embers.map(e => (
        <div
          key={e.id}
          className="ember-particle"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            backgroundColor: e.color,
            '--dur': e.dur,
            '--delay': e.delay,
            '--drift': e.drift,
          }}
        />
      ))}
    </div>
  );
}

// ── Smoke particles (dark) ──
function SmokeField() {
  const clouds = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      size: 40 + Math.random() * 80,
      dur: `${12 + Math.random() * 10}s`,
      delay: `${Math.random() * 10}s`,
      drift: `${-60 + Math.random() * 120}px`,
    })), []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {clouds.map(c => (
        <div
          key={c.id}
          className="smoke-particle rounded-full"
          style={{
            left: c.left,
            width: c.size,
            height: c.size,
            backgroundColor: 'rgba(127, 29, 29, 0.15)',
            '--dur': c.dur,
            '--delay': c.delay,
            '--drift': c.drift,
          }}
        />
      ))}
    </div>
  );
}

// ── Google SVG icon ──
const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// ── Discord SVG icon ──
const DiscordIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

// ═══════════════════════════════════════
// MAIN MENU COMPONENT
// ═══════════════════════════════════════
const LoginScreen = ({ onLoginSuccess, onPlayOffline }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [soundOn, setSoundOn] = useState(false);
  const [cloudChars, setCloudChars] = useState([]);
  const [loadingChars, setLoadingChars] = useState(false);
  const configured = isSupabaseConfigured();

  // ── Local save info ──
  const localSave = useMemo(() => {
    if (!hasSave()) return null;
    return loadGame();
  }, []);

  // ── Try fetching cloud characters on mount ──
  useEffect(() => {
    if (!configured) return;
    setLoadingChars(true);
    getCurrentUser().then(u => {
      if (u) {
        fetchCharacters(u.id).then(chars => {
          setCloudChars(chars);
          setLoadingChars(false);
        });
      } else {
        setLoadingChars(false);
      }
    });
  }, [configured]);

  // ── Ambient sound placeholder ──
  const audioRef = useRef(null);
  useEffect(() => {
    // Placeholder: would load actual ambient audio file
    // e.g. audioRef.current = new Audio('/assets/audio/dark_choir.mp3');
    return () => { if (audioRef.current) { audioRef.current.pause(); } };
  }, []);
  const toggleSound = () => {
    setSoundOn(prev => {
      if (audioRef.current) {
        if (!prev) { audioRef.current.play().catch(() => {}); }
        else { audioRef.current.pause(); }
      }
      return !prev;
    });
  };

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) { setError(err); setLoading(false); }
  };
  const handleDiscord = async () => {
    setLoading(true); setError(null);
    const { error: err } = await signInWithDiscord();
    if (err) { setError(err); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex flex-col">
      {/* ── BACKGROUND LAYERS ── */}
      <div className="absolute inset-0 vignette z-10 pointer-events-none" />
      <EmberField />
      <SmokeField />

      {/* Left silhouette — fallen_knight */}
      <img
        src={`${SP}fallen_knight.png`}
        alt=""
        className="silhouette absolute bottom-0 left-0 h-[70vh] object-contain opacity-10 z-0 select-none"
        draggable={false}
      />
      {/* Right silhouette — boss_warden */}
      <img
        src={`${SP}boss_warden.png`}
        alt=""
        className="silhouette absolute bottom-0 right-0 h-[80vh] object-contain opacity-10 z-0 select-none"
        style={{ animationDelay: '3s' }}
        draggable={false}
      />

      {/* ── TOP ORNAMENT ── */}
      <div className="ornament-line w-full z-20" />

      {/* ── SOUND TOGGLE (top-right) ── */}
      <button
        onClick={toggleSound}
        className="absolute top-3 right-4 z-30 text-slate-600 hover:text-amber-500 transition-colors"
        title={soundOn ? 'Wycisz' : 'Dźwięk Otoczenia'}
      >
        <span className={`text-lg ${soundOn ? 'sound-icon' : ''}`}>{soundOn ? '🔊' : '🔇'}</span>
      </button>

      {/* ── MAIN THREE-COLUMN LAYOUT ── */}
      <div className="flex-1 flex items-stretch z-20 relative w-full max-w-[1400px] mx-auto px-4 py-6 gap-4 min-h-0">

        {/* ═══ LEFT COLUMN — Lore / Tutorial Scroll ═══ */}
        <div className="hidden lg:flex flex-col w-[320px] shrink-0">
          <div className="lore-scroll rounded-lg p-5 flex-1 overflow-y-auto max-h-[calc(100vh-100px)]">
            {/* Scroll header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📜</span>
              <h3 className="font-cinzel text-amber-500 text-lg font-bold tracking-wider">Manuskrypt</h3>
            </div>
            <div className="ornament-line mb-4" />

            {/* Lore intro */}
            <div className="mb-5">
              <h4 className="font-cinzel text-red-400 text-xs uppercase tracking-widest mb-2">Kronika Upadku</h4>
              <p className="font-crimson text-slate-400 text-sm italic leading-relaxed">
                "W Dniu Ciemności w Południe, czternastu Wielkich Bogów zamilkło na zawsze.
                Niebo zgasło. Pustka sięgnęła po ziemię. Z popiołów świątyń wyrosły nowe,
                mroczne potęgi — a ty, ostatni z Bożych Zabójców, wstajesz z martwych."
              </p>
            </div>

            {/* How to Play */}
            <div className="mb-5">
              <h4 className="font-cinzel text-amber-400 text-xs uppercase tracking-widest mb-3">Jak Grać</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 text-sm mt-0.5">⚔️</span>
                  <div>
                    <p className="font-cinzel text-slate-300 text-xs font-bold">Sterowanie</p>
                    <p className="font-crimson text-slate-500 text-xs">
                      Kliknij myszą aby się poruszać. Klawisze <span className="text-amber-400 font-bold">Q W E R</span> uwalniają twoje moce.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 text-sm mt-0.5">🏆</span>
                  <div>
                    <p className="font-cinzel text-slate-300 text-xs font-bold">Cel</p>
                    <p className="font-crimson text-slate-500 text-xs">
                      Pokonaj <span className="text-red-400">6 Bossów Biomów</span> i odzyskaj Odłamki Bogów. Zdobądź tron Pustki.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-amber-500 text-sm mt-0.5">💀</span>
                  <div>
                    <p className="font-cinzel text-slate-300 text-xs font-bold">Śmierć</p>
                    <p className="font-crimson text-slate-500 text-xs italic">
                      Śmierć nie jest końcem — lecz popiół zapamięta twoją porażkę.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="ornament-line my-4" />

            {/* Classes preview */}
            <div className="mb-4">
              <h4 className="font-cinzel text-amber-400 text-xs uppercase tracking-widest mb-3">Klasy Bohaterów</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(CLASS_META).map(([key, meta]) => (
                  <div key={key} className="flex items-center gap-2 bg-slate-900/60 rounded px-2 py-1.5 border border-slate-800/60">
                    <span className="text-lg">{meta.icon}</span>
                    <span className={`font-cinzel text-xs ${meta.color}`}>{meta.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="ornament-line my-4" />

            {/* World hint */}
            <div>
              <h4 className="font-cinzel text-red-400 text-xs uppercase tracking-widest mb-2">Świat Eldorii</h4>
              <p className="font-crimson text-slate-500 text-xs leading-relaxed">
                Sześć biomów, każdy strzeżony przez pradawnego strażnika.
                Królestwo Ironhold leży w ruinach. Mroczne lasy Whispergrove szepczą imiona
                poległych. Pustynne miasto Sandspire kryje tajemnice upadłych bogów.
              </p>
            </div>
          </div>
        </div>

        {/* ═══ CENTER COLUMN — Title + Main Buttons ═══ */}
        <div className="flex-1 flex flex-col items-center justify-center min-w-0">
          {/* Title block */}
          <div className="flex flex-col items-center gap-1 mb-8">
            <div className="text-5xl mb-2 animate-pulsate select-none">☄️</div>
            <h1 className="title-glow font-cinzel text-5xl sm:text-6xl lg:text-7xl font-black text-amber-500 text-center tracking-widest leading-none select-none">
              GOD-SLAYER
            </h1>
            <h2 className="font-cinzel text-lg sm:text-xl lg:text-2xl font-semibold text-red-400 text-center tracking-[0.4em] uppercase mt-1">
              Rise from Ashes
            </h2>
            <div className="ornament-line w-56 mt-3" />
            <p className="font-crimson text-slate-500 text-center text-sm italic mt-3 max-w-sm px-4 hidden sm:block">
              "Bogowie nie umarli z własnej woli. Ktoś ich zabił.<br />
              Teraz na tronie siedzi Pustka — i czeka na ciebie."
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-400 text-sm font-crimson text-center max-w-sm w-full">
              {error}
            </div>
          )}

          {/* ── Main action buttons ── */}
          <div className="flex flex-col gap-3 items-center w-full max-w-xs">
            {/* New Game / Offline */}
            <button
              onClick={onPlayOffline}
              className="menu-btn btn-divine w-full py-3.5 text-base flex items-center justify-center gap-2"
            >
              <span>⚔️</span> Nowa Gra
            </button>

            {/* Continue from local save */}
            {localSave && (
              <button
                onClick={onPlayOffline}
                className="menu-btn btn-gothic w-full py-3 text-sm"
              >
                📜 Kontynuuj
                <span className="block text-[10px] text-slate-500 font-normal normal-case tracking-normal mt-0.5">
                  {localSave.player?.name} — Lv.{localSave.player?.level} — {formatSaveDate(localSave.timestamp)}
                </span>
              </button>
            )}

            <div className="ornament-line w-full my-1" />

            {/* Social login buttons */}
            {!configured && (
              <div className="p-2 bg-amber-950/30 border border-amber-800/40 rounded-lg text-amber-400/70 text-[10px] font-crimson text-center w-full">
                ⚠️ Supabase nie skonfigurowany — logowanie w chmurze niedostępne
              </div>
            )}

            <button
              onClick={handleGoogle}
              disabled={loading || !configured}
              className="menu-btn w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white/90 hover:bg-white disabled:bg-gray-400/50 disabled:cursor-not-allowed text-gray-800 font-semibold rounded-lg transition-all text-sm"
            >
              <GoogleIcon />
              {loading ? 'Łączenie...' : 'Zaloguj przez Google'}
            </button>

            <button
              onClick={handleDiscord}
              disabled={loading || !configured}
              className="menu-btn w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#5865F2]/40 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all text-sm"
            >
              <DiscordIcon />
              {loading ? 'Łączenie...' : 'Zaloguj przez Discord'}
            </button>

            <p className="text-[10px] text-slate-600 text-center font-crimson mt-0.5">
              Logowanie w chmurze synchronizuje postęp między urządzeniami
            </p>
          </div>
        </div>

        {/* ═══ RIGHT COLUMN — Character Cards / Stats ═══ */}
        <div className="hidden lg:flex flex-col w-[300px] shrink-0">
          <div className="lore-scroll rounded-lg p-5 flex-1 overflow-y-auto max-h-[calc(100vh-100px)]">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">👤</span>
              <h3 className="font-cinzel text-amber-500 text-lg font-bold tracking-wider">Bohaterowie</h3>
            </div>
            <div className="ornament-line mb-4" />

            {/* Local save character card */}
            {localSave && localSave.player && (
              <div className="mb-4">
                <h4 className="font-cinzel text-xs text-slate-500 uppercase tracking-widest mb-2">💾 Zapis Lokalny</h4>
                <div className="char-card bg-slate-900/70 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                      <img
                        src={`${SP}knight.png`}
                        alt=""
                        className="w-10 h-10 object-contain"
                        style={{ imageRendering: 'pixelated' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-cinzel text-sm text-slate-200 truncate">{localSave.player.name}</p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className={`font-cinzel ${CLASS_META[localSave.player.class]?.color || 'text-slate-400'}`}>
                          {CLASS_META[localSave.player.class]?.icon} {CLASS_META[localSave.player.class]?.name || localSave.player.class}
                        </span>
                        <span className="text-amber-400 font-cinzel">Lv.{localSave.player.level}</span>
                      </div>
                      {/* Mini HP bar */}
                      <div className="mt-1.5 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-600 rounded-full"
                          style={{ width: `${Math.min(100, ((localSave.player.hp ?? localSave.player.maxHp) / (localSave.player.maxHp || 1)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  {localSave.player.gold != null && (
                    <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-500 font-crimson">
                      <span>🪙 {localSave.player.gold} złota</span>
                      {localSave.timestamp && <span>⏱ {formatSaveDate(localSave.timestamp)}</span>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cloud characters */}
            <div>
              <h4 className="font-cinzel text-xs text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <span>☁️</span> Chmura
                {loadingChars && <span className="animate-spin text-[10px]">⏳</span>}
              </h4>
              {cloudChars.length > 0 ? (
                <div className="space-y-2">
                  {cloudChars.map(char => {
                    const meta = CLASS_META[char.class] || CLASS_META.warrior;
                    return (
                      <div key={char.id} className="char-card bg-slate-900/70 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-xl">
                            {meta.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-cinzel text-sm text-slate-200 truncate">{char.name}</p>
                            <div className="flex items-center gap-2 text-[10px]">
                              <span className={`font-cinzel ${meta.color}`}>{meta.name}</span>
                              <span className="text-amber-400 font-cinzel">Lv.{char.level}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : !loadingChars ? (
                <div className="text-center py-4 bg-slate-900/40 rounded-lg border border-slate-800/40">
                  <p className="text-slate-600 text-xs font-crimson">
                    {configured ? 'Zaloguj się aby zobaczyć postacie' : 'Brak połączenia z chmurą'}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="ornament-line my-4" />

            {/* Login status display */}
            <div>
              <h4 className="font-cinzel text-xs text-slate-500 uppercase tracking-widest mb-2">Status Konta</h4>
              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-800/40">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                  <span className="font-crimson text-xs text-slate-400">
                    {configured ? 'Supabase połączony' : 'Tryb Offline'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Google logo small */}
                  <div className={`p-1.5 rounded border ${configured ? 'bg-white/10 border-white/20' : 'bg-slate-800/60 border-slate-700/40 opacity-40'}`}>
                    <GoogleIcon />
                  </div>
                  {/* Discord logo small */}
                  <div className={`p-1.5 rounded border ${configured ? 'bg-[#5865F2]/20 border-[#5865F2]/30' : 'bg-slate-800/60 border-slate-700/40 opacity-40'}`}>
                    <DiscordIcon />
                  </div>
                  <span className="text-[10px] text-slate-600 font-crimson">
                    {configured ? 'Gotowy do logowania' : 'Skonfiguruj .env'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="z-20 relative">
        <div className="ornament-line w-full" />
        <div className="flex items-center justify-center gap-6 py-3 px-4">
          <span className="text-[10px] text-slate-700 font-cinzel tracking-widest">
            MROCZNE FANTASY • ACTION RPG • 2026
          </span>
          <span className="text-[10px] text-slate-800 font-crimson">v1.0</span>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
