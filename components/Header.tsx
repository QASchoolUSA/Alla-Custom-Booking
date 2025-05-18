"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const pathname = usePathname();
  
    useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > 20) {
          setIsScrolled(true);
        } else {
          setIsScrolled(false);
        }
      };
  
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }, []);
  
    // Close menu when route changes
    useEffect(() => {
      setIsOpen(false);
    }, [pathname]);
  
    // Navigation links
    const navigationLinks = [
      { path: '/', label: "Home" },
      { path: '/about', label: "About" },
      { path: '/services', label: "Services" },
      { path: '/booking', label: "Booking" },
      { path: '/contact', label: "Contact" },
    ];
  
    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <header 
          className={`fixed w-full z-50 transition-all duration-300 ${
            isScrolled 
              ? 'bg-white shadow-md py-2' 
              : 'bg-transparent py-4'
          }`}
        >
          <div className="container mx-auto px-4 flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="text-2xl font-semibold text-primary-600 flex items-center">
              <span className="ml-2">Alla Sidor</span>
            </Link>
    
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navigationLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`font-medium transition-colors duration-200 hover:text-primary-600 ${
                    pathname === link.path
                      ? 'text-primary-600'
                      : isScrolled
                        ? 'text-neutral-800'
                        : 'text-neutral-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
    
              {/* Language Switcher */}
              {/* <button
                onClick={toggleLanguage}
                className="flex items-center text-neutral-700 hover:text-primary-600 transition-colors duration-200"
                aria-label={`Switch to ${language === 'ru' ? 'Ukrainian' : 'Russian'}`}
              >
                <Globe size={20} className="mr-2" />
                <span>{t(`languageSwitcher.${language === 'ru' ? 'uk' : 'ru'}`)}</span>
              </button> */}
            </nav>
    
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              {/* <button
                onClick={toggleLanguage}
                className="mr-4 text-neutral-700 hover:text-primary-600 transition-colors duration-200"
                aria-label={`Switch to ${language === 'ru' ? 'Ukrainian' : 'Russian'}`}
              >
                <Globe size={24} />
              </button> */}
              <button 
                onClick={toggleMenu}
                className="text-neutral-700 hover:text-primary-600 transition-colors duration-200"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
    
          {/* Mobile Navigation */}
          <div 
            className={`md:hidden fixed inset-x-0 top-16 bg-white shadow-lg transform ${
              isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            } transition-transform duration-300 ease-in-out z-40`}
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {navigationLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`font-medium py-2 px-4 rounded-md ${
                      pathname === link.path
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-neutral-800 hover:bg-neutral-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </header>
      );
}