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
  EyeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/helpers';

const TaskDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isFreelancer } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposal: '',
    offered_price: '',
    estimated_time: '',
    cover_letter: '',
  });
  const [applying, setApplying] = useState(false);
  const [canceling, setCanceling] = useState(false);

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

  const handleCancelConfirm = async () => {
    try {
      setCanceling(true);
      await taskService.cancelTask(id);
      toast.success('Task cancelled successfully');
      setShowCancelModal(false);
      fetchTask();
    } catch (error) {
      toast.error('Failed to cancel task');
    } finally {
      setCanceling(false);
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
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom max-w-7xl px-6">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center space-x-2 text-sm">
          <Link to="/tasks" className="text-primary-600 hover:text-primary-700 font-medium">
            Browse Tasks
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">{task.title}</span>
        </nav>

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

                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-gray-500">
                      <ClockIcon className="w-4 h-4" />
                      <span>{formatRelativeTime(task.created_at)}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center space-x-1 text-blue-600">
                      <EyeIcon className="w-4 h-4" />
                      <span className="font-medium">{task.views_count}</span>
                    </div>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center space-x-1 text-green-600">
                      <UserGroupIcon className="w-4 h-4" />
                      <span className="font-medium">{task.applications_count}</span>
                    </div>
                  </div>
                </div>

                {isOwner && task.status === 'OPEN' && (
                  <div className="flex space-x-3">
                    <Link to={`/tasks/${task.id}/edit`}>
                      <button className="inline-flex items-center px-6 py-2.5 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Task
                      </button>
                    </Link>
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="group relative inline-flex items-center px-6 py-2.5 bg-white/90 backdrop-blur-md border-2 border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50/90 hover:border-red-400 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 overflow-hidden"
                    >
                      {/* Animated gradient background on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>

                      <svg className="w-4 h-4 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="relative z-10">Cancel Task</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Task Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-1">Budget</p>
                    <p className="font-bold text-lg text-gray-900">
                      {formatCurrency(task.budget)}
                    </p>
                  </div>
                </div>

                {task.location && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPinIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Location</p>
                      <p className="font-bold text-gray-900">{task.city || task.location}</p>
                    </div>
                  </div>
                )}

                {task.deadline && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CalendarIcon className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Deadline</p>
                      <p className="font-bold text-gray-900">
                        {formatDate(task.deadline)}
                      </p>
                    </div>
                  </div>
                )}

                {task.estimated_duration && (
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ClockIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Duration</p>
                      <p className="font-bold text-gray-900">
                        {task.estimated_duration}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Description */}
            <Card>
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Task Description</h2>
                <p className="text-sm text-gray-500 mt-1">Detailed requirements and expectations</p>
              </div>
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </div>

              {task.category && (
                <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Category</p>
                    <Badge variant="primary" size="lg">{task.category.name}</Badge>
                  </div>
                  {task.is_negotiable && (
                    <div className="flex items-center space-x-2 text-sm text-green-600">
                      <CheckCircleIcon className="w-5 h-5" />
                      <span className="font-medium">Negotiable Budget</span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Images */}
            {task.images && task.images.length > 0 && (
              <Card>
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Attachments</h2>
                  <p className="text-sm text-gray-500 mt-1">{task.images.length} file{task.images.length > 1 ? 's' : ''} attached</p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {task.images.map((image) => (
                    <div key={image.id} className="group relative">
                      <img
                        src={image.image}
                        alt={image.caption || 'Task image'}
                        className="w-full h-48 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 rounded-b-lg">
                          <p className="text-white text-sm font-medium">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6 self-start">
            <div className="sticky top-8 space-y-6">
            {/* Client Info */}
            <Card className="border-2 border-gray-200">
              <div className="border-b border-gray-200 pb-3 mb-4">
                <h3 className="font-bold text-gray-900 text-lg">Client Information</h3>
              </div>
              <div className="flex items-start space-x-4 mb-4">
                <Avatar user={task.client} size="lg" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {isOwner ? (
                      <Link
                        to="/profile"
                        className="font-bold text-lg text-gray-900 hover:text-primary-600 transition-colors"
                      >
                        {task.client?.username}
                      </Link>
                    ) : (
                      <span className="font-bold text-lg text-gray-900">
                        {task.client?.username}
                      </span>
                    )}
                    {isOwner && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-100 text-primary-800">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <div className="flex items-center text-sm">
                      <span className="text-yellow-500">★</span>
                      <span className="ml-1 font-semibold text-gray-900">{task.client?.average_rating || 0}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm text-gray-600">{task.client?.total_reviews || 0} reviews</span>
                  </div>
                </div>
              </div>

              {task.client?.bio && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 italic">{task.client.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary-600">{task.client?.tasks_posted || 0}</p>
                  <p className="text-xs text-gray-600">Tasks Posted</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{task.client?.tasks_completed || 0}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </div>

              {!isOwner && isAuthenticated && (
                <Link to={`/messages?user=${task.client?.id}`}>
                  <button className="w-full inline-flex items-center justify-center px-4 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-all duration-200">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contact Client
                  </button>
                </Link>
              )}
            </Card>

            {/* Actions */}
            {canApply && (
              <Card className="bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                <h3 className="font-bold text-gray-900 mb-2">Ready to start?</h3>
                <p className="text-sm text-gray-600 mb-4">Submit your proposal and stand out</p>
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Apply Now
                </button>
              </Card>
            )}

            {task.is_applied && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <div className="flex items-center space-x-3 text-green-700 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="font-bold text-lg">Application Submitted</span>
                    <p className="text-xs text-green-600">You're in the running!</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">
                  Your application has been sent to the client. We'll notify you of any updates.
                </p>
              </Card>
            )}

            {isOwner && task.status === 'IN_PROGRESS' && (
              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <h3 className="font-bold text-gray-900 mb-3">Task in Progress</h3>
                <p className="text-sm text-gray-600 mb-4">Ready to mark this task as complete?</p>
                <button
                  onClick={handleComplete}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Mark as Completed
                </button>
              </Card>
            )}
            </div>
          </div>
        </div>

        {/* Apply Modal */}
        {showApplyModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget && !applying) {
                setShowApplyModal(false);
              }
            }}
          >
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn">
              <div className="p-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">Apply to Task</h2>
                    <p className="text-sm text-gray-500 mt-1">Submit your proposal to get hired</p>
                  </div>
                  <button
                    onClick={() => setShowApplyModal(false)}
                    disabled={applying}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-colors disabled:opacity-50"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleApply} className="space-y-6">
                  {/* Proposal */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Proposal <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={applicationData.proposal}
                      onChange={(e) => setApplicationData({
                        ...applicationData,
                        proposal: e.target.value
                      })}
                      rows={5}
                      placeholder="Explain why you're the best fit for this task... Highlight your relevant experience and skills."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                      required
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {applicationData.proposal.length} characters
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Your Price (EGP) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                          EGP
                        </span>
                        <input
                          type="number"
                          value={applicationData.offered_price}
                          onChange={(e) => setApplicationData({
                            ...applicationData,
                            offered_price: e.target.value
                          })}
                          placeholder="0.00"
                          min="10"
                          step="0.01"
                          className="w-full pl-16 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                          required
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Task budget: EGP {task.budget}
                      </p>
                    </div>

                    {/* Estimated Time */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estimated Time
                      </label>
                      <input
                        type="text"
                        value={applicationData.estimated_time}
                        onChange={(e) => setApplicationData({
                          ...applicationData,
                          estimated_time: e.target.value
                        })}
                        placeholder="e.g., 2 days, 1 week, 3 hours"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  {/* Cover Letter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cover Letter <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                    </label>
                    <textarea
                      value={applicationData.cover_letter}
                      onChange={(e) => setApplicationData({
                        ...applicationData,
                        cover_letter: e.target.value
                      })}
                      rows={4}
                      placeholder="Add any additional information that might help your application..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">Application Tips</p>
                        <p className="text-sm text-blue-700 mt-1">
                          Be specific about your experience, provide a competitive price, and explain your approach to completing the task.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      disabled={applying}
                      className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={applying}
                      className="flex-1 px-6 py-3.5 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                    >
                      {applying ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Submit Application
                        </span>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget && !canceling) {
                setShowCancelModal(false);
              }
            }}
          >
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-scaleIn">
              <div className="p-8">
                {/* Warning Icon with pulse animation */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center shadow-lg">
                      <ExclamationTriangleIcon className="w-12 h-12 text-red-600" />
                    </div>
                    <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  Cancel This Task?
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-center mb-6 leading-relaxed">
                  This action cannot be undone. All pending applications will be automatically rejected.
                </p>

                {/* Task Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 mb-6 border-2 border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 font-medium mb-1">Task Title</p>
                      <p className="font-bold text-gray-900 leading-tight">{task.title}</p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowCancelModal(false)}
                    disabled={canceling}
                    className="flex-1 px-6 py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Keep Task
                  </button>
                  <button
                    onClick={handleCancelConfirm}
                    disabled={canceling}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {canceling ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Canceling...
                      </span>
                    ) : (
                      'Yes, Cancel Task'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetail;