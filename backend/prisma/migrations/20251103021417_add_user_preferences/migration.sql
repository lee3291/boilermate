/*
  Warnings:

  - The primary key for the `Preference` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `importance` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Preference` table. All the data in the column will be lost.
  - You are about to drop the column `visibility` on the `Preference` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[category,value]` on the table `Preference` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `category` to the `Preference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `Preference` table without a default value. This is not possible if the table is not empty.
  - Made the column `value` on table `Preference` required. This step will fail if there are existing NULL values in that column.
  - Made the column `mustHave` on table `Preference` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Preference" DROP CONSTRAINT "Preference_userId_fkey";

-- DropIndex
DROP INDEX "public"."Preference_userId_key_key";

-- AlterTable
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "importance",
DROP COLUMN "key",
DROP COLUMN "userId",
DROP COLUMN "visibility",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "value" SET NOT NULL,
ALTER COLUMN "mustHave" SET NOT NULL,
ADD CONSTRAINT "Preference_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Preference_id_seq";

-- CreateTable
CREATE TABLE "UserProfilePreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferenceId" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 3,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',

    CONSTRAINT "UserProfilePreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoommatePreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "preferenceId" TEXT NOT NULL,
    "importance" INTEGER NOT NULL DEFAULT 3,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',

    CONSTRAINT "RoommatePreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfilePreference_userId_preferenceId_key" ON "UserProfilePreference"("userId", "preferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "RoommatePreference_userId_preferenceId_key" ON "RoommatePreference"("userId", "preferenceId");

-- CreateIndex
CREATE UNIQUE INDEX "Preference_category_value_key" ON "Preference"("category", "value");

-- AddForeignKey
ALTER TABLE "UserProfilePreference" ADD CONSTRAINT "UserProfilePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfilePreference" ADD CONSTRAINT "UserProfilePreference_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommatePreference" ADD CONSTRAINT "RoommatePreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoommatePreference" ADD CONSTRAINT "RoommatePreference_preferenceId_fkey" FOREIGN KEY ("preferenceId") REFERENCES "Preference"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
