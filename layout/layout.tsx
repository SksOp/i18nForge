import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import React from 'react';

import { ClassValue } from 'clsx';
import { LogOutIcon, PlusIcon } from 'lucide-react';

import { ModeToggle } from '@/components/theme-toggle.button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { cn } from '@/lib/utils';

function Layout({ children, className }: { children: React.ReactNode; className?: ClassValue }) {
  const session = useSession();
  const router = useRouter();
  const isLoggedIn = session.data?.user;
  const handleLogout = () => {
    router.push('/auth/logout');
  };
  const path = usePathname();
  const isAtRoot = path === '/';
  return (
    <div className="min-h-screen">
      {' '}
      <div className="fixed top-0 z-50 w-full  flex items-center justify-between p-4 px-6 lg:px-10 border-b  bg-background/60 backdrop-blur-sm">
        <div
          onClick={() => router.push(isLoggedIn ? '/home' : '/')}
          className="flex items-center cursor-pointer"
        >
          <img src="/logo.svg" alt="Logo" className="h-7 w-7 object-cover border rounded-full" />
        </div>
        <div className="flex-grow" />
        <div className="mr-3">
          <ModeToggle />
        </div>
        {isAtRoot && (
          <Button variant={'default'} onClick={() => router.push('/home')} className="mr-3">
            Dashboard
          </Button>
        )}
        {session.data ? (
          <div className="flex items-center justify-end gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="w-8 h-8 ">
                  <AvatarImage src={session.data?.image || ''} alt="User" />
                  <AvatarFallback className="text-xs">
                    {session.data?.username && session.data?.username[0]}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl p-0 border-0 w-full">
                <Card className=" rounded-2xl shadow-[0px_4px_19px_0px_rgba(0,0,0,0.12)] px-10 border-0 py-4 flex flex-col gap-4 w-full">
                  <CardHeader className="px-4 flex flex-col items-center justify-center gap-2">
                    <Avatar>
                      <AvatarImage src={session.data?.image || ''} alt="User" />
                      <AvatarFallback className="text-xs">
                        {session.data?.username && session.data?.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-1 justify-center items-center w-full">
                      <CardTitle className="font-semibold text-sm ">
                        {session.data?.username}
                      </CardTitle>
                      <CardDescription className=" text-sm font-normal">
                        {session.data?.email}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <Button
                      variant={'ghost'}
                      onClick={handleLogout}
                      className="text-red-500 hover:bg-red-100 text-sm font-normal gap-1"
                    >
                      <LogOutIcon />
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button onClick={() => router.push('/auth/login')}>Login</Button>
        )}
      </div>
      <div className="pt-20 px-4">
        <main className={cn('flex flex-col gap-3', className)}>{children}</main>
      </div>
    </div>
  );
}

export default Layout;
