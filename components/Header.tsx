"use client"

import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();
  
    // Close menu when route changes
    useEffect(() => {
      setIsOpen(false);
    }, [pathname]);
  
    // Navigation links
    const navigationLinks = [
      { path: '/', label: "Home" },
      { path: '/booking', label: "Booking" },
    ];
  
    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <header 
          className="fixed w-full z-50 transition-all duration-300 bg-black/70 py-4"
        >
          <div className="container mx-auto px-4 flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="text-2xl font-semibold flex items-center text-white">
              <span className="ml-2">Alla Sidor</span>
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
            </nav>
    
            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
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
              </nav>
            </div>
          </div>
        </header>
      );
}