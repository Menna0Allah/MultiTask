import { format } from 'date-fns';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * TransactionList - Display list of transactions
 * @param {Array} transactions - Array of transaction objects
 * @param {boolean} loading - Loading state
 */
export default function TransactionList({ transactions = [], loading = false }) {
  const getTransactionTypeColor = (type) => {
    const colors = {
      escrow_deposit: 'text-blue-600 bg-blue-50',
      escrow_release: 'text-green-600 bg-green-50',
      refund: 'text-yellow-600 bg-yellow-50',
      withdrawal: 'text-purple-600 bg-purple-50',
      platform_fee: 'text-gray-600 bg-gray-50',
      transfer: 'text-indigo-600 bg-indigo-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      escrow_deposit: 'Escrow Deposit',
      escrow_release: 'Escrow Release',
      refund: 'Refund',
      withdrawal: 'Withdrawal',
      platform_fee: 'Platform Fee',
      transfer: 'Transfer',
    };
    return labels[type] || type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50',
      processing: 'text-blue-600 bg-blue-50',
      succeeded: 'text-green-600 bg-green-50',
      completed: 'text-green-600 bg-green-50',
      failed: 'text-red-600 bg-red-50',
      cancelled: 'text-gray-600 bg-gray-50',
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: ClockIcon,
      processing: ClockIcon,
      succeeded: CheckCircleIcon,
      completed: CheckCircleIcon,
      failed: XCircleIcon,
      cancelled: XCircleIcon,
    };
    const Icon = icons[status] || ClockIcon;
    return <Icon className="w-4 h-4" />;
  };

  const getTransactionIcon = (type) => {
    if (type === 'escrow_release' || type === 'withdrawal') {
      return <ArrowDownTrayIcon className="w-5 h-5" />;
    } else if (type === 'escrow_deposit') {
      return <ArrowUpTrayIcon className="w-5 h-5" />;
    }
    return <BanknotesIcon className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-20" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <BanknotesIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>No transactions yet</p>
        <p className="text-sm mt-1">Your transaction history will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {/* Left side - Icon and details */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`p-2 rounded-lg flex-shrink-0 ${getTransactionTypeColor(transaction.transaction_type)}`}>
              {getTransactionIcon(transaction.transaction_type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 truncate">
                  {getTransactionTypeLabel(transaction.transaction_type)}
                </p>
                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusColor(transaction.status)}`}>
                  {getStatusIcon(transaction.status)}
                  {transaction.status}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
              </p>

              {transaction.description && (
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {transaction.description}
                </p>
              )}

              {/* Show related user */}
              {transaction.sender_username && transaction.sender_username !== transaction.recipient_username && (
                <p className="text-xs text-gray-500 mt-1">
                  {transaction.transaction_type.includes('deposit') ? (
                    <>From: {transaction.sender_username}</>
                  ) : (
                    <>To: {transaction.recipient_username || 'System'}</>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Amount */}
          <div className="text-right flex-shrink-0 ml-4">
            <p className={`font-bold text-lg ${
              parseFloat(transaction.amount) > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {parseFloat(transaction.amount) > 0 ? '+' : ''}
              {parseFloat(transaction.amount).toFixed(2)} EGP
            </p>

            {transaction.platform_fee && parseFloat(transaction.platform_fee) > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Fee: {parseFloat(transaction.platform_fee).toFixed(2)} EGP
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
