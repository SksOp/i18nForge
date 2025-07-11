import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

import prisma from '@/lib/prisma';

import { totalColab } from './totalColab/route';
import { TotalLanguage } from './totalLanguage/route';
import { GetComitsHistory } from './utils.dashboard';
import { GetGitHubAccessTokenViaApp } from '../global.utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const per_page = Number(searchParams.get('per_page')) || 10;
    const page = Number(searchParams.get('page')) || 1;

    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });

    const paths = project?.paths;
    const totalKeys = Array.isArray(paths) ? paths.length : 0;
    const repo = project?.name;
    const BotName = process.env.APPNAME ?? 'i18n-forge';

    const baseUrl = 'http://localhost:3000';

    const [commits, collaborators, llmUsage] = await Promise.allSettled([
      repo
        ? (async () => {
          const commits = await GetComitsHistory(
            await GetGitHubAccessTokenViaApp(project.installationId),
            project?.name,
            BotName + '[bot]',
            per_page,
            page,
          );
          return commits;
        })().catch((error) => {
          console.error('Error fetching commits:', error);
          return { error: error.message };
        })
        : Promise.resolve(null),

      projectId
        ? totalColab(projectId).catch((error) => {
          console.error('Error fetching collaborators:', error);
          return { error: error.message };
        })
        : Promise.resolve(null),

      (async () => {
        const response = {
          tokenUsed: 0,
          tokenAllowed: 0,
          tokenLeft: 0,
          tokenResetAt: new Date().toISOString(),
        };
        return response;
      })().catch((error) => {
        console.error('Error fetching LLM usage:', error);
        return { error: error.message };
      }),
    ]);

    const languages = projectId
      ? await TotalLanguage(projectId).catch((error) => {
        console.error('Error fetching languages:', error);
        return { error: error.message };
      })
      : null;

    const responseData = {
      commits:
        commits.status === 'fulfilled' ? commits.value : { error: 'Failed to fetch commits' },
      collaborators:
        collaborators.status === 'fulfilled'
          ? { contributors: collaborators.value }
          : { error: 'Failed to fetch collaborators' },
      llmUsage:
        llmUsage.status === 'fulfilled' ? llmUsage.value : { error: 'Failed to fetch LLM usage' },
      languages: languages || { error: 'Failed to fetch languages' },
      totalKeys: Array.isArray(paths) ? paths.length : 0,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in dashboard API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 },
    );
  }
}
