import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { CreditCard, Loader2 } from 'lucide-react';

/**
 * CheckoutForm - Stripe payment form component
 * @param {string} clientSecret - Stripe payment intent client secret
 * @param {number} amount - Payment amount to display
 * @param {number} platformFee - Platform fee amount
 * @param {function} onSuccess - Callback function on successful payment
 * @param {function} onCancel - Callback function when payment is cancelled
 */
export default function CheckoutForm({
  clientSecret,
  amount,
  platformFee,
  onSuccess,
  onCancel
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1f2937',
        fontFamily: 'Inter, system-ui, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
        iconColor: '#3b82f6',
      },
      invalid: {
        color: '#ef4444',
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: false,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      toast.error('Payment system not ready. Please refresh the page.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      // Confirm the payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful!');
        if (onSuccess) {
          onSuccess(paymentIntent);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('An unexpected error occurred. Please try again.');
      toast.error('Payment failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const freelancerAmount = amount - platformFee;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Summary */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Task Amount</span>
          <span className="font-medium text-gray-900">{amount.toFixed(2)} EGP</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Platform Fee (15%)</span>
          <span className="font-medium text-gray-900">{platformFee.toFixed(2)} EGP</span>
        </div>
        <div className="flex justify-between text-sm text-gray-500">
          <span>Freelancer Receives</span>
          <span>{freelancerAmount.toFixed(2)} EGP</span>
        </div>
        <div className="border-t border-gray-300 mt-2 pt-2">
          <div className="flex justify-between">
            <span className="font-semibold text-gray-900">Total Payment</span>
            <span className="font-bold text-blue-600 text-lg">{amount.toFixed(2)} EGP</span>
          </div>
        </div>
      </div>

      {/* Card Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <CreditCard className="inline w-4 h-4 mr-1" />
          Card Details
        </label>
        <div className="border border-gray-300 rounded-lg p-3 bg-white focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-colors">
          <CardElement options={cardElementOptions} />
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Secure Payment:</span> Your payment is protected by
          Stripe's industry-leading security. Funds will be held in escrow until task completion.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isProcessing}
          className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>Pay {amount.toFixed(2)} EGP</>
          )}
        </button>
      </div>
    </form>
  );
}
