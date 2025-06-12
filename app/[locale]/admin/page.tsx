'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
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
import BookingCalendar from '@/components/Booking/BookingCalendar';

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  event_name: string;
  date: string;
  start_time: string;
  end_time: string;
  quantity?: number;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarClient, setCalendarClient] = useState<Booking | null>(null);
  // Removed unused bookingLink state

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
          Admin Dashboard
        </h1>
        <div className="w-full max-w-6xl">
          <Card>
            <CardHeader>
              <CardTitle>Bookings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Loading...</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[140px]">Client Name</TableHead>
                        <TableHead className="min-w-[180px]">Email</TableHead>
                        <TableHead className="min-w-[160px]">Event</TableHead>
                        <TableHead className="min-w-[110px]">Date</TableHead>
                        <TableHead className="min-w-[120px]">Sessions Left</TableHead>
                        <TableHead className="min-w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.values(clientSessions).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                            No bookings found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        Object.values(clientSessions).map((client, idx) => (
                          <TableRow
                            key={client.client_email}
                            className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <TableCell className="font-medium">{client.client_name || '-'}</TableCell>
                            <TableCell>{client.client_email || '-'}</TableCell>
                            <TableCell>{client.event_name || '-'}</TableCell>
                            <TableCell>{client.date || '-'}</TableCell>
                            <TableCell>{client.sessions}</TableCell>
                            <TableCell>
                              <button
                                className="px-3 py-1 bg-black text-white rounded hover:bg-primary-700 transition mr-2"
                                onClick={() => handleScheduleNextSession(client)}
                                disabled={client.sessions <= 0}
                              >
                                Schedule Next Session
                              </button>
                              <button
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                                onClick={() => handleGenerateBookingLink(client)}
                              >
                                Generate Booking Link
                              </button>
                              <button
                                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-primary-700 transition mt-2"
                                onClick={async () => {
                                  await fetch('/api/decrement-session', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ client_email: client.client_email }),
                                  });
                                  setLoading(true);
                                  await fetch('/api/get-bookings')
                                    .then(res => res.json())
                                    .then(data => {
                                      setBookings(data.bookings || []);
                                      setLoading(false);
                                    });
                                }}
                                disabled={client.sessions <= 0}
                              >
                                Mark as Completed
                              </button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </SignedIn>
      <SignedOut>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-xl font-semibold mb-4">Admin Access Required</h2>
          <SignInButton>
            <button className="px-4 py-2 bg-black text-white rounded hover:bg-primary-700 transition">
              Sign In to Access Admin
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
            <h2 className="text-xl font-bold mb-4">Schedule Next Session for {calendarClient.client_name}</h2>
            <BookingCalendar
              event={{
                id: calendarClient.id,
                name: calendarClient.event_name,
                price: 0
              }}
              onDateTimeSelected={async (dateTime) => {
                await fetch('/api/add-to-calendar', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    client_email: calendarClient.client_email,
                    event_name: calendarClient.event_name,
                    date: dateTime.toISOString().split('T')[0],
                    start_time: dateTime.toISOString(),
                  }),
                });
                setShowCalendar(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}