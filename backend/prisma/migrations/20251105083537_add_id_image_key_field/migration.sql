/*
  Warnings:

  - A unique constraint covering the columns `[idImageKey]` on the table `VerificationRequest` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idImageKey` to the `VerificationRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "VerificationRequest" ADD COLUMN     "idImageKey" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_idImageKey_key" ON "VerificationRequest"("idImageKey");
