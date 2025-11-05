/*
  Warnings:

  - You are about to drop the column `globalViewCount` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `uniqueViewCount` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the `ListingView` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ListingView" DROP CONSTRAINT "ListingView_listingId_fkey";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "globalViewCount",
DROP COLUMN "uniqueViewCount";

-- DropTable
DROP TABLE "public"."ListingView";
