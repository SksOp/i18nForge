import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

import { authOptions } from '../../../auth/[...nextauth]/auth';
import { mapInstallation } from '../utils';

type Params = Promise<{ installationId: string }>;

export async function GET(request: Request, data: { params: Params }) {
  try {
    const session = await getServerSession(authOptions);
    const params = await data.params;

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const installation = await prisma.installation.findUnique({
      where: {
        installationId: params.installationId,
      },
    });

    if (!installation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json(mapInstallation(installation));
  } catch (error) {
    console.error('Error fetching installation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
