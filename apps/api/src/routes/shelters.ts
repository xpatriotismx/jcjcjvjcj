import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { env } from "../config/env.js";
import { quoteShelter } from "../domain/shelter-rules.js";
import { playerView, shelterView } from "../services/views.js";

const rentBody = z.object({
  durationHours: z.number().int().min(1).max(720),
  type: z.enum(["STANDARD", "FORTIFIED", "COMMAND"]).default("STANDARD")
});

const shelterRoutes: FastifyPluginAsync = async (app) => {
  app.addHook("preHandler", app.authenticate);

  app.get("/", async (request) => {
    await app.prisma.shelter.updateMany({
      where: {
        playerId: request.player!.id,
        status: "ACTIVE",
        endsAt: { lte: new Date() }
      },
      data: { status: "COMPLETED" }
    });

    const shelters = await app.prisma.shelter.findMany({
      where: { playerId: request.player!.id },
      orderBy: { createdAt: "desc" },
      take: 12
    });
    const active = shelters.find((item) => item.status === "ACTIVE");

    return {
      active: active ? shelterView(active) : null,
      history: shelters.map(shelterView),
      rules: {
        hourlyMoneyCost: env.SHELTER_HOURLY_COST.toString(),
        nineHourGoldCost: env.SHELTER_NINE_HOUR_GOLD_COST.toString(),
        normalMoneyMaxHours: 6,
        normalGoldHours: 9
      }
    };
  });

  app.post("/rent", async (request, reply) => {
    const body = rentBody.parse(request.body);
    const quote = quoteShelter(body.durationHours, request.player!.isVip, {
      hourlyMoneyCost: env.SHELTER_HOURLY_COST,
      nineHourGoldCost: env.SHELTER_NINE_HOUR_GOLD_COST
    });
    const now = new Date();
    const endsAt = new Date(now.getTime() + body.durationHours * 3_600_000);

    try {
      const result = await app.prisma.$transaction(async (tx) => {
        await tx.shelter.updateMany({
          where: {
            playerId: request.player!.id,
            status: "ACTIVE",
            endsAt: { lte: now }
          },
          data: { status: "COMPLETED" }
        });

        const active = await tx.shelter.findFirst({
          where: { playerId: request.player!.id, status: "ACTIVE", endsAt: { gt: now } }
        });
        if (active) throw new Error("Zaten aktif bir sığınak kiralaman var.");

        const debit = quote.currency === "MONEY"
          ? await tx.user.updateMany({
              where: { id: request.player!.id, money: { gte: quote.cost } },
              data: { money: { decrement: quote.cost } }
            })
          : await tx.user.updateMany({
              where: { id: request.player!.id, gold: { gte: quote.cost } },
              data: { gold: { decrement: quote.cost } }
            });

        if (debit.count !== 1) {
          throw new Error(quote.currency === "MONEY" ? "Yeterli oyun paran yok." : "Yeterli altının yok.");
        }

        const shelter = await tx.shelter.create({
          data: {
            playerId: request.player!.id,
            type: body.type,
            level: body.type === "COMMAND" ? 3 : body.type === "FORTIFIED" ? 2 : 1,
            startsAt: now,
            endsAt,
            durationHours: body.durationHours,
            currency: quote.currency,
            cost: quote.cost
          }
        });
        const user = await tx.user.findUniqueOrThrow({ where: { id: request.player!.id } });
        return { shelter, user };
      }, { isolationLevel: "Serializable" });

      return reply.code(201).send({
        shelter: shelterView(result.shelter),
        player: playerView(result.user)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sığınak kiralanamadı.";
      return reply.code(400).send({ message });
    }
  });

  app.post("/leave", async (request, reply) => {
    const active = await app.prisma.shelter.findFirst({
      where: { playerId: request.player!.id, status: "ACTIVE", endsAt: { gt: new Date() } }
    });
    if (!active) return reply.code(404).send({ message: "Aktif sığınak bulunamadı." });

    const shelter = await app.prisma.shelter.update({
      where: { id: active.id },
      data: { status: "CANCELLED" }
    });
    return { shelter: shelterView(shelter) };
  });
};

export default shelterRoutes;
