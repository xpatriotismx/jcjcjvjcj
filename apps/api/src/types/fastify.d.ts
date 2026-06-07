import type { PrismaClient, Role } from "@prisma/client";
import type { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }

  interface FastifyRequest {
    player: {
      id: string;
      username: string;
      role: Role;
      isVip: boolean;
      vipExpiresAt: Date | null;
    } | null;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string;
      username: string;
      role: Role;
    };
    user: {
      sub: string;
      username: string;
      role: Role;
    };
  }
}
