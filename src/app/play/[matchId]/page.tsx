import { GameBoard } from "@/components/game-board";
export default async function PlayPage({ params }: { params: Promise<{ matchId: string }> }) { const { matchId } = await params; return <GameBoard matchId={matchId} />; }
