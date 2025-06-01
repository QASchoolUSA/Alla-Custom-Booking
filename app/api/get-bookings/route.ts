import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase.from('bookings').select('*').order('start_time', { ascending: true });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({ success: true, bookings: data }, { headers: { 'Cache-Control': 'no-store' } });
}