import { Installation } from "@/app/api/github/installations/route";
import { Repository } from "@/app/api/github/repositories/[installtionId]/route";
import { queryOptions } from "@tanstack/react-query";

export const installationsQuery = () => {
  return queryOptions<Installation[]>({
    queryKey: ["installations"],
    queryFn: async () => {
      const response = await fetch("/api/github/installations", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.json();
    },
  });
};

export const installationQuery = (installationId: string) => {
  return queryOptions<Installation>({
    queryKey: ["installation", installationId],
    queryFn: async () => {
      const response = await fetch(
        `/api/github/installations/${installationId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.json();
    },
  });
};

export const installationRepositoriesQuery = (
  installationId: string,
  pageOptions?: {
    page?: number;
    per_page?: number;
    search?: string;
  }
) => {
  return queryOptions<Repository[]>({
    queryKey: [
      "installationRepositories",
      installationId,
      pageOptions?.page,
      pageOptions?.per_page,
      pageOptions?.search,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (pageOptions?.page) params.append("page", pageOptions.page.toString());
      if (pageOptions?.per_page)
        params.append("per_page", pageOptions.per_page.toString());
      if (pageOptions?.search) params.append("search", pageOptions.search);

      const response = await fetch(
        `/api/github/repositories/${installationId}?${params.toString()}`
      );
      return response.json();
    },
  });
};

export const verifyRepoAccessQuery = (
  installationId: string,
  owner: string,
  repo: string
) => {
  return queryOptions<unknown>({
    queryKey: ["verifyRepoAccess", installationId, owner, repo],
    queryFn: async () => {
      const response = await fetch(
        `/api/github/installations/${installationId}/verify/${owner}/${repo}`
      );
      return response.json();
    },
  });
};
