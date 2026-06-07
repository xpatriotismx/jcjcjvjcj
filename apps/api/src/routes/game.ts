import type { FastifyPluginAsync } from "fastify";
import { battleView, chatView, playerView, shelterView } from "../services/views.js";

const gameRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/dashboard", async (request) => {
    const [user, activeShelter, battle, chat] = await Promise.all([
      app.prisma.user.findUniqueOrThrow({ where: { id: request.player!.id } }),
      app.prisma.shelter.findFirst({
        where: { playerId: request.player!.id, status: "ACTIVE", endsAt: { gt: new Date() } }
      }),
      app.prisma.battle.findFirst({
        where: { status: { in: ["WAITING", "ACTIVE"] } },
        orderBy: { updatedAt: "desc" }
      }),
      app.prisma.chatMessage.findMany({
        where: { roomId: "global" },
        include: { user: { select: { id: true, username: true, isVip: true } } },
        orderBy: { createdAt: "desc" },
        take: 30
      })
    ]);

    return {
      player: playerView(user),
      activeShelter: activeShelter ? shelterView(activeShelter) : null,
      battle: battle ? battleView(battle) : null,
      chat: chat.reverse().map(chatView)
    };
  });

  app.get("/battles", async () => {
    const battles = await app.prisma.battle.findMany({
      orderBy: { updatedAt: "desc" },
      take: 20
    });
    return { battles: battles.map(battleView) };
  });
};

export default gameRoutes;
