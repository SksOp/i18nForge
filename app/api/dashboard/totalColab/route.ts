import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

import { error } from 'console';

import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }
    const contributors = await totalColab(projectId);
    if (contributors) {
      return NextResponse.json({ contributors }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Contributros not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error getting total colab:', error);
    return NextResponse.json({ error: 'Failed to get total colab' }, { status: 500 });
  }
}

export async function totalColab(projectId: string) {
  try {
    const contributors = await prisma.contributorToProject.count({
      where: {
        projectId,
      },
    });

    return contributors;
  } catch (error) {
    console.error('Error getting total colab:', error);
    return 0;
  }
}
