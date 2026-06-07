import type {
  ChatMessageView,
  ClientSocketMessage,
  ServerSocketMessage
} from "@sehemistan/contracts";
import websocket from "@fastify/websocket";
import type { FastifyPluginAsync } from "fastify";
import type WebSocket from "ws";
import { z } from "zod";
import { env } from "../config/env.js";
import { synchronizeVip } from "../services/vip-service.js";
import { battleView, chatView } from "../services/views.js";

const querySchema = z.object({
  token: z.string().min(1),
  room: z.string().min(1).max(64).default("global")
});

const incomingSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("join"), roomId: z.string().min(1).max(64), since: z.string().optional() }),
  z.object({ type: z.literal("chat.send"), roomId: z.string().min(1).max(64), body: z.string().trim().min(1).max(500) }),
  z.object({ type: z.literal("battle.strike"), roomId: z.string().min(1).max(64), power: z.number().int().min(1).max(100) }),
  z.object({ type: z.literal("ping"), sentAt: z.number() })
]);

const websocketRoutes: FastifyPluginAsync = async (app) => {
  await app.register(websocket, {
    options: {
      maxPayload: 16 * 1024,
      perMessageDeflate: false
    }
  });

  const rooms = new Map<string, Set<WebSocket>>();
  const roomOf = new WeakMap<WebSocket, Set<string>>();

  const send = (socket: WebSocket, message: ServerSocketMessage) => {
    if (socket.readyState === socket.OPEN) socket.send(JSON.stringify(message));
  };

  const broadcast = (roomId: string, message: ServerSocketMessage) => {
    for (const socket of rooms.get(roomId) ?? []) send(socket, message);
  };

  const announcePresence = (roomId: string) => {
    broadcast(roomId, { type: "presence", roomId, count: rooms.get(roomId)?.size ?? 0 });
  };

  const joinRoom = async (socket: WebSocket, roomId: string) => {
    const sockets = rooms.get(roomId) ?? new Set<WebSocket>();
    sockets.add(socket);
    rooms.set(roomId, sockets);
    const joined = roomOf.get(socket) ?? new Set<string>();
    joined.add(roomId);
    roomOf.set(socket, joined);

    const [messages, battle] = await Promise.all([
      app.prisma.chatMessage.findMany({
        where: { roomId },
        include: { user: { select: { id: true, username: true, isVip: true } } },
        orderBy: { createdAt: "desc" },
        take: 50
      }),
      app.prisma.battle.findUnique({ where: { roomId } })
    ]);
    send(socket, {
      type: "history",
      roomId,
      messages: messages.reverse().map(chatView),
      ...(battle ? { battle: battleView(battle) } : {})
    });
    announcePresence(roomId);
  };

  app.get("/ws", { websocket: true }, async (socket, request) => {
    let player: Awaited<ReturnType<typeof synchronizeVip>>;
    let initialRoom: string;

    try {
      const query = querySchema.parse(request.query);
      const payload = app.jwt.verify<{ sub: string }>(query.token);
      player = await synchronizeVip(app.prisma, payload.sub);
      initialRoom = query.room;
      if (!player) throw new Error("Oyuncu bulunamadı.");
    } catch {
      socket.close(1008, "Geçersiz oturum");
      return;
    }

    roomOf.set(socket, new Set());
    await joinRoom(socket, initialRoom);
    send(socket, {
      type: "ready",
      connectionId: crypto.randomUUID(),
      rooms: [...(roomOf.get(socket) ?? [])]
    });

    let alive = true;
    socket.on("pong", () => {
      alive = true;
    });

    const heartbeat = setInterval(() => {
      if (!alive) {
        socket.terminate();
        return;
      }
      alive = false;
      socket.ping();
    }, env.WS_HEARTBEAT_MS);

    socket.on("message", async (raw) => {
      try {
        const message = incomingSchema.parse(JSON.parse(raw.toString())) as ClientSocketMessage;
        if (message.type === "ping") {
          send(socket, { type: "pong", sentAt: message.sentAt, serverAt: Date.now() });
          return;
        }

        if (message.type === "join") {
          await joinRoom(socket, message.roomId);
          return;
        }

        if (message.type === "chat.send") {
          if (!roomOf.get(socket)?.has(message.roomId)) await joinRoom(socket, message.roomId);
          const saved = await app.prisma.chatMessage.create({
            data: { roomId: message.roomId, body: message.body, userId: player!.id },
            include: { user: { select: { id: true, username: true, isVip: true } } }
          });
          const view: ChatMessageView = chatView(saved);
          broadcast(message.roomId, { type: "chat.message", roomId: message.roomId, message: view });
          return;
        }

        const result = await app.prisma.$transaction(async (tx) => {
          const current = await tx.battle.findUnique({ where: { roomId: message.roomId } });
          if (!current || current.status === "FINISHED") throw new Error("Aktif savaş bulunamadı.");
          const nextRevision = current.revision + 1;
          const hit = Math.max(1, Math.round(message.power * (0.65 + Math.random() * 0.7)));
          const updated = await tx.battle.update({
            where: { id: current.id, revision: current.revision },
            data: {
              status: "ACTIVE",
              attackerScore: { increment: hit },
              revision: { increment: 1 },
              startedAt: current.startedAt ?? new Date()
            }
          });
          const event = await tx.battleEvent.create({
            data: {
              battleId: current.id,
              userId: player!.id,
              kind: "STRIKE",
              revision: nextRevision,
              payload: { hit, username: player!.username }
            }
          });
          return { updated, event };
        });
        broadcast(message.roomId, {
          type: "battle.update",
          roomId: message.roomId,
          battle: battleView(result.updated),
          eventId: result.event.id
        });
      } catch (error) {
        send(socket, {
          type: "error",
          code: "INVALID_MESSAGE",
          message: error instanceof Error ? error.message : "Mesaj işlenemedi."
        });
      }
    });

    socket.on("close", () => {
      clearInterval(heartbeat);
      for (const roomId of roomOf.get(socket) ?? []) {
        rooms.get(roomId)?.delete(socket);
        if (rooms.get(roomId)?.size === 0) rooms.delete(roomId);
        announcePresence(roomId);
      }
    });
  });
};

export default websocketRoutes;
