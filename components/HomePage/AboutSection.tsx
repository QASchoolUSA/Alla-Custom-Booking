// components/HomePage/AboutSection.tsx
"use client";

import React from 'react';
import { Clock, Smartphone, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const AboutSection: React.FC = () => {
  const t = useTranslations('about');
  
  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  // Animation variants for individual cards
  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    },
    hover: {
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  // Animation variants for icons
  const iconVariants = {
    hidden: { scale: 0 },
    visible: { 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.2
      }
    }
  };

  return (
    <section id="about" className="w-full bg-neutral-50 py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-700">
            {t('title')}
          </h2>
          <p className="text-neutral-600 mt-4 max-w-xl mx-auto">
            {t('description')}
          </p>
        </motion.div>
        
        <motion.div 
          className="grid md:grid-cols-3 gap-8 text-center"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div 
            className="p-6 bg-white rounded-xl shadow-lg"
            variants={cardVariants}
            whileHover="hover"
          >
            <motion.div 
              className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"
              variants={iconVariants}
            >
              <Clock className="w-6 h-6" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('saveTime.title')}</h3>
            <p className="text-neutral-600">
              {t('saveTime.description')}
            </p>
          </motion.div>
          
          <motion.div 
            className="p-6 bg-white rounded-xl shadow-lg"
            variants={cardVariants}
            whileHover="hover"
          >
            <motion.div 
              className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"
              variants={iconVariants}
            >
              <Smartphone className="w-6 h-6" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('accessible.title')}</h3>
            <p className="text-neutral-600">
              {t('accessible.description')}
            </p>
          </motion.div>
          
          <motion.div 
            className="p-6 bg-white rounded-xl shadow-lg"
            variants={cardVariants}
            whileHover="hover"
          >
            <motion.div 
              className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4"
              variants={iconVariants}
            >
              <CheckCircle className="w-6 h-6" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('confirmation.title')}</h3>
            <p className="text-neutral-600">
              {t('confirmation.description')}
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;