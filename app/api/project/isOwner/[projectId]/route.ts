import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';

import { haveAccessToProject, haveOwnerAccessToProject } from '@/app/api/global.utils';

import prisma from '@/lib/prisma';

import { authOptions } from '../../../auth/[...nextauth]/auth';

type Params = Promise<{ projectId: string }>;

export async function GET(request: NextRequest, data: { params: Params }) {
  const { projectId } = await data.params;
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const haveAccess = await haveOwnerAccessToProject(projectId, session.user.email);
  if (!haveAccess) {
    return NextResponse.json(
      { error: 'You are not the owner of this project', isOwner: false },
      { status: 200 },
    );
  } else {
    return NextResponse.json({ isOwner: true }, { status: 200 });
  }
}
