import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionEventName } from '@/utils/eventTypes';
import ruTranslations from '@/messages/ru.json';
import uaTranslations from '@/messages/ua.json';

// Mapping from kebab-case event IDs to camelCase translation keys
const eventIdToTranslationKey: Record<string, string> = {
  'initial-meeting': 'initialMeeting',
  'consultation-session': 'consultation',
  'therapy-session': 'therapy',
  'package-5': 'package5',
  'package-10': 'package10',
  'group-therapy': 'groupTherapy',
  'packageOf5': 'packageOf5',
  'packageOf10': 'packageOf10'
};

// Function to get localized event name using translation files
const getLocalizedEventName = (eventId: string, locale: string = 'ru'): string => {
  const translations = locale === 'ua' ? uaTranslations : ruTranslations;
  
  // Map kebab-case eventId to camelCase translation key
  const translationKey = eventIdToTranslationKey[eventId] || eventId;
  
  // Check if the translation key exists in the events translations
  if (translations.events && translations.events[translationKey as keyof typeof translations.events]) {
    return translations.events[translationKey as keyof typeof translations.events].name;
  }
  
  // Fallback to the original eventId if not found
  return eventId;
};

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { 
      clientName, 
      clientEmail, 
      clientPhone, 
      eventType, 
      dateTime, 
      /* sessionNumber,  // Removed unused variable */
      /* totalSessions,  // Removed unused variable */
      /* amount,         // Removed unused variable */
      /* status,         // Removed unused variable */
      clientTimezone,
      locale = 'ru'
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
    console.log('Debug - eventType:', eventType);
    console.log('Debug - locale:', locale);
    const localizedEventName = getLocalizedEventName(eventType, locale);
    console.log('Debug - localizedEventName:', localizedEventName);
    const event_name = getSessionEventName(localizedEventName, 1, 1, locale);
    console.log('Debug - final event_name:', event_name);

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
      const sessionEventName = event_name; // Already localized above
      
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
