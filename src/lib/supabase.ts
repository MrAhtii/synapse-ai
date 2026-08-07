import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://pmnmmthjpqpcaruadvvt.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_v0Y0mcyiD7iTPsTwVCoDYg_JZxocExQ";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    flowType: "implicit",
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});