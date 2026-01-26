import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import taskService from '../../services/taskService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Empty from '../../components/common/Empty';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import toast from 'react-hot-toast';
import { formatCurrency, formatRelativeTime } from '../../utils/helpers';
import {
  BookmarkIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TrashIcon,
  ArrowRightIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const SavedTasks = () => {
  const { user } = useAuth();
  const [savedTasks, setSavedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [taskToRemove, setTaskToRemove] = useState(null);

  useEffect(() => {
    fetchSavedTasks();
  }, []);

  const fetchSavedTasks = async () => {
    try {
      setLoading(true);
      const data = await taskService.getSavedTasks();
      setSavedTasks(data.results || data || []);
    } catch (error) {
      console.error('Error fetching saved tasks:', error);
      toast.error('Failed to load saved tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (savedTask) => {
    setTaskToRemove(savedTask);
    setShowRemoveConfirm(true);
  };

  const confirmRemove = async () => {
    if (!taskToRemove) return;

    try {
      setRemovingId(taskToRemove.task.id);
      await taskService.toggleSaveTask(taskToRemove.task.id);
      setSavedTasks(prev => prev.filter(st => st.id !== taskToRemove.id));
      toast.success('Task removed from saved list');
    } catch (error) {
      console.error('Error removing saved task:', error);
      toast.error('Failed to remove task');
    } finally {
      setRemovingId(null);
      setShowRemoveConfirm(false);
      setTaskToRemove(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'success';
      case 'IN_PROGRESS': return 'warning';
      case 'COMPLETED': return 'info';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container-custom">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-blue-600 dark:from-primary-700 dark:via-purple-700 dark:to-blue-700 py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10 px-6 md:px-8 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
            <BookmarkSolidIcon className="w-5 h-5" />
            {savedTasks.length} Saved {savedTasks.length === 1 ? 'Task' : 'Tasks'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Saved Tasks
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Your bookmarked tasks for easy access later
          </p>
        </div>
      </div>

      <div className="container-custom py-8 px-6 md:px-8 lg:px-12">
        {savedTasks.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookmarkIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No saved tasks yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                When you find tasks you're interested in, click the bookmark icon to save them here for later.
              </p>
              <Link to="/tasks">
                <Button variant="primary" icon={BriefcaseIcon}>
                  Browse Tasks
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {savedTasks.map((savedTask) => (
              <Card
                key={savedTask.id}
                className="dark:bg-gray-800 dark:border dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Task Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                        <BriefcaseIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link
                            to={`/tasks/${savedTask.task.id}`}
                            className="font-bold text-lg text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                          >
                            {savedTask.task.title}
                          </Link>
                          <Badge variant={getStatusColor(savedTask.task.status)}>
                            {savedTask.task.status}
                          </Badge>
                        </div>

                        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-2">
                          {savedTask.task.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <CurrencyDollarIcon className="w-4 h-4" />
                            {formatCurrency(savedTask.task.budget)}
                          </span>
                          {savedTask.task.location && (
                            <span className="flex items-center gap-1">
                              <MapPinIcon className="w-4 h-4" />
                              {savedTask.task.city || savedTask.task.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            Saved {formatRelativeTime(savedTask.created_at)}
                          </span>
                        </div>

                        {savedTask.note && (
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                            Note: {savedTask.note}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 lg:flex-shrink-0">
                    <Link to={`/tasks/${savedTask.task.id}`}>
                      <Button variant="primary" size="sm" icon={ArrowRightIcon}>
                        View Task
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(savedTask)}
                      loading={removingId === savedTask.task.id}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <Link to="/tasks">
            <Button variant="outline">
              Browse More Tasks
            </Button>
          </Link>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRemoveConfirm}
        onClose={() => {
          setShowRemoveConfirm(false);
          setTaskToRemove(null);
        }}
        onConfirm={confirmRemove}
        title="Remove from Saved?"
        message={`Are you sure you want to remove "${taskToRemove?.task?.title}" from your saved tasks?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default SavedTasks;
