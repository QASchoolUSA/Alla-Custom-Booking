import { EventType } from '../types';

// Service data with direct values
export const events: EventType[] = [
  {
    id: 'initial-meeting',
    name: 'Initial Meeting',
    duration: '1 hour',
    price: '50',
    description: 'A first introduction and discussion of your needs.'
  },
  {
    id: 'consultation-session',
    name: 'Consultation Session',
    duration: '2 hours',
    price: '100',
    description: 'A deep-dive consultation session.'
  },
  {
    id: 'therapy-session',
    name: 'Therapy Session',
    duration: '2 hours',
    price: '150',
    description: 'A full therapy session.'
  },
  {
    id: 'package-5',
    name: '5 Session Package',
    duration: '2 hours each',
    price: '650',
    description: 'A package of 5 therapy sessions.'
  },
  {
    id: 'package-10',
    name: '10 Session Package',
    duration: '2 hours each',
    price: '1250',
    description: 'A package of 10 therapy sessions.'
  }
];

// Helper function to get service by ID
export const getServiceById = (id: string): EventType | undefined => {
  return events.find(event => event.id === id);
};