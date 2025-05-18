// types/booking.ts (or a relevant shared types file)
import { StripeError, PaymentIntent } from '@stripe/stripe-js';

export interface SelectedEvent {
  id: string;
  name: string;
  price: number; // Assuming price is a number
  duration?: number; // Example: duration in minutes
  // Add other event properties as needed
}

export interface BookingDetails {
  event: SelectedEvent | null;
  dateTime: Date | null; // Or string if you store it as ISO string initially
  paymentIntentId: string | null;
  clientSecret: string | null;
  // Add other booking details
}

export type BookingStep = 'select-event' | 'calendar' | 'payment' | 'confirmation';

// Props for EventSelection
export interface EventSelectionProps {
  selectedEvent: SelectedEvent | null;
  onSelectEvent: (event: SelectedEvent) => void;
  onContinue: () => void;
}

// Props for BookingCalendar
export interface BookingCalendarProps {
  event: SelectedEvent; // Assuming event is mandatory for calendar view
  onDateTimeSelected: (dateTime: Date) => void; // Or string if you use ISO strings
}

// Props for StripePayment (wrapper component)
export interface StripePaymentProps {
  clientSecret: string;
  bookingAmount: number;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: StripeError) => void;
}

// Props for CheckoutForm (internal to StripePayment)
export interface CheckoutFormProps {
  clientSecret: string;
  bookingAmount: number;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: StripeError) => void;
}