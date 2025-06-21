import React from 'react';
import Link from 'next/link';
import { Instagram, Mail, Phone, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer className="bg-neutral-900 text-white">
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
            <div className="text-neutral-400 mt-4">
              <p className="leading-relaxed whitespace-pre-line">
                {t('bio')}
              </p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-medium mb-4 border-b border-neutral-700 pb-2">
              {t('quickLinks')}
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  {t('home')}
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  {t('booking')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h4 className="text-lg font-medium mb-4 border-b border-neutral-700 pb-2">
              {t('contactInfo')}
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-primary-400" />
                <a href="mailto:contact@allapsychology.com" className="text-neutral-400 hover:text-white transition-colors duration-200">
                contact@allapsychology.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone size={18} className="mr-2 text-primary-400" />
                <a href="tel:+38050123456" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  +380 50 123 4567
                </a>
              </li>
              <li>
                <h5 className="text-sm uppercase tracking-wider text-neutral-500 mb-2">
                  {t('socialMedia')}
                </h5>
                <div className="flex space-x-4 mt-2">
                  <a 
                    href="https://www.instagram.com/alla.psychology_" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                  <a 
                    href="https://t.me/alla_psychology" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
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