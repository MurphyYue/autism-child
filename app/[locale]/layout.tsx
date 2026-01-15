import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/ui/navbar";
import PWAInstallModal from '@/components/PWAInstallModal';
import type { Metadata } from "next";

// Generate static params for each locale
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// Generate hreflang metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const baseUrl = 'https://autism-child.vercel.app';

  return {
    title: locale === 'zh'
      ? "星童 - 自闭症沟通助手"
      : "Star Cat - Autism Communication Assistant",
    description: locale === 'zh'
      ? "通过AI行为模拟帮助父母与自闭症儿童更好地沟通"
      : "An app to help parents communicate with their children with autism through AI-powered behavioral simulations",
    keywords: 'autism, children, support, scenarios, conversation, simulation, profile management, star cat, 自闭症, 儿童, 沟通, AI',
    openGraph: {
      title: locale === 'zh' ? '星童 - 自闭症沟通助手' : 'Star Cat - Support for Children with Autism',
      description: locale === 'zh'
        ? '通过AI行为模拟帮助父母与自闭症儿童更好地沟通'
        : 'A comprehensive platform providing support and resources for children with autism.',
      type: 'website',
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      url: locale === 'zh' ? baseUrl : `${baseUrl}/en`,
      siteName: 'Star Cat',
      images: [
        {
          url: '/images/logo-192x192.png',
          width: 192,
          height: 192,
          alt: 'Star Cat Logo',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: locale === 'zh' ? '星童 - 自闭症沟通助手' : 'Star Cat - Support for Children with Autism',
      description: locale === 'zh'
        ? '通过AI行为模拟帮助父母与自闭症儿童更好地沟通'
        : 'A comprehensive platform providing support and resources for children with autism.',
      images: ['/images/logo-192x192.png'],
    },
    alternates: {
      canonical: locale === 'zh' ? baseUrl : `${baseUrl}/en`,
      languages: {
        'en': `${baseUrl}/en`,
        'zh': baseUrl,
        'x-default': baseUrl,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NextIntlClientProvider messages={messages}>
              <div className="min-h-screen flex flex-col">
                <PWAInstallModal />
                <Navbar />
                <main className="flex-1 flex">{children}</main>
              </div>
            </NextIntlClientProvider>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
