import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import taskService from '../../services/taskService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Empty from '../../components/common/Empty';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  BriefcaseIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatRelativeTime } from '../../utils/helpers';

const MyTasks = () => {
  const { isClient, isFreelancer } = useAuth();

  // Determine initial tab based on user type
  const getInitialTab = () => {
    if (isClient && !isFreelancer) return 'posted';
    if (isFreelancer && !isClient) return 'applications';
    return 'posted'; // Default to posted if user is both
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch based on user type
      if (isClient && (activeTab === 'posted' || !isFreelancer)) {
        const data = await taskService.getMyTasks();
        setTasks(data.results || []);
      }

      if (isFreelancer && (activeTab === 'applications' || !isClient)) {
        const data = await taskService.getMyApplications();
        setApplications(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate time remaining until deadline
  const getTimeRemaining = (deadline) => {
    if (!deadline) return null;

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate - now;

    if (diff < 0) return { text: 'Overdue', isOverdue: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 7) return { text: `${days} days left`, isUrgent: false };
    if (days > 0) return { text: `${days}d ${hours}h left`, isUrgent: days <= 3 };
    if (hours > 0) return { text: `${hours}h left`, isUrgent: true };

    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { text: `${minutes}m left`, isUrgent: true };
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

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      IN_PROGRESS: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      COMPLETED: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
      CANCELLED: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
      PENDING: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      ACCEPTED: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800',
      REJECTED: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800',
    };
    return colors[status] || 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800';
  };

  // Filter and sort tasks/applications
  const filteredTasks = tasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || task.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'deadline':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline) - new Date(b.deadline);
        case 'budget-high':
          return (b.budget || 0) - (a.budget || 0);
        case 'budget-low':
          return (a.budget || 0) - (b.budget || 0);
        default:
          return 0;
      }
    });

  const filteredApplications = applications
    .filter(app => {
      const matchesSearch = app.task?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.proposal_text?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'all' || app.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'deadline':
          if (!a.task?.deadline) return 1;
          if (!b.task?.deadline) return -1;
          return new Date(a.task.deadline) - new Date(b.task.deadline);
        default:
          return 0;
      }
    });

  // Calculate stats
  const taskStats = {
    total: tasks.length,
    open: tasks.filter(t => t.status === 'OPEN').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    completed: tasks.filter(t => t.status === 'COMPLETED').length,
  };

  const appStats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'PENDING').length,
    accepted: applications.filter(a => a.status === 'ACCEPTED').length,
    rejected: applications.filter(a => a.status === 'REJECTED').length,
  };

  const TaskCard = ({ task }) => {
    const StatusIcon = getStatusIcon(task.status);
    const timeRemaining = getTimeRemaining(task.deadline);

    return (
      <Link to={`/tasks/${task.id}`} className="block h-full">
        <Card className="h-full hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border dark:border-gray-700">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-2 flex-1">
                <div className={`p-1.5 rounded-lg border ${getStatusColor(task.status)} flex-shrink-0`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition line-clamp-2">
                  {task.title}
                </h3>
              </div>
            </div>

            {/* Deadline Warning */}
            {timeRemaining && (
              <div className={`mb-3 px-3 py-2 rounded-lg border flex items-center gap-2 ${
                timeRemaining.isOverdue
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                  : timeRemaining.isUrgent
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
              }`}>
                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-semibold">{timeRemaining.text}</span>
              </div>
            )}

            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 text-sm flex-1">
              {task.description}
            </p>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center justify-between text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className="text-green-600 dark:text-green-400 font-bold flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                  {formatCurrency(task.budget)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-1" />
                  {task.applications_count || 0} applicants
                </span>
                <span className="flex items-center">
                  <CalendarIcon className="w-4 h-4 mr-1" />
                  {formatRelativeTime(task.created_at)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  const ApplicationCard = ({ application }) => {
    const StatusIcon = getStatusIcon(application.status);
    const timeRemaining = getTimeRemaining(application.task?.deadline);

    return (
      <Link to={`/tasks/${application.task?.id}`} className="block h-full">
        <Card className="h-full hover:shadow-lg transition-all duration-200 dark:bg-gray-800 dark:border dark:border-gray-700">
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-2 flex-1">
                <div className={`p-1.5 rounded-lg border ${getStatusColor(application.status)} flex-shrink-0`}>
                  <StatusIcon className="w-4 h-4" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition line-clamp-2">
                  {application.task?.title}
                </h3>
              </div>
            </div>

            {/* Deadline Warning */}
            {timeRemaining && (
              <div className={`mb-3 px-3 py-2 rounded-lg border flex items-center gap-2 ${
                timeRemaining.isOverdue
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                  : timeRemaining.isUrgent
                  ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400'
              }`}>
                <ClockIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs font-semibold">{timeRemaining.text}</span>
              </div>
            )}

            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Your Proposal:</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                {application.proposal_text || 'No proposal text'}
              </p>
            </div>

            <div className="space-y-3 mt-auto">
              <div className="flex items-center justify-between text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
                <span className="text-green-600 dark:text-green-400 font-bold flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-1" />
                  {formatCurrency(application.offered_price)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Applied {formatRelativeTime(application.created_at)}
                </span>
                {application.task?.budget && (
                  <span className="text-gray-400 dark:text-gray-500">
                    Budget: {formatCurrency(application.task.budget)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </Card>
      </Link>
    );
  };

  const StatCard = ({ label, value, color, icon: Icon }) => (
    <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shadow-sm`}>
          <Icon className="w-7 h-7" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8 px-6">
      <div className="container-custom">
        {/* Header - Centered */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">My Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {isClient && !isFreelancer && 'Manage and track your posted tasks'}
            {isFreelancer && !isClient && 'Track your applications and opportunities'}
            {isClient && isFreelancer && 'Manage your tasks and track all your applications'}
          </p>
        </div>

        {/* Quick Action Button for Clients Only */}
        {isClient && (
          <div className="flex justify-center mb-6">
            <Link to="/tasks/create">
              <Button variant="primary" icon={PlusIcon} size="lg" className="shadow-lg">
                Post New Task
              </Button>
            </Link>
          </div>
        )}

        {/* Stats Cards - Same style as Dashboard */}
        {activeTab === 'posted' && tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={BriefcaseIcon}
              label="Total Tasks"
              value={taskStats.total}
              color="bg-gradient-to-br from-primary-500 to-primary-600 text-white"
            />
            <StatCard
              icon={ClockIcon}
              label="Open"
              value={taskStats.open}
              color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            />
            <StatCard
              icon={ArrowTrendingUpIcon}
              label="In Progress"
              value={taskStats.inProgress}
              color="bg-gradient-to-br from-yellow-500 to-orange-600 text-white"
            />
            <StatCard
              icon={CheckCircleIcon}
              label="Completed"
              value={taskStats.completed}
              color="bg-gradient-to-br from-green-500 to-green-600 text-white"
            />
          </div>
        )}

        {activeTab === 'applications' && applications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={BriefcaseIcon}
              label="Total Applied"
              value={appStats.total}
              color="bg-gradient-to-br from-primary-500 to-primary-600 text-white"
            />
            <StatCard
              icon={ExclamationTriangleIcon}
              label="Pending"
              value={appStats.pending}
              color="bg-gradient-to-br from-yellow-500 to-orange-600 text-white"
            />
            <StatCard
              icon={CheckCircleIcon}
              label="Accepted"
              value={appStats.accepted}
              color="bg-gradient-to-br from-green-500 to-green-600 text-white"
            />
            <StatCard
              icon={XCircleIcon}
              label="Rejected"
              value={appStats.rejected}
              color="bg-gradient-to-br from-red-500 to-red-600 text-white"
            />
          </div>
        )}

        {/* Tabs - Only show if user is both client and freelancer */}
        {isClient && isFreelancer && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:border dark:border-gray-700 mb-6">
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setActiveTab('posted');
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className={`flex-1 py-4 px-6 font-medium transition-all relative ${
                  activeTab === 'posted'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <BriefcaseIcon className="w-5 h-5" />
                  <span>Posted Tasks</span>
                  {tasks.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === 'posted'
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tasks.length}
                    </span>
                  )}
                </div>
                {activeTab === 'posted' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
                )}
              </button>

              <button
                onClick={() => {
                  setActiveTab('applications');
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
                className={`flex-1 py-4 px-6 font-medium transition-all relative ${
                  activeTab === 'applications'
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <UserGroupIcon className="w-5 h-5" />
                  <span>My Applications</span>
                  {applications.length > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === 'applications'
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {applications.length}
                    </span>
                  )}
                </div>
                {activeTab === 'applications' && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"></div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        {(((isClient && !isFreelancer) || activeTab === 'posted') && tasks.length > 0) ||
         (((isFreelancer && !isClient) || activeTab === 'applications') && applications.length > 0) && (
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder={`Search ${(isClient && !isFreelancer) || activeTab === 'posted' ? 'tasks' : 'applications'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:text-white placeholder:text-gray-400"
              />
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <FunnelIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none bg-white dark:bg-gray-800 dark:text-white min-w-[180px]"
                >
                  <option value="all">All Status</option>
                  {((isClient && !isFreelancer) || activeTab === 'posted') ? (
                    <>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </>
                  ) : (
                    <>
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </>
                  )}
                </select>
              </div>
              <div className="relative">
                <ArrowTrendingUpIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none bg-white dark:bg-gray-800 dark:text-white min-w-[180px]"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="deadline">By Deadline</option>
                  {((isClient && !isFreelancer) || activeTab === 'posted') && (
                    <>
                      <option value="budget-high">Budget: High to Low</option>
                      <option value="budget-low">Budget: Low to High</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <Loading />
        ) : ((isClient && !isFreelancer) || activeTab === 'posted') ? (
          filteredTasks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : tasks.length > 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No tasks match your search or filter</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <Empty
              icon={BriefcaseIcon}
              title="No tasks yet"
              description="You haven't posted any tasks yet. Start by creating your first task!"
              action={
                <Link to="/tasks/create">
                  <Button variant="primary" icon={PlusIcon}>
                    Post Your First Task
                  </Button>
                </Link>
              }
            />
          )
        ) : (
          filteredApplications.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApplications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          ) : applications.length > 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No applications match your search or filter</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <Empty
              icon={BriefcaseIcon}
              title="No applications yet"
              description="You haven't applied to any tasks yet. Browse available tasks and start applying!"
              action={
                <Link to="/tasks">
                  <Button variant="primary" icon={BriefcaseIcon}>
                    Browse Tasks
                  </Button>
                </Link>
              }
            />
          )
        )}
      </div>
    </div>
  );
};

export default MyTasks;
