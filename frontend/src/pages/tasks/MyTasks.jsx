import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import taskService from '../../services/taskService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Empty from '../../components/common/Empty';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { BriefcaseIcon, PlusIcon } from '@heroicons/react/24/outline';
import { formatCurrency, formatRelativeTime } from '../../utils/helpers';

const MyTasks = () => {
  const { user, isClient, isFreelancer } = useAuth();
  const [activeTab, setActiveTab] = useState(isClient ? 'posted' : 'applications');
  const [tasks, setTasks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      if (activeTab === 'posted') {
        const data = await taskService.getMyTasks();
        setTasks(data.results || []);
      } else {
        const data = await taskService.getMyApplications();
        setApplications(data.results || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const TaskCard = ({ task }) => (
    <Link to={`/tasks/${task.id}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition">
            {task.title}
          </h3>
          <Badge variant={task.status === 'OPEN' ? 'success' : 'gray'}>
            {task.status}
          </Badge>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {task.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {formatRelativeTime(task.created_at)}
          </span>
          <span className="text-gray-500">
            {task.applications_count || 0} applications
          </span>
          <span className="text-2xl font-bold text-primary-600">
            {formatCurrency(task.budget)}
          </span>
        </div>
      </Card>
    </Link>
  );

  const ApplicationCard = ({ application }) => (
    <Link to={`/tasks/${application.task?.id}`}>
      <Card hover>
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition">
            {application.task?.title}
          </h3>
          <Badge
            variant={
              application.status === 'ACCEPTED' ? 'success' :
              application.status === 'PENDING' ? 'warning' : 'danger'
            }
          >
            {application.status}
          </Badge>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {application.proposal}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            Applied {formatRelativeTime(application.created_at)}
          </span>
          <span className="text-xl font-bold text-primary-600">
            {formatCurrency(application.offered_price)}
          </span>
        </div>
      </Card>
    </Link>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Tasks</h1>
            <p className="text-gray-600">
              {isClient ? 'Manage your posted tasks' : 'Track your applications'}
            </p>
          </div>

          {isClient && (
            <Link to="/tasks/create">
              <Button variant="primary" icon={PlusIcon}>
                Post New Task
              </Button>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          {isClient && (
            <button
              onClick={() => setActiveTab('posted')}
              className={`pb-4 px-4 font-medium transition ${
                activeTab === 'posted'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Posted Tasks
            </button>
          )}

          {isFreelancer && (
            <button
              onClick={() => setActiveTab('applications')}
              className={`pb-4 px-4 font-medium transition ${
                activeTab === 'applications'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Applications
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <Loading />
        ) : activeTab === 'posted' ? (
          tasks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <Empty
              icon={BriefcaseIcon}
              title="No tasks yet"
              description="You haven't posted any tasks yet"
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
          applications.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map((app) => (
                <ApplicationCard key={app.id} application={app} />
              ))}
            </div>
          ) : (
            <Empty
              icon={BriefcaseIcon}
              title="No applications yet"
              description="You haven't applied to any tasks yet"
              action={
                <Link to="/tasks">
                  <Button variant="primary">
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