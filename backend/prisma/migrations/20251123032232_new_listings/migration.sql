-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "moveInDateOutdatedAlert" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reportedOutdatedAlert" BOOLEAN NOT NULL DEFAULT false;
