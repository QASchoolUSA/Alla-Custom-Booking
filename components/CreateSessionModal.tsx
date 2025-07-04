'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { getLocalizedEvents } from '@/utils/eventTypes';
import { useTranslations } from 'next-intl';
import NewClientModal from '@/components/NewClientModal';
import { Plus } from 'lucide-react';

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone?: string;
  event_name: string;
  date: string;
  start_time: string;
  end_time: string;
  quantity?: number;
  sessions?: number;
}

interface BusySlotData {
  start?: string | null;
  end?: string | null;
}

interface AvailableSlot {
  start: string;
  value: Date;
}

interface NewClientData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated: () => void;
  clientSessions: Record<string, Booking & { sessions: number }>;
}

export default function CreateSessionModal({
  isOpen,
  onClose,
  onSessionCreated,
  clientSessions
}: CreateSessionModalProps) {
  const t = useTranslations('admin');
  const tEvents = useTranslations();
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  const [busySlots, setBusySlots] = useState<BusySlotData[]>([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [availabilityCache, setAvailabilityCache] = useState<Map<string, BusySlotData[]>>(new Map());
  const [clientTimezone, setClientTimezone] = useState<string>('America/New_York');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newClientData, setNewClientData] = useState<NewClientData | null>(null);
  const [clientType, setClientType] = useState<'existing' | 'new'>('existing');

  const localizedEvents = useMemo(() => getLocalizedEvents(tEvents), [tEvents]);
  const clients = Object.values(clientSessions);

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
      const response = await fetch(`/api/calendar-availability?date=${dateString}`);
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
  }, [availabilityCache]);

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

  // Generate available time slots
  useEffect(() => {
    if (!selectedDate) return;
    if (!isLoadingSlots && busySlots) {
      generateAvailableTimeSlots(selectedDate, busySlots);
    }
  }, [busySlots, isLoadingSlots, selectedDate]);

  const generateAvailableTimeSlots = (date: Date, currentBusySlots: BusySlotData[]): void => {
    const dayStartHour = process.env.START_TIME ? parseInt(process.env.START_TIME, 10) : 9;
    const dayEndHour = process.env.END_TIME ? parseInt(process.env.END_TIME, 10) : 18;
    const slotDurationMinutes = process.env.SLOT_DURATION ? parseInt(process.env.SLOT_DURATION, 10) : 60;
    const generatedSlots: AvailableSlot[] = [];
    const adminTimezone = 'America/New_York';

    // Helper function to convert admin's working hours to client's timezone
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

      // Only show future slots if booking for today
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
  };

  const handleNewClientAdded = (client: NewClientData) => {
    setNewClientData(client);
    setClientType('new');
    setSelectedClient(''); // Clear existing client selection
    setShowNewClientModal(false);
  };

  const handleTimeSlotSelect = (timeSlot: Date) => {
    setSelectedTimeSlot(timeSlot);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!selectedEvent || !selectedTimeSlot) {
      toast.error('Please select an event type and time slot');
      return;
    }

    if (clientType === 'existing' && !selectedClient) {
      toast.error('Please select a client');
      return;
    }

    if (clientType === 'new' && !newClientData) {
      toast.error('Please add client information');
      return;
    }

    setIsSubmitting(true);

    try {
      const event = localizedEvents.find(e => e.id === selectedEvent);
      
      if (!event) {
        toast.error('Invalid event selection');
        return;
      }

      let clientName, clientEmail, clientPhone;
      
      if (clientType === 'existing') {
        const client = clientSessions[selectedClient];
        if (!client) {
          toast.error('Invalid client selection');
          return;
        }
        clientName = client.client_name;
        clientEmail = client.client_email;
        clientPhone = client.client_phone || '';
      } else {
        clientName = `${newClientData!.firstName} ${newClientData!.lastName}`;
        clientEmail = newClientData!.email;
        clientPhone = newClientData!.phone;
      }
      
      const response = await fetch('/api/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientName,
          clientEmail,
          clientPhone,
          eventType: selectedEvent,
          dateTime: selectedTimeSlot.toISOString(),
          sessionNumber: 1,
          totalSessions: 1,
          amount: 0, // Admin-created sessions are free
          status: 'completed',
          clientTimezone: clientTimezone
        }),
      });

      if (response.ok) {
        toast.success('Session created successfully!');
        onSessionCreated();
        onClose();
        // Reset form
        setSelectedClient('');
        setSelectedEvent('');
        setSelectedDate(null);
        setSelectedTimeSlot(null);
        setBusySlots([]);
        setAvailableSlots([]);
        setClientType('existing');
        setNewClientData(null);
        setShowNewClientModal(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast.error('Failed to create session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form when closing
      setSelectedClient('');
      setSelectedEvent('');
      setSessionDate('');
      setStartTime('');
      setEndTime('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Selection */}
          <div className="space-y-2">
            <Label htmlFor="event">Select Event Type</Label>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an event type" />
              </SelectTrigger>
              <SelectContent>
                {localizedEvents.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name} - {event.duration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Client Type Selection */}
          <div className="space-y-2">
            <Label>Client</Label>
            <div className="flex gap-4 mb-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="existing"
                  checked={clientType === 'existing'}
                  onChange={(e) => setClientType(e.target.value as 'existing' | 'new')}
                  className="mr-2"
                />
                Existing Client
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="new"
                  checked={clientType === 'new'}
                  onChange={(e) => setClientType(e.target.value as 'existing' | 'new')}
                  className="mr-2"
                />
                New Client
              </label>
            </div>

            {clientType === 'existing' ? (
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.client_email} value={client.client_email}>
                      {client.client_name} ({client.client_email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="space-y-2">
                {newClientData ? (
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-sm font-medium">{newClientData.firstName} {newClientData.lastName}</p>
                    <p className="text-sm text-gray-600">{newClientData.email}</p>
                    <p className="text-sm text-gray-600">{newClientData.phone}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewClientModal(true)}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit Client Info
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewClientModal(true)}
                    className="w-full border-dashed flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add New Client
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Date and Time Selection */}
          <div className="space-y-2">
            <Label>Date & Time</Label>
            <div className="space-y-4">
              {/* Calendar */}
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
              
              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Available Time Slots
                  </h4>
                  {isLoadingSlots ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : slotsError ? (
                    <p className="text-red-600 text-sm">{slotsError}</p>
                  ) : availableSlots.length === 0 ? (
                    <p className="text-gray-500 text-sm">No available time slots for this date.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                       {availableSlots.map((slot, index) => (
                         <Button
                           key={index}
                           type="button"
                           variant={selectedTimeSlot && selectedTimeSlot.getTime() === slot.utc.getTime() ? "default" : "outline"}
                           size="sm"
                           onClick={() => handleTimeSlotSelect(slot.utc)}
                           className="text-sm"
                         >
                           {slot.display}
                         </Button>
                       ))}
                     </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
      
      <NewClientModal
        isOpen={showNewClientModal}
        onClose={() => setShowNewClientModal(false)}
        onClientAdded={handleNewClientAdded}
      />
    </Dialog>
  );
}