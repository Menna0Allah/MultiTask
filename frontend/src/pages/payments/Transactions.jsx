import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import paymentService from '../../services/paymentService';
import toast from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  BanknotesIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]); // Store all for counting
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    deposits: 0,
    releases: 0,
    refunds: 0,
    withdrawals: 0,
    totalAmount: 0,
    totalIncome: 0,
    totalExpense: 0,
  });

  useEffect(() => {
    fetchAllTransactions();
  }, []);

  useEffect(() => {
    applyFilter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, allTransactions, page]);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      // Fetch all transactions to calculate real counts and filter client-side
      const data = await paymentService.getTransactions({ limit: 1000 });
      const allTxns = data.results || data || [];

      // Convert amounts to numbers
      allTxns.forEach(transaction => {
        transaction.amount = parseFloat(transaction.amount) || 0;
        transaction.platform_fee = parseFloat(transaction.platform_fee) || 0;
        transaction.net_amount = parseFloat(transaction.net_amount) || 0;
      });

      setAllTransactions(allTxns);

      // Calculate stats
      const newStats = {
        total: allTxns.length,
        deposits: allTxns.filter(t => t.transaction_type === 'escrow_deposit').length,
        releases: allTxns.filter(t => t.transaction_type === 'escrow_release').length,
        refunds: allTxns.filter(t => t.transaction_type === 'refund').length,
        withdrawals: allTxns.filter(t => t.transaction_type === 'withdrawal').length,
        totalAmount: allTxns.reduce((sum, t) => sum + t.amount, 0),
        totalIncome: allTxns.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0),
        totalExpense: allTxns.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0),
      };

      setStats(newStats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      toast.error('Failed to load transactions');
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (allTransactions.length === 0) return;

    let filtered = [...allTransactions];

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(t => t.transaction_type === filter);
    }

    // Apply pagination
    const startIndex = (page - 1) * 20;
    const endIndex = startIndex + 20;
    const paginatedTransactions = filtered.slice(startIndex, endIndex);

    setTransactions(paginatedTransactions);
    setHasMore(endIndex < filtered.length);
  };

  const handleRefresh = () => {
    setPage(1);
    fetchAllTransactions();
    toast.success('Transactions refreshed');
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

  const filteredTransactions = transactions.filter(transaction => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      transaction.transaction_id?.toLowerCase().includes(searchLower) ||
      transaction.task_title?.toLowerCase().includes(searchLower) ||
      transaction.description?.toLowerCase().includes(searchLower) ||
      getTransactionTypeLabel(transaction.transaction_type).toLowerCase().includes(searchLower)
    );
  });

  if (loading && page === 1) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="container-custom py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <DocumentTextIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  Transaction History
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View and filter all your payment transactions
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              title="Refresh"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            <Link
              to="/wallet"
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium px-4 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all"
            >
              Back to Wallet
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs font-medium mb-1">Total Transactions</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <ChartBarIcon className="w-12 h-12 text-blue-300/50" />
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-xs font-medium mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  +{stats.totalIncome.toFixed(2)} EGP
                </p>
              </div>
              <ArrowTrendingUpIcon className="w-10 h-10 text-green-500 dark:text-green-400" />
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-800 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-xs font-medium mb-1">Total Expense</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  -{stats.totalExpense.toFixed(2)} EGP
                </p>
              </div>
              <ArrowTrendingDownIcon className="w-10 h-10 text-red-500 dark:text-red-400" />
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 dark:from-purple-600 dark:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs font-medium mb-1">Net Amount</p>
                <p className="text-2xl font-bold">
                  {(stats.totalIncome - stats.totalExpense).toFixed(2)} EGP
                </p>
              </div>
              <BanknotesIcon className="w-10 h-10 text-purple-300/50" />
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-0 shadow-md">
          <div className="flex items-center gap-3">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by transaction ID, task, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </Card>

        {/* Filters */}
        <Card className="mb-6 bg-white dark:bg-gray-800 border-0 shadow-md">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <FunnelIcon className="w-5 h-5" />
              <span className="font-medium text-sm">Filter:</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => { setFilter('all'); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All {stats.total > 0 && `(${stats.total})`}
              </button>
              <button
                onClick={() => { setFilter('escrow_deposit'); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === 'escrow_deposit'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Deposits {stats.deposits > 0 && `(${stats.deposits})`}
              </button>
              <button
                onClick={() => { setFilter('escrow_release'); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === 'escrow_release'
                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Releases {stats.releases > 0 && `(${stats.releases})`}
              </button>
              <button
                onClick={() => { setFilter('refund'); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === 'refund'
                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Refunds {stats.refunds > 0 && `(${stats.refunds})`}
              </button>
              <button
                onClick={() => { setFilter('withdrawal'); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  filter === 'withdrawal'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg scale-105'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Withdrawals {stats.withdrawals > 0 && `(${stats.withdrawals})`}
              </button>
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg border-0">
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-6 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <BanknotesIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {searchQuery
                  ? 'No matching transactions'
                  : filter !== 'all'
                    ? `No ${getTransactionTypeLabel(filter).toLowerCase()} transactions`
                    : 'No transactions found'
                }
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : filter !== 'all'
                    ? `You don't have any ${getTransactionTypeLabel(filter).toLowerCase()} transactions yet`
                    : 'Your transaction history will appear here'
                }
              </p>
              {!searchQuery && filter === 'all' && (
                <Link
                  to="/tasks"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <BanknotesIcon className="w-5 h-5" />
                  Start Earning
                </Link>
              )}
              {filter !== 'all' && (
                <button
                  onClick={() => { setFilter('all'); setPage(1); }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 dark:bg-gray-700 text-white rounded-xl hover:bg-gray-700 dark:hover:bg-gray-600 font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  View All Transactions
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-600 gap-4"
                  >
                    <div className="flex items-start sm:items-center gap-4 flex-1">
                      <div className={`p-3 rounded-xl ${getTransactionTypeColor(transaction.transaction_type)} shadow-sm flex-shrink-0`}>
                        {transaction.transaction_type === 'escrow_release' ? (
                          <ArrowDownTrayIcon className="w-6 h-6" />
                        ) : transaction.transaction_type === 'escrow_deposit' ? (
                          <ArrowUpTrayIcon className="w-6 h-6" />
                        ) : (
                          <BanknotesIcon className="w-6 h-6" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-base">
                          {getTransactionTypeLabel(transaction.transaction_type)}
                        </p>
                        {transaction.task_title && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            Task: {transaction.task_title}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-sm text-gray-500 dark:text-gray-500">
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy • HH:mm')}
                          </p>
                          {transaction.transaction_id && (
                            <p className="text-xs text-gray-400 dark:text-gray-600 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              ID: {transaction.transaction_id.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                        {transaction.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 line-clamp-1">
                            {transaction.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`font-bold text-xl ${transaction.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)} EGP
                      </p>
                      {transaction.platform_fee > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Fee: {transaction.platform_fee.toFixed(2)} EGP
                        </p>
                      )}
                      {transaction.net_amount && transaction.net_amount !== transaction.amount && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          Net: {transaction.net_amount.toFixed(2)} EGP
                        </p>
                      )}
                      <span className={`text-xs px-3 py-1.5 rounded-full inline-block mt-2 font-medium border ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {(hasMore || page > 1) && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing page {page} of transactions
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    >
                      Previous
                    </button>
                    <div className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold">
                      Page {page}
                    </div>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={!hasMore}
                      className="px-5 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
