-- CreateEnum
CREATE TYPE "RoommateApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "RoommateApplication" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "status" "RoommateApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "preferenceSnapshot" JSONB,
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommateApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoommateApplication_applicantId_idx" ON "RoommateApplication"("applicantId");

-- CreateIndex
CREATE INDEX "RoommateApplication_listingId_idx" ON "RoommateApplication"("listingId");

-- CreateIndex
CREATE INDEX "RoommateApplication_status_idx" ON "RoommateApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RoommateApplication_listingId_applicantId_key" ON "RoommateApplication"("listingId", "applicantId");

-- AddForeignKey
ALTER TABLE "RoommateApplication" ADD CONSTRAINT "RoommateApplication_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
