/*
  Warnings:

  - You are about to drop the column `amount` on the `PortfolioHistory` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `PortfolioHistory` table. All the data in the column will be lost.
  - You are about to drop the column `symbol` on the `PortfolioHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PortfolioHistory" DROP COLUMN "amount",
DROP COLUMN "name",
DROP COLUMN "symbol";

-- AddForeignKey
ALTER TABLE "PortfolioHistory" ADD CONSTRAINT "PortfolioHistory_coinId_fkey" FOREIGN KEY ("coinId") REFERENCES "Coin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PortfolioHistory" ADD CONSTRAINT "PortfolioHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
