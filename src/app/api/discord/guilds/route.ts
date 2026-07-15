import { NextResponse } from "next/server";
import { hasSupabaseConfig, isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type DiscordGuild = { id: string; name: string; icon: string | null };

export async function GET() {
  if (isDemoMode) return NextResponse.json([{ id: "123", name: "Le salon des amis", iconUrl: null, channels: [{ id: "456", name: "Général" }] }]);
  if (!hasSupabaseConfig) return NextResponse.json([], { status: 503 });
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.provider_token) return NextResponse.json({ error: "Reconnecte Discord pour actualiser tes serveurs." }, { status: 401 });
  const response = await fetch("https://discord.com/api/v10/users/@me/guilds", { headers: { Authorization: `Bearer ${session.provider_token}` }, cache: "no-store" });
  if (!response.ok) return NextResponse.json({ error: "Discord n’a pas pu fournir la liste des serveurs." }, { status: 502 });
  const discordGuilds = await response.json() as DiscordGuild[];
  const admin = createAdminClient();
  const ids = discordGuilds.map((guild) => guild.id);
  const { data: installed } = ids.length ? await admin.from("discord_guilds").select("id,name,icon_url").in("id", ids).eq("active", true) : { data: [] };
  const installedIds = (installed ?? []).map((guild) => guild.id);
  if (installedIds.length) await admin.from("guild_memberships").upsert(installedIds.map((guildId) => ({ profile_id: session.user.id, guild_id: guildId, verified_at: new Date().toISOString() })));
  const { data: channels } = installedIds.length ? await admin.from("discord_voice_channels").select("id,guild_id,name").in("guild_id", installedIds).eq("active", true).eq("bot_can_view", true).eq("bot_can_connect", true) : { data: [] };
  return NextResponse.json((installed ?? []).map((guild) => ({ id: guild.id, name: guild.name, iconUrl: guild.icon_url, channels: (channels ?? []).filter((channel) => channel.guild_id === guild.id).map((channel) => ({ id: channel.id, name: channel.name })) })));
}
