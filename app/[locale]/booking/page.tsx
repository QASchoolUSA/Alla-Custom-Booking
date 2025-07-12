"use client";

import React, { useEffect, useState } from "react";
import { ReceiptText, ChevronLeft, Check, X } from "lucide-react";
import BookingCalendar from "../../../components/Booking/BookingCalendar";
import EventSelection from "@/components/Booking/EventSelection";
import StripeCheckout from "@/components/Booking/StripeCheckout";
import ClientInfo from "@/components/Booking/ClientInfo";
import { SelectedEvent } from "@/types/bookings";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from 'next-intl';

export default function BookingPage() {
  const t = useTranslations('booking');
  const params = useParams();
  const locale = typeof params.locale === "string" ? params.locale : Array.isArray(params.locale) ? params.locale[0] : "ru";
  const router = useRouter();
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [clientTimezone] = useState<string>('Europe/Kiev'); // Store client timezone
  const [step, setStep] = useState<"select-event" | "calendar" | "client-info" | "payment">("select-event");

  const [clientData, setClientData] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  } | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "error">("pending");
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [calendarEventLink, setCalendarEventLink] = useState<string | null>(null);

  useEffect(() => {
    // Only scroll to top on initial page load, not on state changes
    if (step === "select-event" && !selectedEvent) {
      window.scrollTo(0, 0);
    }
    // Listen for Zelle payment completion
    const handleZellePayment = async () => {
      // For Zelle payment, save booking to database (which also creates Google Calendar event)
      if (selectedEvent && selectedDateTime && clientData) {
        try {
          const durationMatch = selectedEvent.duration?.match(/(\d+)\s*hour/i);
          const durationHours = durationMatch ? parseInt(durationMatch[1]) : 1;
          const endDateTime = new Date(selectedDateTime);
          endDateTime.setHours(endDateTime.getHours() + durationHours);
          
          // Save booking to database (this also creates the Google Calendar event)
          const saveResponse = await fetch('/api/save-booking', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_name: selectedEvent.name,
              event_id: selectedEvent.id,
              client_name: `${clientData.firstName} ${clientData.lastName}`,
              client_email: clientData.email,
              client_phone: clientData.phone,
              date: selectedDateTime.toISOString().split('T')[0],
              start_time: selectedDateTime.toISOString(),
              end_time: endDateTime.toISOString(),
              quantity: selectedEvent.quantity || 1,
              locale: locale,
              clientTimezone: clientTimezone
            }),
          });
          
          const saveData = await saveResponse.json();
          if (!saveData.success) {
            console.error('Failed to save booking:', saveData.error);
          }
        } catch (error) {
          console.error('Error processing Zelle payment:', error);
        }
      }
      // Handle 'as-needed' locale prefix correctly
      const successPath = locale === 'ru' ? '/booking/success' : `/${locale}/booking/success`;
      router.push(successPath);
    };
    window.addEventListener('zellePaymentCompleted', handleZellePayment);
    return () => window.removeEventListener('zellePaymentCompleted', handleZellePayment);
  }, [selectedEvent, selectedDateTime, clientData, clientTimezone, router, locale, step]);

  const handleSelectEvent = (event: SelectedEvent) => {
    setSelectedEvent(event);
  };

  const handleContinue = () => {
    setStep("calendar");
    // Scroll to top when moving to calendar step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleDateTimeSelected = (dateTime: Date) => {
    setSelectedDateTime(dateTime);
    setStep("client-info");
    // Scroll to top when moving to client-info step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleClientInfoSubmit = (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    setClientData(data);
    setStep("payment");
    // Scroll to top when moving to payment step
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handlePaymentSuccess = async () => {
    setPaymentStatus("success");
    if (selectedEvent && selectedDateTime && clientData) {
      try {
        const durationMatch = selectedEvent.duration?.match(/(\d+)\s*hour/i);
        const durationHours = durationMatch ? parseInt(durationMatch[1]) : 1;
        const endDateTime = new Date(selectedDateTime);
        endDateTime.setHours(endDateTime.getHours() + durationHours);
        const response = await fetch('/api/add-to-calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventName: selectedEvent.name,
            startTime: selectedDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            customerName: `${clientData.firstName} ${clientData.lastName}`,
            customerEmail: clientData.email,
            customerPhone: clientData.phone,
            clientTimezone: clientTimezone
          }),
        });
        const data = await response.json();
        if (data.success && data.htmlLink) {
          setCalendarEventLink(data.htmlLink);
        } else {
          console.error('Failed to add event to calendar:', data.error);
        }
      } catch (error) {
        console.error('Error adding event to calendar:', error);
      }
    }
  };

  const handlePaymentError = (errorMessage: string) => {
    setPaymentStatus("error");
    setPaymentError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-8 md:pt-12 pb-16 flex flex-col items-center px-4 md:px-6" data-testid="booking-page">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 md:p-8" data-testid="booking-container">
        {/* Move 'Back to your information' button to the very top for payment step */}
        {step === "payment" && selectedEvent && paymentStatus === "pending" && (
          <div className="mb-6 flex justify-center">
              <button
                className="text-primary-600 hover:underline text-sm flex items-center"
                onClick={() => {
                  setStep("client-info");
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
                data-testid="back-to-info-btn"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('backToInfo')}
              </button>
            </div>
        )}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8 text-primary-700" data-testid="booking-title">
          {t('title')}
        </h1>
        {/* Progress indicator */}
        <div className="mb-8 px-2" data-testid="progress-indicator">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{
                backgroundColor: '#4B3F72',
                width: step === "select-event" ? "25%" :
                  step === "calendar" ? "50%" :
                    step === "client-info" ? "75%" : "100%"
              }}
              data-testid="progress-bar"
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className={`transition-colors duration-300 ${step === "select-event" ? "text-primary-600 font-medium" : ""}`}>{t('selectService')}</span>
            <span className={`transition-colors duration-300 ${step === "calendar" ? "text-primary-600 font-medium" : ""}`}>{t('pickDateTime')}</span>
            <span className={`transition-colors duration-300 ${step === "client-info" ? "text-primary-600 font-medium" : ""}`}>{t('clientDetails')}</span>
            <span className={`transition-colors duration-300 ${step === "payment" ? "text-primary-600 font-medium" : ""}`}>{t('payment')}</span>
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center" data-testid="cancellation-policy">
          {t('cancellationPolicy')}
        </div>

        <div className={`transition-all duration-300 ${step === "select-event" ? "active-step" : ""}`} data-testid="step-select-event" style={{ display: step === "select-event" ? "block" : "none" }}>
          <EventSelection
            selectedEvent={selectedEvent}
            onSelectEvent={handleSelectEvent}
            onContinue={handleContinue}
          />
        </div>

        <div className="transition-all duration-300" data-testid="step-calendar" style={{ display: step === "calendar" ? "block" : "none" }}>
          {selectedEvent && (
            <BookingCalendar
              event={selectedEvent}
              onDateTimeSelected={handleDateTimeSelected}
              onBack={() => {
                setStep("select-event");
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
            />
          )}
        </div>

        <div className="transition-all duration-300" data-testid="step-client-info" style={{ display: step === "client-info" ? "block" : "none" }}>
          <ClientInfo onSubmit={handleClientInfoSubmit} />
          <div className="mt-6 flex justify-start">
            <button
              onClick={() => {
                setStep("calendar");
                setTimeout(() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }, 100);
              }}
              className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
              data-testid="back-to-calendar-btn"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('backToCalendar')}
            </button>
          </div>
        </div>

        <div className="space-y-6 transition-all duration-300" data-testid="step-payment" style={{ display: step === "payment" ? "block" : "none" }}>
          {selectedEvent && (
            <>
              {/* Booking Summary at the very top */}
              <div className="w-full" data-testid="booking-summary-section">
              <div className="rounded-xl shadow-md border border-neutral-200 bg-white/90 backdrop-blur-md p-0 sm:p-0">
                <div className="flex flex-col items-center gap-4 py-6">
                  <ReceiptText className="w-10 h-10 text-primary-600 mb-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-primary-700 text-center leading-tight tracking-tight" data-testid="booking-summary-title">{t('bookingSummary')}</h2>
                </div>
                <div className="w-full p-6">
                  <ul className="divide-y divide-neutral-200" data-testid="booking-summary-details">
                    <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-neutral-600">{t('service')}</span>
                      <span className="text-neutral-900">{selectedEvent.name}</span>
                    </li>
                    <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-neutral-600">{t('dateTime')}</span>
                      <span className="text-neutral-900">{selectedDateTime?.toLocaleString()}</span>
                    </li>
                    {clientData && (
                      <>
                        <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                          <span className="font-medium text-neutral-600">{t('name')}</span>
                          <span className="text-neutral-900">{clientData.firstName} {clientData.lastName}</span>
                        </li>
                        <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                          <span className="font-medium text-neutral-600">{t('email')}</span>
                          <span className="text-neutral-900">{clientData.email}</span>
                        </li>
                        <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                          <span className="font-medium text-neutral-600">{t('phone')}</span>
                          <span className="text-neutral-900">{clientData.phone}</span>
                        </li>
                      </>
                    )}
                    <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-neutral-600">{t('price')}</span>
                      <span className="text-neutral-900 font-semibold">${(selectedEvent.price / 100).toFixed(2)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Centered payment button at the bottom */}
            {paymentStatus === "pending" && (
              <div className="w-full flex justify-center" data-testid="payment-section">
                <div className="flex flex-col gap-6 w-full max-w-md">
                  <StripeCheckout
                    amount={selectedEvent.price}
                    eventName={selectedEvent.name}
                    eventId={selectedEvent.id}
                    quantity={1}
                    sessionsCount={selectedEvent.quantity}
                    customerName={clientData ? `${clientData.firstName} ${clientData.lastName}` : undefined}
                    customerEmail={clientData?.email}
                    customerPhone={clientData?.phone}
                    appointmentDate={selectedDateTime ? selectedDateTime.toISOString() : undefined}
                    startTime={selectedDateTime ? selectedDateTime.toISOString() : undefined}
                    endTime={selectedDateTime ? new Date(selectedDateTime.getTime() + (selectedEvent?.duration ? parseDurationToMinutes(selectedEvent.duration) : 60) * 60000).toISOString() : undefined}
                    locale={locale}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                  {paymentError && (
                    <div className="text-red-600 text-sm mt-2">{paymentError}</div>
                  )}
                </div>
              </div>
            )}

            {paymentStatus === "success" && (
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200" data-testid="payment-success">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2" data-testid="payment-success-title">Payment Successful!</h2>
                <p className="mb-6 text-neutral-600" data-testid="payment-success-message">Your appointment has been booked.</p>

                {calendarEventLink && (
                  <div className="mb-6">
                    <a
                      href={calendarEventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
                      data-testid="calendar-link-btn"
                    >
                      View in Google Calendar
                    </a>
                  </div>
                )}

                <button
                  onClick={() => {
                    // Reset the form for a new booking
                    setSelectedEvent(null);
                    setSelectedDateTime(null);
                    setStep("select-event");
                    setPaymentStatus("pending");
                    setCalendarEventLink(null);
                  }}
                  className="bg-primary-600 text-white px-5 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  data-testid="book-another-btn"
                >
                  Book Another Appointment
                </button>
              </div>
            )}

            {paymentStatus === "error" && (
              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200" data-testid="payment-error">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-700 mb-2" data-testid="payment-error-title">Payment Failed</h2>
                <p className="mb-6 text-neutral-600" data-testid="payment-error-message">{paymentError || "There was an error processing your payment."}</p>
                <button
                  onClick={() => setPaymentStatus("pending")}
                  className="bg-primary-600 text-white px-5 py-2 rounded-md hover:bg-primary-700 transition-colors"
                  data-testid="payment-retry-btn"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Back button for payment step */}
            <div className="mt-6 flex justify-start">
              <button
                onClick={() => {
                  setStep("client-info");
                  setTimeout(() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }, 100);
                }}
                className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
                data-testid="back-to-info-btn"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('backToInfo')}
              </button>
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper to parse duration string to minutes
function parseDurationToMinutes(duration: string | undefined): number {
  if (!duration) return 60;
  const hourMatch = duration.match(/(\d+)\s*hour/i);
  const minuteMatch = duration.match(/(\d+)\s*min/i);
  let minutes = 0;
  if (hourMatch) minutes += parseInt(hourMatch[1], 10) * 60;
  if (minuteMatch) minutes += parseInt(minuteMatch[1], 10);
  if (minutes === 0) minutes = 60;
  return minutes;
}