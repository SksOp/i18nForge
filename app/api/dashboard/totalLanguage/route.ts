import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

import prisma from '@/lib/prisma';

export async function TotalLanguage(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    const paths = project?.paths;

    if (Array.isArray(paths)) {
      const totalKeys = paths.length;
      const language = paths.map((path: any) => path?.language);

      return {
        keyCount: totalKeys,
        language,
        projectId,
      };
    } else {
      return {
        error: 'No info found',
      };
    }
  } catch (error) {
    console.error('Error getting total keys:', error);
    return {
      error: 'Failed to get total keys',
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const totalLanguage = await TotalLanguage(projectId);

    if (totalLanguage.keyCount > 0) {
      return NextResponse.json(totalLanguage, { status: 200 });
    } else {
      return NextResponse.json({ error: 'Total language not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error getting total keys:', error);
    return NextResponse.json({ error: 'Failed to get total keys' }, { status: 500 });
  }
}
