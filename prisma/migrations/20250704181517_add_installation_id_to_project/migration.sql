/*
  Warnings:

  - Added the required column `installationId` to the `projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "installationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
