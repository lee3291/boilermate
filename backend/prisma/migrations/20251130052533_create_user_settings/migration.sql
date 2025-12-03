-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email_on_follow_profile_update" BOOLEAN NOT NULL DEFAULT true,
    "email_on_follow_new_listing" BOOLEAN NOT NULL DEFAULT true,
    "email_on_listing_outdated" BOOLEAN NOT NULL DEFAULT true,
    "email_on_listing_27days_old" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
