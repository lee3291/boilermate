-- CreateEnum
CREATE TYPE "InteractionAction" AS ENUM ('ACCEPT', 'DECLINE');

-- CreateTable
CREATE TABLE "RecommendationScore" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "reasons" JSONB,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecommendationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationInteraction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "action" "InteractionAction" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecommendationScore_userId_score_idx" ON "RecommendationScore"("userId", "score" DESC);

-- CreateIndex
CREATE INDEX "RecommendationScore_userId_hidden_idx" ON "RecommendationScore"("userId", "hidden");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationScore_userId_candidateId_key" ON "RecommendationScore"("userId", "candidateId");

-- CreateIndex
CREATE INDEX "RecommendationInteraction_userId_action_idx" ON "RecommendationInteraction"("userId", "action");

-- CreateIndex
CREATE INDEX "RecommendationInteraction_candidateId_action_idx" ON "RecommendationInteraction"("candidateId", "action");

-- CreateIndex
CREATE INDEX "RecommendationInteraction_action_createdAt_idx" ON "RecommendationInteraction"("action", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationInteraction_userId_candidateId_key" ON "RecommendationInteraction"("userId", "candidateId");

-- AddForeignKey
ALTER TABLE "RecommendationScore" ADD CONSTRAINT "RecommendationScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScore" ADD CONSTRAINT "RecommendationScore_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationInteraction" ADD CONSTRAINT "RecommendationInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationInteraction" ADD CONSTRAINT "RecommendationInteraction_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
