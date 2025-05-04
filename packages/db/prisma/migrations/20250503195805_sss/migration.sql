-- DropIndex
DROP INDEX "OnRampTransaction_token_key";

-- CreateIndex
CREATE INDEX "OnRampTransaction_token_idx" ON "OnRampTransaction"("token");
