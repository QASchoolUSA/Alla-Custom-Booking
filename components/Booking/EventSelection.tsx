import React, { useMemo, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { getLocalizedEvents } from '../../utils/eventTypes'; // Import localized events function
import type { EventType } from '../../utils/eventTypes';
import type { EventSelectionProps } from '@/types/bookings';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';

// Remove the local 'events' array definition that was here:
// const events = [ ... ];

const EventSelection: React.FC<EventSelectionProps> = React.memo(({
  selectedEvent,
  onSelectEvent,
  onContinue,
}) => {
  const tBooking = useTranslations('booking');
  const tEvents = useTranslations();
  const continueButtonRef = useRef<HTMLDivElement>(null);
  
  // Memoize events to prevent recalculation on every render
  const events = useMemo(() => getLocalizedEvents(tEvents), [tEvents]);

  // No scrolling behavior needed - desktop doesn't scroll, mobile uses sticky buttons
  
  return (
    <div className="max-w-3xl mx-auto event-selection-container">
      <h2 className="text-2xl font-semibold mb-6 text-center" data-testid="event-selection-title">
        {tBooking('selectService')}
      </h2>

      <div className="space-y-4" data-testid="event-list">
        {events.map((event: EventType) => (
          <div
            key={event.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ease-in-out ${
              selectedEvent?.id === event.id
                ? 'border-alla-purple bg-primary-100 shadow-xl'
                : 'border-neutral-300 hover:border-primary-400 hover:shadow-lg bg-white'
            }`}
            onClick={() => onSelectEvent({
              id: event.id,
              name: event.name,
              price: parseFloat(event.salePrice || event.price) * 100, // Use sale price if available, convert to cents
              regularPrice: event.salePrice ? parseFloat(event.price) * 100 : undefined,
              salePrice: event.salePrice ? parseFloat(event.salePrice) * 100 : undefined,
              duration: event.duration,
              type: 'consultation',
              sessions: event.quantity || 1
            })}
            data-testid={`event-card-${event.id}`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold" data-testid={`event-name-${event.id}`}>
                  {event.name}
                </h3>
                <div className="flex items-center text-neutral-600 mt-1">
                  <Clock size={16} className="mr-2" />
                  <span>{event.duration}</span>
                </div>
                <p className="text-neutral-700 mt-2 whitespace-pre-line">
                  {event.description}
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex items-center">
                <div className="flex flex-col items-end mr-4">
                  {event.salePrice ? (
                    <>
                      <span className="text-sm text-gray-500 line-through" data-testid={`event-regular-price-${event.id}`}>
                        ${event.price}
                      </span>
                      <span className="text-xl font-medium text-red-600" data-testid={`event-sale-price-${event.id}`}>
                        ${event.salePrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-xl font-medium text-primary-600" data-testid={`event-price-${event.id}`}>
                      ${event.price}
                    </span>
                  )}
                </div>
                {/* The div that held the SVG checkmark has been removed from here */}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedEvent && (
        <>
          {/* Desktop Continue Button */}
          <div ref={continueButtonRef} className="hidden md:block mt-8">
            <Button
              type="button"
              onClick={onContinue}
              className="w-full font-semibold px-6 py-2 rounded transition-colors duration-200 text-white hover:opacity-90 bg-alla-purple"
              data-testid="event-selection-continue-btn"
            >
              {tBooking('continue')}
            </Button>
          </div>
          
          {/* Mobile Sticky Continue Button */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
            <Button
              type="button"
              onClick={onContinue}
              className="w-full font-semibold px-6 py-4 rounded transition-colors duration-200 text-white hover:opacity-90 text-lg bg-alla-purple"
              data-testid="event-selection-continue-btn-mobile"
            >
              {tBooking('continue')}
            </Button>
          </div>
          
          {/* Mobile spacer to prevent content from being hidden behind sticky button */}
          <div className="md:hidden h-20"></div>
        </>
      )}
    </div>
  );
});

EventSelection.displayName = 'EventSelection';

export default EventSelection;