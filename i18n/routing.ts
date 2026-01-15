import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'zh',
  localePrefix: 'as-needed' // Hide prefix for default locale (zh), so / is Chinese, /en is English
});

// Create locale-aware navigation components
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
