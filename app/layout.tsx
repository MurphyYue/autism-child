import "./globals.css";
import type { Viewport } from 'next'
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://autism-child.vercel.app'),
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
