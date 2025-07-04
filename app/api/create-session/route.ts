import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionEventName } from '@/utils/eventTypes';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      eventType, 
      dateTime, 
      sessionNumber, 
      totalSessions, 
      amount, 
      status,
      clientTimezone 
    } = data;

    // Validate required fields
    if (!clientName || !clientEmail || !eventType || !dateTime) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    // Parse dateTime and calculate end time (assuming 1 hour sessions)
    const startDateTime = new Date(dateTime);
    const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // Add 1 hour
    
    const date = startDateTime.toISOString().split('T')[0];
    const start_time = startDateTime.toISOString();
    const end_time = endDateTime.toISOString();
    const event_name = getSessionEventName(eventType);

    // Create the session booking directly in the database
    const { error: insertError } = await supabase.from('bookings').insert([
      {
        event_name,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone || '',
        date,
        start_time,
        end_time,
        quantity: 1, // Single session
        sessions: 0, // Completed session (no payment required)
        booking_token: null, // No token for admin-created sessions
      }
    ]);

    if (insertError) {
      return NextResponse.json({ 
        success: false, 
        error: insertError.message 
      }, { status: 500 });
    }

    // Add event to Google Calendar
    try {
      const sessionEventName = getSessionEventName(event_name, 1, 1, 'ru');
      
      const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/add-to-calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: sessionEventName,
          startTime: start_time,
          endTime: end_time,
          customerName: clientName,
          customerEmail: clientEmail,
          customerPhone: clientPhone || '',
          clientTimezone: clientTimezone
        })
      });

      if (!calendarResponse.ok) {
        const errorData = await calendarResponse.json().catch(() => ({}));
        if (calendarResponse.status === 429 || errorData.quotaExceeded) {
          console.warn('Google Calendar API quota exceeded - session created successfully without calendar event');
        } else {
          console.error('Failed to add event to Google Calendar:', calendarResponse.status, errorData);
        }
        // Don't fail the session creation if calendar creation fails
      } else {
        console.log('Calendar event created successfully for admin session');
      }
    } catch (calendarError) {
      console.error('Error adding event to Google Calendar:', calendarError);
      // Don't fail the session creation if calendar creation fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to create session' 
    }, { status: 500 });
  }
}