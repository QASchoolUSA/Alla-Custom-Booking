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
  },
  {
    id: 'group-therapy',
    name: t('events.groupTherapy.name'),
    duration: t('events.groupTherapy.duration'),
    price: '299',
    quantity: 8,
    description: t('events.groupTherapy.description'),
  },
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
  },
  {
    id: 'group-therapy',
    name: 'Group Therapy',
    duration: '3 hours',
    price: '299',
    quantity: 8,
    description: 'A therapy session in a group setting.'
  }
];

// Helper function to get service by ID
export const getEventById = (id: string): EventType | undefined => {
  return events.find(event => event.id === id);
};

// Helper function to generate session-numbered event name for package deals
export const getSessionEventName = (eventName: string, eventQuantity: number, sessionNumber: number, locale: string = 'ru'): string => {
  // Only add session numbers for package deals (quantity > 1)
  if (eventQuantity > 1) {
    const sessionText = getSessionText(sessionNumber, eventQuantity, locale);
    return `${eventName} - ${sessionText}`;
  }
  return eventName;
};

// Helper function to calculate session number based on original quantity and remaining sessions
export const calculateSessionNumber = (originalQuantity: number, remainingSessions: number): number => {
  return originalQuantity - remainingSessions + 1;
};

// Helper function to get localized session text
const getSessionText = (sessionNumber: number, totalSessions: number, locale: string): string => {
  switch (locale) {
    case 'ru':
      return `${sessionNumber} из ${totalSessions}`;
    case 'ua':
      return `${sessionNumber} з ${totalSessions}`;
    default:
      return `${sessionNumber} из ${totalSessions}`;
  }
};
