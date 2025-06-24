'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

interface ProjectData {
  id: string;
  name: string;
  repoName: string;
  owner: string;
}

interface ContributorData {
  id: string;
  email: string;
  status?: string;
}

interface ColabClientProps {
  projectId: string;
  token?: string;
}

export default function ColabClient({ projectId, token }: ColabClientProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [contributor, setContributor] = useState<ContributorData | null>(null);

  useEffect(() => {
    const verifyColabLink = async () => {
      if (!token) {
        setError('Missing collaboration token');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/contributor/verify?projectId=${projectId}&token=${token}`,
        );
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify collaboration link');
        }

        setProject(data.project);
        setContributor(data.contributor);
        setLoading(false);

        // If user is authenticated, activate the collaboration
        if (status === 'authenticated' && session?.user) {
          await activateCollaboration(data.contributor.id);
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while verifying the collaboration link');
        setLoading(false);
      }
    };

    if (projectId && token) {
      verifyColabLink();
    } else {
      setLoading(false);
      setError('Invalid collaboration link');
    }
  }, [projectId, token, status, session]);

  const activateCollaboration = async (contributorId: string) => {
    try {
      const response = await fetch('/api/contributor/activate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contributorId }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to activate collaboration');
      }
      router.push(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred while activating the collaboration');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Loading Collaboration...</h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Collaboration Error</h1>
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
        <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!session && status !== 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-4">Join Collaboration</h1>
        <div className=" shadow-md rounded-lg p-6 mb-6 max-w-md w-full">
          <p className="mb-4">
            You've been invited to collaborate on <strong>{project?.name}</strong>. Please sign in
            to join the project.
          </p>
          <Link
            href={`/api/auth/signin?callbackUrl=${encodeURIComponent(`/colab/${projectId}?token=${token}`)}`}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full block text-center"
          >
            Sign In to Join
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Joining Collaboration</h1>
      <div className=" shadow-md rounded-lg p-6 mb-6 max-w-md w-full">
        <p className="mb-4">
          You're being added as a collaborator to <strong>{project?.name}</strong>.
        </p>
        <div className="animate-pulse bg-gray-100 p-4 rounded-md mb-4">
          <p className="text-gray-600">Processing your collaboration request...</p>
        </div>
      </div>
    </div>
  );
}
