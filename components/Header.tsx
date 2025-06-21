"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from "next/image";
import { useTranslations, useLocale } from 'next-intl';

export default function Header() {
    const t = useTranslations('header');
    const locale = useLocale();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const pathname = usePathname();
  
    // Close menu when route changes
    useEffect(() => {
      setIsOpen(false);
      setIsLangOpen(false);
    }, [pathname]);

    const languages = [
      { code: 'ru', name: 'Русский', flag: '🇷🇺' },
      { code: 'ua', name: 'Українська', flag: '🇺🇦' }
    ];

    const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

    const switchLanguage = (newLocale: string) => {
      const currentPath = pathname.replace(`/${locale}`, '');
      router.push(`/${newLocale}${currentPath}`);
      setIsLangOpen(false);
    };
  
    // Navigation links
    const navigationLinks = [
      { path: `/${locale}`, label: t('home') },
      { path: `/${locale}/booking`, label: t('booking') },
    ];
  
    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <header 
          className="fixed w-full z-50 transition-all duration-300 bg-black/70"
        >
          <div className="container mx-auto px-4">
            {/* Mobile Layout */}
             <div className="md:hidden flex justify-between items-center">
               {/* Placeholder for balance */}
               <div className="w-10"></div>
               
               {/* Centered Logo on Mobile */}
                <Link href={`/${locale}`} className="flex items-center">
                  <Image src="/alla-psychology-logo.webp" alt="Alla Psychology Logo" width={90} height={90} priority />
                </Link>
               
               {/* Mobile Menu Button */}
               <button
                 onClick={toggleMenu}
                 className="text-white p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                 aria-label="Toggle menu"
               >
                 {isOpen ? <X size={24} /> : <Menu size={24} />}
               </button>
             </div>
            
            {/* Desktop Layout */}
            <div className="hidden md:flex justify-between items-center">
              {/* Logo */}
              <Link href={`/${locale}`} className="flex items-center space-x-3">
                <Image src="/alla-psychology-logo.webp" alt="Alla Psychology Logo" width={90} height={90} priority />
                <span className="text-white font-semibold text-lg font-alla-custom">Alla Psychology</span>
              </Link>
    
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`font-medium transition-colors duration-200 hover:text-primary-400 ${
                    pathname === link.path
                      ? 'text-primary-400 font-bold'
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
                    onClick={() => switchLanguage(lang.code)}
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
    
          {/* Mobile Navigation - Improved Design */}
          <div 
            className={`md:hidden fixed left-0 right-0 bottom-0 bg-gradient-to-b from-black/95 to-black/90 backdrop-blur-md z-30 transition-all duration-300 ${
              isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            style={{ top: '90px' }}
          >
            <div className="container mx-auto px-6 py-8 h-full flex flex-col">
              {/* Brand Title */}
              <div className="text-center mb-8">
                <h2 className="text-white text-3xl font-bold font-alla-custom">Alla Psychology</h2>
              </div>
              
              <nav className="flex-1 flex flex-col justify-center space-y-8">
                {navigationLinks.map((link, index) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`group relative font-medium py-4 px-6 text-center text-2xl transition-all duration-300 rounded-xl ${
                      pathname === link.path
                        ? 'text-white bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/25'
                        : 'text-white hover:text-primary-300 hover:bg-white/5 hover:scale-105'
                    }`}
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: isOpen ? 'slideInFromRight 0.5s ease-out forwards' : 'none'
                    }}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {pathname !== link.path && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-primary-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                  </Link>
                ))}
                
                {/* Mobile Language Options - Enhanced Design */}
                <div className="border-t border-white/20 pt-8 mt-8">
                  <h3 className="text-white text-xl font-semibold mb-6 text-center opacity-90">Язык / Мова</h3>
                  <div className="flex justify-center space-x-4">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`flex flex-col items-center space-y-2 py-4 px-6 rounded-2xl transition-all duration-300 min-w-[100px] ${
                          locale === lang.code 
                            ? 'bg-gradient-to-b from-white to-gray-100 text-gray-900 shadow-lg transform scale-105' 
                            : 'text-white hover:bg-white/10 hover:scale-105 border border-white/20'
                        }`}
                      >
                        <span className="text-3xl">{lang.flag}</span>
                        <span className="font-medium text-sm">{lang.name}</span>
                        {locale === lang.code && (
                          <div className="w-2 h-2 bg-primary-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
          </div>
          
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