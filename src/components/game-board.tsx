"use client";

import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, Clock3, Heart, LogOut, RefreshCw, ShieldAlert, Volume2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { gainScore, loseLife, replaceMission, type PlayerState } from "@playroom/shared";
import { isDemoMode } from "@/lib/env";
import { createClient } from "@/lib/supabase/client";
import { useSound } from "./sound-provider";

const demoMissions = [
  "Commence deux phrases par « techniquement ».",
  "Fais prononcer le nom d’un pays à deux personnes.",
  "Place trois fois le mot « incroyable ».",
  "Provoque un débat très sérieux sur un sujet inutile."
];

const initialPlayers: PlayerState[] = [
  { id: "mina", displayName: "Mina", lives: 3, score: 1, detectionScore: 0, eliminated: false, connected: true, inVoice: true, ready: true, replacementUsed: false },
  { id: "thomas", displayName: "Thomas", lives: 2, score: 2, detectionScore: 1, eliminated: false, connected: true, inVoice: true, ready: true, replacementUsed: false },
  { id: "lea", displayName: "Léa", lives: 3, score: 0, detectionScore: 0, eliminated: false, connected: true, inVoice: true, ready: true, replacementUsed: false },
  { id: "sam", displayName: "Sam", lives: 1, score: 1, detectionScore: 0, eliminated: false, connected: true, inVoice: true, ready: true, replacementUsed: false }
];

type Overlay = "none" | "target" | "describe" | "vote" | "result" | "claim" | "win";

export function GameBoard({ matchId }: { matchId: string }) {
  const [players, setPlayers] = useState(initialPlayers);
  const [privateMission, setPrivateMission] = useState(demoMissions[0]!);
  const [overlay, setOverlay] = useState<Overlay>("none");
  const [targetId, setTargetId] = useState("");
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [elapsed, setElapsed] = useState(127);
  const { play } = useSound();
  const me = players[0]!;

  useEffect(() => { const interval = setInterval(() => setElapsed((value) => value + 1), 1000); return () => clearInterval(interval); }, []);
  useEffect(() => {
    if (isDemoMode) return;
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | undefined;
    void supabase.rpc("get_private_mission", { p_match_id: matchId }).then(({ data }) => { if (typeof data === "string") setPrivateMission(data); });
    void supabase.from("matches").select("lobby_id").eq("id", matchId).single().then(({ data }) => {
      if (!data?.lobby_id) return;
      channel = supabase.channel(`lobby:${String(data.lobby_id)}`, { config: { private: true } }).on("broadcast", { event: "game_event" }, () => { void supabase.from("matches").select("phase").eq("id", matchId).single(); }).subscribe();
    });
    return () => { if (channel) void supabase.removeChannel(channel); };
  }, [matchId]);
  useEffect(() => {
    if (overlay !== "claim" || seconds <= 0) return;
    const timeout = setTimeout(() => {
      if (seconds === 1) {
        setPlayers((current) => current.map((player) => player.id === me.id ? gainScore(player) : player));
        nextMission(); play("success"); setResult("Objectif validé : +1 point !"); setOverlay("result");
      }
      setSeconds((value) => value - 1);
    }, 1000);
    return () => clearTimeout(timeout);
  }, [overlay, seconds, me.id, play]);

  function nextMission() { setPrivateMission((current) => demoMissions[(demoMissions.indexOf(current) + 1) % demoMissions.length]!); }
  function buzz() { if (overlay !== "none" || me.eliminated) return; play("buzzer"); setOverlay("target"); }
  function submitGuess() { if (!guess.trim()) return; setOverlay("vote"); }
  function resolve(vote: "correct" | "incorrect" | "too_vague") {
    const target = players.find((player) => player.id === targetId)!;
    if (vote === "correct") {
      setPlayers((current) => current.map((player) => player.id === targetId ? loseLife(player) : player.id === me.id ? { ...player, detectionScore: player.detectionScore + 1 } : player));
      setResult(`Accusation correcte ! ${target.displayName} perd une vie.`); play("life");
    } else if (vote === "incorrect") {
      setPlayers((current) => current.map((player) => player.id === me.id ? loseLife(player) : player));
      setResult(`Accusation incorrecte. Tu perds une vie, ${target.displayName} en garde une nouvelle mission.`); play("life");
    } else setResult("Accusation trop vague. Aucune vie perdue et ton buzzer est bloqué 30 secondes.");
    setOverlay("result");
  }
  function closeResult() { setOverlay("none"); setTargetId(""); setGuess(""); setResult(""); }
  function changeMission() {
    try { setPlayers((current) => current.map((player) => player.id === me.id ? replaceMission(player) : player)); nextMission(); play("click"); }
    catch (error) { setResult(error instanceof Error ? error.message : "Changement impossible."); setOverlay("result"); }
  }
  function claim() { play("start"); setSeconds(5); setOverlay("claim"); }
  function contest() { setSeconds(0); setResult("Thomas conteste. En production, les joueurs neutres votent via la fonction atomique dédiée."); setOverlay("vote"); setTargetId(me.id); }

  const target = players.find((player) => player.id === targetId);
  return <main className="game-screen">
    <header className="game-top"><div><span className="live-dot" /> OBJECTIF SECRET</div><div className="game-timer"><Clock3 size={18} /> {String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</div><Link href="/" aria-label="Quitter la partie"><LogOut /></Link></header>
    <section className="social-table" aria-label="Plateau de jeu">
      <div className="center-zone"><span className="phase-chip">EN JEU</span><motion.button data-testid="buzzer" className="big-buzzer" whileTap={{ scale: .9 }} onClick={buzz} disabled={overlay !== "none" || me.eliminated}><span>BUZZ</span></motion.button><p>{overlay === "none" ? "Une mission te semble suspecte ?" : "Buzzer verrouillé pendant la résolution"}</p></div>
      <div className="player-ring">{players.map((player, index) => <article key={player.id} className={`table-player player-pos-${index + 1} ${player.eliminated ? "eliminated" : ""}`}>
        <span className={`avatar avatar-${index + 1}`}>{player.displayName[0]}</span><strong>{player.displayName}{player.id === me.id && <small>TOI</small>}</strong><div className="hearts" aria-label={`${player.lives} vies`}>{Array.from({ length: 3 }, (_, i) => <Heart key={i} size={16} fill={i < player.lives ? "currentColor" : "none"} />)}</div><span className="score">{player.score} pt{player.score > 1 ? "s" : ""}</span><span className="voice-ok"><Volume2 size={12} /> Vocal</span>
      </article>)}</div>
    </section>
    <section className="mission-dock"><div><span>TON OBJECTIF</span><strong>{privateMission}</strong></div><div className="mission-actions"><button className="button button-primary" onClick={claim} disabled={overlay !== "none" || me.eliminated}><CheckCircle2 size={18} /> Objectif accompli</button><button className="button" onClick={changeMission} disabled={me.replacementUsed || overlay !== "none"}><RefreshCw size={17} /> {me.replacementUsed ? "Changement utilisé" : "Changer d’objectif"}</button></div></section>
    <AnimatePresence>{overlay !== "none" && <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section className="modal panel panel-pad game-modal" initial={{ y: 20, scale: .96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }}>
        {overlay === "target" && <><ShieldAlert size={36} /><h2>Qui accuses-tu ?</h2><p>Choisis le joueur dont tu penses avoir découvert l’objectif.</p><div className="target-grid">{players.slice(1).filter((p) => !p.eliminated).map((player) => <button className="target-button" key={player.id} onClick={() => { setTargetId(player.id); setOverlay("describe"); }}><span className="avatar">{player.displayName[0]}</span>{player.displayName}</button>)}</div><button className="quiet-link" onClick={closeResult}><X size={16} /> Annuler</button></>}
        {overlay === "describe" && <><span className="tag">Accusation contre {target?.displayName}</span><h2>Quel était son objectif ?</h2><p>Décris-le assez précisément pour convaincre les autres.</p><textarea aria-label="Objectif supposé" className="guess-input" value={guess} onChange={(event) => setGuess(event.target.value)} placeholder="Je pense que son objectif était de…" /><button className="button button-red" onClick={submitGuess} disabled={!guess.trim()}>Révéler et lancer le vote</button></>}
        {overlay === "vote" && <><span className="tag">Vote · 20 secondes</span><h2>Le groupe tranche.</h2><p>Dans cette démo, choisis le résultat collectif à simuler.</p><div className="vote-grid"><button className="vote-correct" onClick={() => resolve("correct")}>Accusation correcte</button><button className="vote-wrong" onClick={() => resolve("incorrect")}>Accusation incorrecte</button><button className="vote-vague" onClick={() => resolve("too_vague")}>Trop vague</button></div></>}
        {overlay === "claim" && <><span className="claim-count">{seconds}</span><h2>Objectif annoncé !</h2><p>Les autres ont cinq secondes pour contester avant l’attribution du point.</p><button className="button button-red" onClick={contest}>Simuler une contestation</button></>}
        {overlay === "result" && <><span className="result-icon"><CheckCircle2 /></span><h2>Résolution</h2><p>{result}</p><button className="button button-primary" onClick={closeResult}>Reprendre la partie</button></>}
      </motion.section>
    </motion.div>}</AnimatePresence>
  </main>;
}
