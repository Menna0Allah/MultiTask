import { CheckCircleIcon, ClockIcon, BanknotesIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

/**
 * PaymentTimeline - Shows the payment status journey
 */
export default function PaymentTimeline({ task }) {
  if (!task.requires_payment) {
    return null;
  }

  const escrow = task.escrow;
  const paymentStatus = task.payment_status;

  const steps = [
    {
      name: 'Task Completed',
      status: task.status === 'COMPLETED' ? 'completed' : task.status === 'IN_PROGRESS' ? 'current' : 'upcoming',
      date: task.completed_at,
      icon: CheckCircleIcon,
      description: 'Work delivered and approved by client',
    },
    {
      name: 'Payment Initiated',
      status: paymentStatus !== 'not_required' ? 'completed' : task.status === 'COMPLETED' ? 'current' : 'upcoming',
      date: escrow?.created_at,
      icon: BanknotesIcon,
      description: 'Client initiated payment',
    },
    {
      name: 'Payment Released',
      status: paymentStatus === 'released' ? 'completed' : paymentStatus === 'escrowed' ? 'current' : 'upcoming',
      date: escrow?.released_at,
      icon: CheckCircleIcon,
      description: 'Funds transferred to freelancer',
    },
  ];

  const getStepStyles = (status) => {
    switch (status) {
      case 'completed':
        return {
          icon: 'bg-green-500 text-white',
          line: 'bg-green-500',
          text: 'text-gray-900',
        };
      case 'current':
        return {
          icon: 'bg-blue-500 text-white animate-pulse',
          line: 'bg-gray-300',
          text: 'text-blue-600 font-semibold',
        };
      default:
        return {
          icon: 'bg-gray-300 text-gray-500',
          line: 'bg-gray-300',
          text: 'text-gray-500',
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <BanknotesIcon className="w-5 h-5 text-blue-600" />
        Payment Timeline
      </h3>

      <div className="space-y-6">
        {steps.map((step, stepIdx) => {
          const styles = getStepStyles(step.status);
          const Icon = step.icon;

          return (
            <div key={step.name} className="relative">
              {/* Connector Line */}
              {stepIdx !== steps.length - 1 && (
                <div
                  className={`absolute left-5 top-10 w-0.5 h-full ${styles.line}`}
                  style={{ height: 'calc(100% + 1.5rem)' }}
                />
              )}

              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.icon} shadow-md transition-all`}>
                  {step.status === 'completed' ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : step.status === 'current' ? (
                    <ClockIcon className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <p className={`font-semibold ${styles.text}`}>{step.name}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                  {step.date && (
                    <p className="text-xs text-gray-400 mt-1">
                      {format(new Date(step.date), 'MMM dd, yyyy HH:mm')}
                    </p>
                  )}
                  {step.status === 'current' && (
                    <div className="mt-2">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                        In Progress
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Summary */}
      {escrow && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Payment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-gray-900">{parseFloat(escrow.total_amount).toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee:</span>
              <span className="font-semibold text-gray-900">{parseFloat(escrow.platform_fee_amount).toFixed(2)} EGP</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-gray-200">
              <span className="text-gray-600">Freelancer Receives:</span>
              <span className="font-bold text-green-600">{parseFloat(escrow.freelancer_amount).toFixed(2)} EGP</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
