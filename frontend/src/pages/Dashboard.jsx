import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import taskService from '../services/taskService';
import recommendationService from '../services/recommendationService';
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
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user, isClient, isFreelancer } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [recommendedTasks, setRecommendedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch statistics
      const statsData = await taskService.getMyStatistics();
      setStats(statsData);

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

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
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
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-8 px-6">
        {/* Welcome Section with Gradient */}
        <div className="mb-8 bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-700 dark:to-blue-700 rounded-2xl p-6 text-white shadow-lg max-w-2xl">
          <h1 className="text-2xl font-bold mb-2">
            Welcome back, {user?.first_name || user?.username}! 👋
          </h1>
          <p className="text-primary-50 dark:text-primary-100 text-sm">
            {isClient && 'Manage your tasks and find the perfect freelancers for your projects'}
            {isFreelancer && 'Discover new opportunities and grow your freelance business'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            icon={isClient ? FireIcon : SparklesIcon}
            label={isClient ? 'Active Tasks' : 'Accepted Apps'}
            value={isClient ? stats?.open_tasks || 0 : stats?.applications_accepted || 0}
            color="bg-gradient-to-br from-yellow-500 to-orange-600 text-white"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/40 rounded-lg flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Actions</h2>
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
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                    <CalendarDaysIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {isClient ? 'Your Tasks Overview' : 'Your Applications Overview'}
                  </h2>
                </div>
                <Link
                  to="/my-tasks"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium flex items-center"
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
                        className="group relative p-4 bg-white dark:bg-gray-750 rounded-xl hover:shadow-md transition-all duration-200 border border-gray-100 dark:border-gray-600"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${getStatusColor(status)} flex-shrink-0`}>
                                <StatusIcon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition line-clamp-1">
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
                            className="btn btn-sm btn-outline flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            View
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
            {/* AI Recommendations for Freelancers */}
            {isFreelancer && recommendedTasks.length > 0 && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
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

            {/* Profile Summary */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Your Profile</h2>
              </div>

              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                  {user?.first_name} {user?.last_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">
                  {user?.user_type?.toLowerCase()}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {user?.email}
                </p>
              </div>

              <div className="space-y-2">
                <Link to="/profile">
                  <Button variant="outline" fullWidth>
                    Edit Profile
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Performance Stats */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Performance</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-300">Success Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats?.completed_tasks && stats?.posted_tasks
                        ? Math.round((stats.completed_tasks / (stats.posted_tasks || 1)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all shadow-sm"
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
                    <span className="text-gray-600 dark:text-gray-300">Active Rate</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {stats?.in_progress_tasks && stats?.posted_tasks
                        ? Math.round((stats.in_progress_tasks / (stats.posted_tasks || 1)) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all shadow-sm"
                      style={{
                        width: `${stats?.in_progress_tasks && stats?.posted_tasks
                          ? Math.round((stats.in_progress_tasks / (stats.posted_tasks || 1)) * 100)
                          : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
