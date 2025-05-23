// components/HomePage/HeroSection.tsx
import React from 'react';
import Link from 'next/link';

const HeroSection: React.FC = () => {
  return (
    <section
      className="relative w-full h-screen min-h-[400px] md:min-h-[600px] flex items-center justify-center text-white 
                 bg-cover bg-center bg-[url('/alla-booking-bg.webp')]"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-80"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Effortless Appointment Booking
        </h1>
        <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
          Schedule your appointments with ease. Our intuitive platform makes booking quick and simple.
        </p>
        <Link href="/booking" legacyBehavior>
          <a className="bg-white text-black font-semibold py-3 px-8 rounded-lg shadow-lg hover:bg-gray-100 transition duration-300 text-lg transform hover:scale-105">
            Book Your Appointment Now
          </a>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;