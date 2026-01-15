import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create next-intl middleware for locale detection
const intlMiddleware = createMiddleware(routing);

export async function middleware(req: NextRequest) {
  // Skip locale and auth middleware for API routes and static files
  if (
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/images') ||
    req.nextUrl.pathname.includes('.') // Static files with extensions
  ) {
    return NextResponse.next();
  }

  // Apply locale detection first
  const intlResponse = intlMiddleware(req);

  // Create a response wrapper for Supabase to work with
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    }
  });

  // Create a Supabase client configured to use cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({ name, value, ...options });
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          req.cookies.delete({ name, ...options });
          res.cookies.delete({ name, ...options });
        },
      },
    }
  );

  // Get the user from the session
  const { data: { session } } = await supabase.auth.getSession();

  // Get the pathname without locale prefix for protected path checking
  const pathname = req.nextUrl.pathname;

  // Protected routes that require authentication (without locale prefix)
  const protectedPaths = ['/chat', '/profiles', '/scenarios'];
  const isProtectedPath = protectedPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/') ||
    pathname.startsWith('/en' + path) || pathname.startsWith('/en' + path + '/') ||
    pathname.startsWith('/zh' + path) || pathname.startsWith('/zh' + path + '/')
  );

  // Redirect to login if not authenticated
  if (isProtectedPath && !session) {
    // Preserve locale in redirect
    const localeMatch = pathname.match(/^\/(en|zh)(\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
    const redirectUrl = new URL(`${localePrefix}/auth/login`, req.url);
    // Strip locale from the redirectTo parameter
    const pathWithoutLocale = localeMatch
      ? pathname.replace(/^\/(en|zh)/, '') || '/'
      : pathname;
    redirectUrl.searchParams.set('redirectTo', pathWithoutLocale + req.nextUrl.search);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect authenticated users away from auth pages
  if (session && pathname.includes('/auth')) {
    const localeMatch = pathname.match(/^\/(en|zh)(\/|$)/);
    const localePrefix = localeMatch ? `/${localeMatch[1]}` : '';
    return NextResponse.redirect(new URL(`${localePrefix}/`, req.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/']
};
