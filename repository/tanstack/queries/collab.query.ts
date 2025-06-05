import { fetchContributions } from "@/repository/resources/collab.api";

export const getContributorsQuery = (projectId: string) => ({
  queryKey: ["contributors", projectId],
  queryFn: async () => {
    const resp = await fetchContributions(projectId);
    return resp;
  },
});
