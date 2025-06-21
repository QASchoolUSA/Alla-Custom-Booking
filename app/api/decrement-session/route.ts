import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { client_email } = await req.json();

    if (!client_email) {
      return NextResponse.json({ error: 'Missing client_email' }, { status: 400 });
    }

    // Find the latest booking for this client with sessions left
    const { data: bookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('client_email', client_email)
      .gt('sessions', 0)
      .order('date', { ascending: false });

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({ error: 'No sessions left for this client.' }, { status: 404 });
    }

    // Decrement the sessions of the most recent booking with sessions left
    const booking = bookings[0];
    const newSessions = Math.max(0, (booking.sessions || 1) - 1);

    const { error: updateError } = await supabase
      .from('bookings')
      .update({ sessions: newSessions })
      .eq('id', booking.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, newSessions });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
}