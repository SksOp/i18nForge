'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

import { queryClient } from '@/repository/tanstack/query-client';
import { QueryClientProvider } from '@tanstack/react-query';

import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

export const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <>{children}</>{' '}
        </QueryClientProvider>
        <Toaster />
      </SessionProvider>
    </ThemeProvider>
  );
};
