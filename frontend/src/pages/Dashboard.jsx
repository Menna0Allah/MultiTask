import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import taskService from '../services/taskService';
import recommendationService from '../services/recommendationService';
import paymentService from '../services/paymentService';
import authService from '../services/authService';
import toast from 'react-hot-toast';
import {
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  SparklesIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  FireIcon,
  CalendarDaysIcon,
  WalletIcon,
  BanknotesIcon,
  EnvelopeIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, isClient, isFreelancer } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recommendedTasks, setRecommendedTasks] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Check if banner was dismissed
    const dismissed = localStorage.getItem(`email-verification-banner-dismissed-${user?.email}`);
    if (dismissed === 'true') {
      setBannerDismissed(true);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch statistics
      const statsData = await taskService.getMyStatistics();
      setStats(statsData);

      // Fetch wallet data
      try {
        const walletData = await paymentService.getWallet();
        setWallet(walletData);
      } catch (walletError) {
        console.error('Error fetching wallet data:', walletError);
        // Continue even if wallet fetch fails
      }

      // Fetch recent tasks with more details
      if (isClient) {
        const tasksData = await taskService.getMyTasks({ ordering: '-created_at' });
        setRecentTasks(tasksData.results?.slice(0, 8) || []);
      } else {
        const appsData = await taskService.getMyApplications({ ordering: '-created_at' });
        setRecentTasks(appsData.results?.slice(0, 8) || []);
      }

      // Fetch recommendations for freelancers
      if (isFreelancer) {
        const recData = await recommendationService.getRecommendedTasks({ limit: 5 });
        setRecommendedTasks(recData.results || recData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
      IN_PROGRESS: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
      COMPLETED: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
      CANCELLED: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
      PENDING: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400',
      ACCEPTED: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
      REJECTED: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
    };
    return colors[status] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getStatusIcon = (status) => {
    const icons = {
      OPEN: ClockIcon,
      IN_PROGRESS: ArrowTrendingUpIcon,
      COMPLETED: CheckCircleIcon,
      CANCELLED: XCircleIcon,
      PENDING: ExclamationTriangleIcon,
      ACCEPTED: CheckCircleIcon,
      REJECTED: XCircleIcon,
    };
    return icons[status] || ClockIcon;
  };

  const handleDismissBanner = () => {
    setBannerDismissed(true);
    localStorage.setItem(`email-verification-banner-dismissed-${user?.email}`, 'true');
  };

  const handleResendVerification = async () => {
    if (!user?.email) {
      toast.error('Email address not found');
      return;
    }

    try {
      setResendingEmail(true);
      await authService.resendVerificationEmail(user.email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error) {
      console.error('Resend verification error:', error);
      toast.error(error.response?.data?.detail || 'Failed to resend verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, trend, link }) => {
    const cardContent = (
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              <ArrowTrendingUpIcon className={`w-4 h-4 mr-1 ${!trend.positive && 'rotate-180'}`} />
              {trend.value}% this month
            </p>
          )}
        </div>
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-lg transform transition-transform ${link ? 'group-hover:scale-110' : ''}`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    );

    if (link) {
      return (
        <Link to={link} className="group">
          <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer">
            {cardContent}
          </Card>
        </Link>
      );
    }

    return (
      <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
        {cardContent}
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8 px-6 md:px-8 lg:px-12">
        {/* Modern Welcome Section with Profile and Performance */}
        <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-blue-600 dark:from-primary-700 dark:via-purple-700 dark:to-blue-700 rounded-3xl p-8 text-white shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-6 mb-6">
              {/* Left: Welcome Message */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                    <p className="text-white font-bold text-lg">
                      {user?.first_name} {user?.last_name}
                    </p>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold">
                      Welcome back!
                    </h1>
                    <p className="text-white/90 text-sm mt-1">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <p className="text-white/90 text-base mt-4">
                  {isClient && '💼 Manage your tasks and find the perfect freelancers for your projects'}
                  {isFreelancer && '🚀 Discover new opportunities and grow your freelance business'}
                </p>
              </div>

              {/* Right: Edit Profile Button */}
              <div className="flex flex-col items-center gap-2">
                <Link to="/profile">
                  <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-8 py-3 rounded-xl text-sm font-bold transition-all border-2 border-white/30 hover:border-white/50 shadow-xl hover:shadow-2xl hover:scale-105 transform">
                    Edit Profile
                  </button>
                </Link>
                <p className="text-white/80 text-xs capitalize">
                  {user?.user_type?.toLowerCase()}
                </p>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/20">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">Success Rate</span>
                  <span className="font-semibold text-white">
                    {stats?.completed_tasks && stats?.posted_tasks
                      ? Math.round((stats.completed_tasks / (stats.posted_tasks || 1)) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-green-400 to-green-300 h-2.5 rounded-full transition-all shadow-sm"
                    style={{
                      width: `${stats?.completed_tasks && stats?.posted_tasks
                        ? Math.round((stats.completed_tasks / (stats.posted_tasks || 1)) * 100)
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-white/80">Active Rate</span>
                  <span className="font-semibold text-white">
                    {stats?.in_progress_tasks && stats?.posted_tasks
                      ? Math.round((stats.in_progress_tasks / (stats.posted_tasks || 1)) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-blue-400 to-blue-300 h-2.5 rounded-full transition-all shadow-sm"
                    style={{
                      width: `${stats?.in_progress_tasks && stats?.posted_tasks
                        ? Math.round((stats.in_progress_tasks / (stats.posted_tasks || 1)) * 100)
                        : 0}%`
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Email Verification Banner */}
        {user && !user.is_email_verified && !bannerDismissed && (
          <div className="mb-8 relative overflow-hidden bg-gradient-to-r from-yellow-50 via-orange-50 to-yellow-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-2xl p-6 shadow-lg animate-pulse-slow">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-300/20 dark:bg-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-2xl"></div>

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4 flex-1">
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <span>Verify Your Email Address</span>
                    <span className="px-2 py-0.5 bg-yellow-500 text-white text-xs font-bold rounded-full">
                      Action Required
                    </span>
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                    We sent a verification email to <span className="font-semibold text-gray-900 dark:text-white">{user.email}</span>.
                    Please verify your email to unlock all features and ensure account security.
                  </p>

                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={handleResendVerification}
                      disabled={resendingEmail}
                      className="px-5 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
                    >
                      {resendingEmail ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </>
                      ) : (
                        <>
                          <EnvelopeIcon className="w-4 h-4" />
                          Resend Verification Email
                        </>
                      )}
                    </button>

                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Didn't receive it? Check your spam folder or click resend.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={handleDismissBanner}
                className="flex-shrink-0 w-8 h-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors group"
                aria-label="Dismiss banner"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
              </button>
            </div>
          </div>
        )}

        {/* Stats Grid - Enhanced with Wallet & Earnings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            icon={BriefcaseIcon}
            label={isClient ? 'Total Posted Tasks' : 'Total Applications'}
            value={isClient ? stats?.posted_tasks || 0 : stats?.applications_sent || 0}
            color="bg-gradient-to-br from-primary-500 to-primary-600 text-white"
          />

          <StatCard
            icon={ClockIcon}
            label="In Progress"
            value={stats?.in_progress_tasks || 0}
            color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          />

          <StatCard
            icon={CheckCircleIcon}
            label="Completed"
            value={stats?.completed_tasks || 0}
            color="bg-gradient-to-br from-green-500 to-green-600 text-white"
          />

          <StatCard
            icon={WalletIcon}
            label="Wallet Balance"
            value={`${wallet?.available_balance || 0} EGP`}
            color="bg-gradient-to-br from-emerald-500 to-teal-600 text-white"
            link="/wallet"
          />

          <StatCard
            icon={BanknotesIcon}
            label={isFreelancer ? "Total Earnings" : "Total Spent"}
            value={`${wallet?.total_earned || wallet?.total_spent || 0} EGP`}
            color="bg-gradient-to-br from-yellow-500 to-orange-600 text-white"
            link="/transactions"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                  Start here
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {isClient ? (
                  <>
                    <Link to="/tasks/create">
                      <Button variant="primary" fullWidth icon={PlusIcon} className="h-12">
                        Post New Task
                      </Button>
                    </Link>
                    <Link to="/my-tasks">
                      <Button variant="secondary" fullWidth icon={BriefcaseIcon} className="h-12">
                        Manage Tasks
                      </Button>
                    </Link>
                    <Link to="/messages">
                      <Button variant="outline" fullWidth icon={UserGroupIcon} className="h-12">
                        Messages
                      </Button>
                    </Link>
                    <Link to="/categories">
                      <Button variant="outline" fullWidth icon={ChartBarIcon} className="h-12">
                        Browse Categories
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/tasks">
                      <Button variant="primary" fullWidth icon={BriefcaseIcon} className="h-12">
                        Browse Tasks
                      </Button>
                    </Link>
                    <Link to="/recommendations">
                      <Button variant="secondary" fullWidth icon={SparklesIcon} className="h-12">
                        For You
                      </Button>
                    </Link>
                    <Link to="/my-tasks">
                      <Button variant="outline" fullWidth icon={ClockIcon} className="h-12">
                        My Applications
                      </Button>
                    </Link>
                    <Link to="/messages">
                      <Button variant="outline" fullWidth icon={UserGroupIcon} className="h-12">
                        Messages
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </Card>

            {/* Recent Activity with Tabs */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                    <CalendarDaysIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {isClient ? 'Your Tasks Overview' : 'Your Applications Overview'}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Recent activity</p>
                  </div>
                </div>
                <Link
                  to="/my-tasks"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center hover:bg-primary-50 dark:hover:bg-primary-900/20 px-4 py-2 rounded-lg transition-all"
                >
                  View All
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map((item) => {
                    const status = isClient ? item.status : item.status;
                    const StatusIcon = getStatusIcon(status);
                    const taskTitle = isClient ? item.title : item.task?.title;
                    const taskId = isClient ? item.id : item.task?.id;

                    return (
                      <div
                        key={item.id}
                        className="group relative p-5 bg-white dark:bg-gray-700 rounded-xl hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-gray-100 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${getStatusColor(status)} flex-shrink-0 shadow-sm`}>
                                <StatusIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition line-clamp-1 text-lg">
                                  {taskTitle}
                                </h3>

                                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                                  {isClient ? (
                                    <>
                                      <span className="flex items-center">
                                        <UserGroupIcon className="w-4 h-4 mr-1" />
                                        {item.applications_count || 0} applications
                                      </span>
                                      {item.budget && (
                                        <span className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                                          <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                          {item.budget} EGP
                                        </span>
                                      )}
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                        {status.replace('_', ' ')}
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                        {status}
                                      </span>
                                      {item.task?.budget && (
                                        <span className="flex items-center text-green-600 dark:text-green-400 font-semibold">
                                          <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                                          {item.task.budget} EGP
                                        </span>
                                      )}
                                      {item.created_at && (
                                        <span className="flex items-center text-xs">
                                          <ClockIcon className="w-3.5 h-3.5 mr-1" />
                                          Applied {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>

                                {!isClient && item.proposal_text && (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                                    Your proposal: {item.proposal_text}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          <Link
                            to={`/tasks/${taskId}`}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BriefcaseIcon className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No recent activity</p>
                  {isClient ? (
                    <Link to="/tasks/create">
                      <Button variant="primary" icon={PlusIcon}>
                        Post Your First Task
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/tasks">
                      <Button variant="primary" icon={BriefcaseIcon}>
                        Browse Available Tasks
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Quick Access */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-emerald-200 dark:border-emerald-700 p-5">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                  <WalletIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Wallet</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Financial Overview</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-white dark:bg-gray-700 rounded-xl p-4 shadow-sm">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Available Balance</p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    {wallet?.available_balance || 0} EGP
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                    <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {wallet?.pending_balance || 0} EGP
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total {isFreelancer ? 'Earned' : 'Spent'}</p>
                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {wallet?.total_earned || wallet?.total_spent || 0} EGP
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Link to="/wallet">
                    <Button variant="primary" size="sm" fullWidth icon={WalletIcon}>
                      Wallet
                    </Button>
                  </Link>
                  <Link to="/transactions">
                    <Button variant="outline" size="sm" fullWidth icon={ChartBarIcon}>
                      History
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* AI Recommendations for Freelancers */}
            {isFreelancer && recommendedTasks.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 p-5">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Picks for You</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-300">Based on your profile</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {recommendedTasks.map((task) => (
                    <Link
                      key={task.id}
                      to={`/tasks/${task.id}`}
                      className="block p-4 bg-gradient-to-br from-primary-50 via-purple-50 to-blue-50 dark:from-primary-900/30 dark:via-purple-900/30 dark:to-blue-900/30 rounded-xl hover:shadow-md transition-all border border-primary-100 dark:border-primary-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                          {task.title}
                        </h3>
                        <span className="px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded-full ml-2 flex-shrink-0">
                          NEW
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-green-600 dark:text-green-400 font-bold flex items-center">
                          <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                          {task.budget} EGP
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 flex items-center">
                          <UserGroupIcon className="w-4 h-4 mr-1" />
                          {task.applications_count || 0} applicants
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>

                <Link to="/recommendations" className="block mt-4">
                  <Button variant="outline" fullWidth size="sm" icon={SparklesIcon}>
                    View All Recommendations
                  </Button>
                </Link>
              </Card>
            )}

            {/* Quick Tip */}
            {(stats?.completed_tasks || 0) < 5 && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 p-5">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">💡 Pro Tip</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {isClient
                        ? "Add detailed descriptions and clear requirements to your tasks to attract the best freelancers!"
                        : "Complete your profile with skills and portfolio items to increase your chances of getting hired!"
                      }
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
