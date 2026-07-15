"use client";

import { LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig, isDemoMode, publicEnv } from "@/lib/env";

export function AuthButton() {
  async function signIn() {
    if (isDemoMode || !hasSupabaseConfig) return;
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: `${publicEnv.NEXT_PUBLIC_SITE_URL}/auth/callback`, scopes: "identify guilds" }
    });
  }
  if (isDemoMode) return <span className="button button-discord">Mina · Démo</span>;
  return <button className="button button-discord" onClick={signIn} disabled={!hasSupabaseConfig}><LogIn size={17} /> Continuer avec Discord</button>;
}
