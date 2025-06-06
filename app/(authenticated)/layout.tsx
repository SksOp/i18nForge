'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import React from 'react';

import { queryClient } from '@/state/client';
import { QueryClientProvider } from '@tanstack/react-query';

import Spinner from '@/components/spinner';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return redirect('/auth/login');
  }

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
