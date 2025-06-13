import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { GetGitHubAccessTokenViaApp } from '@/app/api/global.utils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // const accessToken = await GetGitHubAccessTokenViaApp(session.githubId);
    return NextResponse.json({
      tokenUsed: 0,
      tokenAllowed: 0,
      tokenLeft: 0,
      tokenResetAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('error in getting dashboard data: ', error.message);
    return NextResponse.json(error);
  }
}
