import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Helper function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: unknown) {
      const isGoogleApiError = (err: unknown): err is { code: number; message?: string } => {
        return typeof err === 'object' && err !== null && 'code' in err;
      };
      
      if (isGoogleApiError(error) && error.code === 403 && (error.message?.includes('usage limits exceeded') || error.message?.includes('quotaExceeded') || error.message?.includes('Calendar usage limits exceeded')) && i < maxRetries - 1) {
        const backoffTime = Math.min(1000 * Math.pow(2, i) + Math.random() * 1000, 30000);
        console.log(`Rate limited, retrying in ${backoffTime}ms... (attempt ${i + 1}/${maxRetries})`);
        await delay(backoffTime);
        continue;
      }
      throw error;
    }
  }
  throw new Error('All retry attempts failed');
};

// GOOGLE WORKSPACE DOMAIN-WIDE DELEGATION (ACTIVE)
// Service account with Domain-Wide Delegation to send calendar invitations
const serviceAccountAuth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/calendar'],
  process.env.GOOGLE_DOMAIN_USER_EMAIL // Domain-Wide Delegation - allows sending invites
);

// Get Calendar client
const getCalendarClient = async () => {
  await serviceAccountAuth.authorize();
  return google.calendar({ version: 'v3', auth: serviceAccountAuth });
};

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    console.log('Calendar event request data:', requestData);
    
    const { eventName, startTime, endTime, customerName, customerEmail, customerPhone, clientTimezone } = requestData;
    
    // More detailed validation with specific error messages
    const missingFields = [];
    if (!eventName) missingFields.push('eventName');
    if (!startTime) missingFields.push('startTime');
    if (!endTime) missingFields.push('endTime');
    
    if (missingFields.length > 0) {
      console.error(`Missing required fields for calendar event: ${missingFields.join(', ')}`);
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Use client timezone if provided, otherwise fallback to Europe/Kiev
    const timezone = clientTimezone || 'Europe/Kiev';

    // Validate date formats
    try {
      new Date(startTime).toISOString();
      new Date(endTime).toISOString();
    } catch (e) {
      console.error('Invalid date format:', e);
      return NextResponse.json(
        { success: false, error: 'Invalid date format for startTime or endTime. Must be valid dates.' },
        { status: 400 }
      );
    }

    // Format start and end times as ISO strings if they aren't already
    const startDateTime = new Date(startTime).toISOString();
    const endDateTime = new Date(endTime).toISOString();

    // Debug logging for attendee information
    console.log('Customer email for invite:', customerEmail);
    console.log('Customer name for invite:', customerName);
    console.log('Will add attendee:', !!customerEmail);

    // Create event object for Google Calendar
    const event = {
      summary: `${eventName} - ${customerName || 'Customer'}`,
      description: `Booking for ${eventName}\nCustomer: ${customerName || 'N/A'}\nEmail: ${customerEmail || 'N/A'}\nPhone: ${customerPhone || 'N/A'}`,
      start: {
        dateTime: startDateTime,
        timeZone: timezone,
      },
      end: {
        dateTime: endDateTime,
        timeZone: timezone,
      },
      visibility: 'default', // Ensure event is visible to attendees
      transparency: 'opaque', // Show as busy time
      guestsCanInviteOthers: false,
      guestsCanModify: false,
      guestsCanSeeOtherGuests: false,
      reminders: {
        useDefault: true,
      },
      // Add customer as an attendee with Domain-Wide Delegation
      ...(customerEmail ? {
        attendees: [
          { 
            email: customerEmail, 
            displayName: customerName,
            responseStatus: 'needsAction' // Explicitly set response status
          }
        ]
      } : {})
    };

    // Log the final event object
    console.log('Final event object:', JSON.stringify(event, null, 2));

    // Log the event being created
    console.log('Creating calendar event:', {
      summary: event.summary,
      start: startDateTime,
      end: endDateTime
    });

    // Get calendar client and add event to Google Calendar with retry logic
    const calendar = await getCalendarClient();
    const response = await retryWithBackoff(async () => {
      return await calendar.events.insert({
        calendarId: process.env.GOOGLE_CALENDAR_ID!,
        requestBody: event,
        sendUpdates: 'all', // Send email notifications to attendees
        supportsAttachments: true // Better compatibility
      });
    });

    // Log the response to see if attendees were properly added
    console.log('Calendar event created successfully!');
    console.log('Event ID:', response.data.id);
    console.log('Event attendees in response:', response.data.attendees);
    console.log('Send updates setting:', 'all');
    console.log('HTML Link:', response.data.htmlLink);

    return NextResponse.json({ 
      success: true, 
      eventId: response.data.id,
      htmlLink: response.data.htmlLink, // Link to view the event in Google Calendar
      attendees: response.data.attendees // Include attendees in response for debugging
    });
  } catch (error: unknown) {
    console.error('Error adding event to Google Calendar:', error);
    
    const isGoogleApiError = (err: unknown): err is { code: number; message?: string } => {
      return typeof err === 'object' && err !== null && 'code' in err;
    };
    
    // Handle specific Google Calendar API errors
    if (isGoogleApiError(error) && error.code === 403) {
      if (error.message?.includes('usage limits exceeded') || error.message?.includes('quotaExceeded')) {
        console.warn('Google Calendar API quota exceeded - booking will continue without calendar event');
        return NextResponse.json(
          { 
            success: false, 
            error: 'Calendar quota exceeded', 
            details: 'Calendar event could not be created due to API limits. Booking was saved successfully.',
            quotaExceeded: true
          },
          { status: 429 } // Too Many Requests
        );
      } else {
        console.error('Google Calendar API permission error:', error.message);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Calendar permission error', 
            details: 'Insufficient permissions to create calendar event. Please check API configuration.',
            permissionError: true
          },
          { status: 403 }
        );
      }
    }
    
    // Handle other errors
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to add event to Google Calendar', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}