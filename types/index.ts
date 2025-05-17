export interface EventType {
    id: string;
    nameKey: string;
    durationKey: string;
    priceKey: string;
    descriptionKey: string;
    duration: number; // duration in minutes
    price: number;
    isPackage: boolean;
    sessionsCount?: number;
  }
  
  export interface TimeSlot {
    time: string; // Format: HH:MM
    available: boolean;
  }
  
  export interface Booking {
    id: string;
    eventId: string;
    date: string; // Format: YYYY-MM-DD
    time: string; // Format: HH:MM
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    additionalInfo?: string;
    paid: boolean;
    packageDates?: string[]; // For package bookings, array of dates for additional sessions
  }
  
  export interface UserFormData {
    fullName: string;
    email: string;
    phone: string;
    additionalInfo: string;
  }