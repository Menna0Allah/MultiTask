import { X } from 'lucide-react';
import StripeProvider from './StripeProvider';
import CheckoutForm from './CheckoutForm';

/**
 * PaymentModal - Modal wrapper for payment form
 * @param {boolean} isOpen - Whether modal is open
 * @param {function} onClose - Close modal callback
 * @param {string} clientSecret - Stripe payment intent client secret
 * @param {number} amount - Payment amount
 * @param {number} platformFee - Platform fee amount
 * @param {function} onSuccess - Success callback
 * @param {object} taskInfo - Optional task information to display
 */
export default function PaymentModal({
  isOpen,
  onClose,
  clientSecret,
  amount,
  platformFee,
  onSuccess,
  taskInfo = null
}) {
  if (!isOpen) return null;

  const handleSuccess = (paymentIntent) => {
    // Don't call onClose here - onSuccess handler will handle modal closure
    onSuccess(paymentIntent);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complete Payment
            </h2>
            {taskInfo && (
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900">{taskInfo.title}</p>
                <p className="text-xs mt-1">Task #{taskInfo.id}</p>
              </div>
            )}
          </div>

          {/* Payment Form */}
          <StripeProvider clientSecret={clientSecret}>
            <CheckoutForm
              clientSecret={clientSecret}
              amount={amount}
              platformFee={platformFee}
              onSuccess={handleSuccess}
              onCancel={onClose}
            />
          </StripeProvider>
        </div>
      </div>
    </div>
  );
}
