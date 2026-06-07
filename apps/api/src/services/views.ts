import type { Battle, ChatMessage, Shelter, User } from "@prisma/client";
import type {
  BattleSnapshot,
  ChatMessageView,
  PlayerSummary,
  ShelterView
} from "@sehemistan/contracts";

export function playerView(
  user: Pick<User, "id" | "username" | "role" | "money" | "gold" | "level" | "power" | "health" | "isVip" | "vipExpiresAt">
): PlayerSummary {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    money: user.money.toString(),
    gold: user.gold.toString(),
    level: user.level,
    power: user.power,
    health: user.health,
    isVip: user.isVip,
    vipExpiresAt: user.vipExpiresAt?.toISOString() ?? null
  };
}

export function shelterView(shelter: Shelter): ShelterView {
  return {
    id: shelter.id,
    type: shelter.type,
    level: shelter.level,
    startsAt: shelter.startsAt.toISOString(),
    endsAt: shelter.endsAt.toISOString(),
    durationHours: shelter.durationHours,
    currency: shelter.currency,
    cost: shelter.cost.toString(),
    status: shelter.status
  };
}

type ChatWithUser = ChatMessage & {
  user: Pick<User, "id" | "username" | "isVip">;
};

export function chatView(message: ChatWithUser): ChatMessageView {
  return {
    id: message.id,
    roomId: message.roomId,
    body: message.body,
    createdAt: message.createdAt.toISOString(),
    user: message.user
  };
}

export function battleView(battle: Battle): BattleSnapshot {
  return {
    id: battle.id,
    roomId: battle.roomId,
    status: battle.status,
    attackerName: battle.attackerName,
    defenderName: battle.defenderName,
    attackerScore: battle.attackerScore,
    defenderScore: battle.defenderScore,
    revision: battle.revision,
    updatedAt: battle.updatedAt.toISOString()
  };
}
