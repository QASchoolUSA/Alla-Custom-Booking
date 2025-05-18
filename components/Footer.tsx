import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin, Mail, Phone } from 'lucide-react';

export default function Footer() {

  return (
    <footer className="bg-neutral-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Logo and About */}
          <div>
            <Link href="/" className="text-2xl font-semibold text-white mb-4 inline-block">
              Alla Sidor
            </Link>
            <p className="text-neutral-400 mt-4">
              Bio
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-medium mb-4 border-b border-neutral-700 pb-2">
              Home
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/booking" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Booking
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h4 className="text-lg font-medium mb-4 border-b border-neutral-700 pb-2">
              Contact Info
            </h4>
            <ul className="space-y-4">
              <li className="flex items-center">
                <Mail size={18} className="mr-2 text-primary-400" />
                <a href="mailhref:info@allasidor.com" className="text-neutral-400 hover:text-white transition-colors duration-200">
                  info@allasidor.com
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
                  Social Media
                </h5>
                <div className="flex space-x-4 mt-2">
                  <a 
                    href="https://facebook.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} />
                  </a>
                  <a 
                    href="https://instagram.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} />
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-neutral-400 hover:text-primary-400 transition-colors duration-200"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} />
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-neutral-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-neutral-500 text-sm">
            Copyright
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-neutral-500 hover:text-white text-sm transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-neutral-500 hover:text-white text-sm transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};