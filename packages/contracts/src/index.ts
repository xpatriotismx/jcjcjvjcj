export type Role = "PLAYER" | "MODERATOR" | "ADMIN";
export type Currency = "MONEY" | "GOLD";
export type RealtimeChannel = "chat" | "battle" | "system";

export interface PlayerSummary {
  id: string;
  username: string;
  role: Role;
  money: string;
  gold: string;
  level: number;
  power: number;
  health: number;
  isVip: boolean;
  vipExpiresAt: string | null;
}

export interface ShelterView {
  id: string;
  type: "STANDARD" | "FORTIFIED" | "COMMAND";
  level: number;
  startsAt: string;
  endsAt: string;
  durationHours: number;
  currency: Currency;
  cost: string;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export interface ChatMessageView {
  id: string;
  roomId: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    isVip: boolean;
  };
}

export interface BattleSnapshot {
  id: string;
  roomId: string;
  status: "WAITING" | "ACTIVE" | "FINISHED";
  attackerName: string;
  defenderName: string;
  attackerScore: number;
  defenderScore: number;
  revision: number;
  updatedAt: string;
}

export type ClientSocketMessage =
  | { type: "join"; roomId: string; since?: string }
  | { type: "chat.send"; roomId: string; body: string }
  | { type: "battle.strike"; roomId: string; power: number }
  | { type: "ping"; sentAt: number };

export type ServerSocketMessage =
  | { type: "ready"; connectionId: string; rooms: string[] }
  | { type: "history"; roomId: string; messages: ChatMessageView[]; battle?: BattleSnapshot }
  | { type: "chat.message"; roomId: string; message: ChatMessageView }
  | { type: "battle.update"; roomId: string; battle: BattleSnapshot; eventId: string }
  | { type: "presence"; roomId: string; count: number }
  | { type: "pong"; sentAt: number; serverAt: number }
  | { type: "error"; code: string; message: string };
