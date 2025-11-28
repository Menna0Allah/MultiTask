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

      // Fetch recent tasks
      if (isClient) {
        const tasksData = await taskService.getMyTasks({ ordering: '-created_at' });
        setRecentTasks(tasksData.results?.slice(0, 5) || []);
      } else {
        const appsData = await taskService.getMyApplications({ ordering: '-created_at' });
        setRecentTasks(appsData.results?.slice(0, 5) || []);
      }

      // Fetch recommendations for freelancers
      if (isFreelancer) {
        const recData = await recommendationService.getRecommendedTasks(5);
        setRecommendedTasks(recData.results || recData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.first_name || user?.username}!
        </h1>
        <p className="text-gray-600">
          {isClient && 'Manage your tasks and find the perfect freelancers'}
          {isFreelancer && 'Find new opportunities and grow your business'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {isClient ? 'Posted Tasks' : 'Applications'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {isClient ? stats?.posted_tasks || 0 : stats?.applications_sent || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <BriefcaseIcon className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.in_progress_tasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ClockIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.completed_tasks || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {isClient ? 'Active' : 'Accepted'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {isClient ? stats?.open_tasks || 0 : stats?.applications_accepted || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              {isClient ? (
                <>
                  <Link to="/tasks/create">
                    <Button variant="primary" fullWidth icon={PlusIcon}>
                      Post New Task
                    </Button>
                  </Link>
                  <Link to="/my-tasks">
                    <Button variant="secondary" fullWidth>
                      View My Tasks
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/tasks">
                    <Button variant="primary" fullWidth>
                      Browse Tasks
                    </Button>
                  </Link>
                  <Link to="/my-tasks">
                    <Button variant="secondary" fullWidth>
                      My Applications
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {isClient ? 'Recent Tasks' : 'Recent Applications'}
              </h2>
              <Link to="/my-tasks" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View All
              </Link>
            </div>

            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {isClient ? item.title : item.task?.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {isClient ? (
                          `${item.applications_count || 0} applications`
                        ) : (
                          <span className={`badge ${
                            item.status === 'ACCEPTED' ? 'badge-success' : 
                            item.status === 'PENDING' ? 'badge-warning' : 'badge-danger'
                          }`}>
                            {item.status}
                          </span>
                        )}
                      </p>
                    </div>
                    <Link
                      to={isClient ? `/tasks/${item.id}` : `/tasks/${item.task?.id}`}
                      className="btn btn-sm btn-outline"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Recommendations for Freelancers */}
          {isFreelancer && recommendedTasks.length > 0 && (
            <Card>
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
              </div>

              <div className="space-y-3">
                {recommendedTasks.map((task) => (
                  <Link
                    key={task.id}
                    to={`/tasks/${task.id}`}
                    className="block p-3 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg hover:shadow-md transition"
                  >
                    <h3 className="font-medium text-gray-900 mb-1">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {task.description?.substring(0, 60)}...
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-primary-600 font-semibold">
                        {task.budget} EGP
                      </span>
                      <span className="text-gray-500">
                        {task.applications_count || 0} applications
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              <Link to="/recommendations" className="block mt-4">
                <Button variant="outline" fullWidth size="sm">
                  View All Recommendations
                </Button>
              </Link>
            </Card>
          )}

          {/* Profile Completion */}
          <Card>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Profile</h2>
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-primary-600">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">
                {user?.first_name} {user?.last_name}
              </h3>
              <p className="text-sm text-gray-600">
                {user?.user_type}
              </p>
            </div>
            
            <Link to="/profile">
              <Button variant="outline" fullWidth>
                Edit Profile
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;