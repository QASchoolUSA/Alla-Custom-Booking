import "@/app/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { Metadata, Viewport } from 'next';
import { Alegreya } from 'next/font/google';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";
import { getMessages } from 'next-intl/server';

const comfortaa = Alegreya({
  weight: '500',
  subsets: ['cyrillic']
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
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
      </head>
      <body className={comfortaa.className}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Header />
          {children}
          <Footer />
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
