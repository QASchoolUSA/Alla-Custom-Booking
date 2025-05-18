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
    const { eventName, startTime, endTime, customerName, customerEmail } = await request.json();
    
    // Validate required fields
    if (!eventName || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format start and end times as ISO strings if they aren't already
    const startDateTime = new Date(startTime).toISOString();
    const endDateTime = new Date(endTime).toISOString();

    // Create event object for Google Calendar
    const event = {
      summary: `${eventName} - ${customerName || 'Customer'}`,
      description: `Booking for ${eventName}\nCustomer: ${customerName || 'N/A'}\nEmail: ${customerEmail || 'N/A'}`,
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
    };

    // Add event to Google Calendar
    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID!,
      requestBody: event,
    });

    return NextResponse.json({ 
      success: true, 
      eventId: response.data.id,
      htmlLink: response.data.htmlLink // Link to view the event in Google Calendar
    });
  } catch (error) {
    console.error('Error adding event to Google Calendar:', error);
    return NextResponse.json(
      { error: 'Failed to add event to Google Calendar' },
      { status: 500 }
    );
  }
}