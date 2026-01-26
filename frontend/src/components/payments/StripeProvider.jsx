import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Load Stripe outside component to avoid recreating object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * StripeProvider - Wraps components that need Stripe functionality
 * Usage: Wrap payment forms and checkout components with this provider
 */
export default function StripeProvider({ children, clientSecret = null }) {
  const options = {
    // Appearance customization
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#3b82f6', // Blue-500 from Tailwind
        colorBackground: '#ffffff',
        colorText: '#1f2937', // Gray-800
        colorDanger: '#ef4444', // Red-500
        fontFamily: 'Inter, system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    // Only include clientSecret if provided (for payment intent)
    ...(clientSecret && { clientSecret }),
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      {children}
    </Elements>
  );
}
