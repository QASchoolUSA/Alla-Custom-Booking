// app/api/google-calendar-availability/route.ts
import { google, calendar_v3 } from 'googleapis'; // Import specific types
import { NextRequest, NextResponse } from 'next/server';

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
        // GOOGLE WORKSPACE DOMAIN-WIDE DELEGATION (ACTIVE)
        // Service account with Domain-Wide Delegation for calendar access
        const serviceAccountAuth = new google.auth.JWT(
          process.env.GOOGLE_CLIENT_EMAIL,
          undefined,
          process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          ['https://www.googleapis.com/auth/calendar'],
          process.env.GOOGLE_DOMAIN_USER_EMAIL // Domain-Wide Delegation
        );

        const calendar = google.calendar({ version: 'v3', auth: serviceAccountAuth });

        const timeMinDate = new Date(date);
        timeMinDate.setUTCHours(0, 0, 0, 0); // Using UTC for consistency

        const timeMaxDate = new Date(date);
        timeMaxDate.setUTCHours(23, 59, 59, 999); // Using UTC

        const params: calendar_v3.Params$Resource$Freebusy$Query = {
            requestBody: {
                timeMin: timeMinDate.toISOString(),
                timeMax: timeMaxDate.toISOString(),
                items: [{ id: process.env.GOOGLE_CALENDAR_ID || 'primary' }],
                timeZone: 'UTC',
            },
        };

        const response = await retryWithBackoff(async () => {
            return await calendar.freebusy.query(params);
        });

        const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
        const busySlotsResult = response.data.calendars?.[calendarId]?.busy;

        return NextResponse.json({ 
            busySlots: busySlotsResult as BusySlot[] || []
        });

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