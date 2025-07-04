-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_installationId_fkey";

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "installations"("installationId") ON DELETE RESTRICT ON UPDATE CASCADE;
