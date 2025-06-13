'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

import { Toaster } from '@/components/ui/sonner';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <>{children}</>
      <Toaster />
    </SessionProvider>
  );
};
