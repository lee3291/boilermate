/*
  Warnings:

  - You are about to drop the `ContactedListing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ListingFlag` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SavedListing` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."ContactedListing" DROP CONSTRAINT "ContactedListing_listingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ListingFlag" DROP CONSTRAINT "ListingFlag_listingId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SavedListing" DROP CONSTRAINT "SavedListing_listingId_fkey";

-- DropTable
DROP TABLE "public"."ContactedListing";

-- DropTable
DROP TABLE "public"."ListingFlag";

-- DropTable
DROP TABLE "public"."SavedListing";

-- DropEnum
DROP TYPE "public"."FlagReason";
