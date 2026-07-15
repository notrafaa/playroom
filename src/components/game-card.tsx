"use client";

import Link from "next/link";
import { ArrowUpRight, Lock, X } from "lucide-react";
import { useState } from "react";
import { useSound } from "./sound-provider";

type GameCardProps = {
  title: string;
  description: string;
  color: "yellow" | "purple" | "mint";
  art: "buzzer" | "question" | "sabotage";
  available?: boolean;
  href?: string;
  futurePitch?: string;
};

export function GameCard({ title, description, color, art, available = false, href = "#", futurePitch }: GameCardProps) {
  const [open, setOpen] = useState(false);
  const { play } = useSound();
  return <>
    <article className={`game-card card-${color}`}>
      <div className="game-copy">
        <span className="tag">{available ? "Disponible" : "Bientôt disponible"}</span>
        <h3>{title}</h3><p>{description}</p>
        <div className="card-action">
          {available ? <Link href={href as never} className="button button-primary" onClick={() => play("click")}>Jouer <ArrowUpRight size={18} /></Link>
            : <button className="button" onClick={() => { play("click"); setOpen(true); }}><Lock size={16} /> Découvrir</button>}
        </div>
      </div>
      <div className="game-art" aria-hidden="true">
        {art === "buzzer" && <><div className="art-buzzer" /><span className="art-avatar">M</span><span className="art-avatar">T</span><span className="art-avatar">L</span><span className="art-avatar">S</span></>}
        {art === "question" && <div className="question-art">?</div>}
        {art === "sabotage" && <div className="sabotage-art" />}
      </div>
    </article>
    {open && <div className="modal-backdrop" role="presentation" onMouseDown={() => setOpen(false)}>
      <section className="modal panel panel-pad" role="dialog" aria-modal="true" aria-labelledby="future-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" aria-label="Fermer" onClick={() => setOpen(false)}><X /></button>
        <span className="tag">En préparation</span><h2 id="future-title">{title}</h2><p>{futurePitch}</p>
        <button className="button" onClick={() => setOpen(false)}>Compris, je patiente</button>
      </section>
    </div>}
  </>;
}
