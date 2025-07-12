// This is a suggested implementation - you'll need to adapt it to your actual data structure
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getSessionEventName, calculateSessionNumber } from '@/utils/eventTypes';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('-- [Received request body] --', body);
    console.log(body);
    const { amount, currency, eventName, eventId, quantity, sessionsCount, customerName, customerEmail, customerPhone, appointmentDate, startTime, endTime, locale = 'ru' } = body;
    // Get the base URL from the request headers to support dynamic domains
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'https';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    const successUrl = `${baseUrl}/${locale}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/${locale}/booking?canceled=true`;

    // Log the request data for debugging
    console.log('Checkout session request data:', {
      eventName,
      quantity,
      startTime,
      endTime,
      customerName,
      appointmentDate
    });

    // Calculate start and end times if not provided but appointmentDate is available
    let finalStartTime = startTime;
    let finalEndTime = endTime;
    
    if (!finalStartTime && appointmentDate) {
      // If we only have appointmentDate, use it as startTime
      finalStartTime = new Date(appointmentDate).toISOString();
      
      // Set endTime to be 1 hour after startTime if not provided
      if (!finalEndTime) {
        const endDate = new Date(appointmentDate);
        endDate.setHours(endDate.getHours() + 1);
        finalEndTime = endDate.toISOString();
      }
    }

    // Validate required fields
    if (!finalStartTime || !finalEndTime) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        missingFields: [
          !finalStartTime ? 'startTime' : null,
          !finalEndTime ? 'endTime' : null
        ].filter(Boolean)
      }, { status: 400 });
    }

    const sessionsCountValue = sessionsCount || quantity || 1;

    // Calculate session number for package deals
    let finalEventName = eventName;
    if (customerEmail && quantity && quantity > 1) {
      // Get the client's remaining sessions to calculate current session number
      const { data: clientBookings } = await supabase
        .from('bookings')
        .select('quantity')
        .eq('client_email', customerEmail)
        .gt('quantity', 0)
        .order('date', { ascending: false })
        .limit(1);
      
      if (clientBookings && clientBookings.length > 0) {
        const remainingSessions = clientBookings[0].quantity;
        const sessionNumber = calculateSessionNumber(quantity, remainingSessions);
        finalEventName = getSessionEventName(eventName, quantity, sessionNumber, locale);
      }
    }

    // Create a checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: finalEventName || 'Booking',
              description: `Appointment on ${appointmentDate}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      locale: 'ru', // Always use Russian for Stripe as Ukrainian is not supported
      metadata: {
        eventName: finalEventName,
        eventId: eventId,
        startTime: finalStartTime,
        endTime: finalEndTime,
        customerName,
        customerEmail,
        customerPhone,
        appointmentDate,
        sessionsCount: sessionsCountValue,
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}