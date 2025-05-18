import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

interface StripeError extends Error {
  type?: string;
  code?: string;
  param?: string;
  statusCode?: number;
}

export async function POST(request: Request) {
  try {
    const { amount, currency = 'usd' } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: unknown) {
    const stripeError = error as StripeError;
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: stripeError.message }, { status: 500 });
  }
}