// This is a suggested implementation - you'll need to adapt it to your actual data structure
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, currency, eventName, customerName, appointmentDate, startTime, endTime, customerEmail, customerPhone } = body;

    // Log the request data for debugging
    console.log('Checkout session request data:', {
      eventName,
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
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/booking`,
      metadata: {
        eventName,
        startTime: finalStartTime,
        endTime: finalEndTime,
        customerName,
        customerEmail,
        customerPhone,
        appointmentDate
      },
    });

    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: 'Error creating checkout session' }, { status: 500 });
  }
}