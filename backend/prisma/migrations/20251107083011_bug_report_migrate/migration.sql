/*
  Warnings:

  - The primary key for the `BugReport` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `stepsToReprod` on the `BugReport` table. All the data in the column will be lost.
  - Added the required column `steps` to the `BugReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `BugReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `BugReport` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "BugReport" DROP CONSTRAINT "BugReport_pkey",
DROP COLUMN "stepsToReprod",
ADD COLUMN     "priority" TEXT,
ADD COLUMN     "steps" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "status" SET DEFAULT 'OPEN',
ADD CONSTRAINT "BugReport_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "BugReport_id_seq";
