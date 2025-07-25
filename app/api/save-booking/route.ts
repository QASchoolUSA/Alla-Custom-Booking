import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionEventName } from '@/utils/eventTypes';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      event_name, 
      client_name, 
      client_email, 
      client_phone, 
      date, 
      start_time, 
      end_time, 
      quantity, 
      locale, 
      booking_token, 
      is_package_booking,
      clientTimezone 
    } = data;
    
    // Debug logging for save-booking




    if (is_package_booking && booking_token) {
      // For package bookings with tokens, update the existing booking with appointment details
      // First, find the original booking to get the current sessions count
      const { data: originalBooking, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_token', booking_token)
        .single();

      if (fetchError || !originalBooking) {
        return NextResponse.json({ success: false, error: 'Original booking not found' }, { status: 404 });
      }

      if (originalBooking.sessions <= 0) {
        return NextResponse.json({ success: false, error: 'No sessions remaining' }, { status: 400 });
      }

      // Extract the base event name without session numbering
      const baseEventName = event_name.split(' - ')[0]; // Remove existing session numbering
      const sessionEventName = getSessionEventName(
        baseEventName, 
        originalBooking.quantity || 1, 
        (originalBooking.quantity - originalBooking.sessions + 1), 
        locale || 'ru'
      );

      // Update the existing booking with appointment details and decrement sessions
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          date,
          start_time,
          end_time,
          sessions: originalBooking.sessions - 1
        })
        .eq('booking_token', booking_token);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      // Add event to Google Calendar
      try {
        // Dynamically determine the base URL from request headers
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
        
        const calendarResponse = await fetch(`${baseUrl}/api/add-to-calendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: sessionEventName,
            startTime: start_time,
            endTime: end_time,
            customerName: client_name,
            customerEmail: client_email,
            customerPhone: client_phone,
            clientTimezone: clientTimezone
          })
        });

        if (!calendarResponse.ok) {
          const errorData = await calendarResponse.json().catch(() => ({}));
          if (calendarResponse.status === 429 || errorData.quotaExceeded) {
            console.warn('Google Calendar API quota exceeded - package booking saved successfully without calendar event');
          } else {
            console.error('Failed to add event to Google Calendar:', calendarResponse.status, errorData);
          }
          // Don't fail the booking if calendar creation fails
        } else {
          console.log('Calendar event created successfully for package booking');
        }
      } catch (calendarError) {
        console.error('Error adding event to Google Calendar:', calendarError);
        // Don't fail the booking if calendar creation fails
      }

      return NextResponse.json({ success: true });
    } else {
      // Original logic for regular bookings
      const sessionEventName = getSessionEventName(event_name, quantity || 1, 1, locale || 'ru');

      const { error } = await supabase.from('bookings').insert([
        {
          event_name: event_name, // Store event name
          client_name,
          client_email,
          client_phone,
          date,
          start_time,
          end_time,
          quantity,
          sessions: quantity || 1, // Initialize sessions with the same value as quantity
        }
      ]);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      // Add event to Google Calendar for regular bookings too
      try {
        // Dynamically determine the base URL from request headers
        const host = request.headers.get('host');
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
        
        const calendarResponse = await fetch(`${baseUrl}/api/add-to-calendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: sessionEventName,
            startTime: start_time,
            endTime: end_time,
            customerName: client_name,
            customerEmail: client_email,
            customerPhone: client_phone,
            clientTimezone: clientTimezone
          })
        });

        if (!calendarResponse.ok) {
          const errorData = await calendarResponse.json().catch(() => ({}));
          if (calendarResponse.status === 429 || errorData.quotaExceeded) {
            console.warn('Google Calendar API quota exceeded - regular booking saved successfully without calendar event');
          } else {
            console.error('Failed to add event to Google Calendar:', calendarResponse.status, errorData);
          }
          // Don't fail the booking if calendar creation fails
        } else {
          console.log('Calendar event created successfully for regular booking');
        }
      } catch (calendarError) {
        console.error('Error adding event to Google Calendar:', calendarError);
        // Don't fail the booking if calendar creation fails
      }

      return NextResponse.json({ success: true });
    }
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to save booking' }, { status: 500 });
  }
}