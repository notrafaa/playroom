import { LobbyRoom } from "@/components/lobby-room";
export default async function LobbyPage({ params }: { params: Promise<{ code: string }> }) { const { code } = await params; return <main className="shell"><header className="page-head"><p className="eyebrow">Salle d’attente</p><h1>La soirée des suspects</h1></header><LobbyRoom code={code.toUpperCase()} /></main>; }
