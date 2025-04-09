'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageSquare, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import LocaleSwitcher from '@/components/locale-switcher';

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2 pl-6">
            <span className="hidden font-bold sm:inline-block">
              logo
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary pl-6',
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Home className="h-4 w-4 hidden sm:inline" />
              <span className="">Home</span>
            </Link>
            {user ? (
              <>
                <Link
                  href="/profiles"
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive('/profiles') ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Users className="h-4 w-4 hidden sm:inline" />
                  <span>Profiles</span>
                </Link>
                <Link
                  href="/scenarios"
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive('/scenarios') ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <MessageSquare className="h-4 w-4 hidden sm:inline" />
                  <span className="">Scenarios</span>
                </Link>
                <Link
                  href="/chat"
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive('/chat') ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <MessageSquare className="h-4 w-4 hidden sm:inline" />
                  <span className="">Conversation</span>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-muted-foreground hover:text-primary"
                  onClick={async () => {
                    await signOut();
                    window.location.href = '/auth/login';
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className='hidden sm:inline-block'>Logout</span>
                </Button>
              </>
            ) : (
              <Button asChild variant="outline" size="sm" className="ml-4">
                <Link href="/auth/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Button>
            )}
            <LocaleSwitcher />
          </div>
        </div>
      </div>
    </nav>
  );
}