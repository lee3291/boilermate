-- DropIndex
DROP INDEX "VerificationRequest_idImageKey_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "legalName" TEXT;

-- AlterTable
ALTER TABLE "VerificationRequest" ALTER COLUMN "idImageKey" DROP NOT NULL;
