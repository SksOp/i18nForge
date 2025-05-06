"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader, Edit } from "lucide-react";
import { getFileContent, projectQuery } from "@/state/query/project";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Project } from "@prisma/client";
import { Path } from "@prisma/client/runtime/library";
import TranslationsPage from "@/components/translation";
import { useSession } from "next-auth/react";

export default function ProjectPage() {
  const params = useParams();

  const {
    data: project,
    isLoading,
    error,
  } = useQuery(projectQuery(params.id as string));
  const { data: session } = useSession();
  const { data: fileContent, isLoading: fileContentLoading } = useQuery(
    getFileContent(params.id as string, session?.accessToken || "")
  );

  if (isLoading || fileContentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const dataForTable = {};
  if (fileContent?.fileContent) {
    project?.paths.forEach((path, index) => {
      dataForTable[path.language] = JSON.parse(fileContent?.fileContent[index]);
    });
  }
  console.log("dataForTable", dataForTable);

  return (
    <div>
      <TranslationsPage
        files={dataForTable}
        userName={project?.owner ?? " "}
        repoName={project?.repoName ?? " "}
      />
    </div>
  );
}
