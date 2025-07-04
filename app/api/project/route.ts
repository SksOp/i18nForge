import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

import { authOptions } from '../auth/[...nextauth]/auth';
import { getUser } from '../auth/[...nextauth]/auth';
import { error } from 'console';
/*******CREATE PROJECT ROUTES *******/
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, owner, ownerType, paths, repoName, branch, installationId } = body;

    if (!name || !owner || !ownerType || !paths || !repoName || !branch || !installationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }


    try {
      const existingProject = await prisma.project.findFirst({
        where: {
          name,
        },
      });
      if (existingProject) {
        return NextResponse.json(
          { error: 'A project with this name already exists' },
          { status: 400 },
        );
      }
    } catch { }



    const user = await prisma.user.findUnique({
      where: {
        githubId: session.githubId,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!installationId) {
      return NextResponse.json({ error: "missing Installation Id " });
    }
    console.info("------------");
    console.log(installationId);
    console.log("type of installation id: ", typeof (installationId));
    console.info("-------------");

    const installation = await prisma.installation.findUnique({
      where: { installationId: installationId }
    });


    console.dir(JSON.stringify(installation, null, 2));
    console.log("installation Id");

    const project = await prisma.project.create({
      data: {
        name,
        owner,
        ownerType,
        paths,
        installationId: installationId,
        userId: user?.id,
        repoName,
        defaultBranch: branch,
      },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUser(session.githubId);
    const projects = await prisma.project.findMany({
      where: {
        userId: user?.id,
      },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}
