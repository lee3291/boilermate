/*
  Warnings:

  - You are about to drop the column `legalName` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idImageKey]` on the table `VerificationRequest` will be added. If there are existing duplicate values, this will fail.
  - Made the column `idImageKey` on table `VerificationRequest` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "legalName";

-- AlterTable
ALTER TABLE "VerificationRequest" ALTER COLUMN "idImageKey" SET NOT NULL;

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "reporterId" INTEGER NOT NULL,
    "reportedUserId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unresolved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_idImageKey_key" ON "VerificationRequest"("idImageKey");
