/*
  Warnings:

  - Added the required column `amount` to the `PortfolioHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `PortfolioHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `PortfolioHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PortfolioHistory" ADD COLUMN     "amount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "symbol" TEXT NOT NULL;
