import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';



import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { GetGitHubAccessTokenViaApp } from '@/app/api/global.utils';



import prisma from '@/lib/prisma';



import { GitHubRepo } from '../../types';
import { getOrgRepos, getUserRepos } from '../../utils';





export type Repository = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  updated_at: string;
  created_at: string;
  pushed_at: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
};

const mapRepository = (repository: GitHubRepo): Repository => {
  return {
    id: repository.id,
    name: repository.name,
    full_name: repository.full_name,
    private: repository.private,
    html_url: repository.html_url,
    updated_at: repository.updated_at,
    created_at: repository.created_at,
    pushed_at: repository.pushed_at,
    size: repository.size,
    stargazers_count: repository.stargazers_count,
    watchers_count: repository.watchers_count,
  };
};
type Params = Promise<{ installtionId: string }>;
export async function GET(request: NextRequest, data: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    const params = await data.params;
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const per_page = parseInt(searchParams.get('per_page') || '5');
    const search = searchParams.get('search') || '';

    const installation = await prisma.installation.findUnique({
      where: {
        installationId: params.installtionId.toString(),
      },
    });

    if (!installation) {
      return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
    }

    let repositories: GitHubRepo[] = [];

    if (installation.type.toLocaleLowerCase() === 'user') {
      repositories = await getUserRepos(
        {
          page,
          per_page,
          search,
        },
        session.accessToken,
      );
    } else {
      repositories = await getOrgRepos(
        installation.githubName,
        { page, per_page, search },
        session.accessToken,
      );
    }

    return NextResponse.json(repositories.map(mapRepository));
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
  }
}