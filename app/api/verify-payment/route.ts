// This is a suggested implementation - you'll need to adapt it to your actual data structure
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ success: false, message: 'Session ID is required' });
  }

  try {
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'payment_intent', 'customer']
    });

    console.log('Session metadata:', session.metadata);

    if (session.payment_status === 'paid') {
      // Extract booking details from session metadata or your database
      // This assumes you stored these details in the session metadata when creating the checkout session
      const bookingDetails = {
        eventName: session.metadata?.eventName || 'Booking',
        startTime: session.metadata?.startTime,
        endTime: session.metadata?.endTime,
        customerName: session.metadata?.customerName,
        customerEmail: session.customer_email || session.metadata?.customerEmail,
        customerPhone: session.metadata?.customerPhone
      };

      // Log the booking details to help with debugging
      console.log('Extracted booking details:', bookingDetails);

      // Validate required fields
      if (!bookingDetails.startTime || !bookingDetails.endTime) {
        console.error('Missing required time fields in session metadata');
        return NextResponse.json({ 
          success: false, 
          message: 'Missing required booking details in payment session',
          missingFields: [
            !bookingDetails.startTime ? 'startTime' : null,
            !bookingDetails.endTime ? 'endTime' : null
          ].filter(Boolean)
        });
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Payment verified successfully',
        bookingDetails
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `Payment not completed. Status: ${session.payment_status}` 
      });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error verifying payment' 
    });
  }
}