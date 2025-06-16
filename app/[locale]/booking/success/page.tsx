'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

// Create a client component that uses useSearchParams
function SuccessContent({ params }: { params: { locale: string } }) {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [calendarEventLink, setCalendarEventLink] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('Invalid session ID');
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
              await fetch('/api/save-booking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  eventName,
                  clientName: customerName,
                  clientEmail: customerEmail,
                  clientPhone: customerPhone,
                  date: startTime ? startTime.split('T')[0] : undefined,
                  startTime,
                  endTime,
                  quantity: sessionsCount || 1, // Use the quantity from bookingDetails
                  locale: params.locale || 'en'
                }),
              });

              // Create calendar event
              const calendarResponse = await fetch('/api/add-to-calendar', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  eventName,
                  startTime,
                  endTime,
                  customerName,
                  customerEmail,
                  customerPhone
                }),
              });
              
              const calendarData = await calendarResponse.json();
              
              if (calendarData.success && calendarData.htmlLink) {
                setCalendarEventLink(calendarData.htmlLink);
              } else {
                console.error('Failed to add event to calendar:', calendarData.error);
              }
            }
          } catch (calendarError) {
            console.error('Error creating calendar event:', calendarError);
          }
          
          setStatus('success');
          setMessage('Your payment was successful! Your booking has been confirmed.');
        } else {
          setStatus('error');
          setMessage(data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setStatus('error');
        setMessage('An error occurred while verifying your payment');
      }
    };

    verifyPayment();
  }, [sessionId]);

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
            <h2 className="mt-6 text-2xl font-bold text-gray-900" data-testid="success-title">Payment Successful!</h2>
            <p className="mt-2 text-gray-600" data-testid="success-message">{message}</p>
            
            {calendarEventLink && (
              <div className="mt-6 mb-4">
                <a 
                  href={calendarEventLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  data-testid="success-calendar-link"
                >
                  View in Google Calendar
                </a>
              </div>
            )}
            
            <div className="mt-6">
              <Link href="/" className="text-primary-600 hover:text-primary-800 font-medium" data-testid="success-home-link">
                Return to Home
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

// Main page component with Suspense boundary
export default function SuccessPage({ params }: { params: { locale: string } }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8" data-testid="success-page-loading">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg" data-testid="success-page-loading-container">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" data-testid="page-loading-spinner"></div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900" data-testid="page-loading-message">Loading...</h2>
          </div>
        </div>
      </div>
    }>
      <SuccessContent params={params} />
    </Suspense>
  );
}