"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Loader, Edit } from "lucide-react";
import { getFileContent } from "@/state/query/project";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

async function projectQuery(id: string) {
  const response = await fetch(`/api/project/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }
  return response.json();
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const [fileContent, setFileContent] = useState<any>(null);

  const { data: fileData, isLoading: isFileLoading } = useQuery({
    queryKey: ["fileData", projectId],
    queryFn: () => getFileContent(projectId),
  });

  useEffect(() => {
    if (fileData?.fileContent) {
      setFileContent(fileData.fileContent);
    }
  }, [fileData]);

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectQuery(projectId),
  });

  if (isLoading || isFileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6">
        <div className="text-red-500">
          Error loading project: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <Button
          onClick={() => router.push(`/projects/${projectId}/edit`)}
          className="flex items-center gap-2"
        >
          <Edit className="h-4 w-4" />
          Edit Files
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Language Files</h2>
        {project.paths.map((path: Record<string, string>, index: number) => (
          <div key={index} className="p-4 border rounded">
            <div>
              <span className="font-medium">Path:</span>{" "}
              <pre>{JSON.stringify(path.path)}</pre>
            </div>
            <div>
              <span className="font-medium">Language:</span> {path.language}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">File Content</h2>
        {fileContent && fileContent.length > 0 ? (
          <div className="space-y-4">
            {fileContent.map((content: string, index: number) => (
              <div key={index} className="p-4 border rounded bg-gray-50">
                <pre className="whitespace-pre-wrap break-words">
                  {content}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No file content available</p>
        )}
      </div>
    </div>
  );
}
