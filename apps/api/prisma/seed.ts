import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();
const passwordHash = await argon2.hash("Sehemistan!2026");

const admin = await prisma.user.upsert({
  where: { username: "admin" },
  update: {},
  create: {
    username: "admin",
    email: "admin@sehemistan.local",
    passwordHash,
    role: "ADMIN",
    money: 25_000_000_000n,
    gold: 25_000n,
    level: 99,
    power: 920,
    isVip: true,
    vipExpiresAt: new Date("2036-01-01T00:00:00.000Z")
  }
});

const player = await prisma.user.upsert({
  where: { username: "sehem" },
  update: {},
  create: {
    username: "sehem",
    email: "sehem@sehemistan.local",
    passwordHash,
    money: 5_000_000_000n,
    gold: 500n,
    level: 18,
    power: 340
  }
});

await prisma.battle.upsert({
  where: { roomId: "battle:old-city" },
  update: {},
  create: {
    roomId: "battle:old-city",
    status: "ACTIVE",
    attackerName: "Kuzey Hanedanı",
    defenderName: "Kızıl Konsey",
    attackerScore: 43,
    defenderScore: 38,
    revision: 1,
    startedAt: new Date(),
    endsAt: new Date(Date.now() + 6 * 3_600_000),
    state: { district: "Eski Şehir", objective: "Merkez Sığınak" }
  }
});

const chatCount = await prisma.chatMessage.count();
if (chatCount === 0) {
  await prisma.chatMessage.createMany({
    data: [
      { userId: admin.id, roomId: "global", body: "Sehemistan 2.0 operasyon ağı çevrim içi." },
      { userId: player.id, roomId: "global", body: "Eski Şehir cephesinde hareketlilik var." }
    ]
  });
}

console.log("Seed tamamlandı. admin / sehem kullanıcılarının parolası: Sehemistan!2026");
await prisma.$disconnect();
