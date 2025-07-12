// types/booking.ts (or a relevant shared types file)
import { StripeError, PaymentIntent } from '@stripe/stripe-js';

export interface SelectedEvent {
  id: string;
  name: string;
  price: number; // The actual price to be charged (sale price if available, otherwise regular price)
  regularPrice?: number; // Original price before discount
  salePrice?: number; // Discounted price
  duration?: string;
  quantity?: number;
  type: string;
  sessions: number;
}
// Props for EventSelection
export interface EventSelectionProps {
  selectedEvent: SelectedEvent | null;
  onSelectEvent: (event: SelectedEvent) => void;
  onContinue: () => void;
}

// Props for BookingCalendar
export interface BookingCalendarProps {
  event: SelectedEvent; // Assuming event is mandatory for calendar view
  onDateTimeSelected: (dateTime: Date, timezone: string) => void; // Include timezone data
  onBack: () => void; // Function to handle back navigation
}

// Props for StripePayment (wrapper component)
export interface StripePaymentProps {
  clientSecret: string;
  bookingAmount: number;
  onSuccess: (paymentIntent: PaymentIntent) => void;
  onError: (error: StripeError) => void;
}