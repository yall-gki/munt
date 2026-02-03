/*
  Warnings:

  - The values [DCA] on the enum `StrategyType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "VerificationTokenType" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET', 'EMAIL_OTP');

-- AlterEnum
BEGIN;
CREATE TYPE "StrategyType_new" AS ENUM ('DCAa', 'GRID', 'INDICATOR', 'MANUAL');
ALTER TABLE "Strategy" ALTER COLUMN "type" TYPE "StrategyType_new" USING ("type"::text::"StrategyType_new");
ALTER TYPE "StrategyType" RENAME TO "StrategyType_old";
ALTER TYPE "StrategyType_new" RENAME TO "StrategyType";
DROP TYPE "public"."StrategyType_old";
COMMIT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "password" TEXT;

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "type" "VerificationTokenType" NOT NULL DEFAULT 'EMAIL_VERIFY'
);

-- CreateIndex
CREATE INDEX "VerificationToken_identifier_type_idx" ON "VerificationToken"("identifier", "type");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_type_key" ON "VerificationToken"("identifier", "token", "type");
