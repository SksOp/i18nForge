import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { GetGitHubAccessTokenViaApp } from '@/app/api/global.utils';

import prisma from '@/lib/prisma';

import { MetaAPI } from '../meta.expose';
import { FileContentForCommit } from '../meta.utils';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const accessToken = session.accessToken;
  if (!accessToken) {
    return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
  }
  if (!request.nextUrl.searchParams.get('id')) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }
  const branch = request.nextUrl.searchParams.get('branch') ?? 'main';

  const project = await prisma.project.findUnique({
    where: {
      id: request.nextUrl.searchParams.get('id') ?? undefined,
    },
  });
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const { paths, owner, name } = project;
  if (!paths) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }
  const path = (Array.isArray(paths) ? paths : [paths]).map((p: any) => {
    const url = new URL(`https://github.com/${name}/blob/${branch}${p.path}`);
    return url.pathname.substring(1);
  });
  const fileContent = await MetaAPI.getFilesContent(path, accessToken, name);
  try {
    return NextResponse.json({ fileContent }, { status: 200 });
  } catch (error) {
    console.error('Error fetching file content:', error);
    return NextResponse.json({
      error: `Failed to fetch file content: error: ${error.message}`
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = request.headers.get('x-user-accessToken');
    const owner = searchParams.get('owner');
    const repo = searchParams.get('repo');
    const branch = searchParams.get('branch');
    const path = searchParams.get('path');
    const message = searchParams.get('message');

    if (!token || !owner || !repo || !branch || !path || !message) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const body = await request.json();
    const content = body.content;

    if (!content) {
      return NextResponse.json({ error: 'Missing content in request body' }, { status: 400 });
    }
    const fileContent: FileContentForCommit[] = content.map((file: any) => ({
      path: file.path,
      content: file.content,
      branch: branch,
    }));

    const result = await MetaAPI.commitContent(token, owner, repo, branch, fileContent, message);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error committing content:', error);
    return NextResponse.json({ error: 'Failed to commit content' }, { status: 500 });
  }
}
