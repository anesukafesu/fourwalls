import { createClient } from "npm:@supabase/supabase-js";

/**
 * Creates a Supabase client with optional user token for authenticated requests.
 * @param token Optional JWT access token (from user)
 * @returns Supabase client instance
 */
export function createSupabaseClient(token?: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase URL or Service Role Key is not set in environment variables."
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });

  return supabase;
}
