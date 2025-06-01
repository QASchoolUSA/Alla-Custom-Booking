import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { eventName, clientName, clientEmail, clientPhone, date, startTime, endTime, quantity } = data;

    const { error } = await supabase.from('bookings').insert([
      {
        event_name: eventName,
        client_name: clientName,
        client_email: clientEmail,
        client_phone: clientPhone,
        date,
        start_time: startTime,
        end_time: endTime,
        quantity,
      }
    ]);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Failed to save booking' }, { status: 500 });
  }
}