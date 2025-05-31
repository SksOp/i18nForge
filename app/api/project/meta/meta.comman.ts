import prisma from "@/lib/prisma";

export async function getOwnerAndRepo(id: string): Promise<{ owner: string | null; repo: string | null }> {
    if (!id) {
        return { owner: null, repo: null };
    }
    const project = await prisma.project.findUnique({
        where: {
            id: id ?? undefined,
        },
    });
    if (!project) {
        return { owner: null, repo: null };
    }
    const { name } = project;
    if (!name) {
        return { owner: null, repo: null };
    }
    const owner = name.split("/")[0];
    const repo = name.split("/")[1];
    return { owner, repo };
}


