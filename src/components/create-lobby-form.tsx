"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseConfig, isDemoMode } from "@/lib/env";

export function CreateLobbyForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(formData: FormData) {
    setBusy(true); setError("");
    const settings = {
      maxPlayers: Number(formData.get("maxPlayers")), startingLives: Number(formData.get("startingLives")),
      targetScore: Number(formData.get("targetScore")), difficulty: String(formData.get("difficulty")),
      cameraAllowed: formData.get("cameraAllowed") === "on", reconnectSeconds: 30,
      spectatorsAllowed: formData.get("spectatorsAllowed") === "on"
    };
    if (isDemoMode) {
      localStorage.setItem("playroom:demo-lobby", JSON.stringify({ name: formData.get("name"), settings }));
      router.push("/lobby/DEMO1"); return;
    }
    if (!hasSupabaseConfig) { setError("Supabase n’est pas encore configuré."); setBusy(false); return; }
    const supabase = createClient();
    const { data, error: rpcError } = await supabase.rpc("create_lobby", {
      p_name: String(formData.get("name")), p_is_public: formData.get("visibility") === "public", p_settings: settings
    });
    if (rpcError) { setError(rpcError.message); setBusy(false); return; }
    router.push(`/lobby/${String(data)}`);
  }
  return <form className="panel panel-pad form-grid" action={submit}>
    <div className="field field-full"><label htmlFor="name">Nom du lobby</label><input id="name" name="name" required maxLength={50} defaultValue="La soirée des suspects" /></div>
    <div className="field"><label htmlFor="visibility">Visibilité</label><select id="visibility" name="visibility"><option value="private">Privé · avec un code</option><option value="public">Public · visible par tous</option></select></div>
    <div className="field"><label htmlFor="maxPlayers">Joueurs maximum</label><select id="maxPlayers" name="maxPlayers" defaultValue="8">{[3,4,5,6,7,8,9,10].map((n) => <option key={n}>{n}</option>)}</select></div>
    <div className="field"><label htmlFor="startingLives">Vies de départ</label><select id="startingLives" name="startingLives" defaultValue="3">{[1,2,3,4,5].map((n) => <option key={n}>{n}</option>)}</select></div>
    <div className="field"><label htmlFor="targetScore">Points pour gagner</label><select id="targetScore" name="targetScore" defaultValue="5">{[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n}>{n}</option>)}</select></div>
    <div className="field"><label htmlFor="difficulty">Difficulté</label><select id="difficulty" name="difficulty"><option value="mixed">Mélangée</option><option value="easy">Facile</option><option value="medium">Moyenne</option><option value="hard">Difficile</option></select></div>
    <div className="field"><label>Options</label><label className="toggle-row"><span>Objectifs caméra</span><input name="cameraAllowed" type="checkbox" /></label></div>
    <div className="field"><label>&nbsp;</label><label className="toggle-row"><span>Spectateurs autorisés</span><input name="spectatorsAllowed" type="checkbox" defaultChecked /></label></div>
    {error && <p className="notice field-full" role="alert">{error}</p>}
    <div className="field-full"><button className="button button-primary" disabled={busy}>{busy ? "Création…" : "Créer le lobby"}</button></div>
  </form>;
}
