"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';

export default function Header() {
  const t = useTranslations('header');
  const locale = useLocale();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();
  const isBookingPage = pathname.includes('/booking');

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  const languages = [
    {
      code: 'ru',
      name: 'Русский',
      flag: (
        <svg width="20" height="15" viewBox="0 0 3 2" className="inline-block">
          <rect width="3" height="0.67" fill="#fff" />
          <rect width="3" height="0.67" y="0.67" fill="#0039a6" />
          <rect width="3" height="0.66" y="1.34" fill="#d52b1e" />
        </svg>
      )
    },
    {
      code: 'ua',
      name: 'Українська',
      flag: (
        <svg width="20" height="15" viewBox="0 0 3 2" className="inline-block">
          <rect width="3" height="1" fill="#005bbb" />
          <rect width="3" height="1" y="1" fill="#ffd500" />
        </svg>
      )
    }
  ];

  // const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const getLanguageSwitchUrl = (newLocale: string) => {
    // Get the current path segments
    const segments = pathname.split('/').filter(Boolean);

    // Remove the current locale if it exists in the path
    let pathWithoutLocale = '/';
    if (segments.length > 0) {
      // If first segment is a locale, remove it
      if (segments[0] === 'ua' || segments[0] === 'ru') {
        pathWithoutLocale = '/' + segments.slice(1).join('/');
      } else {
        pathWithoutLocale = '/' + segments.join('/');
      }
    }

    // Ensure path starts with /
    if (!pathWithoutLocale.startsWith('/')) {
      pathWithoutLocale = '/' + pathWithoutLocale;
    }

    // Construct the new URL
    // With localePrefix: 'always', both locales need prefixes
    const newPath = `/${newLocale}${pathWithoutLocale}`;

    // Ensure we don't have double slashes
    return newPath.replace(/\/+/g, '/');
  };



  // Navigation links - handle 'always' locale prefix
  const getLocalizedPath = (path: string) => {
    if (path.startsWith('http')) return path;
    // With localePrefix: 'always', both locales need prefixes
    return `/${locale}${path}`;
  };

  const navigationLinks = [
    { path: getLocalizedPath('/'), label: t('home') },
    { path: 'https://scheduler.zoom.us/alla-sidor', label: t('booking') },
  ];

  // Helper function to check if link is active
  const isLinkActive = (linkPath: string) => {
    // With localePrefix: 'always', compare paths directly
    return pathname === linkPath;
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header
      className="w-full z-50 transition-all duration-300 bg-transparent h-20 relative"
    >
      <div className="container mx-auto px-4 h-20">
        {/* Mobile Layout */}
        <div className="md:hidden flex justify-between items-center h-full">
          {/* Placeholder for balance */}
          <div className="w-10"></div>

          {/* Centered Logo on Mobile */}
          <Link href={getLocalizedPath('/')} className="flex items-center">
            <Image src="/alla-psychology-logo.webp" alt="Alla Psychology Logo" width={90} height={90} priority />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="text-white p-3 hover:bg-white/10 rounded-lg transition-colors duration-200 touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
            type="button"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center h-full">
          {/* Logo */}
          <Link href={getLocalizedPath('/')} className="flex items-center space-x-3">
            <Image src="/alla-psychology-logo.webp" alt="Alla Psychology Logo" width={90} height={90} priority />
            <span className="text-white font-semibold text-lg font-alla-custom">Alla Psychology</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`font-medium transition-colors duration-200 hover:underline decoration-double ${isLinkActive(link.path)
                    ? 'underline decoration-double text-white font-bold'
                    : 'text-white'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Language Switcher - Radio Button Style */}
            <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 border border-white/20">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    if (locale === lang.code) {
                      return;
                    }
                    const targetUrl = getLanguageSwitchUrl(lang.code);
                    router.push(targetUrl);
                  }}
                  className={`flex items-center justify-center px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${locale === lang.code
                      ? 'text-white shadow-sm'
                      : 'text-white hover:bg-white/20'
                    }`}
                  style={{
                    backgroundColor: locale === lang.code ? '#4B3F72' : undefined
                  }}
                  aria-label={`Switch to ${lang.name}`}
                >
                  <span className="text-base">{lang.flag}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile Navigation - Liquid Glass Design */}
      {isOpen && (
        <div className={`md:hidden fixed inset-0 z-[60] backdrop-blur-xl ${isBookingPage
            ? ''
            : 'bg-white/10'
          }`} style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            position: 'fixed',
            backgroundColor: isBookingPage ? 'rgba(75, 63, 114, 0.95)' : undefined
          }}>
          <div className="flex flex-col h-full">
            {/* Header with close button */}
            <div className={`flex justify-between items-center p-6 border-b ${isBookingPage
                ? 'border-opacity-70'
                : 'border-white/30 bg-white/5'
              }`} style={{
                borderColor: isBookingPage ? 'rgba(75, 63, 114, 0.7)' : undefined,
                backgroundColor: isBookingPage ? 'rgba(75, 63, 114, 0.5)' : undefined
              }}>
              <h2 className="text-white text-xl font-bold">Alla Psychology</h2>
              <button
                onClick={toggleMenu}
                className={`text-white p-2 rounded-lg transition-colors ${isBookingPage
                    ? ''
                    : 'hover:bg-white/10'
                  }`}
                style={{}}
                onMouseEnter={(e) => {
                  if (isBookingPage) {
                    e.currentTarget.style.backgroundColor = 'rgba(75, 63, 114, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isBookingPage) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 flex flex-col justify-center px-8 space-y-4">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-center py-5 px-8 text-xl font-medium rounded-2xl transition-all duration-300 border backdrop-blur-sm ${isLinkActive(link.path)
                      ? isBookingPage
                        ? 'text-yellow-400 shadow-lg'
                        : 'text-yellow-400 bg-white/20 border-yellow-400/30 shadow-lg'
                      : isBookingPage
                        ? 'text-white hover:text-yellow-300 hover:shadow-md'
                        : 'text-white hover:text-yellow-300 hover:bg-white/15 border-white/20 hover:border-white/40 hover:shadow-md'
                    }`}
                  style={{
                    backgroundColor: isLinkActive(link.path) && isBookingPage ? 'rgba(75, 63, 114, 0.5)' : undefined,
                    borderColor: isLinkActive(link.path) && isBookingPage ? 'rgba(255, 193, 7, 0.5)' : isBookingPage && !isLinkActive(link.path) ? 'rgba(75, 63, 114, 0.6)' : undefined
                  }}
                  onMouseEnter={(e) => {
                    if (isBookingPage && !isLinkActive(link.path)) {
                      e.currentTarget.style.backgroundColor = 'rgba(75, 63, 114, 0.3)';
                      e.currentTarget.style.borderColor = 'rgba(75, 63, 114, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isBookingPage && !isLinkActive(link.path)) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = 'rgba(75, 63, 114, 0.6)';
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}

              {/* Section Navigation Buttons */}
              <button
                onClick={() => {
                  const aboutSection = document.getElementById('about-section');
                  if (aboutSection) {
                    aboutSection.scrollIntoView({ behavior: 'smooth' });
                    setIsOpen(false);
                  }
                }}
                className={`text-center py-5 px-8 text-xl font-medium rounded-2xl transition-all duration-300 border backdrop-blur-sm ${isBookingPage
                    ? 'text-white hover:text-yellow-300 hover:shadow-md'
                    : 'text-white hover:text-yellow-300 hover:bg-white/15 border-white/20 hover:border-white/40 hover:shadow-md'
                  }`}
                style={{
                  borderColor: isBookingPage ? 'rgba(75, 63, 114, 0.6)' : undefined
                }}
                onMouseEnter={(e) => {
                  if (isBookingPage) {
                    e.currentTarget.style.backgroundColor = 'rgba(75, 63, 114, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(75, 63, 114, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isBookingPage) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(75, 63, 114, 0.6)';
                  }
                }}
              >
                About
              </button>

              <button
                onClick={() => {
                  const servicesSection = document.getElementById('services-section');
                  if (servicesSection) {
                    servicesSection.scrollIntoView({ behavior: 'smooth' });
                    setIsOpen(false);
                  }
                }}
                className={`text-center py-5 px-8 text-xl font-medium rounded-2xl transition-all duration-300 border backdrop-blur-sm ${isBookingPage
                    ? 'text-white hover:text-yellow-300 hover:shadow-md'
                    : 'text-white hover:text-yellow-300 hover:bg-white/15 border-white/20 hover:border-white/40 hover:shadow-md'
                  }`}
                style={{
                  borderColor: isBookingPage ? 'rgba(75, 63, 114, 0.6)' : undefined
                }}
                onMouseEnter={(e) => {
                  if (isBookingPage) {
                    e.currentTarget.style.backgroundColor = 'rgba(75, 63, 114, 0.3)';
                    e.currentTarget.style.borderColor = 'rgba(75, 63, 114, 0.5)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isBookingPage) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(75, 63, 114, 0.6)';
                  }
                }}
              >
                Services
              </button>

              {/* Language Switcher */}
              <div className={`border-t pt-8 mt-8 pb-6 rounded-3xl ${isBookingPage
                  ? ''
                  : 'border-white/30 bg-white/5'
                }`} style={{
                  borderColor: isBookingPage ? 'rgba(75, 63, 114, 0.7)' : undefined,
                  backgroundColor: isBookingPage ? 'rgba(75, 63, 114, 0.3)' : undefined
                }}>
                <h3 className="text-white text-lg font-semibold mb-4 text-center">Language</h3>
                <div className="flex justify-center space-x-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        if (locale === lang.code) {
                          return;
                        }
                        const targetUrl = getLanguageSwitchUrl(lang.code);
                        router.push(targetUrl);
                      }}
                      className={`flex flex-col items-center space-y-3 py-4 px-6 rounded-2xl transition-all duration-300 border backdrop-blur-sm ${locale === lang.code
                          ? isBookingPage
                            ? 'text-white shadow-lg'
                            : 'bg-white/25 text-white border-white/40 shadow-lg'
                          : isBookingPage
                            ? 'text-white hover:shadow-md'
                            : 'text-white hover:bg-white/15 border-white/25 hover:border-white/40 hover:shadow-md'
                        }`}
                      style={{
                        backgroundColor: locale === lang.code && isBookingPage ? 'rgba(75, 63, 114, 0.5)' : undefined,
                        borderColor: locale === lang.code && isBookingPage ? 'rgba(75, 63, 114, 0.6)' : isBookingPage && locale !== lang.code ? 'rgba(75, 63, 114, 0.6)' : undefined
                      }}
                      onMouseEnter={(e) => {
                        if (isBookingPage && locale !== lang.code) {
                          e.currentTarget.style.backgroundColor = 'rgba(75, 63, 114, 0.3)';
                          e.currentTarget.style.borderColor = 'rgba(75, 63, 114, 0.5)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isBookingPage && locale !== lang.code) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = 'rgba(75, 63, 114, 0.6)';
                        }
                      }}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                    </button>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}

      <style jsx>{`
            @keyframes slideInFromRight {
              from {
                opacity: 0;
                transform: translateX(30px);
              }
              to {
                opacity: 1;
                transform: translateX(0);
              }
            }
          `}</style>
    </header>
  );
}