/*
  Warnings:

  - You are about to drop the column `numberBath` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `numberBed` on the `Listing` table. All the data in the column will be lost.
  - Added the required column `location` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "numberBath",
DROP COLUMN "numberBed",
ADD COLUMN     "location" TEXT NOT NULL,
ALTER COLUMN "pricing" SET DATA TYPE DOUBLE PRECISION;
