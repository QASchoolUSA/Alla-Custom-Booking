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
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'ua', name: 'Українська', flag: '🇺🇦' }
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
      // With localePrefix: 'always', both locales need prefixes
      return `/${locale}${path}`;
    };
    
    const navigationLinks = [
      { path: getLocalizedPath('/'), label: t('home') },
      { path: getLocalizedPath('/booking'), label: t('booking') },
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
                  className={`font-medium transition-colors duration-200 hover:text-yellow-400 ${
                    isLinkActive(link.path)
                      ? 'text-yellow-400 font-bold'
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
                    className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      locale === lang.code 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-white hover:bg-white/20'
                    }`}
                    aria-label={`Switch to ${lang.name}`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <span className="hidden sm:inline">{lang.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
            </nav>
            </div>
          </div>
    
          {/* Mobile Navigation - Liquid Glass Design */}
          {isOpen && (
            <div className="md:hidden fixed inset-0 z-[60] bg-white/10 backdrop-blur-xl" style={{top: 0, left: 0, right: 0, bottom: 0, position: 'fixed'}}>
              <div className="flex flex-col h-full">
                {/* Header with close button */}
                <div className="flex justify-between items-center p-6 border-b border-white/30 bg-white/5">
                  <h2 className="text-white text-xl font-bold">Alla Psychology</h2>
                  <button
                    onClick={toggleMenu}
                    className="text-white p-2 hover:bg-white/10 rounded-lg"
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
                      className={`text-center py-5 px-8 text-xl font-medium rounded-2xl transition-all duration-300 border border-white/20 backdrop-blur-sm ${
                        isLinkActive(link.path)
                          ? 'text-yellow-400 bg-white/20 border-yellow-400/30 shadow-lg'
                          : 'text-white hover:text-yellow-300 hover:bg-white/15 hover:border-white/40 hover:shadow-md'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  {/* Language Switcher */}
                  <div className="border-t border-white/30 pt-8 mt-8 bg-white/5 rounded-t-3xl">
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
                          className={`flex flex-col items-center space-y-3 py-4 px-6 rounded-2xl transition-all duration-300 border backdrop-blur-sm ${
                            locale === lang.code 
                              ? 'bg-white/25 text-white border-white/40 shadow-lg' 
                              : 'text-white hover:bg-white/15 border-white/25 hover:border-white/40 hover:shadow-md'
                          }`}
                        >
                          <span className="text-2xl">{lang.flag}</span>
                          <span className="text-sm font-medium">{lang.name}</span>
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