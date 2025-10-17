/*
  Warnings:

  - You are about to drop the column `creatorId` on the `Listing` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "creatorId",
ADD COLUMN     "user" TEXT NOT NULL DEFAULT 'Anonymous';
