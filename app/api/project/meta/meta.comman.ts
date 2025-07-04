import prisma from '@/lib/prisma';

export async function getOwnerAndRepo(
  id: string,
): Promise<{ owner: string | null; repo: string | null; installationId: string | null }> {
  if (!id) {
    return { owner: null, repo: null, installationId: null };
  }
  const project = await prisma.project.findUnique({
    where: {
      id: id ?? undefined,
    },
  });
  if (!project) {
    return { owner: null, repo: null, installationId: null };
  }
  const { name, installationId } = project;
  if (!name) {
    return { owner: null, repo: null, installationId: null };
  }
  const owner = name.split('/')[0];
  const repo = name.split('/')[1];
  return { owner, repo, installationId };
}
