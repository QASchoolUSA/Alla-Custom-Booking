import type { Metadata } from "next";
import "@/app/globals.css";
import { NextIntlClientProvider } from 'next-intl';
import { ClerkProvider } from '@clerk/nextjs'
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getMessages } from 'next-intl/server';

export const metadata: Metadata = {
  title: "Alla Psychology",
  description: "Alla Psychology - Psychotherapeutic Services",
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
    <ClerkProvider>
      <html lang={locale}>
        <head>
          <link rel="icon" href="/alla-psychology.ico" type="image/x-icon" />
        </head>
        <body>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <Header />
            {children}
            <Footer />
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
