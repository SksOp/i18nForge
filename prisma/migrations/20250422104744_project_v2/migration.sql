-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "defaultBranch" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "repoName" TEXT NOT NULL DEFAULT '';
