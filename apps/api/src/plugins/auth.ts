import jwt from "@fastify/jwt";
import fp from "fastify-plugin";
import { env } from "../config/env.js";
import { synchronizeVip } from "../services/vip-service.js";

export default fp(async (app) => {
  await app.register(jwt, { secret: env.JWT_SECRET });
  app.decorateRequest("player", null);

  app.addHook("onRequest", async (request, reply) => {
    const header = request.headers.authorization;
    if (!header?.startsWith("Bearer ")) return;

    try {
      await request.jwtVerify();
      const player = await synchronizeVip(app.prisma, request.user.sub);
      if (!player) {
        return reply.code(401).send({ message: "Oyuncu hesabı bulunamadı." });
      }
      request.player = player;
      await app.prisma.user.update({
        where: { id: player.id },
        data: { lastSeenAt: new Date() }
      });
    } catch {
      return reply.code(401).send({ message: "Oturum geçersiz veya süresi dolmuş." });
    }
  });

  app.decorate("authenticate", async (request, reply) => {
    if (!request.player) {
      await reply.code(401).send({ message: "Bu işlem için giriş yapmalısın." });
    }
  });
});
