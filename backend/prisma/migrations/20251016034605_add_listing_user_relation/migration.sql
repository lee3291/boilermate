/*
  Warnings:

  - You are about to drop the `Dog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EmailVerification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Listing` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Preference` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Listing" DROP CONSTRAINT "Listing_userID_fkey";

-- DropForeignKey
ALTER TABLE "public"."Preference" DROP CONSTRAINT "Preference_userId_fkey";

-- DropTable
DROP TABLE "public"."Dog";

-- DropTable
DROP TABLE "public"."EmailVerification";

-- DropTable
DROP TABLE "public"."Listing";

-- DropTable
DROP TABLE "public"."Preference";

-- DropTable
DROP TABLE "public"."User";

-- DropEnum
DROP TYPE "public"."SearchStatus";

-- DropEnum
DROP TYPE "public"."Status";

-- DropEnum
DROP TYPE "public"."UserStatus";

-- DropEnum
DROP TYPE "public"."Visibility";
