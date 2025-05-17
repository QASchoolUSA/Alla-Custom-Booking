"use client";

import React, { useState, useEffect, JSX } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';

// Type for the busy slots received from your API
interface BusySlotData {
    start?: string | null;
    end?: string | null;
}

// Type for the calculated available slots you'll display
interface AvailableSlot {
    start: string;    // Formatted time string, e.g., "09:00 AM"
    value: Date;      // Actual Date object for booking or further processing
}

// Helper to format Date to YYYY-MM-DD string
const formatDateToYYYYMMDD = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function BookingCalendar(): JSX.Element {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [busySlots, setBusySlots] = useState<BusySlotData[]>([]);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (selectedDate) {
            const formattedDate = formatDateToYYYYMMDD(selectedDate);
            fetchAvailability(formattedDate);
        }
    }, [selectedDate]);

    const fetchAvailability = async (dateString: string): Promise<void> => {
        setIsLoading(true);
        setError(null);
        setAvailableSlots([]);
        try {
            const response = await fetch(`/api/google-calendar-availability?date=${dateString}`);
            if (!response.ok) {
                const errorData: { message?: string } = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
            const data: { busySlots?: BusySlotData[] } = await response.json();
            setBusySlots(data.busySlots || []);
        } catch (err: any) {
            console.error("Failed to fetch availability:", err);
            setError(err.message as string);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedDate) return;

        if (!isLoading && busySlots) { // Check if busySlots is defined
            generateAvailableTimeSlots(selectedDate, busySlots);
        }
    }, [busySlots, isLoading, selectedDate]);

    const generateAvailableTimeSlots = (date: Date, currentBusySlots: BusySlotData[]): void => {
        const dayStartHour = 9; // 9 AM
        const dayEndHour = 17;  // 5 PM
        const slotDurationMinutes = 30;
        const generatedSlots: AvailableSlot[] = [];

        // Create date objects in the user's local timezone for display logic
        const startOfDay = new Date(date);
        startOfDay.setHours(dayStartHour, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(dayEndHour, 0, 0, 0);

        let currentSlotTime = new Date(startOfDay);

        while (currentSlotTime < endOfDay) {
            const slotStart = new Date(currentSlotTime);
            const slotEnd = new Date(currentSlotTime.getTime() + slotDurationMinutes * 60000);

            const isBusy = currentBusySlots.some(busy => {
                if (!busy.start || !busy.end) return false; // Skip if start or end is missing
                // Busy slots from Google are ISO strings (likely UTC or with timezone offset)
                // Convert them to Date objects for comparison.
                // Date constructor with ISO string correctly parses to local timezone representation of that UTC time.
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);

                // Overlap check: (StartA < EndB) and (EndA > StartB)
                return slotStart < busyEnd && slotEnd > busyStart;
            });

            if (!isBusy) {
                generatedSlots.push({
                    start: slotStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
                    value: slotStart,
                });
            }
            currentSlotTime = slotEnd;
        }
        setAvailableSlots(generatedSlots);
    };

    return (
        <div className="flex flex-col items-center gap-8 p-4 sm:p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl">
                <div className="flex-1 bg-white rounded-lg shadow p-4 md:p-6">
                    <h2 className="text-xl font-semibold mb-4 text-primary-700">Select a Date</h2>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        disabled={(date: Date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                    />
                </div>
                <div className="flex-1 bg-white rounded-lg shadow p-4 md:p-6 mt-6 md:mt-0">
                    <h2 className="text-xl font-semibold mb-4 text-primary-700">
                        Available Slots for {selectedDate ? selectedDate.toLocaleDateString() : 'N/A'}
                    </h2>
                    {isLoading && <p className="text-neutral-500">Loading availability...</p>}
                    {error && <p className="text-red-600">Error: {error}</p>}
                    {!isLoading && !error && availableSlots.length === 0 && selectedDate && (
                        <p className="text-neutral-500">No available slots for this day or outside working hours.</p>
                    )}
                    {!isLoading && !error && availableSlots.length > 0 && (
                        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
                            {availableSlots.map((slot) => (
                                <Button
                                    key={slot.start}
                                    variant="outline"
                                    onClick={() => alert(`Slot selected: ${slot.start} on ${selectedDate?.toLocaleDateString()}`)}
                                    className="w-full"
                                >
                                    {slot.start}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}