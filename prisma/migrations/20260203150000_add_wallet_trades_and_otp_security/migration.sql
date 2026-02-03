-- Add OTP attempt tracking + timestamps
ALTER TABLE "VerificationToken"
ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Create enum for wallet trade status
DO $$ BEGIN
  CREATE TYPE "WalletTradeStatus" AS ENUM ('COMPLETED', 'FAILED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create wallet trade table
CREATE TABLE IF NOT EXISTS "WalletTrade" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "fromCoinId" TEXT NOT NULL,
  "toCoinId" TEXT NOT NULL,
  "fromAmount" DOUBLE PRECISION NOT NULL,
  "toAmount" DOUBLE PRECISION NOT NULL,
  "fromPrice" DOUBLE PRECISION NOT NULL,
  "toPrice" DOUBLE PRECISION NOT NULL,
  "status" "WalletTradeStatus" NOT NULL DEFAULT 'COMPLETED',
  "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WalletTrade_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WalletTrade_userId_executedAt_idx" ON "WalletTrade"("userId", "executedAt");
CREATE INDEX IF NOT EXISTS "WalletTrade_fromCoinId_idx" ON "WalletTrade"("fromCoinId");
CREATE INDEX IF NOT EXISTS "WalletTrade_toCoinId_idx" ON "WalletTrade"("toCoinId");

ALTER TABLE "WalletTrade"
ADD CONSTRAINT "WalletTrade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WalletTrade"
ADD CONSTRAINT "WalletTrade_fromCoinId_fkey" FOREIGN KEY ("fromCoinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "WalletTrade"
ADD CONSTRAINT "WalletTrade_toCoinId_fkey" FOREIGN KEY ("toCoinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
