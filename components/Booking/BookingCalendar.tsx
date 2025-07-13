'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BookingCalendarProps } from '@/types/bookings';

interface BusySlotData {
  start?: string | null;
  end?: string | null;
}

interface AvailableSlot {
  start: string;
  value: Date;
  display?: string;
  utc?: Date;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ event, onDateTimeSelected, onBack }) => {
  const t = useTranslations('booking');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const [busySlots, setBusySlots] = useState<BusySlotData[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [availabilityCache, setAvailabilityCache] = useState<Map<string, BusySlotData[]>>(new Map());
  const [clientTimezone, setClientTimezone] = useState<string>('Europe/Kiev');
  const continueButtonRef = useRef<HTMLDivElement>(null);

  // Helper to format Date to YYYY-MM-DD string
  const formatDateToYYYYMMDD = (date: Date | undefined): string => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Detect client timezone on component mount
  useEffect(() => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setClientTimezone(detectedTimezone);
    } catch (error) {
      console.warn('Failed to detect timezone, using default:', error);
    }
  }, []);

  // Fetch availability for a given date
  const fetchAvailability = useCallback(async (dateString: string) => {
    // Check cache first
    if (availabilityCache.has(dateString)) {
      const cachedSlots = availabilityCache.get(dateString)!;
      setBusySlots(cachedSlots);
      return;
    }

    setIsLoadingSlots(true);
    setSlotsError(null);
    
    try {
      const response = await fetch(`/api/calendar-availability?date=${dateString}&eventId=${event.id}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const busySlots = data.busySlots || [];
      
      // Update cache
      setAvailabilityCache(prevCache => {
        const newCache = new Map(prevCache);
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
      console.error('Failed to fetch availability:', error);
      setSlotsError(error.message);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [availabilityCache, event.id]);

  // Fetch availability when date changes
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
    const dayStartHour = 9; // 9 AM
    const dayEndHour = 18; // 6 PM
    const slotDurationMinutes = 60; // 1 hour slots
    const generatedSlots: AvailableSlot[] = [];
    const adminTimezone = 'Europe/Kiev';
  
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
          display: displayTime,
          utc: slotStart,
        });
      }
      currentSlotTime = slotEnd;
    }
    setAvailableSlots(generatedSlots);
  }, [clientTimezone]);

  // Generate available time slots
  useEffect(() => {
    if (!selectedDate) return;
    if (!isLoadingSlots && busySlots) {
      generateAvailableTimeSlots(selectedDate, busySlots);
    }
  }, [busySlots, isLoadingSlots, selectedDate, generateAvailableTimeSlots]);

  const handleTimeSlotSelect = (timeSlot: Date) => {
    setSelectedTimeSlot(timeSlot);
  };

  // No scrolling behavior needed - desktop doesn't scroll, mobile uses sticky buttons

  const handleContinue = () => {
    if (selectedTimeSlot) {
      onDateTimeSelected(selectedTimeSlot, clientTimezone);
    }
  };

  return (
    <div className="space-y-6" data-testid="booking-calendar">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{t('pickDateTime')}</h2>
        <p className="text-gray-600">
          {event.name} - {event.duration}
        </p>
      </div>

      <div className="space-y-4">
        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dayOfWeek = date.getDay();
              // Disable past dates and weekends (Saturday=6, Sunday=0)
              return date < today || dayOfWeek === 0 || dayOfWeek === 6;
            }}
            className="rounded-md border calendar-large"
            data-testid="calendar"
          />
        </div>
        
        {/* Time Slots */}
        {selectedDate && (
          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-3 text-center available-times-title">
              {t('selectTime')}
            </h4>
            {isLoadingSlots ? (
              <div className="grid grid-cols-3 gap-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : slotsError ? (
              <p className="text-red-600 text-sm text-center">{t('errorFetchingAvailability')}</p>
            ) : availableSlots.length === 0 ? (
              <p className="text-gray-500 text-sm text-center">{t('noSlots')}</p>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto" data-testid="time-slots">
                {availableSlots.map((slot, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant={selectedTimeSlot && slot.utc && selectedTimeSlot.getTime() === slot.utc.getTime() ? "default" : "outline"}
                    size="sm"
                    onClick={() => slot.utc && handleTimeSlotSelect(slot.utc)}
                    className="text-sm"
                    style={selectedTimeSlot && slot.utc && selectedTimeSlot.getTime() === slot.utc.getTime() ? { backgroundColor: '#4B3F72', color: 'white' } : {}}
                    data-testid={`time-slot-${index}`}
                  >
                    {slot.display}
                  </Button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div ref={continueButtonRef} className="hidden md:flex gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex items-center w-1/2"
          data-testid="back-btn"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          {t('back')}
        </Button>
        
        <Button
          onClick={handleContinue}
          disabled={!selectedTimeSlot}
          className="w-1/2 text-white hover:opacity-90 bg-alla-purple"
          data-testid="continue-btn"
        >
          {t('continue')}
        </Button>
      </div>
      
      {/* Mobile Sticky Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex items-center w-1/2 py-4"
            data-testid="back-btn-mobile"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {t('back')}
          </Button>
          
          <Button
            onClick={handleContinue}
            disabled={!selectedTimeSlot}
            className="w-1/2 py-4 text-white hover:opacity-90 bg-alla-purple"
            data-testid="continue-btn-mobile"
          >
            {t('continue')}
          </Button>
        </div>
      </div>
      
      {/* Mobile spacer to prevent content from being hidden behind sticky buttons */}
      <div className="md:hidden h-20"></div>
    </div>
  );
};

export default BookingCalendar;