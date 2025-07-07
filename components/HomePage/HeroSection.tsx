// components/HomePage/HeroSection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SplitText from '@/lib/splitText';
import { useTranslations, useLocale } from 'next-intl';

const HeroSection: React.FC = () => {
  const t = useTranslations('hero');
  const locale = useLocale();
  const [fixedHeight, setFixedHeight] = useState<number | null>(null);
  
  // Set fixed height on initial load to prevent resizing during scroll
  useEffect(() => {
    if (typeof window !== 'undefined' && fixedHeight === null) {
      setFixedHeight(window.innerHeight);
    }
  }, [fixedHeight]);
  
  // Handle 'always' locale prefix correctly
  const getLocalizedPath = (path: string) => {
    // With localePrefix: 'always', all locales need prefixes
    return `/${locale}${path}`;
  };
  
  return (
    <section 
      className="relative w-full flex items-center justify-center text-white overflow-hidden min-h-screen"
      style={{ 
        height: fixedHeight ? `${fixedHeight}px` : '100vh',
        marginTop: '-80px', // Offset header height
        paddingTop: '80px'   // Add padding to maintain content position
      }}
    >
      {/* Content */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center h-full">
        <SplitText
          text={t('title')}
          className="text-4xl md:text-6xl font-bold mb-6"
          delay={100}
          duration={0.6}
          ease="power3.out"
          splitType="chars"
          from={{ opacity: 0, y: 40 }}
          to={{ opacity: 1, y: 0 }}
          threshold={0.1}
          rootMargin="-100px"
          textAlign="center"
        />
        <p className="text-lg md:text-xl mb-8 max-w-2xl">
          {t('subtitle')}
        </p>
        <Link
          href={getLocalizedPath('/booking')}
          className="bg-white text-black font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-lg transform hover:scale-105"
        >
          {t('cta')}
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;