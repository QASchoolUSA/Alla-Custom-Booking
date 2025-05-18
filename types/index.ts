export interface EventType {
  id: string;
  name: string;
  duration: string;
  price: string;
  description: string;
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