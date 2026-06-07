import argon2 from "argon2";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { playerView } from "../services/views.js";

const credentials = z.object({
  username: z.string().trim().min(3).max(32),
  password: z.string().min(8).max(128)
});

const registerBody = credentials.extend({
  email: z.string().trim().email().max(255)
});

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/register", async (request, reply) => {
    const body = registerBody.parse(request.body);
    const existing = await app.prisma.user.findFirst({
      where: {
        OR: [{ username: body.username }, { email: body.email.toLowerCase() }]
      }
    });

    if (existing) {
      return reply.code(409).send({ message: "Kullanıcı adı veya e-posta zaten kullanılıyor." });
    }

    const user = await app.prisma.user.create({
      data: {
        username: body.username,
        email: body.email.toLowerCase(),
        passwordHash: await argon2.hash(body.password)
      }
    });

    const token = app.jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      { expiresIn: "7d" }
    );

    return reply.code(201).send({ token, player: playerView(user) });
  });

  app.post("/login", async (request, reply) => {
    const body = credentials.parse(request.body);
    const user = await app.prisma.user.findUnique({ where: { username: body.username } });

    if (!user || !(await argon2.verify(user.passwordHash, body.password))) {
      return reply.code(401).send({ message: "Kullanıcı adı veya parola hatalı." });
    }

    const token = app.jwt.sign(
      { sub: user.id, username: user.username, role: user.role },
      { expiresIn: "7d" }
    );
    return { token, player: playerView(user) };
  });

  app.get("/me", { preHandler: app.authenticate }, async (request) => {
    const user = await app.prisma.user.findUniqueOrThrow({ where: { id: request.player!.id } });
    return { player: playerView(user) };
  });
};

export default authRoutes;
