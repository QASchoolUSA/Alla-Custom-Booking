export interface EventType {
  id: string;
  name: string;
  duration: string;
  price: string;
  quantity: number;
  description: string;
}

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