'use client';

import React from 'react';
import Link from 'next/link';
import { Instagram, Mail, Phone, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer 
      className="text-white border-t border-white/10"
      style={{
        background: 'linear-gradient(135deg, rgba(218, 212, 254, 0.08) 0%, rgba(218, 212, 254, 0.03) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo and About */}
          <div>
            <Link href="/" className="flex items-center space-x-3 text-2xl font-semibold text-white mb-4">
              <Image 
                src="/alla-psychology-logo.webp" 
                alt="Alla Psychology Logo" 
                width={96}
                height={96}
                className="w-24 h-24 object-contain"
              />
              <span className="font-alla-custom">Alla Psychology</span>
            </Link>
            <div className="text-white/70 mt-4">
              <p className="leading-relaxed whitespace-pre-line">
                {t('bio')}
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-medium mb-4 pb-2 border-b border-white/20">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-white/70 hover:text-white transition-colors duration-200">
                  {t('home')}
                </Link>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const aboutSection = document.getElementById('about-section');
                    if (aboutSection) {
                      aboutSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-white/70 hover:text-white transition-colors duration-200 text-left"
                >
                  {t('about')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    const servicesSection = document.getElementById('services-section');
                    if (servicesSection) {
                      servicesSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="text-white/70 hover:text-white transition-colors duration-200 text-left"
                >
                  {t('services')}
                </button>
              </li>
              <li>
                <Link href="/booking" className="text-white/70 hover:text-white transition-colors duration-200">
                  {t('booking')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h4 className="text-lg font-medium mb-4 pb-2 border-b border-white/20">
              {t('contactInfo')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-white/80" />
                <a href="mailto:contact@allapsychology.com" className="text-white/70 hover:text-white transition-colors duration-200">
                contact@allapsychology.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-white/80" />
                <a href="tel:+14078680405" className="text-white/70 hover:text-white transition-colors duration-200">
                  +1 407 868 0405
                </a>
              </li>
              <li>
                <h5 className="text-sm uppercase tracking-wider text-white/60 mb-2">
                  {t('socialMedia')}
                </h5>
                <div className="flex space-x-4 mt-2">
                  <a 
                    href="https://www.instagram.com/alla.psychology_" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-white/20 text-white/70 hover:text-white transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                  <a 
                    href="https://t.me/alla_psychology" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-white/20 text-white/70 hover:text-white transition-all duration-200"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)'
                    }}
                    aria-label="Telegram"
                  >
                    <Send size={20} />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>


      </div>
    </footer>
  );
};