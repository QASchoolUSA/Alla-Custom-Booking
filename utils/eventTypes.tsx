import { EventType } from '../types';

// Service data with translation keys
export const events: EventType[] = [
  {
    id: 'initial-meeting',
    nameKey: 'events.eventList.initialMeeting.name',
    durationKey: 'events.eventList.initialMeeting.duration',
    priceKey: 'events.eventList.initialMeeting.price',
    descriptionKey: 'events.eventList.initialMeeting.description',
    duration: 60, // 1 hour in minutes
    price: 50,
    isPackage: false
  },
  {
    id: 'consultation-session',
    nameKey: 'events.eventList.consultationSession.name',
    durationKey: 'events.eventList.consultationSession.duration',
    priceKey: 'events.eventList.consultationSession.price',
    descriptionKey: 'events.eventList.consultationSession.description',
    duration: 120, // 2 hours in minutes
    price: 100,
    isPackage: false
  },
  {
    id: 'therapy-session',
    nameKey: 'events.eventList.therapySession.name',
    durationKey: 'events.eventList.therapySession.duration',
    priceKey: 'events.eventList.therapySession.price',
    descriptionKey: 'events.eventList.therapySession.description',
    duration: 120, // 2 hours in minutes
    price: 150,
    isPackage: false
  },
  {
    id: 'package-5',
    nameKey: 'events.eventList.package5.name',
    durationKey: 'events.eventList.package5.duration',
    priceKey: 'events.eventList.package5.price',
    descriptionKey: 'events.eventList.package5.description',
    duration: 120, // 2 hours in minutes
    price: 650,
    isPackage: true,
    sessionsCount: 5
  },
  {
    id: 'package-10',
    nameKey: 'events.eventList.package10.name',
    durationKey: 'events.eventList.package10.duration',
    priceKey: 'events.eventList.package10.price',
    descriptionKey: 'events.eventList.package10.description',
    duration: 120, // 2 hours in minutes
    price: 1250,
    isPackage: true,
    sessionsCount: 10
  }
];

// Helper function to get service by ID
export const getServiceById = (id: string): EventType | undefined => {
  return events.find(event => event.id === id);
};