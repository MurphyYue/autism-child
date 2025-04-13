'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageSquare, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import LocaleSwitcher from '@/components/locale-switcher';
import { Menu } from 'lucide-react'; 
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"; 
import Image from 'next/image';

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const NavItems = () => (
    <>
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
          <Link
            href="/chat"
            className={cn(
              'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
              isActive('/chat') ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Conversation</span>
          </Link>
          <Link
            href="/chat"
            className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
            onClick={async () => {
              await signOut();
              window.location.href = '/auth/login';
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Logout</span>
          </Link>
        </>
      ) : (
        <Button asChild variant="outline" size="sm">
          <Link href="/auth/login" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            <span>Login</span>
          </Link>
        </Button>
      )}
      <LocaleSwitcher />
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo.png"
            alt="Autism Child Logo"
            width={40}
            height={40}
            className="w-auto h-8 md:h-10 ml-2 rounded-full"
             priority
          />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavItems />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-4">
          {/* <LocaleSwitcher /> */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <div className="flex flex-col gap-4 mt-4">
                <NavItems />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}