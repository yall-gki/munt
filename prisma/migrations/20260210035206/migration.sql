-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StrategyType" ADD VALUE 'HODL';
ALTER TYPE "StrategyType" ADD VALUE 'DCA';
ALTER TYPE "StrategyType" ADD VALUE 'SWING';
ALTER TYPE "StrategyType" ADD VALUE 'REBALANCING';
ALTER TYPE "StrategyType" ADD VALUE 'STAKING';
ALTER TYPE "StrategyType" ADD VALUE 'HISTORICAL_SIMULATION';

-- AlterTable
ALTER TABLE "Strategy" ADD COLUMN     "parameters" JSONB;

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "portfolioValue" DOUBLE PRECISION NOT NULL,
    "perCoinValue" JSONB NOT NULL,
    "realizedPL" DOUBLE PRECISION NOT NULL,
    "unrealizedPL" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Snapshot_userId_date_idx" ON "Snapshot"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Snapshot_userId_date_key" ON "Snapshot"("userId", "date");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- AddForeignKey
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
