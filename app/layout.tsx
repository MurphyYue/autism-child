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

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Autism Communication Assistant",
  description: "An app to help parents communicate with children with autism",
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
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
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning>
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
