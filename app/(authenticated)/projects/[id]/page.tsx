"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Loader } from "lucide-react";

async function projectQuery(id: string) {
  const response = await fetch(`/api/project/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch project");
  }
  return response.json();
}

export default function ProjectPage() {
  const params = useParams();
  const projectId = params.id as string;

  const {
    data: project,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectQuery(projectId),
  });

  if (isLoading) {
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
      <h1 className="text-2xl font-bold mb-6">{project.name}</h1>

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
    </div>
  );
}
