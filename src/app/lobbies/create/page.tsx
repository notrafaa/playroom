import type { Metadata } from "next";
import { CreateLobbyForm } from "@/components/create-lobby-form";
export const metadata: Metadata = { title: "Créer un lobby" };
export default function CreateLobbyPage() { return <main className="shell"><header className="page-head"><p className="eyebrow">Nouvelle partie</p><h1>Prépare la table.</h1><p>Configure Objectif secret. Le serveur et le salon Discord seront confirmés dans le lobby avant le lancement.</p></header><CreateLobbyForm /></main>; }
