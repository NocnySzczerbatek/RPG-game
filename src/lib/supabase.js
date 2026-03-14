// ============================================================
// Supabase Client Configuration
// ============================================================
// HOW TO SET UP:
// 1. Create a free project at https://supabase.com
// 2. Enable Google and Discord OAuth providers in Authentication → Providers
// 3. Copy your project URL and anon key from Settings → API
// 4. Create a .env file in the project root with:
//      VITE_SUPABASE_URL=https://your-project.supabase.co
//      VITE_SUPABASE_ANON_KEY=your-anon-key
// 5. Run the SQL from supabase_schema.sql in the SQL Editor
// ============================================================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars. ' +
    'Cloud save and login will not work. Set them in a .env file.'
  );
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = () => !!supabase;
