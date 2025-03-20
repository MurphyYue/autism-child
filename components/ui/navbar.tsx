'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageSquare, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">
              Autism Communication Assistant
            </span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={cn(
                'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
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
                  <Users className="h-4 w-4" />
                  <span>Profiles</span>
                </Link>
                <Link
                  href="/scenarios"
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive('/scenarios') ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Scenarios</span>
                </Link>
              </>
            ) : (
              <Button asChild variant="outline" size="sm" className="ml-4">
                <Link href="/auth/login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}