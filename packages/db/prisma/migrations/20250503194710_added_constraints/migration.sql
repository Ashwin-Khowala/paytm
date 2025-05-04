/*
  Warnings:

  - The primary key for the `OnRampTransaction` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "OnRampTransaction" DROP CONSTRAINT "OnRampTransaction_pkey",
ADD CONSTRAINT "OnRampTransaction_pkey" PRIMARY KEY ("id", "startTime");
