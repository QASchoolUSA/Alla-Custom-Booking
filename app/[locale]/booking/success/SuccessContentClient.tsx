'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import ruMessages from "@/messages/ru.json";
import uaMessages from "@/messages/ua.json";



// Client component that uses useSearchParams
export default function SuccessContentClient({ locale }: { locale: string }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [calendarEventLink] = useState<string | null>(null);

  // Select messages based on locale
  const messages = locale === "ru" ? ruMessages : locale === "ua" ? uaMessages : ruMessages;
  useEffect(() => {
    if (!sessionId) {
      setStatus('success');
      setMessage('Your appointment has been scheduled!');
      return;
    }

    const verifyPayment = async () => {
      try {
        // First verify the payment
        const response = await fetch(`/api/verify-payment?session_id=${sessionId}`);
        const data = await response.json();

        if (data.success) {
          // If payment is successful, create the calendar event
          try {
            // The verify-payment endpoint should return booking details
            if (data.bookingDetails) {
              const { eventName, startTime, endTime, customerName, customerEmail, customerPhone, sessionsCount } = data.bookingDetails;

              // Save booking to Supabase (add this block)
              // Extract base event name without session numbering for database storage
              const baseEventName = eventName.split(' - ')[0];
              
              await fetch('/api/save-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  event_name: baseEventName, // Use base event name for database
                  client_name: customerName,
                  client_email: customerEmail,
                  client_phone: customerPhone,
                  date: startTime ? startTime.split('T')[0] : undefined,
                  start_time: startTime,
                  end_time: endTime,
                  quantity: sessionsCount || 1, // Use the quantity from bookingDetails
                  locale: locale || 'ru'
                }),
              });

              // Calendar event is already created by the save-booking API
              setStatus('success');
              setMessage(`Your ${eventName} appointment has been confirmed!`);
            } else {
              setStatus('success');
              setMessage('Your payment has been confirmed!');
            }
          } catch (calendarError) {
            console.error('Calendar creation error:', calendarError);
            setStatus('success');
            setMessage('Your payment has been confirmed! However, we couldn\'t add the event to your calendar automatically.');
          }
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment verification failed');
        }
      } catch (error) {
        console.error('Payment verification error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment');
      }
    };

    verifyPayment();
  }, [sessionId, locale]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-testid="success-page">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg" data-testid="success-container">
        {status === 'loading' && (
          <div className="text-center" data-testid="payment-verification-loading">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" data-testid="loading-spinner"></div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900" data-testid="loading-message">Verifying your payment...</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center" data-testid="payment-success-state">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900" data-testid="success-title">{messages.booking.successPage.title}</h2>
            <p className="mt-2 text-gray-600" data-testid="success-message">{messages.booking.successPage.mainMessage}</p>
            <p className="mt-2 text-gray-600" data-testid="success-email-confirmation">{messages.booking.successPage.emailConfirmation}</p>
            <div className="mt-6">
              <Link href="/" className="text-primary-600 hover:text-primary-800 font-medium" data-testid="success-home-link">
                {messages.booking.successPage.returnHome}
              </Link>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center" data-testid="payment-error-state">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900" data-testid="error-title">Payment Verification Failed</h2>
            <p className="mt-2 text-gray-600" data-testid="error-message">{message}</p>
            <div className="mt-6">
              <Link href="/" className="text-primary-600 hover:text-primary-800 font-medium" data-testid="error-home-link">
                Return to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}