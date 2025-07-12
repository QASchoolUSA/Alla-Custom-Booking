"use client";

import React, { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import BookingCalendar from '../../../../../components/Booking/BookingCalendar';
import ClientInfo from '@/components/Booking/ClientInfo';
import StripeCheckout from '@/components/Booking/StripeCheckout';
import { SelectedEvent } from '@/types/bookings';
import { useTranslations } from 'next-intl';
import { getLocalizedEvents } from '@/utils/eventTypes';

interface BookingClientProps {
  booking_token: string;
}

const BookingClient: React.FC<BookingClientProps> = ({ booking_token }) => {
  const tBooking = useTranslations('booking');
  const tEvents = useTranslations();
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [step, setStep] = useState<'calendar' | 'client-info' | 'payment' | 'success'>('calendar');
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [clientInfo, setClientInfo] = useState<Record<string, unknown> | null>(null);
  
  // Get localized events to find the correct event details
  const localizedEvents = getLocalizedEvents(tEvents);

  useEffect(() => {
    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_token', booking_token)
        .single();

      if (error || !data) {
        console.error('Error fetching booking:', error);
        return;
      }
      setBooking(data);
    };
    if (booking_token) {
      fetchBooking();
    }
  }, [booking_token]);

  if (!booking) {
    return <div>Loading or Booking not found...</div>;
  }

  const handleDateTimeSelect = async (dateTime: Date) => {
    setSelectedDateTime(dateTime);
    
    // For existing clients with tokens, skip client info and payment
    // and directly book the appointment
    try {
      const response = await fetch('/api/save-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: booking.client_name,
          client_email: booking.client_email,
          client_phone: booking.client_phone,
          event_name: booking.event_name,
          date: dateTime.toISOString().split('T')[0],
          start_time: dateTime.toISOString(),
          end_time: new Date(dateTime.getTime() + 60 * 60 * 1000).toISOString(), // 1 hour later
          amount: 0, // No payment needed for existing clients
          currency: booking.currency,
          quantity: 1, // Single session booking
          sessions: 1,
          locale: booking.locale,
          booking_token: booking_token,
          is_package_booking: true
        })
      });
      
      if (response.ok) {
        setStep('success');
      } else {
        console.error('Failed to save booking');
      }
    } catch (error) {
      console.error('Error saving booking:', error);
    }
  };

  const handleClientInfoSubmit = (data: Record<string, unknown>) => {
    setClientInfo(data);
    setStep('payment');
  };

  const handlePaymentSuccess = () => {
    setStep('success');
  };

  switch (step) {
    case 'calendar':
      return (
        <div className="pt-20 min-h-screen">
          <BookingCalendar
            event={{
              id: 'package-booking',
              name: booking.event_name as string,
              price: 0,
              duration: localizedEvents.find(e => 
                (booking.event_name as string)?.includes(e.name) || 
                (booking.event_name as string)?.includes(e.id)
              )?.duration || '1 hour'
            } as SelectedEvent}
            onBack={() => window.history.back()}
            onDateTimeSelected={handleDateTimeSelect}
          />
        </div>
      );
    case 'client-info':
      return (
        <div className="pt-20 min-h-screen">
          <ClientInfo
            onSubmit={handleClientInfoSubmit}
          />
        </div>
      );
    case 'payment':
      return (
        <div className="pt-20 min-h-screen">
          <StripeCheckout
            amount={booking.amount as number}
            currency={booking.currency as string}
            eventName={(booking.selectedEvent as SelectedEvent)?.name}
            quantity={booking.quantity as number}
            sessionsCount={booking.sessionsCount as number}
            customerName={((clientInfo?.firstName ?? '') + ' ' + (clientInfo?.lastName ?? '')) as string}
            customerEmail={clientInfo?.email as string}
            customerPhone={clientInfo?.phone as string}
            appointmentDate={selectedDateTime?.toISOString().split('T')[0]}
            startTime={selectedDateTime?.toISOString()}
            locale={booking.locale as string}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={() => {}}
          />
          <div className="mt-4 text-sm text-muted-foreground text-center" data-testid="cancellation-policy">
            {tBooking('cancellationPolicy')}
          </div>
        </div>
      );
    case 'success':
      return (
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="max-w-md mx-auto p-6 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-medium text-green-900 mb-2">{tBooking('appointmentBooked')}</h2>
              <p className="text-sm text-green-700 mb-4">
                Your appointment has been successfully scheduled for {selectedDateTime?.toLocaleDateString()} at {selectedDateTime?.toLocaleTimeString()}.
              </p>
              <p className="text-xs text-green-600">
                You will receive a confirmation email shortly.
              </p>
            </div>
            <div className="mt-4 text-sm text-muted-foreground text-center" data-testid="cancellation-policy">
              {tBooking('cancellationPolicy')}
            </div>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default BookingClient;