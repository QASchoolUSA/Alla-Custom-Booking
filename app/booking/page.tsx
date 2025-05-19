"use client";

import React, { useState } from "react";
import BookingCalendar from "@/components/Booking/BookingCalendar";
import EventSelection from "@/components/Booking/EventSelection";
import StripeCheckout from "@/components/Booking/StripeCheckout";
import ClientInfo from "@/components/Booking/ClientInfo";
import { SelectedEvent } from "@/types/bookings";
import { getEventById } from "@/utils/eventTypes";

export default function BookingPage() {
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
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center py-8 px-2 md:px-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-4 md:p-8">

        {/* <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary-700">
          Book Your Appointment
        </h1> */}
        
        {step === "select-event" && (
          <EventSelection
            selectedEvent={selectedEvent ? selectedEvent.id : null}
            onSelectEvent={handleSelectEvent}
            onContinue={handleContinue}
          />
        )}
        
        {step === "calendar" && (
          <div>
            <BookingCalendar 
              event={selectedEvent!}
              onDateTimeSelected={handleDateTimeSelected}
            />
            <div className="mt-4">
              <button 
                onClick={() => setStep("select-event")}
                className="text-primary-600 hover:text-primary-800"
              >
                ← Back to service selection
              </button>
            </div>
          </div>
        )}
        
        {step === "client-info" && (
          <div>
            <ClientInfo onSubmit={handleClientInfoSubmit} />
            <div className="mt-4">
              <button 
                onClick={() => setStep("calendar")}
                className="text-primary-600 hover:text-primary-800"
              >
                ← Back to calendar
              </button>
            </div>
          </div>
        )}
        
        {step === "payment" && selectedEvent && (
          <div className="space-y-6">
            <div className="bg-neutral-100 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Booking Summary</h2>
              <p><strong>Service:</strong> {selectedEvent.name}</p>
              <p><strong>Date/Time:</strong> {selectedDateTime?.toLocaleString()}</p>
              {clientData && (
                <>
                  <p><strong>Name:</strong> {clientData.firstName} {clientData.lastName}</p>
                  <p><strong>Email:</strong> {clientData.email}</p>
                  <p><strong>Phone:</strong> {clientData.phone}</p>
                </>
              )}
              <p><strong>Price:</strong> ${(selectedEvent.price / 100).toFixed(2)}</p>
            </div>
            
            {paymentStatus === "pending" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
                <StripeCheckout 
                  amount={selectedEvent.price}
                  eventName={selectedEvent.name}
                  customerName={clientData ? `${clientData.firstName} ${clientData.lastName}` : undefined}
                  customerEmail={clientData?.email}
                  customerPhone={clientData?.phone}
                  appointmentDate={selectedDateTime ? selectedDateTime.toLocaleString() : undefined}
                  startTime={selectedDateTime ? selectedDateTime.toISOString() : undefined}
                  endTime={selectedDateTime && selectedEvent.duration ? 
                    new Date(selectedDateTime.getTime() + (typeof selectedEvent.duration === 'number' ? 
                      selectedEvent.duration : 60) * 60000).toISOString() 
                    : undefined}
                  onPaymentSuccess={handlePaymentSuccess}
                  onPaymentError={handlePaymentError}
                />
                <div className="mt-4">
                  <button 
                    onClick={() => setStep("client-info")}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    ← Back to your information
                  </button>
                </div>
              </div>
            )}
            
            {paymentStatus === "success" && (
              <div className="text-center p-6 bg-green-100 rounded-lg">
                <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Successful!</h2>
                <p className="mb-4">Your appointment has been booked.</p>
                
                {calendarEventLink && (
                  <div className="mb-4">
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
                
                <button 
                  onClick={() => {
                    // Reset the form for a new booking
                    setSelectedEvent(null);
                    setSelectedDateTime(null);
                    setStep("select-event");
                    setPaymentStatus("pending");
                    setCalendarEventLink(null);
                  }}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
                >
                  Book Another Appointment
                </button>
              </div>
            )}
            
            {paymentStatus === "error" && (
              <div className="text-center p-6 bg-red-100 rounded-lg">
                <h2 className="text-2xl font-bold text-red-700 mb-2">Payment Failed</h2>
                <p className="mb-4">{paymentError || "There was an error processing your payment."}</p>
                <button 
                  onClick={() => setPaymentStatus("pending")}
                  className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
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