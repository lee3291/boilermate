/*
  Warnings:

  - You are about to drop the column `userAId` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `userBId` on the `Chat` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ChatParticipantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_userAId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Chat" DROP CONSTRAINT "Chat_userBId_fkey";

-- DropIndex
DROP INDEX "public"."Chat_userAId_userBId_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "userAId",
DROP COLUMN "userBId",
ADD COLUMN     "creatorId" TEXT,
ADD COLUMN     "groupIcon" TEXT,
ADD COLUMN     "isGroup" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "ChatParticipant" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ChatParticipantStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "ChatParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatParticipant_userId_chatId_key" ON "ChatParticipant"("userId", "chatId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatParticipant" ADD CONSTRAINT "ChatParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
