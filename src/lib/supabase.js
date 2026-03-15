import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Client is only created when credentials are configured
export const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

/**
 * Fetch isAdmin flag from the `profiles` table for the current session user.
 * Returns false if Supabase is not configured, user is not logged in,
 * or the profile doesn't have is_admin set.
 */
export async function fetchIsAdmin() {
  if (!supabase) return false;
  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return false;

    const { data, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error || !data) return false;
    return data.is_admin === true;
  } catch {
    return false;
  }
}
