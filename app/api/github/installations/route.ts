import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '../../auth/[...nextauth]/auth';
import { getAllOrgInstallations, getUserOrgs, getUserSelfInstallation } from '../utils';
import { mapInstallation } from './utils';

export type Installation = {
  id: string;
  installationId: string;
  type: 'Organization' | 'User';
  name: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    // console.log(session);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // app access token
    const orgs = await getUserOrgs(session.accessToken); // user access token to get orgs
    // console.log(session);
    const installations = await getAllOrgInstallations(orgs);
    const userInstallation = await getUserSelfInstallation(session.githubId);

    return NextResponse.json(
      [userInstallation, ...installations]
        .filter((installation) => installation !== null)
        .map(mapInstallation),
    );
  } catch (error) {
    console.error('Error fetching installations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
