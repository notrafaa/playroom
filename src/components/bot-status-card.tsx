"use client";

import { Bot, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type Status = { online: boolean; lastSeenAt: string | null; guildCount: number; demo?: boolean };

export function BotStatusCard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  async function refresh() {
    setLoading(true);
    const response = await fetch("/api/bot-status", { cache: "no-store" });
    setStatus(await response.json() as Status);
    setLoading(false);
  }
  useEffect(() => {
    let active = true;
    const load = () => { void fetch("/api/bot-status", { cache: "no-store" }).then((response) => response.json() as Promise<Status>).then((value) => { if (active) { setStatus(value); setLoading(false); } }); };
    load();
    const interval = setInterval(load, 10_000);
    return () => { active = false; clearInterval(interval); };
  }, []);
  if (loading && !status) return <div className="bot-card skeleton">Vérification du bot…</div>;
  const online = status?.online ?? false;
  return <section className={`bot-card ${online ? "bot-online" : "bot-offline"}`}>
    <div className="bot-icon"><Bot size={30} /></div>
    <div><strong>{online ? "Bot Discord disponible" : "Le bot fait actuellement une petite sieste."}</strong>
      <p>{online ? "La détection vocale est opérationnelle." : "Les jeux utilisant Discord sont temporairement indisponibles. Tu peux contacter le propriétaire… mais s’il dort aussi, laisse-les dormir tous les deux."}</p>
      {status?.lastSeenAt && <small>Dernier signal : {new Date(status.lastSeenAt).toLocaleString("fr-FR")}</small>}
    </div>
    <button className="button button-ghost" onClick={() => void refresh()} disabled={loading}><RefreshCw size={17} className={loading ? "spin" : ""} /> Réessayer</button>
  </section>;
}
