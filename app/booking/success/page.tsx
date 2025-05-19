"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
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
              const { eventName, startTime, endTime, customerName, customerEmail, customerPhone } = data.bookingDetails;
              
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
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred while verifying your payment');
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">Verifying your payment...</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="mt-2 text-gray-600">{message}</p>
            
            {calendarEventLink && (
              <div className="mt-6 mb-4">
                <a 
                  href={calendarEventLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  View in Google Calendar
                </a>
              </div>
            )}
            
            <div className="mt-6">
              <a href="/" className="text-primary-600 hover:text-primary-800 font-medium">
                Return to Home
              </a>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-6 text-2xl font-bold text-gray-900">Payment Verification Failed</h2>
            <p className="mt-2 text-red-600">{message}</p>
            <div className="mt-6">
              <a href="/booking" className="text-primary-600 hover:text-primary-800 font-medium">
                Try Again
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}