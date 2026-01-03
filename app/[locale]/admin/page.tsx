'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SignInButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MoreHorizontal, Calendar, Link, CheckCircle, User, Mail, DollarSign, Plus } from 'lucide-react';
import { calculateSessionNumber, getSessionEventName, getLocalizedEvents } from '@/utils/eventTypes';
import { useTranslations, useLocale } from 'next-intl';
import CreateSessionModal from '@/components/CreateSessionModal';
import BookingCalendar from '../../../components/Booking/BookingCalendar';

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

export default function AdminDashboard() {
  const t = useTranslations('admin');
  const tEvents = useTranslations();
  const locale = useLocale();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarClient, setCalendarClient] = useState<Booking | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);

  useEffect(() => {
    fetch('/api/get-bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || []);
        setLoading(false);
      });
  }, []);

  // Group bookings by client and prioritize bookings with sessions > 0, then by latest date
  const clientSessions = useMemo(() => {
    const clientMap = new Map<string, Booking & { sessions: number }>();
    
    bookings.forEach(booking => {
      const key = booking.client_email;
      const existing = clientMap.get(key);
      const bookingSessions = booking.sessions !== undefined ? booking.sessions : (booking.quantity || 1);
      
      if (!existing) {
        clientMap.set(key, { ...booking, sessions: bookingSessions });
      } else {
        // Prioritize bookings with sessions > 0, then by latest date
        const shouldReplace = 
          (bookingSessions > 0 && existing.sessions === 0) ||
          (bookingSessions === existing.sessions && new Date(booking.date) > new Date(existing.date));
        
        if (shouldReplace) {
          clientMap.set(key, { ...booking, sessions: bookingSessions });
        }
      }
    });
    
    return Array.from(clientMap.values()).sort((a, b) => {
      // Sort by sessions (descending), then by date (descending)
      if (a.sessions !== b.sessions) {
        return b.sessions - a.sessions;
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }).reduce((acc, booking) => {
      acc[booking.client_email] = booking;
      return acc;
    }, {} as Record<string, Booking & { sessions: number }>);
  }, [bookings]);

  const handleScheduleNextSession = useCallback((client: Booking) => {
    setCalendarClient(client);
    setShowCalendar(true);
  }, []);
  
  const handleGenerateBookingLink = useCallback(async (client: Booking) => {
    const res = await fetch('/api/generate-booking-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_email: client.client_email }),
    });
    const data = await res.json();
    if (data.success && data.link) {
      navigator.clipboard.writeText(data.link);
      alert('Booking link copied to clipboard!');
    } else {
      alert('Failed to generate booking link: ' + (data.error || 'Unknown error'));
    }
  }, []);

  // Memoize localized events to prevent recalculation on every render
  const localizedEvents = useMemo(() => getLocalizedEvents(tEvents), [tEvents]);

  // Helper function to get localized event name by ID
  const getLocalizedEventName = useCallback((eventId: string) => {
    const event = localizedEvents.find(e => e.id === eventId);
    return event ? event.name : eventId;
  }, [localizedEvents]);

  const handleCreateSession = useCallback(() => {
    setShowCreateSession(true);
  }, []);

  const handleSessionCreated = useCallback(async () => {
    // Refresh bookings when a session is created
    const bookingsResponse = await fetch('/api/get-bookings');
    const bookingsData = await bookingsResponse.json();
    setBookings(bookingsData.bookings || []);
  }, []);
  return (
    <div className="min-h-screen bg-neutral-50 pt-24 md:pt-32 pb-16 flex flex-col items-center px-2 sm:px-4 md:px-8">
      <SignedIn>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary-700 text-center sm:text-left">
            {t('dashboard')}
          </h1>
          <Button 
            onClick={handleCreateSession}
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            data-testid="create-session-button"
          >
            <Plus className="h-4 w-4" />
            {t('createSession')}
          </Button>
        </div>
        <div className="w-full max-w-6xl" data-testid="admin-dashboard-container">
          <Card data-testid="admin-dashboard-card">
            <CardHeader data-testid="admin-dashboard-header">
              <CardTitle data-testid="admin-dashboard-title">{t('bookingsOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8" data-testid="loading-spinner">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading bookings...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="stats-cards-container">
                    <Card data-testid="total-clients-card">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none" data-testid="total-clients-label">{t('totalClients')}</p>
                            <p className="text-2xl font-bold" data-testid="total-clients-count">{Object.values(clientSessions).length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card data-testid="money-received-card">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none" data-testid="money-received-label">{t('moneyReceived')}</p>
                            <p className="text-2xl font-bold" data-testid="money-received-amount">
                              ${bookings.reduce((sum, booking) => {
                                // Assuming each booking has a standard price based on event type
                                const price = booking.event_name.includes('Individual') ? 150 : 
                                             booking.event_name.includes('Couple') ? 200 : 100;
                                return sum + (price * (booking.quantity || 1));
                              }, 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card data-testid="this-month-card">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none" data-testid="this-month-label">{t('thisMonth')}</p>
                            <p className="text-2xl font-bold" data-testid="this-month-count">{bookings.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card data-testid="completed-card">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none" data-testid="completed-label">{t('completed')}</p>
                            <p className="text-2xl font-bold" data-testid="completed-count">
                              {Object.values(clientSessions).filter(client => client.sessions === 0).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Table */}
                  <div className="rounded-md border" data-testid="bookings-table-container">
                    <Table data-testid="bookings-table">
                      <TableHeader data-testid="table-header">
                        <TableRow>
                          <TableHead className="w-1/3 sm:w-1/4" data-testid="client-header">{t('client')}</TableHead>
                          <TableHead className="hidden md:table-cell w-1/6" data-testid="event-type-header">{t('eventType')}</TableHead>
                          <TableHead className="hidden lg:table-cell w-1/6" data-testid="last-session-header">{t('lastSession')}</TableHead>
                          <TableHead className="w-1/3 sm:w-1/4" data-testid="sessions-header">{t('sessions')}</TableHead>
                          <TableHead className="text-right w-1/6" data-testid="actions-header">{t('actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.values(clientSessions).length === 0 ? (
                          <TableRow data-testid="no-bookings-row">
                            <TableCell colSpan={5} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2" data-testid="no-bookings-message">
                                <User className="h-8 w-8 text-muted-foreground" />
                                <p className="text-muted-foreground">{t('noBookingsFound')}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          Object.values(clientSessions).map((client) => (
                            <TableRow key={client.client_email} data-testid={`client-row-${client.client_email}`}>
                              <TableCell data-testid={`client-info-${client.client_email}`}>
                                <div className="space-y-1">
                                  <p className="font-medium leading-none" data-testid={`client-name-${client.client_email}`}>{client.client_name || 'Unknown'}</p>
                                  <p className="text-sm text-muted-foreground flex items-center" data-testid={`client-email-${client.client_email}`}>
                                    <Mail className="h-3 w-3 mr-1" />
                                    {client.client_email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell" data-testid={`event-type-${client.client_email}`}>
                                <Badge variant="outline" data-testid={`event-badge-${client.client_email}`}>{getLocalizedEventName(client.event_name)}</Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell" data-testid={`last-session-${client.client_email}`}>
                                <p className="text-sm text-muted-foreground" data-testid={`last-session-date-${client.client_email}`}>
                                  {new Date(client.date).toLocaleDateString()}
                                </p>
                              </TableCell>
                              <TableCell data-testid={`sessions-${client.client_email}`}>
                                <div className="space-y-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs" data-testid={`booked-sessions-badge-${client.client_email}`}>
                                        Booked: {client.quantity || 1}
                                      </Badge>
                                      <Badge 
                                        variant={client.sessions > 0 ? "default" : "secondary"}
                                        className={`text-xs ${
                                          client.sessions > 0 
                                            ? "bg-green-100 text-green-800 border-green-300" 
                                            : "bg-gray-100 text-gray-600 border-gray-300"
                                        }`}
                                        data-testid={`left-sessions-badge-${client.client_email}`}
                                      >
                                        Left: {client.sessions}
                                      </Badge>
                                    </div>
                                  </div>
                                  {/* Mobile-only: Show event type and date */}
                                  <div className="md:hidden space-y-1" data-testid={`mobile-info-${client.client_email}`}>
                                    <Badge variant="outline" className="text-xs" data-testid={`mobile-event-badge-${client.client_email}`}>{getLocalizedEventName(client.event_name)}</Badge>
                                    <p className="text-xs text-muted-foreground" data-testid={`mobile-date-${client.client_email}`}>
                                      {new Date(client.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right" data-testid={`actions-${client.client_email}`}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 sm:h-9 sm:w-9" data-testid={`actions-menu-trigger-${client.client_email}`}>
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48" data-testid={`actions-menu-content-${client.client_email}`}>
                                    <DropdownMenuLabel className="text-xs sm:text-sm" data-testid={`actions-label-${client.client_email}`}>{t('actions')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleScheduleNextSession(client)}
                                      disabled={client.sessions <= 0}
                                      className="cursor-pointer text-xs sm:text-sm"
                                      data-testid={`schedule-session-${client.client_email}`}
                                    >
                                      <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="truncate">{t('scheduleNextSession')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleGenerateBookingLink(client)}
                                      className="cursor-pointer text-xs sm:text-sm"
                                      data-testid={`generate-booking-link-${client.client_email}`}
                                    >
                                      <Link className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="truncate">{t('generateBookingLink')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={async () => {
                                        try {
                                          setLoading(true);
                                          const response = await fetch('/api/decrement-session', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ client_email: client.client_email }),
                                          });
                                          
                                          if (response.ok) {
                                            // Refresh the bookings data with cache busting
                                            const bookingsResponse = await fetch('/api/get-bookings?' + new Date().getTime());
                                            const data = await bookingsResponse.json();
                                            setBookings(data.bookings || []);
                                            
                                            // Show success toast
                                            toast.success("Session has been marked as completed successfully.");
                                          } else {
                                            throw new Error('Failed to mark session as completed');
                                          }
                                        } catch {
                                          toast.error("Failed to mark session as completed. Please try again.");
                                        } finally {
                                          setLoading(false);
                                        }
                                      }}
                                      disabled={client.sessions <= 0}
                                      className="cursor-pointer text-red-600 text-xs sm:text-sm"
                                      data-testid={`mark-as-completed-${client.client_email}`}
                                    >
                                      <CheckCircle className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="truncate">{t('markAsCompleted')}</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen" data-testid="signed-out-container">
          <h2 className="text-xl font-semibold mb-4" data-testid="admin-access-required-title">{t('adminAccessRequired')}</h2>
          <SignInButton>
            <button className="px-4 py-2 bg-black text-white rounded hover:bg-primary-700 transition" data-testid="sign-in-button">
              {t('signInToAccess')}
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      {showCalendar && calendarClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" data-testid="calendar-modal-overlay">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative" data-testid="calendar-modal">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowCalendar(false)}
              data-testid="calendar-modal-close-button"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4" data-testid="calendar-modal-title">{t('scheduleNextSessionFor', { clientName: calendarClient.client_name })}</h2>
            <BookingCalendar
              data-testid="booking-calendar-component"
              event={{
                id: calendarClient.id,
                name: calendarClient.event_name,
                price: 0,
                type: "admin-session",
                sessions: calendarClient.sessions || 1
              }}
              onBack={() => setShowCalendar(false)}
              onDateTimeSelected={async (dateTime) => {
                // Calculate end time (1 hour after start time)
                const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000);
                
                // Calculate session number for package deals
                const originalQuantity = calendarClient.quantity || 1;
                const remainingSessions = calendarClient.sessions || 0;
                const sessionNumber = calculateSessionNumber(originalQuantity, remainingSessions);
                // Get locale from URL params
                const locale = window.location.pathname.split('/')[1] || 'ru';
                const localizedEventName = getLocalizedEventName(calendarClient.event_name);
                const sessionEventName = getSessionEventName(localizedEventName, originalQuantity, sessionNumber, locale);
                
                try {
                  const response = await fetch('/api/add-to-calendar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      eventName: sessionEventName,
                      startTime: dateTime.toISOString(),
                      endTime: endTime.toISOString(),
                      customerName: calendarClient.client_name,
                      customerEmail: calendarClient.client_email,
                      customerPhone: calendarClient.client_phone || ''
                    }),
                  });
                  
                  if (response.ok) {
                     console.log('Calendar event created successfully');
                     
                     // Decrement session count after successful booking
                     await fetch('/api/decrement-session', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify({ client_email: calendarClient.client_email }),
                     });
                     
                     // Refresh bookings to show updated session count
                     const bookingsResponse = await fetch('/api/get-bookings');
                     if (bookingsResponse.ok) {
                       const bookingsData = await bookingsResponse.json();
                       setBookings(bookingsData.bookings || []);
                     }
                   } else {
                     const errorData = await response.json();
                     console.error('Failed to create calendar event:', errorData);
                   }
                } catch (error) {
                  console.error('Error creating calendar event:', error);
                }
                
                setShowCalendar(false);
              }}
            />
          </div>
        </div>
      )}
      
      {/* Create Session Modal */}
      {showCreateSession && (
        <CreateSessionModal
           isOpen={showCreateSession}
           onClose={() => setShowCreateSession(false)}
           onSessionCreated={handleSessionCreated}
           clientSessions={clientSessions}
           locale={locale}
         />
      )}
    </div>
  );
}