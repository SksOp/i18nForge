import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

import { GetComitsHistory } from '../utils.dashboard';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.nextUrl);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const repo = searchParams.get('repo');
    const per_page = Number(searchParams.get('per_page')) || 10;
    const page = Number(searchParams.get('page')) || 1;

    if (!repo) {
      return NextResponse.json({ error: 'Missing Repository and' }, { status: 400 });
    }
    if (!repo.includes('/')) {
      return NextResponse.json({ error: 'Invalid Repository' }, { status: 400 });
    }

    const APPNAME = process.env.APPNAME ?? 'i18n-forge';

    const commits = await GetComitsHistory(
      session.accessToken,
      repo,
      APPNAME + '[bot]',
      per_page,
      page,
    );

    return NextResponse.json(commits);
  } catch (error) {
    console.error('error in getting commits: ', error.message);
    return NextResponse.json(error);
  }
}
