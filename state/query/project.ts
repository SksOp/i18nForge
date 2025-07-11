import { JsonValue } from '@prisma/client/runtime/library';
import { queryOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ProjectResponse {
  projects: Project[];
  currentUser: {
    userName: string;
  };
}
interface Project {
  id: string;
  name: string;
  owner: string;
  createdAt: Date;
  updatedAt: Date;
  ownerType: string;
  defaultBranch: string;
  installationId: string;
  repoName: string;
  paths: Array<{ path: string; language: string }>;
  userId: string;
  branch?: string;
}
interface CreateProjectPayload {
  name: string;
  owner: string;
  ownerType: string;
  installationId: string;
  paths: Record<string, string>[];
  branch: string;
  repoName: string;
}

interface UpdateProjectPayload {
  id: string;
  paths: Record<string, string>[];
}

export const createProject = async (data: CreateProjectPayload) => {
  const response = await fetch('/api/project', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.status === 400) {
    throw new Error('Project already exists');
  }
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create project');
  }

  return response.json();
};
export const updateProject = async (data: UpdateProjectPayload) => {
  const response = await fetch(`/api/project/${data.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ paths: data.paths }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update project');
  }

  return response.json();
};
export const projectsQuery = () => {
  return queryOptions({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('/api/project', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json() as Promise<ProjectResponse>;
    },
  });
};

export const projectQuery = (projectId: string) => {
  return queryOptions({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/project/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json() as Promise<{
        project: Project;
        currentUser: {
          userName: string;
        };
      }>;
    },
  });
};

export const isOwnerQuery = (projectId: string) => {
  if (!projectId) {
    return queryOptions({
      queryKey: ['isOwner', projectId],
      queryFn: async () => {
        throw new Error('Project ID is required');
      },
      enabled: false,
    });
  }
  return queryOptions({
    queryKey: ['isOwner', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/project/isOwner/${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to check ownership');
      }
      return response.json() as Promise<{ isOwner: boolean; error?: string }>;
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const getFileContent = (projectId: string, accessToken?: string, branch?: string) => {
  return queryOptions({
    queryKey: ['fileContent', projectId, branch],
    queryFn: async () => {
      const response = await fetch(`/api/project/meta/file?id=${projectId}&branch=${branch}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-accessToken': accessToken || '',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get file content');
      }

      return response.json() as Promise<{
        fileContent: { path: string; content: string }[];
      }>;
    },
  });
};

export const branchQuery = (userName: string, repoName: string) => {
  return queryOptions({
    queryKey: ['branch', repoName, userName],
    queryFn: async () => {
      const response = await fetch(
        `/api/project/meta/branch?repo=${repoName}&userName=${userName}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.json() as Promise<{ branches: string[] }>;
    },
  });
};

export const dashboardQuery = (projectId: string) => {
  return queryOptions({
    queryKey: ['dashboard', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard?projectId=${projectId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.json() as Promise<{
        dashboard: { commits: number; collaborators: number; languages: number };
      }>;
    },
  });
};
