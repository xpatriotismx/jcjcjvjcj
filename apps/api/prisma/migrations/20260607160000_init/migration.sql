-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PLAYER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "ShelterType" AS ENUM ('STANDARD', 'FORTIFIED', 'COMMAND');

-- CreateEnum
CREATE TYPE "ShelterStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('MONEY', 'GOLD');

-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('WAITING', 'ACTIVE', 'FINISHED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(32) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PLAYER',
    "money" BIGINT NOT NULL DEFAULT 5000000000,
    "gold" BIGINT NOT NULL DEFAULT 500,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "power" INTEGER NOT NULL DEFAULT 100,
    "health" INTEGER NOT NULL DEFAULT 100,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "vipExpiresAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shelter" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "type" "ShelterType" NOT NULL DEFAULT 'STANDARD',
    "level" INTEGER NOT NULL DEFAULT 1,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "durationHours" INTEGER NOT NULL,
    "currency" "Currency" NOT NULL,
    "cost" BIGINT NOT NULL,
    "status" "ShelterStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shelter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "roomId" VARCHAR(64) NOT NULL,
    "body" VARCHAR(500) NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "roomId" VARCHAR(64) NOT NULL,
    "status" "BattleStatus" NOT NULL DEFAULT 'WAITING',
    "attackerName" VARCHAR(64) NOT NULL,
    "defenderName" VARCHAR(64) NOT NULL,
    "attackerScore" INTEGER NOT NULL DEFAULT 0,
    "defenderScore" INTEGER NOT NULL DEFAULT 0,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "state" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleEvent" (
    "id" TEXT NOT NULL,
    "battleId" TEXT NOT NULL,
    "userId" TEXT,
    "kind" VARCHAR(40) NOT NULL,
    "payload" JSONB NOT NULL,
    "revision" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BattleEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAudit" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "targetId" TEXT,
    "action" VARCHAR(80) NOT NULL,
    "metadata" JSONB NOT NULL,
    "ipAddress" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_isVip_vipExpiresAt_idx" ON "User"("isVip", "vipExpiresAt");

-- CreateIndex
CREATE INDEX "Shelter_playerId_status_endsAt_idx" ON "Shelter"("playerId", "status", "endsAt");

-- CreateIndex
CREATE INDEX "ChatMessage_roomId_createdAt_idx" ON "ChatMessage"("roomId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Battle_roomId_key" ON "Battle"("roomId");

-- CreateIndex
CREATE INDEX "Battle_status_updatedAt_idx" ON "Battle"("status", "updatedAt");

-- CreateIndex
CREATE INDEX "BattleEvent_battleId_createdAt_idx" ON "BattleEvent"("battleId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BattleEvent_battleId_revision_key" ON "BattleEvent"("battleId", "revision");

-- CreateIndex
CREATE INDEX "AdminAudit_actorId_createdAt_idx" ON "AdminAudit"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "AdminAudit_targetId_createdAt_idx" ON "AdminAudit"("targetId", "createdAt");

-- AddForeignKey
ALTER TABLE "Shelter" ADD CONSTRAINT "Shelter_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleEvent" ADD CONSTRAINT "BattleEvent_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleEvent" ADD CONSTRAINT "BattleEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAudit" ADD CONSTRAINT "AdminAudit_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAudit" ADD CONSTRAINT "AdminAudit_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

