"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import EventSelection from '@/components/Booking/EventSelection';
import BookingCalendar from '@/components/Booking/BookingCalendar';
import ClientInfo from '@/components/Booking/ClientInfo';
import StripeCheckout from '@/components/Booking/StripeCheckout';
import { SelectedEvent } from '@/types/bookings';

interface BookingPageProps {
  params: { booking_token: string; locale: string };
}

// Usable type for Next.js React.use
// @ts-ignore
export default function BookingPackagePage({ params }: BookingPageProps) {
  // @ts-ignore
  const unwrappedParams = React.use(params as any) as { booking_token: string; locale: string };
  const { booking_token } = unwrappedParams;
  const [booking, setBooking] = useState<any>(null);
  const [step, setStep] = useState<'calendar' | 'client-info' | 'payment' | 'success'>('calendar');
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [clientInfo, setClientInfo] = useState<any>(null);

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

  const handleClientInfoSubmit = (data: any) => {
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
          event={booking.selectedEvent}
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
          amount={booking.amount}
          currency={booking.currency}
          eventName={booking.selectedEvent?.name}
          quantity={booking.quantity}
          sessionsCount={booking.sessionsCount}
          customerName={clientInfo?.firstName + ' ' + clientInfo?.lastName}
          customerEmail={clientInfo?.email}
          customerPhone={clientInfo?.phone}
          appointmentDate={selectedDateTime?.toISOString().split('T')[0]}
          startTime={selectedDateTime?.toISOString()}
          locale={booking.locale}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={(msg) => {}}
        />
      );
    case 'success':
      return (
        <div>
          <h2>Booking Successful!</h2>
          <p>Your booking has been confirmed.</p>
        </div>
      );
    default:
      return null;
  }
}