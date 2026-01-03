'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const CertificatesGallery = () => {
    const t = useTranslations('about.gallery');
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const certificates = [
        { id: 1, src: '/CERTIFICATE0844.JPG', alt: 'Certificate 1' },
        { id: 2, src: '/CERTIFICATE0845.JPG', alt: 'Certificate 2' },
        { id: 3, src: '/CERTIFICATE3178.PNG', alt: 'Certificate 3' },
        { id: 4, src: '/CERTIFICATE3371.PNG', alt: 'Certificate 4' },
        { id: 5, src: '/CERTIFICATE3372.PNG', alt: 'Certificate 5' },
        { id: 6, src: '/CERTIFICATE6129.JPG', alt: 'Certificate 6' },
        { id: 7, src: '/CERTIFICATE6506.PNG', alt: 'Certificate 7' },
        { id: 8, src: '/CERTIFICATE8941.JPG', alt: 'Certificate 8' },
        { id: 9, src: '/CERTIFICATE9006.JPG', alt: 'Certificate 9' },
    ];

    const handleNext = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((prev) => (prev !== null && prev < certificates.length - 1 ? prev + 1 : 0));
        }
    };

    const handlePrev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (selectedIndex !== null) {
            setSelectedIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : certificates.length - 1));
        }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowRight') handleNext();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'Escape') setSelectedIndex(null);
    };

    React.useEffect(() => {
        if (selectedIndex !== null) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [selectedIndex]);

    return (
        <div className="mt-20">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center mb-10"
            >
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                    {t('title')}
                </h3>
                <p className="text-neutral-600">
                    {t('description')}
                </p>
            </motion.div>

            {/* Main View: Horizontal Scroll (Carousel-like) */}
            <div className="relative group">
                <div className="flex overflow-x-auto gap-4 px-4 pb-8 snap-x snap-mandatory scrollbar-hide">
                    {certificates.map((cert, index) => (
                        <motion.div
                            key={cert.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            whileHover={{ scale: 1.05 }}
                            className="relative flex-shrink-0 w-64 md:w-80 aspect-[4/3] cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow snap-center"
                            onClick={() => setSelectedIndex(index)}
                        >
                            <Image
                                src={cert.src}
                                alt={cert.alt}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 33vw"
                            />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
                        </motion.div>
                    ))}
                </div>

                {/* Helper gradient for scroll indication */}
                <div className="absolute right-0 top-0 bottom-8 w-12 bg-gradient-to-l from-neutral-50 to-transparent pointer-events-none md:hidden" />
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <button
                            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors z-50"
                            onClick={() => setSelectedIndex(null)}
                        >
                            <X size={32} />
                        </button>

                        {/* Nav Btns */}
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 hidden md:block"
                            onClick={handlePrev}
                        >
                            <ChevronLeft size={32} />
                        </button>
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-50 hidden md:block"
                            onClick={handleNext}
                        >
                            <ChevronRight size={32} />
                        </button>

                        <motion.div
                            key={selectedIndex}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="relative w-full max-w-5xl h-[80vh]"
                            onClick={(e) => e.stopPropagation()}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = Math.abs(offset.x) * velocity.x;
                                if (swipe < -100) {
                                    handleNext();
                                } else if (swipe > 100) {
                                    handlePrev();
                                }
                            }}
                        >
                            <Image
                                src={certificates[selectedIndex].src}
                                alt="Certificate Full View"
                                fill
                                className="object-contain"
                                quality={100}
                                priority
                            />
                        </motion.div>

                        {/* Mobile Helper Text */}
                        <div className="absolute bottom-6 left-0 right-0 text-center text-white/50 text-sm md:hidden pointer-events-none">
                            Swipe to navigate • {selectedIndex + 1} / {certificates.length}
                        </div>
                        {/* Desktop Counter */}
                        <div className="absolute top-6 left-6 text-white/50 text-sm hidden md:block pointer-events-none">
                            {selectedIndex + 1} / {certificates.length}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CertificatesGallery;
