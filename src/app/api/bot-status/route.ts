import { NextResponse } from "next/server";
import { isBotOnline } from "@playroom/shared";
import { hasSupabaseConfig, isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  if (isDemoMode) return NextResponse.json({ online: true, lastSeenAt: new Date().toISOString(), guildCount: 3, demo: true });
  if (!hasSupabaseConfig) return NextResponse.json({ online: false, lastSeenAt: null, guildCount: 0 });
  const supabase = await createClient();
  const { data } = await supabase.from("bot_instances").select("discord_connected,last_seen_at,current_guild_count").order("last_seen_at", { ascending: false }).limit(1).maybeSingle();
  return NextResponse.json({
    online: data ? isBotOnline(data.last_seen_at, data.discord_connected) : false,
    lastSeenAt: data?.last_seen_at ?? null,
    guildCount: data?.current_guild_count ?? 0
  });
}
