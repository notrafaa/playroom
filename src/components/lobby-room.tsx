"use client";

import { Check, Copy, Crown, Headphones, LogOut, UserRoundX } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { canStartMatch, isBotOnline, type PlayerState } from "@playroom/shared";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

const initialPlayers: PlayerState[] = [
  { id: "mina", displayName: "Mina", lives: 3, score: 0, detectionScore: 0, eliminated: false, connected: true, inVoice: true, ready: true, replacementUsed: false },
  { id: "thomas", displayName: "Thomas", lives: 3, score: 0, detectionScore: 0, eliminated: false, connected: true, inVoice: true, ready: true, replacementUsed: false },
  { id: "lea", displayName: "Léa", lives: 3, score: 0, detectionScore: 0, eliminated: false, connected: true, inVoice: true, ready: false, replacementUsed: false },
  { id: "sam", displayName: "Sam", lives: 3, score: 0, detectionScore: 0, eliminated: false, connected: true, inVoice: false, ready: true, replacementUsed: false }
];
type GuildOption = { id: string; name: string; iconUrl: string | null; channels: { id: string; name: string }[] };

export function LobbyRoom({ code }: { code: string }) {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerState[]>(isDemoMode ? initialPlayers : []);
  const [lobbyId, setLobbyId] = useState("");
  const [hostId, setHostId] = useState(isDemoMode ? "mina" : "");
  const [botOnline, setBotOnline] = useState(isDemoMode);
  const [currentUserId, setCurrentUserId] = useState(isDemoMode ? "mina" : "");
  const [guilds, setGuilds] = useState<GuildOption[]>(isDemoMode ? [{ id: "123", name: "Le salon des amis", iconUrl: null, channels: [{ id: "456", name: "Général" }] }] : []);
  const [selectedGuild, setSelectedGuild] = useState(isDemoMode ? "123" : "");
  const [selectedChannel, setSelectedChannel] = useState(isDemoMode ? "456" : "");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const ready = canStartMatch(players, botOnline);

  useEffect(() => {
    if (isDemoMode) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | undefined;
    let active = true;
    const load = async () => {
      const { data: lobby, error: lobbyError } = await supabase.from("lobbies").select("id,host_id").eq("code", code).single();
      if (lobbyError || !lobby) { if (active) setError("Lobby introuvable ou accès refusé."); return; }
      const [{ data: rows }, { data: auth }, { data: bot }] = await Promise.all([
        supabase.from("lobby_players").select("profile_id,ready,site_present,in_voice,role,profiles(display_name,username,avatar_url)").eq("lobby_id", lobby.id).order("joined_at"),
        supabase.auth.getUser(),
        supabase.from("bot_instances").select("discord_connected,last_seen_at").order("last_seen_at", { ascending: false }).limit(1).maybeSingle()
      ]);
      if (!active) return;
      setLobbyId(lobby.id); setHostId(lobby.host_id); setCurrentUserId(auth.user?.id ?? "");
      setBotOnline(bot ? isBotOnline(bot.last_seen_at, bot.discord_connected) : false);
      setPlayers((rows ?? []).map((row) => {
        const profile = row.profiles as unknown as { display_name: string | null; username: string; avatar_url: string | null };
        return { id: row.profile_id, displayName: profile.display_name ?? profile.username, ...(profile.avatar_url ? { avatarUrl: profile.avatar_url } : {}), lives: 3, score: 0, detectionScore: 0, eliminated: false, connected: row.site_present, inVoice: row.in_voice, ready: row.ready, replacementUsed: false };
      }));
      if (!channel) {
        channel = supabase.channel(`lobby:${lobby.id}`, { config: { private: true, presence: { key: auth.user?.id ?? "anonymous" } } })
          .on("presence", { event: "sync" }, () => { void load(); })
          .on("postgres_changes", { event: "*", schema: "public", table: "lobby_players", filter: `lobby_id=eq.${lobby.id}` }, () => { void load(); })
          .subscribe((status) => { if (status === "SUBSCRIBED") void channel?.track({ online_at: new Date().toISOString() }); });
      }
    };
    void load();
    void fetch("/api/discord/guilds", { cache: "no-store" }).then((response) => response.json() as Promise<GuildOption[]>).then((options) => { if (Array.isArray(options) && active) setGuilds(options); });
    return () => { active = false; if (channel) void supabase.removeChannel(channel); };
  }, [code]);

  async function toggleReady() {
    const me = players.find((player) => player.id === currentUserId);
    if (!me) return;
    if (isDemoMode) return setPlayers((current) => current.map((p) => p.id === currentUserId ? { ...p, ready: !p.ready } : p));
    const { error: rpcError } = await createClient().rpc("set_player_ready", { p_lobby_id: lobbyId, p_ready: !me.ready });
    if (rpcError) setError(rpcError.message);
  }
  async function startMatch() {
    if (!ready) return;
    if (isDemoMode) return router.push("/play/demo-match");
    const { data, error: rpcError } = await createClient().rpc("start_match", { p_lobby_id: lobbyId });
    if (rpcError) return setError(rpcError.message);
    router.push(`/play/${String(data)}`);
  }
  async function chooseChannel(channelId: string) {
    setSelectedChannel(channelId);
    if (isDemoMode || !lobbyId || !selectedGuild || !channelId) return;
    const { error: rpcError } = await createClient().rpc("configure_lobby_discord", { p_lobby_id: lobbyId, p_guild_id: selectedGuild, p_channel_id: channelId });
    if (rpcError) setError(rpcError.message);
  }
  async function kickPlayer(playerId: string) {
    if (isDemoMode) return setPlayers((current) => current.filter((player) => player.id !== playerId));
    const { error: rpcError } = await createClient().rpc("kick_lobby_player", { p_lobby_id: lobbyId, p_profile_id: playerId });
    if (rpcError) setError(rpcError.message);
  }
  async function leaveLobby() {
    if (!isDemoMode && lobbyId) await createClient().rpc("leave_lobby", { p_lobby_id: lobbyId });
    router.push("/");
  }
  async function copyLink() { await navigator.clipboard.writeText(`${location.origin}/join/${code}`); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return <>
    <div className="lobby-toolbar"><div><span className="eyebrow">Code du lobby</span><strong className="lobby-code">{code}</strong></div><button className="button" onClick={() => void copyLink()}>{copied ? <Check size={17} /> : <Copy size={17} />} {copied ? "Copié" : "Partager"}</button></div>
    <div className="lobby-layout">
      <section className="panel panel-pad"><div className="section-title"><div><p className="eyebrow">Participants</p><h2>Autour de la table</h2></div><span>{players.length}/8</span></div>
        <div className="player-list">{players.map((player, index) => <article className="lobby-player" key={player.id}>
          <span className={`avatar avatar-${index + 1}`}>{player.displayName[0]}</span><div><strong>{player.displayName} {player.id === hostId && <Crown size={15} />}</strong><small className={player.inVoice ? "ok" : "bad"}><Headphones size={13} /> {player.inVoice ? "Dans le vocal" : "Absent du vocal"}</small></div><span className={`ready-chip ${player.ready ? "ready" : ""}`}>{player.ready ? "Prêt" : "Pas prêt"}</span>{currentUserId === hostId && player.id !== currentUserId && <button aria-label={`Expulser ${player.displayName}`} className="icon-button" onClick={() => void kickPlayer(player.id)}><UserRoundX size={17} /></button>}
        </article>)}</div>
      </section>
      <aside className="panel panel-pad lobby-side"><span className="tag">Objectif secret</span><h2>Tout est presque prêt.</h2><p>Tout le monde doit être sur le site, prêt et présent dans le même salon vocal.</p>
        <label className="field"><span>Serveur Discord</span><select value={selectedGuild} onChange={(event) => { setSelectedGuild(event.target.value); setSelectedChannel(""); }}><option value="">Choisir un serveur</option>{guilds.map((guild) => <option key={guild.id} value={guild.id}>{guild.name}</option>)}</select></label>
        <label className="field"><span>Salon vocal</span><select value={selectedChannel} onChange={(event) => void chooseChannel(event.target.value)} disabled={!selectedGuild}><option value="">Choisir un vocal</option>{guilds.find((guild) => guild.id === selectedGuild)?.channels.map((channel) => <option key={channel.id} value={channel.id}>{channel.name}</option>)}</select></label>
        <a className="button" href={selectedGuild && selectedChannel ? `https://discord.com/channels/${selectedGuild}/${selectedChannel}` : "#"} aria-disabled={!selectedGuild || !selectedChannel} target="_blank" rel="noreferrer"><Headphones size={18} /> Rejoindre le vocal Discord</a>
        <button className="button" onClick={() => void toggleReady()}>{players.find((player) => player.id === currentUserId)?.ready ? "Je ne suis plus prêt" : "Je suis prêt"}</button>
        {!ready && <div className="notice">En attente : chaque joueur doit être prêt, connecté au site et présent dans le vocal.</div>}
        {isDemoMode && !ready && <button className="button" onClick={() => setPlayers((current) => current.map((player) => ({ ...player, ready: true, connected: true, inVoice: true })))}>Simuler tout le monde prêt</button>}
        {error && <div className="notice" role="alert">{error}</div>}
        <button className="button button-primary" disabled={!ready} onClick={() => void startMatch()}>Lancer la partie</button>
        <button className="quiet-link" onClick={() => void leaveLobby()}><LogOut size={16} /> Quitter le lobby</button>
      </aside>
    </div>
  </>;
}
