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
      { code: 'en', name: 'English', flag: '🇺🇸' },
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
          <div className="container mx-auto px-4 flex justify-between items-center">
            {/* Logo */}
            <Link href={`/${locale}`} className="flex items-center space-x-3">
              <Image src="/alla-psychology-logo.webp" alt="Alla Psychology Logo" width={90} height={90} priority />
              <span className="text-white font-semibold text-lg font-alla-custom">{t('brand')}</span>
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
              
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center space-x-2 text-white hover:text-primary-400 transition-colors duration-200 px-3 py-2 rounded-md"
                  aria-label="Switch language"
                >
                  <Globe size={18} />
                  <span className="text-sm">{currentLanguage.flag}</span>
                  <span className="text-sm">{currentLanguage.code.toUpperCase()}</span>
                </button>
                
                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center space-x-3 ${
                          locale === lang.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </nav>
    
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-4">
              {/* Mobile Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className="flex items-center space-x-1 text-white hover:text-primary-400 transition-colors duration-200"
                  aria-label="Switch language"
                >
                  <Globe size={20} />
                  <span className="text-sm">{currentLanguage.flag}</span>
                </button>
                
                {isLangOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 flex items-center space-x-2 ${
                          locale === lang.code ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        }`}
                      >
                        <span>{lang.flag}</span>
                        <span className="text-xs">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button 
                onClick={toggleMenu}
                className="text-white hover:text-primary-400 transition-colors duration-200"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
    
          {/* Mobile Navigation */}
          <div 
            className={`md:hidden fixed inset-0 bg-black/95 z-40 transition-opacity duration-300 ${
              isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            style={{ top: '64px' }} // Adjust based on your header height
          >
            <div className="container mx-auto px-4 py-8">
              <nav className="flex flex-col space-y-6">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`font-medium py-3 px-4 text-center text-xl transition-colors duration-200 ${
                      pathname === link.path
                        ? 'text-primary-400 border-b-2 border-primary-400'
                        : 'text-white hover:text-primary-400'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {/* Mobile Language Options */}
                <div className="border-t border-gray-600 pt-6 mt-6">
                  <h3 className="text-white text-lg font-medium mb-4 text-center">Language / Язык / Мова</h3>
                  <div className="flex flex-col space-y-3">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`flex items-center justify-center space-x-3 py-3 px-4 rounded-md transition-colors duration-200 ${
                          locale === lang.code 
                            ? 'bg-primary-600 text-white' 
                            : 'text-white hover:bg-gray-700'
                        }`}
                      >
                        <span className="text-xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </header>
      );
}