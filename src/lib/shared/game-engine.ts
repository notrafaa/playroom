import type { PlayerState } from "./types";

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateLobbyCode(random = Math.random): string {
  return Array.from({ length: 5 }, () => CODE_ALPHABET[Math.floor(random() * CODE_ALPHABET.length)] ?? "A").join("");
}

export function canManageLobby(actorId: string, hostId: string): boolean {
  return actorId === hostId;
}

export function canStartMatch(players: PlayerState[], botOnline: boolean): boolean {
  const active = players.filter((player) => !player.eliminated);
  return botOnline && active.length >= 3 && active.every((player) => player.ready && player.connected && player.inVoice);
}

export function pickMission<T extends { id: string; minPlayers: number; cameraRequired: boolean; active: boolean }>(
  missions: T[], playerCount: number, cameraAllowed: boolean, excludedIds: ReadonlySet<string> = new Set(), random = Math.random
): T {
  const available = missions.filter((mission) => mission.active && mission.minPlayers <= playerCount && (!mission.cameraRequired || cameraAllowed) && !excludedIds.has(mission.id));
  if (available.length === 0) throw new Error("Aucun objectif compatible n’est disponible.");
  return available[Math.floor(random() * available.length)] ?? available[0]!;
}

export function replaceMission(player: PlayerState): PlayerState {
  if (player.eliminated) throw new Error("Un spectateur ne peut pas changer d’objectif.");
  if (player.replacementUsed) throw new Error("Le changement gratuit a déjà été utilisé.");
  return { ...player, replacementUsed: true };
}

export function loseLife(player: PlayerState): PlayerState {
  const lives = Math.max(0, player.lives - 1);
  return { ...player, lives, eliminated: lives === 0 };
}

export function gainScore(player: PlayerState, amount = 1): PlayerState {
  if (player.eliminated) throw new Error("Un spectateur ne peut pas marquer de point.");
  return { ...player, score: player.score + amount };
}

export type Vote = "correct" | "incorrect" | "too_vague";
export function resolveVotes(votes: Vote[]): Vote {
  const counts: Record<Vote, number> = { correct: 0, incorrect: 0, too_vague: 0 };
  for (const vote of votes) counts[vote] += 1;
  const max = Math.max(...Object.values(counts));
  const winners = (Object.keys(counts) as Vote[]).filter((key) => counts[key] === max);
  return winners.length === 1 ? winners[0]! : "too_vague";
}

export function winner(players: PlayerState[], targetScore: number): PlayerState | null {
  const scoreWinner = players.find((player) => player.score >= targetScore);
  if (scoreWinner) return scoreWinner;
  const active = players.filter((player) => !player.eliminated);
  return active.length === 1 ? active[0]! : null;
}

export function isBotOnline(lastSeenAt: string, discordConnected: boolean, now = Date.now(), offlineAfterMs = 30_000): boolean {
  return discordConnected && now - new Date(lastSeenAt).getTime() < offlineAfterMs;
}

export function isCommandExpired(expiresAt: string, now = Date.now()): boolean {
  return new Date(expiresAt).getTime() <= now;
}

export function reconnectStatus(disconnectedAt: string, reconnectSeconds = 30, now = Date.now()) {
  const elapsed = Math.floor((now - new Date(disconnectedAt).getTime()) / 1000);
  const remaining = Math.max(0, reconnectSeconds - elapsed);
  return { remaining, expired: remaining === 0 };
}
