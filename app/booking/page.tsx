"use client";

import React, { useState } from "react";
import BookingCalendar from "@/components/BookingCalendar";
import EventSelection from "@/components/EventSelection";

export default function BookingPage() {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [step, setStep] = useState<"select-event" | "calendar">("select-event");

  const handleSelectEvent = (eventID: string) => {
    setSelectedEvent(eventID);
  };

  const handleContinue = () => {
    setStep("calendar");
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center py-8 px-2 md:px-6">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-4 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-primary-700">
          Book Your Appointment
        </h1>
        {step === "select-event" && (
          <EventSelection
            selectedEvent={selectedEvent}
            onSelectService={handleSelectEvent}
            onContinue={handleContinue}
          />
        )}
        {step === "calendar" && (
          <BookingCalendar />
        )}
      </div>
    </div>
  );
}