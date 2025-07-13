import {
  addContributor,
  deleteContributor,
  fetchContributions,
} from '@/repository/resources/collab.api';

export const getContributorsQuery = (projectId: string) => ({
  queryKey: ['contributors', projectId],
  queryFn: async () => {
    const resp = await fetchContributions(projectId);
    return resp;
  },
});

export const addCollaboratorQuery = () => ({
  mutationKey: ['addCollaborator'],
  mutationFn: ({
    projectId,
    contributorEmails,
  }: {
    projectId: string;
    contributorEmails: string[];
  }) => addContributor({ projectId, contributorEmails }),
});

export const deleteContributorQuery = (contributorId: string, projectId: string) => ({
  queryKey: ['deleteContributor', projectId, contributorId],
  queryFn: async () => {
    const resp = await deleteContributor(projectId, contributorId);
    return resp;
  },
});
