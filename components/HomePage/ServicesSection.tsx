"use client";
import React from "react";
import { getLocalizedEvents } from "@/utils/eventTypes";
import { Clock, Users, Boxes, HeartHandshake } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from 'next-intl';

export default function ServicesSection() {
  const t = useTranslations();
  const events = getLocalizedEvents(t);
  return (
    <section id="services-section" className="py-16 px-4 md:px-8 lg:px-16 bg-neutral-50">
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
                <div className="p-3 bg-alla-purple rounded-full mr-4">
                  {/* Choose an appropriate icon based on the event type or index */}
                  {event.id === 'initial-meeting' && <Clock className="w-6 h-6 text-white" />}
                  {event.id === 'consultation-session' && <Users className="w-6 h-6 text-white" />}
                  {event.id === 'therapy-session' && <HeartHandshake className="w-6 h-6 text-white" />}
                  {event.id === 'package-5' && <Boxes className="w-6 h-6 text-white" />}
                  {event.id === 'package-10' && <Boxes className="w-6 h-6 text-white" />}
                  {event.id === 'group-therapy' && <Users className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-xl font-semibold">{event.name}</h3>
              </div>

              <div className="text-gray-600 mb-4">
                {event.description.split('\n').map((line, index, arr) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < arr.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>

              {event.bonus && (
                <div className="mb-4 p-2 bg-alla-purple/5 border border-alla-purple/20 rounded-md">
                  <p className="text-alla-purple text-sm font-medium flex items-start">
                    <span className="mr-2">🎁</span>
                    <span>{event.bonus}</span>
                  </p>
                </div>
              )}

              {/* Removed the features section and replaced with nothing for now */}

              <div className="mt-6 flex justify-between items-center">
                <div className="flex flex-col">
                  {event.salePrice ? (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        ${event.price}
                      </span>
                      <span className="text-lg font-semibold text-red-600">
                        ${event.salePrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-semibold text-primary">
                      ${event.price}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {event.duration}
                </span>
              </div>

              <a
                href="https://scheduler.zoom.us/alla-sidor"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 block w-full text-center py-2 px-4 bg-alla-purple text-white rounded-lg hover:bg-alla-purple/90 transition-colors"
              >
                {t('header.bookNow') || "Book Now"}
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
