import { queryOptions } from "@tanstack/react-query";

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
      return response.json();
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
      return response.json();
    },
  });
};


export const getFileContent = async (projectId: string) => {
  const res2 = await fetch(`/api/project/meta?id=${projectId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!res2.ok) {
    const error = await res2.json();
    throw new Error(error.error || "Failed to get file content");
  }

  return res2.json();
};
