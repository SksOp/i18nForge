/*
  Warnings:

  - A unique constraint covering the columns `[githubId]` on the table `installations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `githubId` to the `installations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `githubName` to the `installations` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "installations" ADD COLUMN     "githubId" TEXT NOT NULL,
ADD COLUMN     "githubName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "installations_githubId_key" ON "installations"("githubId");
