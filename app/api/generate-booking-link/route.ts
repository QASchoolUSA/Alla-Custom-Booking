import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { client_email } = await req.json();
    if (!client_email) {
      return NextResponse.json({ success: false, error: 'Missing client_email' }, { status: 400 });
    }

    // Try to find an existing booking with a token for this client
    const { data: bookings } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_email', client_email)
      .not('booking_token', 'is', null)
      .limit(1);

    let booking_token;
    if (bookings && bookings.length > 0) {
      booking_token = bookings[0].booking_token;
    } else {
      // Generate a new token
      booking_token = randomBytes(16).toString('hex');
      // Attach token to the latest package booking for this client
      const { data: latest } = await supabase
        .from('bookings')
        .select('*')
        .eq('client_email', client_email)
        .order('date', { ascending: false })
        .limit(1);
      if (!latest || latest.length === 0) {
        return NextResponse.json({ success: false, error: 'No booking found for this client.' }, { status: 404 });
      }
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ booking_token })
        .eq('id', latest[0].id);
      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }
    }
    // Construct the booking link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const link = `${baseUrl}/booking/package/${booking_token}`;
    return NextResponse.json({ success: true, link });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}