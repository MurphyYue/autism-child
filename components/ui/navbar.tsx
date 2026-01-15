"use client";

import { Link, usePathname } from "@/i18n/routing";
import { Home, Users, MessageSquareDot, MessagesSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import LocaleSwitcher from "@/components/locale-switcher";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import Image from "next/image";
import { useTranslations } from "next-intl";

export function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const t = useTranslations("Navigation");

  const isActive = (path: string) => {
    return pathname === path;
  };

  const NavItems = () => (
    <>
      <Link
        href="/"
        className={cn(
          "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
          isActive("/") ? "text-primary" : "text-muted-foreground"
        )}
      >
        <Home className="h-4 w-4" />
        <span>{t("home")}</span>
      </Link>
      {user ? (
        <>
          <Link
            href="/profiles"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isActive("/profiles") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            <span>{t("profiles")}</span>
          </Link>
          <Link
            href="/scenarios"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isActive("/scenarios") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MessageSquareDot className="h-4 w-4" />
            <span>{t("scenarios")}</span>
          </Link>
          <Link
            href="/chat"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isActive("/chat") ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MessagesSquare className="h-4 w-4" />
            <span>{t("conversation")}</span>
          </Link>
          <div
            className="flex items-center gap-2 text-sm font-medium transition-colors text-muted-foreground hover:text-primary cursor-pointer"
            onClick={async () => {
              await signOut();
              window.location.href = "/auth/login";
            }}
          >
            <LogOut className="h-4 w-4" />
            <span>{t("logout")}</span>
          </div>
        </>
      ) : (
        <div
          className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary cursor-pointer"
          onClick={async () => {
            await signOut();
            window.location.href = "/auth/login";
          }}
        >
          <LogOut className="h-4 w-4" />
          <span>{t("login")}</span>
        </div>
      )}
      <LocaleSwitcher />
    </>
  );

  return (
    <nav className="sticky top-0 z-50 border-b dark:border-slate-700 bg-gradient-to-r from-blue-100/90 via-purple-100/90 to-pink-100/90 dark:from-slate-500/90 dark:via-slate-600/90 dark:to-slate-700/90 backdrop-blur supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-blue-100/60 supports-[backdrop-filter]:via-purple-100/60 supports-[backdrop-filter]:to-pink-100/60 dark:supports-[backdrop-filter]:from-slate-500/60 dark:supports-[backdrop-filter]:via-slate-700/60 dark:supports-[backdrop-filter]:to-slate-800/60">
      <div className="container flex h-14 items-center justify-between w-full">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/images/logo-192x192.png"
            alt="Autism Child Logo"
            width={40}
            height={40}
            className="w-auto h-8 md:h-10 ml-4 rounded-full"
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
              <Button variant="ghost" size="icon" className="mr-4">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetHeader>
                <SheetTitle></SheetTitle>
                <SheetDescription></SheetDescription>
              </SheetHeader>
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
