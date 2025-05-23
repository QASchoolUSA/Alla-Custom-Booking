// app/api/google-calendar-availability/route.ts
import { google, calendar_v3 } from 'googleapis'; // Import specific types
import { NextRequest, NextResponse } from 'next/server';

// Define a type for the busy slots we expect from Google Calendar API
interface BusySlot {
    start?: string | null; // ISO date string
    end?: string | null;   // ISO date string
}

// Define the expected structure of our API response
interface AvailabilityResponse {
    busySlots?: BusySlot[];
    message?: string;
    details?: string;
}

// Define a more specific error type
interface GoogleApiError extends Error {
    response?: {
        data?: {
            error?: {
                message?: string;
            };
        };
    };
}

export async function GET(request: NextRequest): Promise<NextResponse<AvailabilityResponse>> {

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Expecting date in 'YYYY-MM-DD' format

    if (!date) {
        return NextResponse.json({ message: 'Date query parameter is required' }, { status: 400 });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
        );

        oauth2Client.setCredentials({
            refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
        });

        await oauth2Client.getAccessToken();

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const timeMinDate = new Date(date);
        timeMinDate.setUTCHours(0, 0, 0, 0); // Using UTC for consistency

        const timeMaxDate = new Date(date);
        timeMaxDate.setUTCHours(23, 59, 59, 999); // Using UTC

        const params: calendar_v3.Params$Resource$Freebusy$Query = {
            requestBody: {
                timeMin: timeMinDate.toISOString(),
                timeMax: timeMaxDate.toISOString(),
                items: [{ id: process.env.GOOGLE_CALENDAR_ID || 'primary' }],
                timeZone: 'UTC', // Explicitly state you are sending UTC times
            },
        };

        const response = await calendar.freebusy.query(params);

        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
        const busySlotsResult = response.data.calendars?.[calendarId]?.busy;


        return NextResponse.json({ busySlots: busySlotsResult as BusySlot[] || [] });

    } catch (error: unknown) {
        // Type guard to safely access error properties
        const apiError = error as GoogleApiError;
        
        console.error('Error fetching Google Calendar availability:', apiError.message);
        console.error('Error details:', apiError.response?.data || apiError);
        
        let errorMessage = 'Failed to fetch availability.';
        if (apiError.response?.data?.error?.message) {
            errorMessage += ` Google API Error: ${apiError.response.data.error.message}`;
        }
        
        return NextResponse.json({ message: errorMessage, details: apiError.message }, { status: 500 });
    }
}