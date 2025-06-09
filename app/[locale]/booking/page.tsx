"use client";

import React, { useEffect, useState } from "react";
import { ReceiptText, ChevronLeft, Check, X } from "lucide-react";
import BookingCalendar from "@/components/Booking/BookingCalendar";
import EventSelection from "@/components/Booking/EventSelection";
import StripeCheckout from "@/components/Booking/StripeCheckout";
import ClientInfo from "@/components/Booking/ClientInfo";
import { SelectedEvent } from "@/types/bookings";
import { getEventById } from "@/utils/eventTypes";
import { useParams } from "next/navigation";
import { useTranslations } from 'next-intl';

export default function BookingPage() {
  const t = useTranslations('booking');
  const params = useParams();
  const locale = typeof params.locale === "string" ? params.locale : Array.isArray(params.locale) ? params.locale[0] : "en";
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
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
    window.scrollTo(0, 0);
  }, [step]);

  const handleSelectEvent = (eventID: string) => {
    // Find the event object based on ID or create a simple one for now
    const eventData = getEventById(eventID);
    if (eventData) {
      const priceInCents = parseInt(eventData.price) * 100;

      const event: SelectedEvent = {
        id: eventID,
        name: eventData.name,
        price: priceInCents,
        duration: eventData.duration,
        quantity: eventData.quantity,
      };
      setSelectedEvent(event);
    }
  };

  const handleContinue = () => {
    setStep("calendar");
  };

  const handleDateTimeSelected = (dateTime: Date) => {
    console.log("Selected date and time:", dateTime);
    setSelectedDateTime(dateTime);
    setStep("client-info");
  };

  const handleClientInfoSubmit = (data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }) => {
    console.log("Client info submitted:", data);
    setClientData(data);
    setStep("payment");
  };

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    console.log("Payment successful with ID:", paymentIntentId);
    setPaymentStatus("success");
    // Here you would typically save the booking to your database
    // and maybe redirect to a confirmation page
    // Only proceed if we have all the necessary data
    if (selectedEvent && selectedDateTime && clientData) {
      try {
        // Calculate end time based on duration (assuming duration is in format like "2 hours")
        const durationMatch = selectedEvent.duration?.match(/(\d+)\s*hour/i);
        const durationHours = durationMatch ? parseInt(durationMatch[1]) : 1; // Default to 1 hour

        const endDateTime = new Date(selectedDateTime);
        endDateTime.setHours(endDateTime.getHours() + durationHours);

        // Add event to Google Calendar
        const response = await fetch('/api/add-to-calendar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventName: selectedEvent.name,
            startTime: selectedDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            // Now we can add customer details
            customerName: `${clientData.firstName} ${clientData.lastName}`,
            customerEmail: clientData.email,
            customerPhone: clientData.phone
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
    console.error("Payment error:", errorMessage);
    setPaymentStatus("error");
    setPaymentError(errorMessage);
  };

  return (
    <div className="min-h-screen bg-neutral-50 pt-24 md:pt-32 pb-16 flex flex-col items-center px-4 md:px-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Move 'Back to your information' button to the very top for payment step */}
        {step === "payment" && selectedEvent && paymentStatus === "pending" && (
          <div className="mb-6 flex justify-center">
            <button
              className="text-primary-600 hover:underline text-sm flex items-center"
              onClick={() => setStep("client-info")}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t('backToInfo')}
            </button>
          </div>
        )}
        
        {/* Removed the top Pay button */}

        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8 text-primary-700">
          Book Your Appointment
        </h1>

        {/* Progress indicator */}
        <div className="mb-8 px-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-lime-600 h-2 rounded-full transition-all duration-500 ease-in-out"
              style={{
                width: step === "select-event" ? "25%" :
                  step === "calendar" ? "50%" :
                    step === "client-info" ? "75%" : "100%"
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className={`transition-colors duration-300 ${step === "select-event" ? "text-primary-600 font-medium" : ""}`}>{t('selectService')}</span>
            <span className={`transition-colors duration-300 ${step === "calendar" ? "text-primary-600 font-medium" : ""}`}>{t('pickDateTime')}</span>
            <span className={`transition-colors duration-300 ${step === "client-info" ? "text-primary-600 font-medium" : ""}`}>{t('clientDetails')}</span>
            <span className={`transition-colors duration-300 ${step === "payment" ? "text-primary-600 font-medium" : ""}`}>{t('payment')}</span>
          </div>
        </div>

        {step === "select-event" && (
          <div className="transition-all duration-300">
            <EventSelection
              selectedEvent={selectedEvent ? selectedEvent.id : null}
              onSelectEvent={handleSelectEvent}
              onContinue={handleContinue}
            />
          </div>
        )}

        {step === "calendar" && (
          <div className="transition-all duration-300">
            <BookingCalendar
              event={selectedEvent!}
              onDateTimeSelected={handleDateTimeSelected}
            />
            <div className="mt-6 flex justify-start">
              <button
                onClick={() => setStep("select-event")}
                className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('backToService')}
              </button>
            </div>
          </div>
        )}

        {step === "client-info" && (
          <div className="transition-all duration-300">
            <ClientInfo onSubmit={handleClientInfoSubmit} />
            <div className="mt-6 flex justify-start">
              <button
                onClick={() => setStep("calendar")}
                className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('backToCalendar')}
              </button>
            </div>
          </div>
        )}

        {step === "payment" && selectedEvent && (
          <div className="space-y-6 transition-all duration-300">
            {/* Booking Summary at the very top */}
            <div className="w-full">
              <div className="rounded-xl shadow-md border border-neutral-200 bg-white/90 backdrop-blur-md p-0 sm:p-0">
                <div className="flex flex-col items-center gap-4 py-6">
                  <ReceiptText className="w-10 h-10 text-primary-600 mb-2" />
                  <h2 className="text-lg sm:text-xl font-semibold text-primary-700 text-center leading-tight tracking-tight">{t('bookingSummary')}</h2>
                </div>
                <div className="w-full p-6">
                  <ul className="divide-y divide-neutral-200">
                    <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-neutral-600">Service</span>
                      <span className="text-neutral-900">{selectedEvent.name}</span>
                    </li>
                    <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-neutral-600">Date/Time</span>
                      <span className="text-neutral-900">{selectedDateTime?.toLocaleString()}</span>
                    </li>
                    {clientData && (
                      <>
                        <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                          <span className="font-medium text-neutral-600">Name</span>
                          <span className="text-neutral-900">{clientData.firstName} {clientData.lastName}</span>
                        </li>
                        <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                          <span className="font-medium text-neutral-600">Email</span>
                          <span className="text-neutral-900">{clientData.email}</span>
                        </li>
                        <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                          <span className="font-medium text-neutral-600">Phone</span>
                          <span className="text-neutral-900">{clientData.phone}</span>
                        </li>
                      </>
                    )}
                    <li className="py-2 flex flex-col sm:flex-row sm:justify-between">
                      <span className="font-medium text-neutral-600">Price</span>
                      <span className="text-neutral-900 font-semibold">${(selectedEvent.price / 100).toFixed(2)}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Centered payment button at the bottom */}
            {paymentStatus === "pending" && (
              <div className="w-full flex justify-center">
                <div className="flex flex-col gap-6 w-full max-w-md">
                  <StripeCheckout
                    amount={selectedEvent.price}
                    eventName={selectedEvent.name}
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
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <Check className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h2>
                <p className="mb-6 text-neutral-600">Your appointment has been booked.</p>

                {calendarEventLink && (
                  <div className="mb-6">
                    <a
                      href={calendarEventLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors"
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
                >
                  Book Another Appointment
                </button>
              </div>
            )}

            {paymentStatus === "error" && (
              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <X className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="text-2xl font-bold text-red-700 mb-2">Payment Failed</h2>
                <p className="mb-6 text-neutral-600">{paymentError || "There was an error processing your payment."}</p>
                <button
                  onClick={() => setPaymentStatus("pending")}
                  className="bg-primary-600 text-white px-5 py-2 rounded-md hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}
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