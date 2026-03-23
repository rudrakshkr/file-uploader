/*
  Warnings:

  - A unique constraint covering the columns `[shareToken]` on the table `Folders` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Folders" ADD COLUMN     "shareExpires" TIMESTAMP(3),
ADD COLUMN     "shareToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Folders_shareToken_key" ON "Folders"("shareToken");
