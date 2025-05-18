"use client";

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button"; // Assuming you have this

// Make sure to put your publishable key in .env.local
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutFormProps {
  amount: number; // Amount in cents
  currency?: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (errorMessage: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ amount, currency = 'usd', onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          onPaymentError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch(apiError => {
        const errorMessage = "Failed to initialize payment.";
        console.error(errorMessage, apiError);
        setError(errorMessage);
        onPaymentError(errorMessage);
      });
  }, [amount, currency, onPaymentError]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      // Stripe.js has not yet loaded or client secret not fetched.
      // Make sure to disable form submission until Stripe.js has loaded.
      setError("Payment system is not ready. Please wait a moment.");
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError("Card details not found. Please ensure card details are entered correctly.");
      setProcessing(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
        // billing_details: { // Optional: Add billing details if needed
        //   name: 'Jenny Rosen',
        // },
      },
    });

    if (stripeError) {
      console.error("Stripe error:", stripeError);
      const message = stripeError.message || "An unexpected error occurred.";
      setError(message);
      onPaymentError(message);
    } else if (paymentIntent?.status === 'succeeded') {
      console.log('Payment succeeded!', paymentIntent);
      onPaymentSuccess(paymentIntent.id);
      // You can redirect to a success page or show a success message
    } else if (paymentIntent) {
      const message = `Payment status: ${paymentIntent.status}. Please try again.`;
      setError(message);
      onPaymentError(message);
    } else {
      const message = "Payment failed for an unknown reason.";
      setError(message);
      onPaymentError(message);
    }

    setProcessing(false);
  };

  const cardElementOptions = {
    style: {
      base: {
        color: "#32325d",
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 mb-1">
          Card Details
        </label>
        <CardElement id="card-element" options={cardElementOptions} className="p-3 border border-gray-300 rounded-md shadow-sm" />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <Button
        type="submit"
        disabled={!stripe || !clientSecret || processing}
        className="w-full"
      >
        {processing ? 'Processing...' : `Pay $${(amount / 100).toFixed(2)}`}
      </Button>
    </form>
  );
};

interface StripePaymentProps {
  amount: number; // Amount in cents
  currency?: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (errorMessage: string) => void;
}

const StripePayment: React.FC<StripePaymentProps> = ({ amount, currency, onPaymentSuccess, onPaymentError }) => {
  const options: StripeElementsOptions = {
    // clientSecret will be fetched and set in CheckoutForm,
    // but if you had it here, you could pass it.
    // For now, appearance is a good option to set.
    appearance: {
      theme: 'stripe',
    },
  };

  // Ensure amount is valid before rendering Elements
  if (amount <= 0 || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
     return (
        <div className="text-center p-4">
          <p className="text-red-500">
            {amount <= 0 ? "Invalid payment amount." : "Stripe is not configured correctly. Publishable key is missing."}
          </p>
        </div>
      );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm
        amount={amount}
        currency={currency}
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripePayment;