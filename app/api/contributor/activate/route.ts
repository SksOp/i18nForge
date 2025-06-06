import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

import { ColabService } from '../invite/colab/core.colab';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contributorId, userId } = body;

    if (!contributorId) {
      return NextResponse.json({ error: 'Contributor ID is required' }, { status: 400 });
    }

    const colabService = new ColabService();
    const result = await colabService.activateCollaborator(contributorId, userId);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error activating collaborator:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
