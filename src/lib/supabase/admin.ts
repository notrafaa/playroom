import { createClient } from "@supabase/supabase-js";
import { publicEnv } from "../env";

export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!publicEnv.NEXT_PUBLIC_SUPABASE_URL || !serviceKey) throw new Error("Clé Supabase serveur manquante.");
  return createClient(publicEnv.NEXT_PUBLIC_SUPABASE_URL, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}
