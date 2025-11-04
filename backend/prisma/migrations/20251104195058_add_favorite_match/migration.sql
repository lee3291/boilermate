-- CreateTable
CREATE TABLE "FavoriteMatch" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "favoritedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoriteMatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteMatch_userId_favoritedUserId_key" ON "FavoriteMatch"("userId", "favoritedUserId");

-- AddForeignKey
ALTER TABLE "FavoriteMatch" ADD CONSTRAINT "FavoriteMatch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteMatch" ADD CONSTRAINT "FavoriteMatch_favoritedUserId_fkey" FOREIGN KEY ("favoritedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
