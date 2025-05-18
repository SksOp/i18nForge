-- CreateTable
CREATE TABLE "contributor_to_project" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" TEXT,

    CONSTRAINT "contributor_to_project_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contributor_to_project" ADD CONSTRAINT "contributor_to_project_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contributor_to_project" ADD CONSTRAINT "contributor_to_project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
