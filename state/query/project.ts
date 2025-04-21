import { JsonValue } from "@prisma/client/runtime/library";
import { queryOptions } from "@tanstack/react-query";

interface Project {
  id: string;
  name: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  ownerType: string;
  paths: Array<{ path: string; language: string }>;
  userId: string;
}
interface CreateProjectPayload {
  name: string;
  owner: string;
  ownerType: string;
  paths: Record<string, string>[];
}

interface UpdateProjectPayload {
  id: string;
  paths: Record<string, string>[];
}

export const createProject = async (data: CreateProjectPayload) => {
  const response = await fetch("/api/project", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create project");
  }

  return response.json();
};
export const updateProject = async (data: UpdateProjectPayload) => {
  const response = await fetch(`/api/project/${data.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paths: data.paths }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update project");
  }

  return response.json();
};
export const projectsQuery = () => {
  return queryOptions({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/project", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json() as Promise<Project[]>;
    },
  });
};

export const projectQuery = (projectId: string) => {
  return queryOptions({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/project/${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json() as Promise<Project>;
    },
  });
};

export const getFileContent = (projectId: string) => {
  return queryOptions({
    queryKey: ["fileContent", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/project/meta?id=${projectId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get file content");
      }

      return response.json() as Promise<{ fileContent: string[] }>;
    },
  });
};
