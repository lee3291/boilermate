-- CreateEnum
CREATE TYPE "VoteType" AS ENUM ('LIKE', 'DISLIKE');

-- CreateTable
CREATE TABLE "UserVote" (
    "id" TEXT NOT NULL,
    "voteType" "VoteType" NOT NULL,
    "voterId" TEXT NOT NULL,
    "votedUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserVote_voterId_votedUserId_key" ON "UserVote"("voterId", "votedUserId");

-- AddForeignKey
ALTER TABLE "UserVote" ADD CONSTRAINT "UserVote_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserVote" ADD CONSTRAINT "UserVote_votedUserId_fkey" FOREIGN KEY ("votedUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
