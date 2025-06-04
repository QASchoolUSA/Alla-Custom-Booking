export interface EventType {
  id: string;
  name: string;
  duration: string;
  price: string;
  quantity: number;
  description: string;
}

// Function to get localized events
export const getLocalizedEvents = (t: any): EventType[] => [
  {
    id: 'initial-meeting',
    name: t('events.initialMeeting.name'),
    duration: t('events.initialMeeting.duration'),
    price: '50',
    quantity: 1,
    description: t('events.initialMeeting.description')
  },
  {
    id: 'consultation-session',
    name: t('events.consultation.name'),
    duration: t('events.consultation.duration'),
    price: '100',
    quantity: 1,
    description: t('events.consultation.description')
  },
  {
    id: 'therapy-session',
    name: t('events.therapy.name'),
    duration: t('events.therapy.duration'),
    price: '150',
    quantity: 1,
    description: t('events.therapy.description')
  },
  {
    id: 'package-5',
    name: t('events.package5.name'),
    duration: t('events.package5.duration'),
    price: '650',
    quantity: 5,
    description: t('events.package5.description')
  },
  {
    id: 'package-10',
    name: t('events.package10.name'),
    duration: t('events.package10.duration'),
    price: '1250',
    quantity: 10,
    description: t('events.package10.description')
  }
];

// Keep the original events for backward compatibility
export const events: EventType[] = [
  {
    id: 'initial-meeting',
    name: 'Initial Meeting',
    duration: '1 hour',
    price: '50',
    quantity: 1,
    description: 'A first introduction and discussion of your needs.'
  },
  {
    id: 'consultation-session',
    name: 'Consultation Session',
    duration: '2 hours',
    price: '100',
    quantity: 1,
    description: 'A deep-dive consultation session.'
  },
  {
    id: 'therapy-session',
    name: 'Therapy Session',
    duration: '2 hours',
    price: '150',
    quantity: 1,
    description: 'A full therapy session.'
  },
  {
    id: 'package-5',
    name: '5 Session Package',
    duration: '2 hours each',
    price: '650',
    quantity: 5,
    description: 'A package of 5 therapy sessions.'
  },
  {
    id: 'package-10',
    name: '10 Session Package',
    duration: '2 hours each',
    price: '1250',
    quantity: 10,
    description: 'A package of 10 therapy sessions.'
  }
];

// Helper function to get service by ID
export const getEventById = (id: string): EventType | undefined => {
  return events.find(event => event.id === id);
};