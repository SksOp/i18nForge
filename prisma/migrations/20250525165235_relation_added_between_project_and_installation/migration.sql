-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "installationId" TEXT NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("installationId") ON DELETE RESTRICT ON UPDATE CASCADE;
