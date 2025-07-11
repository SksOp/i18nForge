import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

import { ColabService } from './invite/colab/core.colab';
import { haveOwnerAccessToProject } from '../global.utils';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const colabService = new ColabService();
    const contributors = await colabService.getContributors(projectId);
    return NextResponse.json(contributors);
  } catch (error: any) {
    console.error('Error inviting collaborator:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json({ error: 'Missing projectId' }, { status: 400 });
    }

    const body = await request.json();
    const { contributorId } = body;
    /** yadi woh project ka admin hai tho he contributor ko remove kar sakta hain  */
    const isAdmin = await haveOwnerAccessToProject(projectId, session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'You do not have permission to remove contributors' }, { status: 403 });
    }

    if (!contributorId) {
      return NextResponse.json({ error: 'Missing contributorId' }, { status: 400 });
    }

    const colabService = new ColabService();
    /** Jo project ka owner hai usne remove kiya ? */
    await colabService.removeCollaborator(contributorId);
    return NextResponse.json({ message: 'Contributor removed successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error removing contributor:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
