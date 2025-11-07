-- CreateTable
CREATE TABLE "MessageApproval" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,

    CONSTRAINT "MessageApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserBlocking" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "blockedId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserBlocking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MessageApproval_messageId_userId_key" ON "MessageApproval"("messageId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserBlocking_blockerId_blockedId_key" ON "UserBlocking"("blockerId", "blockedId");

-- AddForeignKey
ALTER TABLE "MessageApproval" ADD CONSTRAINT "MessageApproval_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageApproval" ADD CONSTRAINT "MessageApproval_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlocking" ADD CONSTRAINT "UserBlocking_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserBlocking" ADD CONSTRAINT "UserBlocking_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
