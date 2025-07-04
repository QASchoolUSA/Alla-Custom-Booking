import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { getLocalizedEvents } from '../../utils/eventTypes'; // Import localized events function
import type { EventType } from '../../utils/eventTypes';
import type { SelectedEvent, EventSelectionProps } from '@/types/bookings';
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
  
  // Memoize events to prevent recalculation on every render
  const events = useMemo(() => getLocalizedEvents(tEvents), [tEvents]);
  
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6" data-testid="event-selection-title">
        {tBooking('selectService')}
      </h2>

      <div className="space-y-4" data-testid="event-list">
        {events.map((event: EventType) => (
          <div
            key={event.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ease-in-out ${
              selectedEvent?.id === event.id
                ? 'border-primary-600 bg-primary-100 shadow-xl ring-2 ring-primary-500 ring-offset-2 ring-offset-white'
                : 'border-neutral-300 hover:border-primary-400 hover:shadow-lg bg-white'
            }`}
            onClick={() => onSelectEvent({
              id: event.id,
              name: event.name,
              price: parseFloat(event.price) * 100, // Convert to cents
              duration: event.duration,
              type: 'consultation',
              sessions: event.quantity || 1
            })}
            data-testid={`event-card-${event.id}`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium" data-testid={`event-name-${event.id}`}>
                  {event.name}
                </h3>
                <div className="flex items-center text-neutral-600 mt-1">
                  <Clock size={16} className="mr-2" />
                  <span>{event.duration}</span>
                </div>
                <p className="text-neutral-700 mt-2">
                  {event.description}
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex items-center">
                <span className="text-xl font-medium text-primary-600 mr-4" data-testid={`event-price-${event.id}`}>
                  ${event.price}
                </span>
                {/* The div that held the SVG checkmark has been removed from here */}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <Button
          type="button"
          disabled={!selectedEvent}
          onClick={selectedEvent ? onContinue : undefined}
          className={`font-semibold px-6 py-2 rounded transition-colors duration-200
            ${selectedEvent
              ? 'bg-black text-white hover:bg-gray-800'
              : 'bg-neutral-300 text-neutral-500'
            }`}
          data-testid="event-selection-continue-btn"
        >
          {tBooking('continue')}
        </Button>
      </div>
    </div>
  );
});

EventSelection.displayName = 'EventSelection';

export default EventSelection;