// components/HomePage/HeroSection.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';

const HeroSection: React.FC = () => {
  const t = useTranslations('hero');
  const locale = useLocale();
  
  return (
    <section className="relative w-full h-screen min-h-[400px] md:min-h-[600px] flex items-center justify-center text-white overflow-hidden">
      {/* Background Image */}
      <Image
        src="/alla-psychology-background.webp"
        alt="Alla Psychology Background"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-80 z-10"></div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {t('title')}
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          {t('subtitle')}
        </p>
        <Link
          href={`/${locale}/booking`}
          className="bg-white text-black font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-lg transform hover:scale-105"
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;