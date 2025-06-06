import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/app/api/auth/[...nextauth]/auth';

import { ColabService } from '../invite/colab/core.colab';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const token = searchParams.get('token');

    if (!projectId || !token) {
      return NextResponse.json({ error: 'Project ID and token are required' }, { status: 400 });
    }

    const colabService = new ColabService();
    const result = await colabService.verifyColabLink(projectId, token);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error verifying collaboration link:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
