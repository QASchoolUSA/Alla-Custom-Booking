import { useState, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '../ui/dialog';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeCheckoutProps {
  amount: number;
  currency?: string;
  eventName?: string;
  eventId?: string;
  quantity?: number;
  sessionsCount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  locale?: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (errorMessage: string) => void;
}

const StripeCheckout = ({ 
  amount, 
  currency = 'usd', 
  eventName = 'Booking Service',
  eventId,
  quantity = 1,
  sessionsCount,
  customerName,
  customerEmail,
  customerPhone,
  appointmentDate,
  startTime,
  endTime,
  locale = 'ru',
  onPaymentSuccess, 
  onPaymentError 
}: StripeCheckoutProps) => {
  const t = useTranslations('booking');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showZelleModal, setShowZelleModal] = useState(false);
  const paymentButtonsRef = useRef<HTMLDivElement>(null);

  // Check for successful payment return from Stripe
  useEffect(() => {
    // Check URL parameters for success indicators after redirect
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      // If we have a session ID in the URL, it means the payment was successful
      // Call the success handler with the session ID
      onPaymentSuccess(sessionId);
    }
  }, [onPaymentSuccess]);

  // No scrolling behavior needed - desktop doesn't scroll, mobile uses sticky buttons

  // Ensure amount is valid before proceeding
  if (amount <= 0 || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div className="text-center p-4">
        <p className="text-red-500">
          {amount <= 0 ? "Invalid payment amount." : "Stripe is not configured correctly. Publishable key is missing."}
        </p>
      </div>
    );
  }

  const handleCheckout = async () => {
    console.log('handleCheckout function called');
    setIsLoading(true);
    setError(null);
    
    console.log('Starting checkout process with amount:', amount);
  
    try {
      // Calculate start and end times if appointmentDate is provided
      let startTimeValue = startTime;
      let endTimeValue = endTime;
      
      if (!startTimeValue && appointmentDate) {
        // If we only have appointmentDate, use it as startTime
        startTimeValue = new Date(appointmentDate).toISOString();
        
        // Set endTime to be 1 hour after startTime if not provided
        if (!endTimeValue) {
          const endDate = new Date(appointmentDate);
          endDate.setHours(endDate.getHours() + 1);
          endTimeValue = endDate.toISOString();
        }
      }
      
      // Create a checkout session on your server
      console.log('Sending request to create-checkout-session');
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          eventName,
          eventId,
          quantity,
          sessionsCount,
          customerName,
          customerEmail,
          customerPhone,
          appointmentDate,
          startTime,
          endTime,
          locale
        }),
      });
  
      console.log('Response status:', response.status);
      const session = await response.json();
      console.log('Session response:', session);
  
      if (session.error) {
        console.error('Session error:', session.error);
        setError(session.error);
        onPaymentError(session.error);
        setIsLoading(false);
        return;
      }
  
      // Redirect to Stripe Checkout
      console.log('Loading Stripe with session ID:', session.id);
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
  
      console.log('Redirecting to Stripe checkout');
      const { error } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });
  
      if (error) {
        console.error('Stripe redirect error:', error);
        setError(error.message || 'An error occurred during checkout');
        onPaymentError(error.message || 'An error occurred during checkout');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      onPaymentError(errorMessage);
    }
  
    setIsLoading(false);
  };

  return (
    <div className="max-w-md mx-auto p-4" data-testid="stripe-checkout">
      {error && <div className="text-red-500 mb-4" data-testid="stripe-error-message">{error}</div>}
      
      {/* Desktop Payment Buttons */}
      <div ref={paymentButtonsRef} className="hidden md:block">
        <button
        onClick={(e) => {
          e.preventDefault();
          console.log('Button clicked');
          handleCheckout();
        }}
        disabled={isLoading}
        className="w-full text-white py-3 px-4 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center pointer mb-4 bg-alla-purple"
        data-testid="stripe-pay-button"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
        <>{t('payWithStripe')}</>
        )}
        </button>
        <button
          onClick={() => setShowZelleModal(true)}
          className="w-full text-white py-3 px-4 rounded-md hover:opacity-90 flex items-center justify-center pointer bg-alla-purple"
          data-testid="zelle-pay-button"
        >
          Pay with Zelle
        </button>
      </div>
      
      {/* Mobile Sticky Payment Buttons */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="space-y-3">
          <button
          onClick={(e) => {
            e.preventDefault();
            console.log('Button clicked');
            handleCheckout();
          }}
          disabled={isLoading}
          className="w-full text-white py-4 px-4 rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center pointer text-lg font-medium bg-alla-purple"
          data-testid="stripe-pay-button-mobile"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
          <>{t('payWithStripe')}</>
          )}
          </button>
          <button
            onClick={() => setShowZelleModal(true)}
            className="w-full text-white py-4 px-4 rounded-md hover:opacity-90 flex items-center justify-center pointer text-lg font-medium bg-alla-purple"
            data-testid="zelle-pay-button-mobile"
          >
            Pay with Zelle
          </button>
        </div>
      </div>
      
      {/* Mobile spacer to prevent content from being hidden behind sticky buttons */}
      <div className="md:hidden h-32"></div>
      {showZelleModal && (
        <Dialog open={showZelleModal} onOpenChange={setShowZelleModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pay with Zelle</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              Please send your payment to:<br />
              <strong>Email:</strong> example@email.com<br />
              <strong>Phone:</strong> +1-234-567-8901
            </DialogDescription>
            <div className="mt-4">
              <button
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                onClick={() => {
                  setShowZelleModal(false);
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('zellePaymentCompleted'));
                  }
                }}
              >
                Payment Completed
              </button>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <button className="mt-2 w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">Cancel</button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}</div>
  );
};

export default StripeCheckout;
