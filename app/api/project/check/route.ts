import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { names } = body;
    // console.log("name", name);
    if (!names || names.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingProjects = await prisma.project.findMany({
      where: {
        name: {
          in: Array.isArray(names) ? names : [names],
          mode: 'insensitive',
        },
      },
    });
    console.log('Existing projects:', existingProjects);
    return NextResponse.json({
      isExisting: existingProjects.length > 0,
      projects: existingProjects.map((project) => {
        return {
          name: project.repoName,
          id: project.id,
        };
      }),
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
