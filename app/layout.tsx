import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/ui/navbar";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import PWAInstallModal from '@/components/PWAInstallModal';
import type { Viewport } from 'next'

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: "Autism Communication Assistant",
  description: "An app to help parents communicate with their children with autism",
  metadataBase: new URL('https://autism-child.vercel.app'),
  keywords: 'autism, children, support, scenarios, conversation, simulation, profile management, star cat',
  openGraph: {
    title: 'Star Cat - Support for Children with Autism',
    description: 'A comprehensive platform providing support and resources for children with autism.',
    type: 'website',
    locale: 'en_US',
    url: 'autism-child.vercel.app',
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
    title: 'Star Cat - Support for Children with Autism',
    description: 'A comprehensive platform providing support and resources for children with autism.',
    images: ['/images/logo-192x192.png'],
  },
  icons: {
    icon: [
      {
        url: "/images/logo-512x512.png",
        type: "image/png",
      }
    ],
    apple: [
      {
        url: "/images/logo-192x192.png",
        type: "image/png",
        sizes: "180x180"
      }
    ]
  },
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <NextIntlClientProvider>
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
