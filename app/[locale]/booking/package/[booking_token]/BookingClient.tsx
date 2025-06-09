"use client";

import React, { useEffect, useState } from "react";
import { supabase } from '@/lib/supabase';
import BookingCalendar from '@/components/Booking/BookingCalendar';
import ClientInfo from '@/components/Booking/ClientInfo';
import StripeCheckout from '@/components/Booking/StripeCheckout';
import { SelectedEvent } from '@/types/bookings';
import { useTranslations } from 'next-intl';

interface BookingClientProps {
  booking_token: string;
}

const BookingClient: React.FC<BookingClientProps> = ({ booking_token }) => {
  const t = useTranslations('booking');
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [step, setStep] = useState<'calendar' | 'client-info' | 'payment' | 'success'>('calendar');
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [clientInfo, setClientInfo] = useState<Record<string, unknown> | null>(null);

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

  const handleDateTimeSelect = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
    setStep('client-info');
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
        <BookingCalendar
          event={booking.selectedEvent as SelectedEvent}
          onDateTimeSelected={handleDateTimeSelect}
        />
      );
    case 'client-info':
      return (
        <ClientInfo
          onSubmit={handleClientInfoSubmit}
        />
      );
    case 'payment':
      return (
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
      );
    case 'success':
      return (
        <div>
          <h2>{t('paymentSuccessful')}</h2>
          <p>{t('appointmentBooked')}</p>
        </div>
      );
    default:
      return null;
  }
};

export default BookingClient;