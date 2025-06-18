'use client';

import React, { useEffect, useState } from 'react';
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
import { MoreHorizontal, Calendar, Link, CheckCircle, User, Mail, DollarSign } from 'lucide-react';
import BookingCalendar from '@/components/Booking/BookingCalendar';
import { calculateSessionNumber, getSessionEventName } from '@/utils/eventTypes';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

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
  const params = useParams();
  const locale = typeof params.locale === 'string' ? params.locale : Array.isArray(params.locale) ? params.locale[0] : 'en';
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarClient, setCalendarClient] = useState<Booking | null>(null);

  useEffect(() => {
    fetch('/api/get-bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data.bookings || []);
        setLoading(false);
      });
  }, []);

  // Group bookings by client and calculate sessions left
  const clientSessions = bookings.reduce((acc, booking) => {
    if (!acc[booking.client_email]) {
      acc[booking.client_email] = { ...booking, sessions: 0 };
    }
    acc[booking.client_email].sessions += booking.quantity || 1;
    return acc;
  }, {} as Record<string, Booking & { sessions: number }>);

  const handleScheduleNextSession = (client: Booking) => {
    setCalendarClient(client);
    setShowCalendar(true);
  };
  const handleGenerateBookingLink = async (client: Booking) => {
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
  };
  return (
    <div className="min-h-screen bg-neutral-50 pt-24 md:pt-32 pb-16 flex flex-col items-center px-2 sm:px-4 md:px-8">
      <SignedIn>
        <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-primary-700 text-center">
          {t('dashboard')}
        </h1>
        <div className="w-full max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle>{t('bookingsOverview')}</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading bookings...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Stats Cards */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{t('totalClients')}</p>
                            <p className="text-2xl font-bold">{Object.values(clientSessions).length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{t('moneyReceived')}</p>
                            <p className="text-2xl font-bold">
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
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{t('thisMonth')}</p>
                            <p className="text-2xl font-bold">{bookings.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{t('completed')}</p>
                            <p className="text-2xl font-bold">
                              {Object.values(clientSessions).filter(client => client.sessions === 0).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-1/3 sm:w-1/4">{t('client')}</TableHead>
                          <TableHead className="hidden md:table-cell w-1/6">{t('eventType')}</TableHead>
                          <TableHead className="hidden lg:table-cell w-1/6">{t('lastSession')}</TableHead>
                          <TableHead className="w-1/3 sm:w-1/4">{t('sessions')}</TableHead>
                          <TableHead className="text-right w-1/6">{t('actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.values(clientSessions).length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center">
                              <div className="flex flex-col items-center justify-center space-y-2">
                                <User className="h-8 w-8 text-muted-foreground" />
                                <p className="text-muted-foreground">{t('noBookingsFound')}</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          Object.values(clientSessions).map((client) => (
                            <TableRow key={client.client_email}>
                              <TableCell>
                                <div className="space-y-1">
                                  <p className="font-medium leading-none">{client.client_name || 'Unknown'}</p>
                                  <p className="text-sm text-muted-foreground flex items-center">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {client.client_email}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="hidden md:table-cell">
                                <Badge variant="outline">{client.event_name}</Badge>
                              </TableCell>
                              <TableCell className="hidden lg:table-cell">
                                <p className="text-sm text-muted-foreground">
                                  {new Date(client.date).toLocaleDateString()}
                                </p>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 space-y-1 sm:space-y-0">
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="outline" className="text-xs">
                                        Booked: {client.quantity || 1}
                                      </Badge>
                                      <Badge 
                                        variant={client.sessions > 0 ? "default" : "secondary"}
                                        className={`text-xs ${
                                          client.sessions > 0 
                                            ? "bg-green-100 text-green-800 border-green-300" 
                                            : "bg-gray-100 text-gray-600 border-gray-300"
                                        }`}
                                      >
                                        Left: {client.sessions}
                                      </Badge>
                                    </div>
                                  </div>
                                  {/* Mobile-only: Show event type and date */}
                                  <div className="md:hidden space-y-1">
                                    <Badge variant="outline" className="text-xs">{client.event_name}</Badge>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(client.date).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel className="text-xs sm:text-sm">{t('actions')}</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleScheduleNextSession(client)}
                                      disabled={client.sessions <= 0}
                                      className="cursor-pointer text-xs sm:text-sm"
                                    >
                                      <Calendar className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                                      <span className="truncate">{t('scheduleNextSession')}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => handleGenerateBookingLink(client)}
                                      className="cursor-pointer text-xs sm:text-sm"
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
                                            // Refresh the bookings data
                                            const bookingsResponse = await fetch('/api/get-bookings');
                                            const data = await bookingsResponse.json();
                                            setBookings(data.bookings || []);
                                            
                                            // Show success toast
                                            toast.success("Session has been marked as completed successfully.");
                                          } else {
                                            throw new Error('Failed to mark session as completed');
                                          }
                                        } catch (error) {
                                          toast.error("Failed to mark session as completed. Please try again.");
                                        } finally {
                                          setLoading(false);
                                        }
                                      }}
                                      disabled={client.sessions <= 0}
                                      className="cursor-pointer text-red-600 text-xs sm:text-sm"
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
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-xl font-semibold mb-4">{t('adminAccessRequired')}</h2>
          <SignInButton>
            <button className="px-4 py-2 bg-black text-white rounded hover:bg-primary-700 transition">
              {t('signInToAccess')}
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      {showCalendar && calendarClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-black"
              onClick={() => setShowCalendar(false)}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4">{t('scheduleNextSessionFor', { clientName: calendarClient.client_name })}</h2>
            <BookingCalendar
              event={{
                id: calendarClient.id,
                name: calendarClient.event_name,
                price: 0
              }}
              onDateTimeSelected={async (dateTime) => {
                // Calculate end time (1 hour after start time)
                const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000);
                
                // Calculate session number for package deals
                const originalQuantity = calendarClient.quantity || 1;
                const remainingSessions = calendarClient.sessions || 0;
                const sessionNumber = calculateSessionNumber(originalQuantity, remainingSessions);
                // Get locale from URL params
                const locale = window.location.pathname.split('/')[1] || 'en';
                const sessionEventName = getSessionEventName(calendarClient.event_name, originalQuantity, sessionNumber, locale);
                
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
    </div>
  );
}