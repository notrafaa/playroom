"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";

type PublicLobby = { code: string; name: string; max_players: number; lobby_players: { count: number }[] };

export function PublicLobbies() {
  const [lobbies, setLobbies] = useState<PublicLobby[]>(isDemoMode ? [{ code: "DEMO1", name: "Les suspects du mercredi", max_players: 8, lobby_players: [{ count: 3 }] }] : []);
  useEffect(() => {
    if (isDemoMode) return;
    const supabase = createClient();
    void supabase.from("lobbies").select("code,name,max_players,lobby_players(count)").eq("is_public", true).eq("status", "waiting").gt("expires_at", new Date().toISOString()).then(({ data }) => setLobbies((data ?? []) as PublicLobby[]));
  }, []);
  if (!lobbies.length) return <div className="notice">Aucun lobby public pour le moment. C’est peut-être à toi de lancer la soirée.</div>;
  return <div className="player-list">{lobbies.map((lobby) => <article className="public-lobby" key={lobby.code}><div><strong>{lobby.name}</strong><small>Objectif secret · {lobby.lobby_players[0]?.count ?? 0}/{lobby.max_players} joueurs</small></div><Link href={`/join/${lobby.code}` as never} className="button">Rejoindre</Link></article>)}</div>;
}
