import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import taskService from '../../services/taskService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import {
  MapPinIcon,
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/helpers';

const TaskDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isFreelancer } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposal: '',
    offered_price: '',
    estimated_time: '',
    cover_letter: '',
  });
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [id]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTask(id);
      setTask(data);
      // Pre-fill offered price with task budget
      setApplicationData(prev => ({
        ...prev,
        offered_price: data.budget,
      }));
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Task not found');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please login to apply');
      navigate('/login');
      return;
    }

    if (!isFreelancer) {
      toast.error('Only freelancers can apply to tasks');
      return;
    }

    try {
      setApplying(true);
      await taskService.applyToTask(id, applicationData);
      toast.success('Application submitted successfully!');
      setShowApplyModal(false);
      fetchTask(); // Refresh task data
    } catch (error) {
      toast.error('Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleComplete = async () => {
    if (window.confirm('Mark this task as completed?')) {
      try {
        await taskService.completeTask(id);
        toast.success('Task marked as completed');
        fetchTask();
      } catch (error) {
        toast.error('Failed to complete task');
      }
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel this task?')) {
      try {
        await taskService.cancelTask(id);
        toast.success('Task cancelled');
        fetchTask();
      } catch (error) {
        toast.error('Failed to cancel task');
      }
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  if (!task) {
    return null;
  }

  const isOwner = user?.id === task.client?.id;
  const canApply = task.can_apply && !task.is_applied;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Header */}
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Badge variant={task.status === 'OPEN' ? 'success' : 'gray'}>
                      {task.status}
                    </Badge>
                    {task.is_remote && <Badge variant="info">Remote</Badge>}
                    <Badge variant="primary">{task.task_type}</Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {task.title}
                  </h1>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{formatRelativeTime(task.created_at)}</span>
                    <span>•</span>
                    <span>{task.views_count} views</span>
                    <span>•</span>
                    <span>{task.applications_count} applications</span>
                  </div>
                </div>

                {isOwner && task.status === 'OPEN' && (
                  <div className="flex space-x-2">
                    <Link to={`/tasks/${task.id}/edit`}>
                      <Button variant="secondary" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button variant="danger" size="sm" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              {/* Task Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CurrencyDollarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Budget</p>
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(task.budget)}
                    </p>
                  </div>
                </div>

                {task.location && (
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-semibold text-gray-900">{task.city || task.location}</p>
                    </div>
                  </div>
                )}

                {task.deadline && (
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Deadline</p>
                      <p className="font-semibold text-gray-900">
                        {formatDate(task.deadline)}
                      </p>
                    </div>
                  </div>
                )}

                {task.estimated_duration && (
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-semibold text-gray-900">
                        {task.estimated_duration}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
                {task.description}
              </div>

              {task.category && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Badge variant="gray">{task.category.name}</Badge>
                </div>
              )}
            </Card>

            {/* Images */}
            {task.images && task.images.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Attachments</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {task.images.map((image) => (
                    <img
                      key={image.id}
                      src={image.image}
                      alt={image.caption || 'Task image'}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">Posted by</h3>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar user={task.client} size="lg" />
                <div>
                  <Link
                    to={`/users/${task.client?.username}`}
                    className="font-medium text-gray-900 hover:text-primary-600"
                  >
                    {task.client?.username}
                  </Link>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>⭐ {task.client?.average_rating || 0}</span>
                    <span className="mx-1">•</span>
                    <span>{task.client?.total_reviews || 0} reviews</span>
                  </div>
                </div>
              </div>

              {task.client?.bio && (
                <p className="text-sm text-gray-600 mb-4">{task.client.bio}</p>
              )}

              {!isOwner && isAuthenticated && (
                <Link to={`/messages?user=${task.client?.id}`}>
                  <Button variant="outline" fullWidth>
                    Contact Client
                  </Button>
                </Link>
              )}
            </Card>

            {/* Actions */}
            {canApply && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Apply to this task</h3>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setShowApplyModal(true)}
                >
                  Apply Now
                </Button>
              </Card>
            )}

            {task.is_applied && (
              <Card>
                <div className="flex items-center space-x-2 text-green-600 mb-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  <span className="font-semibold">Already Applied</span>
                </div>
                <p className="text-sm text-gray-600">
                  You have already submitted an application for this task.
                </p>
              </Card>
            )}

            {isOwner && task.status === 'IN_PROGRESS' && (
              <Card>
                <h3 className="font-semibold text-gray-900 mb-4">Mark as Completed</h3>
                <Button variant="success" fullWidth onClick={handleComplete}>
                  Complete Task
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Apply to Task</h2>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposal <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={applicationData.proposal}
                      onChange={(e) => setApplicationData({
                        ...applicationData,
                        proposal: e.target.value
                      })}
                      rows={4}
                      placeholder="Explain why you're the best fit for this task..."
                      className="textarea-field"
                      required
                    />
                  </div>

                  <Input
                    label="Your Price (EGP)"
                    type="number"
                    value={applicationData.offered_price}
                    onChange={(e) => setApplicationData({
                      ...applicationData,
                      offered_price: e.target.value
                    })}
                    placeholder="Enter your price"
                    required
                  />

                  <Input
                    label="Estimated Time"
                    value={applicationData.estimated_time}
                    onChange={(e) => setApplicationData({
                      ...applicationData,
                      estimated_time: e.target.value
                    })}
                    placeholder="e.g., 2 days, 1 week"
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cover Letter
                    </label>
                    <textarea
                      value={applicationData.cover_letter}
                      onChange={(e) => setApplicationData({
                        ...applicationData,
                        cover_letter: e.target.value
                      })}
                      rows={3}
                      placeholder="Additional information..."
                      className="textarea-field"
                    />
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={() => setShowApplyModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={applying}
                    >
                      Submit Application
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;