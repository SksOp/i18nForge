import { deleteProjectApi } from '@/repository/resources/project.api';

export const deleteProjectQuery = (id: string) => ({
  mutationKey: ['deleteProject', id],
  mutationFn: async () => {
    await deleteProjectApi(id);
    return id;
  },
});
