"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SelectedEvent } from '@/types/bookings';
import { useTranslations } from 'next-intl';


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

interface BookingCalendarProps {
    event: SelectedEvent;
    onDateTimeSelected: (dateTime: Date) => void;
}

// Helper to format Date to YYYY-MM-DD string
const formatDateToYYYYMMDD = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const BookingCalendar: React.FC<BookingCalendarProps> = React.memo(({ event, onDateTimeSelected }) => {
    const t = useTranslations('booking');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [busySlots, setBusySlots] = useState<BusySlotData[]>([]);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
    const [availabilityCache, setAvailabilityCache] = useState<Map<string, BusySlotData[]>>(new Map());
    const [clientTimezone, setClientTimezone] = useState<string>('Europe/Kiev'); // Default fallback

    // Detect client timezone on component mount
    useEffect(() => {
        try {
            const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            setClientTimezone(detectedTimezone);
            console.log('Detected client timezone:', detectedTimezone);
        } catch (error) {
            console.warn('Failed to detect timezone, using fallback:', error);
            setClientTimezone('Europe/Kiev');
        }
    }, []);

    // Use the event prop to display event information
    useEffect(() => {
        if (event) {
            console.log(`Booking calendar loaded for event: ${event.name}`);
        }
    }, [event]);

    const handleTimeSlotSelect = (dateTime: Date): void => {
        setSelectedTimeSlot(dateTime);
    };
    
    const handleContinue = (): void => {
        if (selectedTimeSlot) {
            onDateTimeSelected(selectedTimeSlot);
        }
    };

    const fetchAvailability = useCallback(async (dateString: string): Promise<void> => {
        // Check cache first to reduce API calls
        if (availabilityCache.has(dateString)) {
            const cachedData = availabilityCache.get(dateString) || [];
            setBusySlots(cachedData);
            console.log(`Using cached availability data for ${dateString}`);
            return;
        }

        setIsLoading(true);
        setError(null);
        setAvailableSlots([]);
        try {
            const response = await fetch(`/api/calendar-availability?date=${dateString}`);
            if (!response.ok) {
                const errorData: { message?: string } = await response.json();
                throw new Error(errorData.message || `Error: ${response.status}`);
            }
            const data: { busySlots?: BusySlotData[] } = await response.json();
            const busySlots = data.busySlots || [];
            
            // Cache the result for future use
            setAvailabilityCache(prev => {
                const newCache = new Map(prev);
                newCache.set(dateString, busySlots);
                // Keep cache size reasonable - remove entries older than 7 days
                if (newCache.size > 7) {
                    const oldestKey = newCache.keys().next().value;
                    if (oldestKey) {
                        newCache.delete(oldestKey);
                    }
                }
                return newCache;
            });
            
            setBusySlots(busySlots);
        } catch (err: unknown) {
            const error = err as Error;
            console.error("Failed to fetch availability:", error);
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }, [availabilityCache]);

    useEffect(() => {
        if (selectedDate) {
            const formattedDate = formatDateToYYYYMMDD(selectedDate);
            fetchAvailability(formattedDate);
        }
    }, [selectedDate, fetchAvailability]);

    // Reset selected time slot when date changes
    useEffect(() => {
        setSelectedTimeSlot(null);
    }, [selectedDate]);

    const generateAvailableTimeSlots = useCallback((date: Date, currentBusySlots: BusySlotData[]): void => {
        const dayStartHour = process.env.START_TIME ? parseInt(process.env.START_TIME, 10) : 9;
        const dayEndHour = process.env.END_TIME? parseInt(process.env.END_TIME, 10) : 18;
        const slotDurationMinutes = process.env.SLOT_DURATION? parseInt(process.env.SLOT_DURATION, 10) : 60;
        const generatedSlots: AvailableSlot[] = [];
        const adminTimezone = 'America/New_York'; // Admin's timezone
        const convertAdminTimeToClientTime = (hour: number, minute: number = 0): Date => {
            const adminDateTime = new Date();
            adminDateTime.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
            adminDateTime.setHours(hour, minute, 0, 0);
            const adminTimeStr = adminDateTime.toLocaleString('sv-SE', { timeZone: adminTimezone });
            const adminTimeInAdminTz = new Date(adminTimeStr);
            const adminOffsetMs = adminDateTime.getTime() - adminTimeInAdminTz.getTime();
            return new Date(adminDateTime.getTime() - adminOffsetMs);
        };
        const startOfDay = convertAdminTimeToClientTime(dayStartHour, 0);
        const endOfDay = convertAdminTimeToClientTime(dayEndHour, 0);
        let currentSlotTime = new Date(startOfDay);
        while (currentSlotTime < endOfDay) {
            const slotStart = new Date(currentSlotTime);
            const slotEnd = new Date(currentSlotTime.getTime() + slotDurationMinutes * 60000);
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            if (isToday && slotStart <= now) {
                currentSlotTime = slotEnd;
                continue;
            }
            const isBusy = currentBusySlots.some(busy => {
                if (!busy.start || !busy.end) return false;
                const busyStart = new Date(busy.start);
                const busyEnd = new Date(busy.end);
                return slotStart < busyEnd && slotEnd > busyStart;
            });
            if (!isBusy) {
                const displayTime = slotStart.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: true,
                    timeZone: clientTimezone
                });
                generatedSlots.push({
                    start: displayTime,
                    value: slotStart,
                });
            }
            currentSlotTime = slotEnd;
        }
        setAvailableSlots(generatedSlots);
    }, [clientTimezone]);

    useEffect(() => {
        if (!selectedDate) return;
        if (!isLoading && busySlots) {
            generateAvailableTimeSlots(selectedDate, busySlots);
        }
    }, [busySlots, isLoading, selectedDate, generateAvailableTimeSlots]);

    return (
        <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 w-full">
            <div className="flex flex-col w-full max-w-4xl mx-auto">
                {/* Calendar Section - Always on top for mobile */}
                <div className="w-full bg-white rounded-lg shadow p-4 md:p-6 mb-3" data-testid="calendar-section">
                    <h2 className="text-xl font-semibold mb-4 text-primary-700 text-center" data-testid="calendar-title">Select a Date</h2>
                    <div className="flex justify-center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border mx-auto"
                            disabled={(date: Date) => date < new Date(new Date().setDate(new Date().getDate() -1))}
                            data-testid="date-picker"
                        />
                    </div>
                </div>
                
                {/* Available Slots Section - Below calendar on mobile */}
                <div className="w-full bg-white rounded-lg shadow p-4 md:p-6" data-testid="time-slots-section">
                    {/* Removed the "Available Slots for" header */}
                    
                    <div className="text-center">
                        {isLoading && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-2">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <Skeleton key={index} className="h-10 w-full" />
                                ))}
                            </div>
                        )}
                        {error && <p className="text-red-600">Error: {error}</p>}
                        {!isLoading && !error && availableSlots.length === 0 && selectedDate && (
                            <p className="text-neutral-500">No available slots for this day or outside working hours.</p>
                        )}
                    </div>
                    
                    {!isLoading && !error && availableSlots.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-72 overflow-y-auto p-2" data-testid="time-slots-grid">
                            {availableSlots.map((slot) => (
                                <Button
                                    key={slot.start}
                                    variant="outline"
                                    onClick={() => handleTimeSlotSelect(slot.value)}
                                    className={`w-full transition-colors ${
                                        selectedTimeSlot && selectedTimeSlot.getTime() === slot.value.getTime()
                                        ? 'border-2 border-black font-medium'
                                        : 'hover:bg-primary-50 hover:text-primary-700'
                                    }`}
                                    data-testid={`time-slot-${slot.start.replace(/[^a-zA-Z0-9]/g, '-')}`}
                                >
                                    {slot.start}
                                </Button>
                            ))}
                        </div>
                    )}
                    
                    {selectedTimeSlot && (
                        <div className="mt-6 flex justify-center">
                            <Button 
                                onClick={handleContinue}
                                className="px-6 py-2 bg-black text-white hover:bg-gray-800"
                                data-testid="calendar-continue-btn"
                            >
                                {t('continue')} {selectedTimeSlot.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                            </Button>
                        </div>
                    )}
                </div>
                
                {/* Desktop layout - side by side */}
                <div className="hidden md:flex md:flex-row md:gap-8 w-full mt-6">
                    {/* This is just a placeholder for desktop layout structure */}
                    {/* The actual content is rendered in the sections above */}
                </div>
            </div>
        </div>
    );
});

BookingCalendar.displayName = 'BookingCalendar';

export default BookingCalendar;