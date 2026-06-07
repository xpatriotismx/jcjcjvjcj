import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import staticPlugin from "@fastify/static";
import Fastify from "fastify";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ZodError } from "zod";
import { env } from "./config/env.js";
import authPlugin from "./plugins/auth.js";
import prismaPlugin from "./plugins/prisma.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import gameRoutes from "./routes/game.js";
import shelterRoutes from "./routes/shelters.js";
import websocketRoutes from "./routes/websocket.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "debug" : "info"
    },
    trustProxy: true,
    requestTimeout: 30_000,
    keepAliveTimeout: 72_000,
    connectionTimeout: 10_000
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN.split(",").map((origin) => origin.trim()),
    credentials: true
  });
  await app.register(rateLimit, { max: 180, timeWindow: "1 minute" });
  await app.register(prismaPlugin);
  await app.register(authPlugin);

  app.get("/health", async () => {
    await app.prisma.$queryRaw`SELECT 1`;
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(shelterRoutes, { prefix: "/api/shelters" });
  await app.register(adminRoutes, { prefix: "/api/admin" });
  await app.register(gameRoutes, { prefix: "/api/game" });
  await app.register(websocketRoutes);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: "Gönderilen bilgiler geçersiz.",
        issues: error.issues
      });
    }
    app.log.error(error);
    const statusCode = typeof error === "object" && error !== null && "statusCode" in error
      ? Number(error.statusCode)
      : 500;
    const message = error instanceof Error ? error.message : "Beklenmeyen bir sunucu hatası oluştu.";
    return reply.code(statusCode).send({
      message: statusCode < 500
        ? message
        : "Beklenmeyen bir sunucu hatası oluştu."
    });
  });

  const dirname = path.dirname(fileURLToPath(import.meta.url));
  const webRoot = path.resolve(dirname, "../../web/dist");
  if (env.NODE_ENV === "production" && existsSync(webRoot)) {
    await app.register(staticPlugin, { root: webRoot, wildcard: false });
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith("/api/") || request.url.startsWith("/ws")) {
        return reply.code(404).send({ message: "Kaynak bulunamadı." });
      }
      return reply.sendFile("index.html");
    });
  }

  return app;
}
