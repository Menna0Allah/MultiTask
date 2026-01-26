import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';
import {
  WalletIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  SparklesIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Wallet() {
  const { user } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showConfirmWithdraw, setShowConfirmWithdraw] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletData, transactionsData, withdrawalsData] = await Promise.all([
        paymentService.getWallet(),
        paymentService.getTransactions({ limit: 10 }),
        paymentService.getWithdrawals({ limit: 5 }),
      ]);

      // Convert string balances to numbers
      if (walletData) {
        walletData.available_balance = parseFloat(walletData.available_balance) || 0;
        walletData.escrowed_balance = parseFloat(walletData.escrowed_balance) || 0;
        walletData.pending_balance = parseFloat(walletData.pending_balance) || 0;
        walletData.lifetime_earnings = parseFloat(walletData.lifetime_earnings) || 0;
        walletData.lifetime_spent = parseFloat(walletData.lifetime_spent) || 0;
      }

      // Convert transaction amounts to numbers
      const transactions = transactionsData.results || transactionsData || [];
      transactions.forEach(transaction => {
        transaction.amount = parseFloat(transaction.amount) || 0;
        transaction.platform_fee = parseFloat(transaction.platform_fee) || 0;
        transaction.net_amount = parseFloat(transaction.net_amount) || 0;
      });

      // Convert withdrawal amounts to numbers
      const withdrawals = withdrawalsData.results || withdrawalsData || [];
      withdrawals.forEach(withdrawal => {
        withdrawal.amount = parseFloat(withdrawal.amount) || 0;
      });

      setWallet(walletData);
      setTransactions(transactions);
      setWithdrawals(withdrawals);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawRequest = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount < 50) {
      toast.error('Minimum withdrawal amount is 50 EGP');
      return;
    }

    if (!wallet || amount > wallet.available_balance) {
      toast.error('Insufficient balance');
      return;
    }

    // Show confirmation dialog
    setShowConfirmWithdraw(true);
  };

  const handleWithdrawConfirm = async () => {
    const amount = parseFloat(withdrawAmount);

    try {
      setIsProcessing(true);
      await paymentService.createWithdrawal(amount);
      toast.success('Withdrawal request submitted successfully');
      setShowWithdrawModal(false);
      setShowConfirmWithdraw(false);
      setWithdrawAmount('');
      fetchWalletData();
    } catch (error) {
      console.error('Error creating withdrawal:', error);
      toast.error(error.response?.data?.error || 'Failed to create withdrawal request');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTransactionTypeColor = (type) => {
    const colors = {
      escrow_deposit: 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/30',
      escrow_release: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30',
      refund: 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/30',
      withdrawal: 'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-900/30',
      platform_fee: 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800',
    };
    return colors[type] || 'text-gray-600 bg-gray-50 dark:text-gray-400 dark:bg-gray-800';
  };

  const getTransactionTypeLabel = (type) => {
    const labels = {
      escrow_deposit: 'Escrow Deposit',
      escrow_release: 'Escrow Release',
      refund: 'Refund',
      withdrawal: 'Withdrawal',
      platform_fee: 'Platform Fee',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800',
      processing: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
      succeeded: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 border-green-200 dark:border-green-800',
      completed: 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30 border-green-200 dark:border-green-800',
      failed: 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30 border-red-200 dark:border-red-800',
      cancelled: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
    };
    return colors[status] || 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container-custom py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <WalletIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  My Wallet
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage your earnings and withdrawals
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchWalletData}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              title="Refresh"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            <Link
              to="/profile"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
            >
              Back to Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <SparklesIcon className="w-5 h-5 text-blue-200" />
                <p className="text-blue-100 text-sm font-medium">Total Balance</p>
              </div>
              <p className="text-4xl sm:text-5xl font-bold mb-1">
                {((wallet?.available_balance || 0) + (wallet?.escrowed_balance || 0)).toFixed(2)} EGP
              </p>
              <p className="text-blue-100 text-sm">
                Available: {wallet?.available_balance?.toFixed(2) || '0.00'} EGP •
                Escrowed: {wallet?.escrowed_balance?.toFixed(2) || '0.00'} EGP
              </p>
            </div>
            {parseFloat(wallet?.pending_balance) > 0 && (
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <p className="text-blue-100 text-xs mb-1">Pending</p>
                <p className="text-2xl font-bold">{parseFloat(wallet.pending_balance).toFixed(2)} EGP</p>
              </div>
            )}
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Balance Card */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <WalletIcon className="w-5 h-5 text-blue-100" />
                  <p className="text-blue-100 text-sm font-medium">Available Balance</p>
                </div>
                <p className="text-3xl font-bold">{wallet?.available_balance?.toFixed(2) || '0.00'} EGP</p>
              </div>
            </div>
            <Button
              onClick={() => setShowWithdrawModal(true)}
              className="mt-2 w-full bg-white hover:bg-blue-50 font-semibold shadow-md hover:shadow-lg transition-all duration-300 border-0 py-3"
              disabled={!wallet?.available_balance || wallet.available_balance < 50}
            >
              <ArrowDownTrayIcon className="w-5 h-5 mr-2 text-blue-700" />
              <span className="font-bold text-base text-blue-700">Withdraw Funds</span>
            </Button>
            {wallet?.available_balance < 50 && (
              <p className="text-xs text-blue-100 mt-2 text-center">
                Minimum 50 EGP required
              </p>
            )}
          </Card>

          {/* Escrowed Balance Card */}
          <Card className="bg-white dark:bg-gray-800 border-2 border-yellow-200 dark:border-yellow-800 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Escrowed Balance</p>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {wallet?.escrowed_balance?.toFixed(2) || '0.00'} EGP
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <ShieldCheckIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 dark:text-gray-300">
                Funds held securely for active tasks. Released upon completion.
              </p>
            </div>
          </Card>

          {/* Lifetime Earnings Card */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <ArrowTrendingUpIcon className="w-5 h-5 text-green-100" />
                  <p className="text-green-100 text-sm font-medium">Lifetime Earnings</p>
                </div>
                <p className="text-3xl font-bold">{wallet?.lifetime_earnings?.toFixed(2) || '0.00'} EGP</p>
              </div>
              <ChartBarIcon className="w-16 h-16 text-green-400/30" />
            </div>
            <div className="mt-2 p-3 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
              <p className="text-xs text-green-50">
                Total earnings from all completed tasks
              </p>
            </div>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg border-0">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
            </div>
            <Link
              to="/transactions"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold flex items-center gap-1 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
            >
              View All
              <ArrowUpTrayIcon className="w-4 h-4 rotate-90" />
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <BanknotesIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No transactions yet</p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Start working on tasks to see your transaction history
              </p>
              <Link
                to="/tasks"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <SparklesIcon className="w-5 h-5" />
                Browse Available Tasks
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getTransactionTypeColor(transaction.transaction_type)} shadow-sm`}>
                      {transaction.transaction_type === 'escrow_release' ? (
                        <ArrowDownTrayIcon className="w-6 h-6" />
                      ) : transaction.transaction_type === 'escrow_deposit' ? (
                        <ArrowUpTrayIcon className="w-6 h-6" />
                      ) : (
                        <BanknotesIcon className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-base">
                        {getTransactionTypeLabel(transaction.transaction_type)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(transaction.created_at), 'MMM dd, yyyy • HH:mm')}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{transaction.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-xl ${parseFloat(transaction.amount) > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {parseFloat(transaction.amount) > 0 ? '+' : ''}{parseFloat(transaction.amount).toFixed(2)} EGP
                    </p>
                    <span className={`text-xs px-3 py-1.5 rounded-full inline-block mt-1.5 font-medium border ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Withdrawals */}
        {withdrawals.length > 0 && (
          <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg border-0">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <ArrowDownTrayIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Withdrawals</h2>
            </div>
            <div className="space-y-3">
              {withdrawals.map((withdrawal) => (
                <div
                  key={withdrawal.id}
                  className="flex items-center justify-between p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                      <ArrowDownTrayIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Withdrawal #{withdrawal.withdrawal_id}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(withdrawal.created_at), 'MMM dd, yyyy • HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-gray-900 dark:text-white">{parseFloat(withdrawal.amount).toFixed(2)} EGP</p>
                    <span className={`text-xs px-3 py-1.5 rounded-full inline-block mt-1.5 font-medium border ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* How Wallet Works - Information Section */}
        <Card className="mb-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-100 dark:border-blue-900">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
              <ShieldCheckIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How Your Wallet Works</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-blue-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <WalletIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Available Balance</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Funds you can withdraw immediately. This includes completed task payments that have been released from escrow.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-yellow-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <ClockIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Escrowed Balance</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Funds held in escrow for active tasks. Released when client confirms task completion or after auto-release period.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-green-100 dark:border-gray-600 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <ChartBarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Lifetime Earnings</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Total amount you've earned on the platform. This includes all completed tasks and released payments.
              </p>
            </div>
          </div>
          <div className="p-5 bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-gray-600">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CreditCardIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Withdrawal Information
            </h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>Minimum withdrawal: <strong>50 EGP</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>Processing time: <strong>1-3 business days</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>Funds transferred to your linked Stripe account</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span>All transactions are <strong>secure and encrypted</strong></span>
              </li>
            </ul>
          </div>
        </Card>

        {/* Withdrawal Modal */}
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)} />
            <div className="flex min-h-full items-center justify-center p-4">
              <Card className="relative max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl border-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <ArrowDownTrayIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Request Withdrawal</h3>
                </div>

                <form onSubmit={handleWithdrawRequest}>
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Amount (EGP)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="50"
                      max={wallet?.available_balance || 0}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all text-lg font-semibold"
                      placeholder="Enter amount"
                      autoFocus
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Minimum: <strong>50 EGP</strong>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Available: <strong className="text-blue-600 dark:text-blue-400">{wallet?.available_balance?.toFixed(2) || '0.00'} EGP</strong>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          Secure Withdrawal Process
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">
                          Withdrawals are processed within 1-3 business days. Funds will be securely transferred to your linked Stripe bank account.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={() => setShowWithdrawModal(false)}
                      variant="outline"
                      className="flex-1 py-3 font-semibold border-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isProcessing}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 shadow-lg hover:shadow-xl transition-all duration-300 border-0"
                    >
                      {isProcessing ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          Confirm Withdrawal
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        )}

        {/* Withdrawal Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmWithdraw}
          onClose={() => setShowConfirmWithdraw(false)}
          onConfirm={handleWithdrawConfirm}
          title="Confirm Withdrawal"
          message={`Are you sure you want to withdraw ${withdrawAmount} EGP? This withdrawal will be processed within 1-3 business days and transferred to your linked Stripe account.`}
          confirmText="Yes, Withdraw"
          cancelText="Cancel"
          variant="warning"
          loading={isProcessing}
        />
      </div>
    </div>
  );
}
