"use client";

import React, { useEffect, useState } from "react";
import BookingCalendar from "@/components/Booking/BookingCalendar";
import EventSelection from "@/components/Booking/EventSelection";
import StripeCheckout from "@/components/Booking/StripeCheckout";
import ClientInfo from "@/components/Booking/ClientInfo";
import { SelectedEvent } from "@/types/bookings";
import { getEventById } from "@/utils/eventTypes";
import { useParams } from "next/navigation";

export default function BookingPage() {
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
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-6 md:mb-8 text-primary-700">
          Book Your Appointment
        </h1>
        
        {/* Progress indicator */}
        <div className="mb-8 px-2">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-black h-2 rounded-full transition-all duration-500 ease-in-out" 
              style={{ 
                width: step === "select-event" ? "25%" : 
                       step === "calendar" ? "50%" : 
                       step === "client-info" ? "75%" : "100%" 
              }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span className={`transition-colors duration-300 ${step === "select-event" ? "text-primary-600 font-medium" : ""}`}>Select Service</span>
            <span className={`transition-colors duration-300 ${step === "calendar" ? "text-primary-600 font-medium" : ""}`}>Pick Date & Time</span>
            <span className={`transition-colors duration-300 ${step === "client-info" ? "text-primary-600 font-medium" : ""}`}>Client Details</span>
            <span className={`transition-colors duration-300 ${step === "payment" ? "text-primary-600 font-medium" : ""}`}>Payment</span>
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to service selection
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to calendar
              </button>
            </div>
          </div>
        )}
        
        {step === "payment" && selectedEvent && (
          <div className="space-y-6 transition-all duration-300">
            <div className="bg-neutral-100 p-5 rounded-lg border border-neutral-200">
              <h2 className="text-xl font-semibold mb-3 text-primary-700">Booking Summary</h2>
              <div className="space-y-2">
                <p><strong className="text-neutral-700">Service:</strong> <span className="text-neutral-800">{selectedEvent.name}</span></p>
                <p><strong className="text-neutral-700">Date/Time:</strong> <span className="text-neutral-800">{selectedDateTime?.toLocaleString()}</span></p>
                {clientData && (
                  <>
                    <p><strong className="text-neutral-700">Name:</strong> <span className="text-neutral-800">{clientData.firstName} {clientData.lastName}</span></p>
                    <p><strong className="text-neutral-700">Email:</strong> <span className="text-neutral-800">{clientData.email}</span></p>
                    <p><strong className="text-neutral-700">Phone:</strong> <span className="text-neutral-800">{clientData.phone}</span></p>
                  </>
                )}
                <p><strong className="text-neutral-700">Price:</strong> <span className="text-neutral-800 font-medium">${(selectedEvent.price / 100).toFixed(2)}</span></p>
              </div>
            </div>
            
            {paymentStatus === "pending" && (
              <div>
                <h2 className="text-xl font-semibold mb-4 text-primary-700">Payment Details</h2>
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
                <div className="mt-6 flex justify-start">
                  <button 
                    onClick={() => setStep("client-info")}
                    className="flex items-center text-primary-600 hover:text-primary-800 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to your information
                  </button>
                </div>
              </div>
            )}
            
            {paymentStatus === "success" && (
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
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
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
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