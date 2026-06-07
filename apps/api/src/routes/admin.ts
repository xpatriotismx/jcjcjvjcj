import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { playerView } from "../services/views.js";

const grantVipBody = z.object({
  playerId: z.string().uuid().optional(),
  username: z.string().trim().min(3).max(32).optional(),
  days: z.number().int().min(0).max(3650).default(0),
  hours: z.number().int().min(0).max(87600).default(0)
}).refine((value) => value.playerId || value.username, {
  message: "playerId veya username gereklidir."
}).refine((value) => value.days > 0 || value.hours > 0, {
  message: "VIP süresi sıfırdan büyük olmalıdır."
});

const adminRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.post("/grant-vip", async (request, reply) => {
    if (request.player!.role !== "ADMIN") {
      return reply.code(403).send({ message: "Bu işlem yalnızca yöneticilere açıktır." });
    }

    const body = grantVipBody.parse(request.body);
    const target = await app.prisma.user.findFirst({
      where: body.playerId ? { id: body.playerId } : { username: body.username! }
    });
    if (!target) return reply.code(404).send({ message: "Oyuncu bulunamadı." });

    const milliseconds = ((body.days * 24) + body.hours) * 3_600_000;
    const base = target.vipExpiresAt && target.vipExpiresAt > new Date()
      ? target.vipExpiresAt
      : new Date();
    const vipExpiresAt = new Date(base.getTime() + milliseconds);

    const updated = await app.prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: target.id },
        data: { isVip: true, vipExpiresAt }
      });
      await tx.adminAudit.create({
        data: {
          actorId: request.player!.id,
          targetId: target.id,
          action: "GRANT_VIP",
          metadata: { days: body.days, hours: body.hours, vipExpiresAt: vipExpiresAt.toISOString() },
          ipAddress: request.ip
        }
      });
      return user;
    });

    return { player: playerView(updated) };
  });

  app.get("/players", async (request, reply) => {
    if (request.player!.role !== "ADMIN") {
      return reply.code(403).send({ message: "Yetkisiz işlem." });
    }
    const users = await app.prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return { players: users.map(playerView) };
  });
};

export default adminRoutes;
