import "@/app/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { Metadata, Viewport } from 'next';
import { Alegreya } from 'next/font/google';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { getMessages } from 'next-intl/server';
import Silk from "@/lib/backgroundSilk";

const comfortaa = Alegreya({
  weight: '500',
  subsets: ['cyrillic']
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#dad4fe',
};

export const metadata: Metadata = {
  title: "Alla Psychology",
  description: "Alla Psychology - Psychotherapeutic Services",
  keywords: "psychology, therapy, psychotherapist, mental health, counseling",
  authors: [{ name: "Alla Sidor" }],
  robots: "index, follow",
  openGraph: {
    title: "Alla Psychology",
    description: "Alla Psychology - Psychotherapeutic Services",
    type: "website",
  },
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  
  // Use next-intl's getMessages with locale parameter
  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        <link rel="icon" href="/alla-psychology.ico" type="image/x-icon" />
        <link rel="preload" href="/alla-psychology-background.webp" as="image" />
        <meta name="theme-color" content="#dad4fe" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={comfortaa.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {/* Global Silk Background */}
          <div className="fixed inset-0 w-full h-full z-0 overflow-hidden">
            <Silk
              speed={3}
              color="#4B3F72"
            />
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <Header />
            <main>
              {children}
            </main>
            <Footer />
          </div>
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
