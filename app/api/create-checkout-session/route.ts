// This is a suggested implementation - you'll need to adapt it to your actual data structure
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('-- [Received request body] --', body);
    console.log(body);
    const { amount, currency, eventName, quantity, sessionsCount, customerName, customerEmail, customerPhone, appointmentDate, startTime, endTime, locale = 'en' } = body;
    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/booking/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/booking?canceled=true`;

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

    // Create a checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency || 'usd',
            product_data: {
              name: eventName || 'Booking',
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
      metadata: {
        eventName,
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