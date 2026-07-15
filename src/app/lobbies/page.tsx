import Link from "next/link";
import type { Metadata } from "next";
import { JoinForm } from "@/components/join-form";
import { PublicLobbies } from "@/components/public-lobbies";
export const metadata: Metadata = { title: "Lobbies" };
export default function LobbiesPage() { return <main className="shell"><header className="page-head"><p className="eyebrow">Trouver une partie</p><h1>Entre sans frapper.</h1><p>Rejoins un lobby public ou utilise le code envoyé par ton ami.</p></header><div className="lobby-browser"><section className="panel panel-pad"><h2>J’ai un code</h2><JoinForm /></section><section className="panel panel-pad"><div className="section-title"><h2>Lobbies publics</h2><Link className="button" href="/lobbies/create">Créer</Link></div><PublicLobbies /></section></div></main>; }
