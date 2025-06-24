"use client";

import { getLocalizedEvents } from "@/utils/eventTypes";
import { Clock, Users, Music, Camera, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

export default function ServicesSection() {
  const t = useTranslations();
  const events = getLocalizedEvents(t);
  return (
    <section className="py-16 px-4 md:px-8 lg:px-16 bg-neutral-50">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {t('services.title')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full mr-4">
                  {/* Choose an appropriate icon based on the event type or index */}
                  {index % 5 === 0 && <Clock className="w-6 h-6 text-primary" />}
                  {index % 5 === 1 && <Users className="w-6 h-6 text-primary" />}
                  {index % 5 === 2 && <Music className="w-6 h-6 text-primary" />}
                  {index % 5 === 3 && <Camera className="w-6 h-6 text-primary" />}
                  {index % 5 === 4 && <Heart className="w-6 h-6 text-primary" />}
                  {/* Fallback icon if none of the above conditions match */}
                  {index % 5 > 4 && <Star className="w-6 h-6 text-primary" />}
                </div>
                <h3 className="text-xl font-semibold">{event.name}</h3>
              </div>
              
              <p className="text-gray-600 mb-4">{event.description}</p>
              
              {/* Removed the features section and replaced with nothing for now */}
              
              <div className="mt-6 flex justify-between items-center">
                <span className="text-lg font-semibold text-primary">
                  ${event.price}
                </span>
                <span className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {event.duration}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
