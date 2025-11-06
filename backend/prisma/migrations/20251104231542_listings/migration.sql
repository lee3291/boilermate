-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "globalViewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "uniqueViewCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ListingView" (
    "listingId" TEXT NOT NULL,
    "viewerKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingView_pkey" PRIMARY KEY ("listingId","viewerKey")
);

-- CreateIndex
CREATE INDEX "ListingView_viewerKey_idx" ON "ListingView"("viewerKey");

-- AddForeignKey
ALTER TABLE "ListingView" ADD CONSTRAINT "ListingView_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
