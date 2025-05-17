import { Clock } from 'lucide-react';
import React from 'react';

// Demo event data
const events = [
  {
    id: 'initial-meeting',
    name: 'Initial Meeting',
    duration: '1 hour',
    price: '$50',
    description: 'A first introduction and discussion of your needs.'
  },
  {
    id: 'consultation-session',
    name: 'Consultation Session',
    duration: '2 hours',
    price: '$100',
    description: 'A deep-dive consultation session.'
  },
  {
    id: 'therapy-session',
    name: 'Therapy Session',
    duration: '2 hours',
    price: '$150',
    description: 'A full therapy session.'
  },
  {
    id: 'package-5',
    name: '5 Session Package',
    duration: '2 hours each',
    price: '$650',
    description: 'A package of 5 therapy sessions.'
  },
  {
    id: 'package-10',
    name: '10 Session Package',
    duration: '2 hours each',
    price: '$1250',
    description: 'A package of 10 therapy sessions.'
  }
];

interface EventSelectionProps {
  selectedEvent: string | null;
  onSelectService: (serviceId: string) => void;
  onContinue: () => void;
}

const EventSelection: React.FC<EventSelectionProps> = ({
  selectedEvent,
  onSelectService,
  onContinue,
}) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6">
        Select a Service
      </h2>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
              selectedEvent === event.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-300 hover:border-primary-300'
            }`}
            onClick={() => onSelectService(event.id)}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-medium">
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
                <span className="text-xl font-medium text-primary-600 mr-4">
                  {event.price}
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedEvent === event.id
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : 'border-neutral-300'
                }`}>
                  {selectedEvent === event.id && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          className="btn btn-primary"
          disabled={!selectedEvent}
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default EventSelection;