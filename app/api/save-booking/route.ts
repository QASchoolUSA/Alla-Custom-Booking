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
      is_package_booking 
    } = data;

    if (is_package_booking && booking_token) {
      // For package bookings with tokens, create a new appointment and decrement sessions
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

      // Create the appointment booking
      // Extract the base event name without session numbering
      const baseEventName = event_name.split(' - ')[0]; // Remove existing session numbering
      const sessionEventName = getSessionEventName(
        baseEventName, 
        originalBooking.quantity || 1, 
        (originalBooking.quantity - originalBooking.sessions + 1), 
        locale || 'en'
      );

      const { error: insertError } = await supabase.from('bookings').insert([
        {
          event_name: baseEventName, // Store base event name for admin display
          client_name,
          client_email,
          client_phone,
          date,
          start_time,
          end_time,
          quantity: 1, // Single appointment
          sessions: 0, // Completed appointment
          booking_token: null, // No token for individual appointments
        }
      ]);

      if (insertError) {
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }

      // Decrement sessions from the original booking
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ sessions: originalBooking.sessions - 1 })
        .eq('booking_token', booking_token);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      // Add event to Google Calendar
      try {
        const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/add-to-calendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: sessionEventName,
            startTime: start_time,
            endTime: end_time,
            customerName: client_name,
            customerEmail: client_email,
            customerPhone: client_phone
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
      const sessionEventName = getSessionEventName(event_name, quantity || 1, 1, locale || 'en');

      const { error } = await supabase.from('bookings').insert([
        {
          event_name: event_name, // Store base event name for admin display
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
        const calendarResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/add-to-calendar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventName: sessionEventName,
            startTime: start_time,
            endTime: end_time,
            customerName: client_name,
            customerEmail: client_email,
            customerPhone: client_phone
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