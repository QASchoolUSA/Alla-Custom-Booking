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

  // Scroll to about section
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
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
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 sm:px-6 flex flex-col items-center justify-center text-center h-full pt-0 md:pt-0">
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
          href="https://scheduler.zoom.us/alla-sidor"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-black font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-lg transform hover:scale-105"
        >
          {t('cta')}
        </Link>

        {/* Animated down arrow */}
        <button
          onClick={scrollToAbout}
          className="mt-12 text-white hover:text-gray-300 transition-colors duration-300 animate-bounce"
          aria-label="Scroll to about section"
        >
          <svg
            className="w-8 h-8 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default HeroSection;