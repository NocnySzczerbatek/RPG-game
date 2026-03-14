// ============================================================
// COMPONENT: Login Screen — Google & Discord Social Login
// ============================================================
import React, { useState } from 'react';
import { signInWithGoogle, signInWithDiscord } from '../lib/cloudSave.js';
import { isSupabaseConfigured } from '../lib/supabase.js';

const LoginScreen = ({ onLoginSuccess, onPlayOffline }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const configured = isSupabaseConfigured();

  const handleGoogle = async () => {
    setLoading(true); setError(null);
    const { error: err } = await signInWithGoogle();
    if (err) { setError(err); setLoading(false); }
    // OAuth will redirect; onAuthStateChange in App handles the rest
  };

  const handleDiscord = async () => {
    setLoading(true); setError(null);
    const { error: err } = await signInWithDiscord();
    if (err) { setError(err); setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background embers */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-amber-600 opacity-40 animate-pulsate"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Decorative line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent mb-12" />

      {/* Logo / Title */}
      <div className="flex flex-col items-center gap-2 mb-10 relative z-10">
        <div className="text-6xl mb-3 animate-pulsate">☄️</div>
        <h1 className="font-cinzel text-4xl sm:text-5xl font-black text-amber-500 text-center tracking-widest leading-tight drop-shadow-2xl">
          GOD-SLAYER
        </h1>
        <h2 className="font-cinzel text-xl sm:text-2xl font-semibold text-red-400 text-center tracking-[0.4em] uppercase">
          Rise from Ashes
        </h2>
        <div className="w-48 h-px bg-gradient-to-r from-transparent via-red-800 to-transparent mt-3" />
      </div>

      {/* Login Box */}
      <div className="relative z-10 w-full max-w-sm px-6">
        <div className="bg-slate-900/80 border border-amber-900/50 rounded-xl p-6 backdrop-blur-sm shadow-2xl">
          <h3 className="font-cinzel text-lg text-amber-400 font-bold text-center mb-6">
            Zaloguj się
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-400 text-sm font-crimson text-center">
              {error}
            </div>
          )}

          {!configured && (
            <div className="mb-4 p-3 bg-amber-950/40 border border-amber-800/50 rounded-lg text-amber-400 text-xs font-crimson text-center">
              ⚠️ Supabase nie jest skonfigurowany. Dodaj zmienne <code className="bg-slate-800 px-1 rounded">VITE_SUPABASE_URL</code> i{' '}
              <code className="bg-slate-800 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> w pliku <code className="bg-slate-800 px-1 rounded">.env</code>
            </div>
          )}

          <div className="flex flex-col gap-3">
            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={loading || !configured}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-100 disabled:bg-gray-300 disabled:cursor-not-allowed text-gray-800 font-semibold rounded-lg transition-all shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {loading ? 'Łączenie...' : 'Zaloguj przez Google'}
            </button>

            {/* Discord */}
            <button
              onClick={handleDiscord}
              disabled={loading || !configured}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#5865F2] hover:bg-[#4752C4] disabled:bg-[#5865F2]/50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
              </svg>
              {loading ? 'Łączenie...' : 'Zaloguj przez Discord'}
            </button>
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-700" />
            <span className="text-xs text-slate-500 font-cinzel">LUB</span>
            <div className="flex-1 h-px bg-slate-700" />
          </div>

          {/* Offline play */}
          <button
            onClick={onPlayOffline}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-cinzel text-sm rounded-lg transition-all"
          >
            ⚔️ Graj Offline (LocalStorage)
          </button>
          <p className="text-[10px] text-slate-600 text-center mt-2 font-crimson">
            Zapis offline jest przechowywany lokalnie i nie synchronizuje się między urządzeniami.
          </p>
        </div>
      </div>

      {/* Lore */}
      <div className="mt-10 max-w-md px-6 relative z-10">
        <div className="gothic-border rounded p-3 text-center">
          <p className="font-crimson text-slate-500 text-sm italic">
            "W Dniu Ciemności w Południe, czternastu Wielkich Bogów zamilkło na zawsze.
            Niebo zgasło. Pustka sięgnęła po ziemię. A ty — ostatni — wstajesz."
          </p>
        </div>
      </div>

      <div className="mt-6 text-xs text-slate-700 font-cinzel tracking-widest relative z-10">
        MROCZNE FANTASY • ACTION RPG • 2026
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-red-900 to-transparent mt-8" />
    </div>
  );
};

export default LoginScreen;
