import { z } from "zod";

export const gamePhaseSchema = z.enum([
  "waiting_for_players", "checking_voice", "countdown", "playing",
  "accusation", "objective_review", "paused", "results", "cancelled"
]);
export type GamePhase = z.infer<typeof gamePhaseSchema>;

export const botCommandTypeSchema = z.enum([
  "SYNC_GUILDS", "CHECK_MEMBER_VOICE", "CHECK_LOBBY_VOICE", "MOVE_MEMBER", "REFRESH_CHANNELS"
]);
export type BotCommandType = z.infer<typeof botCommandTypeSchema>;

export const botCommandSchema = z.object({
  id: z.string().uuid(),
  type: botCommandTypeSchema,
  guild_id: z.string(),
  lobby_id: z.string().uuid().nullable(),
  payload: z.record(z.string(), z.unknown()),
  expires_at: z.string().datetime()
});
export type BotCommand = z.infer<typeof botCommandSchema>;

export const lobbySettingsSchema = z.object({
  maxPlayers: z.number().int().min(3).max(10).default(8),
  startingLives: z.number().int().min(1).max(5).default(3),
  targetScore: z.number().int().min(1).max(10).default(5),
  difficulty: z.enum(["easy", "medium", "hard", "mixed"]).default("mixed"),
  cameraAllowed: z.boolean().default(false),
  reconnectSeconds: z.number().int().min(10).max(120).default(30),
  spectatorsAllowed: z.boolean().default(true)
});
export type LobbySettings = z.infer<typeof lobbySettingsSchema>;

export type PlayerState = {
  id: string;
  displayName: string;
  avatarUrl?: string;
  lives: number;
  score: number;
  detectionScore: number;
  eliminated: boolean;
  connected: boolean;
  inVoice: boolean;
  ready: boolean;
  replacementUsed: boolean;
};

export type RealtimeEvent =
  | { type: "player_joined" | "player_left" | "player_ready_changed" | "voice_state_changed"; playerId: string }
  | { type: "game_started" | "game_paused" | "game_resumed" | "game_finished"; matchId: string }
  | { type: "mission_assigned"; playerId: string }
  | { type: "buzzer_pressed"; playerId: string }
  | { type: "accusation_created" | "accusation_resolved"; accusationId: string }
  | { type: "vote_received"; accusationId: string }
  | { type: "objective_claimed"; playerId: string }
  | { type: "life_lost" | "score_changed"; playerId: string; value: number }
  | { type: "bot_status_changed"; online: boolean };
