-- CreateTable
CREATE TABLE "Saved" (
    "username" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Saved_pkey" PRIMARY KEY ("username","listingId")
);

-- CreateIndex
CREATE INDEX "Saved_username_idx" ON "Saved"("username");

-- CreateIndex
CREATE INDEX "Saved_listingId_idx" ON "Saved"("listingId");

-- AddForeignKey
ALTER TABLE "Saved" ADD CONSTRAINT "Saved_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
