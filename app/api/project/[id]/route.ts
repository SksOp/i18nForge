import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

type Params = Promise<{ id: string }>;
export async function GET(request: Request, data: { params: Params }) {
  try {
    const params = await data.params;
    const { id } = params;
    const project = await prisma.project.findUnique({
      where: {
        id,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
  }
}
type PutParams = Promise<{ id: string }>;
export async function PUT(request: Request, data: { params: PutParams }) {
  try {
    const params = await data.params;
    const { id } = params;
    const body = await request.json();
    const { paths } = body;

    const project = await prisma.project.update({
      where: {
        id,
      },
      data: {
        paths: paths,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, data: { params: Params }) {
  try {
    const params = await data.params;
    const { id } = params;
    await prisma.$transaction([
      prisma.contributorToProject.deleteMany({
        where: {
          projectId: id,
        },
      }),
      prisma.project.delete({
        where: {
          id,
        },
      }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete project ', reason: error },
      { status: 500 },
    );
  }
}
