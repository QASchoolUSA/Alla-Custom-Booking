import { NextResponse } from 'next/server';
import { google } from 'googleapis';

// Initialize Google Calendar API with OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Set credentials using refresh token
oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    console.log('Calendar event request data:', requestData);
    
    const { eventName, startTime, endTime, customerName, customerEmail, customerPhone } = requestData;
    
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

    // Create event object for Google Calendar
    const event = {
      summary: `${eventName} - ${customerName || 'Customer'}`,
      description: `Booking for ${eventName}\nCustomer: ${customerName || 'N/A'}\nEmail: ${customerEmail || 'N/A'}\nPhone: ${customerPhone || 'N/A'}`,
      start: {
        dateTime: startDateTime,
        timeZone: 'UTC', // Adjust to your timezone
      },
      end: {
        dateTime: endDateTime,
        timeZone: 'UTC', // Adjust to your timezone
      },
      // Optional: Add reminders, attendees, etc.
      reminders: {
        useDefault: true,
      },
      // Add customer as an attendee if email is provided
      ...(customerEmail ? {
        attendees: [
          { email: customerEmail, displayName: customerName }
        ]
      } : {})
    };

    // Log the event being created
    console.log('Creating calendar event:', {
      summary: event.summary,
      start: startDateTime,
      end: endDateTime
    });

    // Add event to Google Calendar
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: event,
      sendUpdates: 'all', // Send email notifications to attendees
    });

    return NextResponse.json({ 
      success: true, 
      eventId: response.data.id,
      htmlLink: response.data.htmlLink // Link to view the event in Google Calendar
    });
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add event to Google Calendar', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}