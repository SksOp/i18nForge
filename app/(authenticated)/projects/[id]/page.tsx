"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader, Edit } from "lucide-react";
import { getFileContent, projectQuery } from "@/state/query/project";
import TranslationsPage from "@/components/translation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

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
  const [dataForTable, setDataForTable] = useState<Record<string, any>>({});

  useEffect(() => {
    const table: Record<string, any> = {};
    if (fileContent?.fileContent) {
      project?.paths.forEach((path, index) => {
        try {
          const content = fileContent.fileContent[index].content;
          if (typeof content === "object") {
            table[path.language] = content;
          } else if (typeof content === "string") {
            table[path.language] = JSON.parse(content);
          }
        } catch (error) {
          console.error(`Error parsing content for ${path.language}:`, error);
        }
      });

      setDataForTable(table);
    }
    // console.log("dataForTable", JSON.stringify(table));
  }, [fileContent, project]);

  if (isLoading || fileContentLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

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
