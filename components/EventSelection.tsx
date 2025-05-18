import { Clock } from 'lucide-react';
import React from 'react';
import { Button } from "@/components/ui/button";
import { events } from '../utils/eventTypes'; // Import events from the correct path
import type { EventType } from '../types'; // Import EventType for better type safety if needed

// Remove the local 'events' array definition that was here:
// const events = [ ... ];

interface EventSelectionProps {
  selectedEvent: string | null;
  onSelectEvent: (eventID: string) => void;
  onContinue: () => void;
}

const EventSelection: React.FC<EventSelectionProps> = ({
  selectedEvent,
  onSelectEvent,
  onContinue,
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Select a Service
      </h2>

      <div className="space-y-4">
        {events.map((event: EventType) => (
          <div
            key={event.id}
            className={`border-2 rounded-lg p-4 cursor-pointer transition-all duration-300 ease-in-out ${
              selectedEvent === event.id
                ? 'border-primary-600 bg-primary-100 shadow-xl ring-2 ring-primary-500 ring-offset-2 ring-offset-white'
                : 'border-neutral-300 hover:border-primary-400 hover:shadow-lg bg-white'
            }`}
            onClick={() => onSelectEvent(event.id)}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  {event.name}
                </h3>
                <div className="flex items-center text-neutral-600 mt-1">
                  <Clock size={16} className="mr-2" />
                  <span>{event.duration} minutes</span>
                </div>
                <p className="text-neutral-700 mt-2">
                  {event.description}
                </p>
              </div>
              <div className="mt-4 md:mt-0 md:ml-4 flex items-center">
                <span className="text-xl font-medium text-primary-600 mr-4">
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
        >
          Continue
        </Button>
      </div>
    </div>
  );
};

export default EventSelection;