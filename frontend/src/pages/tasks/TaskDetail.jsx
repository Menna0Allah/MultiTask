import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import taskService from '../../services/taskService';
import paymentService from '../../services/paymentService';
import reviewService from '../../services/reviewService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import PaymentModal from '../../components/payments/PaymentModal';
import PaymentTimeline from '../../components/payments/PaymentTimeline';
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewList from '../../components/reviews/ReviewList';
import StarRating from '../../components/common/StarRating';
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
  BanknotesIcon,
  BookmarkIcon,
  ShareIcon,
  FlagIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import {
  BookmarkIcon as BookmarkSolidIcon,
} from '@heroicons/react/24/solid';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/helpers';

const TaskDetail = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isFreelancer } = useAuth();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  const [applicationData, setApplicationData] = useState({
    proposal: '',
    offered_price: '',
    estimated_time: '',
    cover_letter: '',
  });
  const [applying, setApplying] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isReleasingPayment, setIsReleasingPayment] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [showReleasePaymentModal, setShowReleasePaymentModal] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    fetchTask();
    fetchReviews();
  }, [id]);

  const fetchTask = async () => {
    // Validate that ID exists and is valid
    if (!id || id === 'undefined' || id === 'null') {
      toast.error('Invalid task ID');
      navigate('/tasks');
      return;
    }

    try {
      setLoading(true);
      const data = await taskService.getTask(id);
      setTask(data);
      // Pre-fill offered price with task budget
      setApplicationData(prev => ({
        ...prev,
        offered_price: data.budget,
      }));

      // Fetch applications if user is task owner
      if (user?.id === data.client?.id) {
        fetchApplications();
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Task not found');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true);
      const data = await taskService.getTaskApplications(id);
      setApplications(data.results || data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoadingApplications(false);
    }
  };

  // Calculate suitability score based on multiple factors
  const calculateSuitabilityScore = (application) => {
    let score = 0;
    const maxScore = 100;

    // Price competitiveness (30 points)
    const priceRatio = application.offered_price / task.budget;
    if (priceRatio <= 0.8) score += 30; // Under budget
    else if (priceRatio <= 1.0) score += 25; // At budget
    else if (priceRatio <= 1.2) score += 15; // Slightly over
    else score += 5; // Well over budget

    // Freelancer rating (25 points)
    const rating = application.freelancer?.average_rating || 0;
    score += (rating / 5) * 25;

    // Completed tasks (20 points)
    const completedTasks = application.freelancer?.tasks_completed || 0;
    if (completedTasks >= 50) score += 20;
    else if (completedTasks >= 20) score += 15;
    else if (completedTasks >= 10) score += 10;
    else if (completedTasks >= 5) score += 5;

    // Proposal quality (15 points) - based on length and detail
    const proposalLength = application.proposal?.length || 0;
    if (proposalLength >= 300) score += 15;
    else if (proposalLength >= 200) score += 10;
    else if (proposalLength >= 100) score += 5;

    // Response time (10 points) - how quickly they applied
    const applicationTime = new Date(application.created_at);
    const taskTime = new Date(task.created_at);
    const hoursDiff = (applicationTime - taskTime) / (1000 * 60 * 60);
    if (hoursDiff <= 1) score += 10;
    else if (hoursDiff <= 6) score += 7;
    else if (hoursDiff <= 24) score += 4;

    return Math.min(Math.round(score), maxScore);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800';
    if (score >= 60) return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    return 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400 border-orange-200 dark:border-orange-800';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Low Match';
  };

  const handleAcceptApplication = (application) => {
    setSelectedApplication(application);
    setShowAcceptModal(true);
  };

  const handleAcceptConfirm = async () => {
    try {
      setAccepting(true);

      // Accept application directly (payment happens after completion)
      const acceptResponse = await taskService.acceptApplication(selectedApplication.id);
      console.log('Accept response:', acceptResponse);

      toast.success('Application accepted successfully! Task is now in progress.');
      setShowAcceptModal(false);
      setSelectedApplication(null);
      fetchTask();
      fetchApplications();
    } catch (error) {
      console.error('Error accepting application:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.detail || error.message || 'Failed to accept application';
      toast.error(errorMessage);
    } finally {
      setAccepting(false);
    }
  };

  const handlePayNow = async () => {
    try {
      setIsCreatingPayment(true);
      console.log('Creating payment for completed task:', task.id);
      console.log('Task assigned_to:', task.assigned_to);

      // Fetch applications directly (don't rely on state)
      let appsToUse = applications;

      if (!appsToUse || appsToUse.length === 0) {
        console.log('Applications not loaded, fetching directly...');
        try {
          const data = await taskService.getTaskApplications(id);
          appsToUse = data.results || data || [];
          console.log('Fetched applications:', appsToUse);

          // Also update state for UI
          setApplications(appsToUse);
        } catch (fetchError) {
          console.error('Error fetching applications:', fetchError);
          toast.error('Failed to load applications. Please refresh the page.');
          return;
        }
      }

      console.log('Using applications array:', appsToUse);

      if (!appsToUse || appsToUse.length === 0) {
        toast.error('No applications found for this task. Please refresh the page.');
        return;
      }

      // First try to find an accepted application
      let applicationToPay = appsToUse.find(app => app.status === 'ACCEPTED');
      console.log('Found accepted application:', applicationToPay);

      // If no accepted application, find the one from the assigned freelancer
      if (!applicationToPay && task.assigned_to) {
        console.log('Looking for application from assigned freelancer ID:', task.assigned_to.id);

        // Try different comparison methods
        applicationToPay = appsToUse.find(app => {
          console.log(`Comparing app.freelancer.id (${app.freelancer.id}) with task.assigned_to.id (${task.assigned_to.id})`);
          return app.freelancer.id === task.assigned_to.id ||
                 app.freelancer.id == task.assigned_to.id ||
                 app.freelancer.id === task.assigned_to ||
                 String(app.freelancer.id) === String(task.assigned_to.id);
        });

        console.log('Found application from assigned freelancer:', applicationToPay);

        if (!applicationToPay) {
          // Last resort: just take the first application if there's only one
          if (appsToUse.length === 1) {
            console.log('Only one application exists, using it');
            applicationToPay = appsToUse[0];
          } else {
            toast.error('No application found from the assigned freelancer.');
            console.error('Applications:', appsToUse);
            console.error('Task assigned_to:', task.assigned_to);
            return;
          }
        }
      }

      // If still no application found
      if (!applicationToPay) {
        toast.error('Task must be assigned to a freelancer before payment');
        return;
      }

      console.log('Using application:', applicationToPay.id);
      const paymentData = await paymentService.createPaymentIntent(applicationToPay.id);
      console.log('Payment intent created:', paymentData);

      // Set the selected application so the PaymentModal can render
      setSelectedApplication(applicationToPay);
      setPaymentIntent(paymentData);
      setShowPaymentModal(true);
    } catch (error) {
      console.error('Error creating payment:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create payment';

      // If payment already exists, show info instead of error
      if (errorMessage.includes('already funded') || errorMessage.includes('already released')) {
        toast.success('Payment already completed for this task!');
        // Refresh to show updated status
        fetchTask();
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentResult) => {
    try {
      console.log('Payment succeeded:', paymentIntentResult);
      toast.success('Payment successful! Funds will be transferred to freelancer.');

      setShowPaymentModal(false);
      setPaymentIntent(null);
      setSelectedApplication(null);

      // Refresh task data to show updated payment status
      await fetchTask();
      if (user?.id === task?.client?.id) {
        await fetchApplications();
      }
    } catch (error) {
      console.error('Error after payment:', error);
      toast.error('Payment succeeded. Please refresh to see updated status.');
    }
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    setPaymentIntent(null);
    setSelectedApplication(null);
    toast('Payment cancelled. You can retry when ready.');
  };

  const handleRejectApplication = (application) => {
    setSelectedApplication(application);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    try {
      setRejecting(true);
      await taskService.rejectApplication(selectedApplication.id);
      toast.success('Application rejected');
      setShowRejectModal(false);
      setSelectedApplication(null);
      fetchApplications();
    } catch (error) {
      toast.error('Failed to reject application');
    } finally {
      setRejecting(false);
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
      const errorMessage = error.response?.data?.detail ||
                          error.response?.data?.error ||
                          error.response?.data?.message ||
                          (error.response?.data && typeof error.response.data === 'object'
                            ? Object.values(error.response.data).flat().join(', ')
                            : 'Failed to submit application');
      toast.error(errorMessage);
    } finally {
      setApplying(false);
    }
  };

  const handleComplete = () => {
    setShowCompleteModal(true);
  };

  const handleCompleteConfirm = async () => {
    try {
      setCompleting(true);
      await taskService.completeTask(id);
      toast.success('Task marked as completed');
      setShowCompleteModal(false);
      fetchTask();
    } catch (error) {
      toast.error('Failed to complete task');
    } finally {
      setCompleting(false);
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

  const handleReleasePayment = () => {
    if (!task.escrow?.escrow_id) {
      toast.error('No escrow found for this task');
      return;
    }
    setShowReleasePaymentModal(true);
  };

  const handleReleasePaymentConfirm = async () => {
    try {
      setIsReleasingPayment(true);
      await paymentService.releaseEscrow(task.escrow.escrow_id);
      toast.success('Payment released successfully!');
      setShowReleasePaymentModal(false);
      fetchTask();
    } catch (error) {
      console.error('Error releasing payment:', error);
      toast.error(error.response?.data?.error || 'Failed to release payment');
    } finally {
      setIsReleasingPayment(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save tasks');
      navigate('/login');
      return;
    }

    try {
      const response = await taskService.toggleSaveTask(id);
      setIsBookmarked(response.is_saved);
      toast.success(response.message);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast.error('Failed to save task');
    }
  };

  // Check if task is bookmarked on load
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (isAuthenticated && task) {
        try {
          const response = await taskService.checkTaskSaved(id);
          setIsBookmarked(response.is_saved);
        } catch (error) {
          // Silently fail - not critical
        }
      }
    };
    checkBookmarkStatus();
  }, [isAuthenticated, task, id]);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: task.title,
        text: `Check out this task: ${task.title}`,
        url: url,
      }).catch(() => {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
      });
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await reviewService.getTaskReviews(id);
      setReviews(data.results || data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      // Don't show error toast for reviews - it's not critical
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmittingReview(true);
      await reviewService.submitTaskReview(id, reviewData);
      toast.success('Review submitted successfully!');
      setShowReviewForm(false);
      fetchReviews(); // Refresh reviews
      fetchTask(); // Refresh task to update average rating
    } catch (error) {
      console.error('Error submitting review:', error);
      const errorMessage = error.response?.data?.detail || error.response?.data?.error || 'Failed to submit review';
      toast.error(errorMessage);
      throw error; // Re-throw so ReviewForm can handle it
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewHelpful = async (reviewId, isHelpful) => {
    try {
      await reviewService.markReviewHelpful(reviewId, isHelpful);
      toast.success('Thank you for your feedback!');
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      // Don't show error - this feature might not be implemented yet
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
    <div className="force-light-mode bg-gray-50 min-h-screen py-12">
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
              {/* Status Badges and Actions */}
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-center flex-wrap gap-2">
                  <Badge variant={task.status === 'OPEN' ? 'success' : task.status === 'IN_PROGRESS' ? 'info' : task.status === 'COMPLETED' ? 'success' : 'gray'}>
                    {task.status}
                  </Badge>
                  {task.is_remote && <Badge variant="info">🌍 Remote</Badge>}
                  <Badge variant="primary">{task.task_type}</Badge>

                  {/* Payment Status Badge with icon */}
                  {task.payment_status === 'escrowed' && (
                    <Badge variant="warning">
                      <LockClosedIcon className="w-3 h-3 inline mr-1" />
                      Payment Secured in Escrow
                    </Badge>
                  )}
                  {task.payment_status === 'released' && (
                    <Badge variant="success">
                      <CheckCircleIcon className="w-3 h-3 inline mr-1" />
                      Payment Released
                    </Badge>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {!isOwner && (
                    <button
                      onClick={handleBookmark}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark task'}
                    >
                      {isBookmarked ? (
                        <BookmarkSolidIcon className="w-5 h-5 text-primary-600" />
                      ) : (
                        <BookmarkIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleShare}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Share task"
                  >
                    <ShareIcon className="w-5 h-5 text-gray-600" />
                  </button>
                  {!isOwner && (
                    <button
                      onClick={handleReport}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Report task"
                    >
                      <FlagIcon className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Title and Metadata */}
              <div className="mb-6">
                <h1 className="text-4xl font-bold text-gray-900 mb-4 break-words leading-tight">
                  {task.title}
                </h1>

                <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4" />
                    <span>Posted {formatRelativeTime(task.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <EyeIcon className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">{task.views_count} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserGroupIcon className="w-4 h-4 text-green-600" />
                    <span className="font-medium">{task.applications_count} {task.applications_count === 1 ? 'application' : 'applications'}</span>
                  </div>
                  {task.category && (
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-400">in</span>
                      <Badge variant="primary" size="sm">{task.category.name}</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Actions */}
              {isOwner && task.status === 'OPEN' && (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                  <Link to={`/tasks/${task.id}/edit`} className="flex-1 sm:flex-initial">
                    <button className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-200 shadow-md hover:shadow-lg">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit Task
                    </button>
                  </Link>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-red-500 text-red-600 rounded-lg font-semibold hover:bg-red-50 hover:border-red-600 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel Task
                  </button>
                </div>
              )}
            </Card>

            {/* Task Info - Key Details */}
            <Card>
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">Project Details</h2>
                <p className="text-sm text-gray-500 mt-1">Key information about this task</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div className="prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed break-words overflow-hidden">
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

            {/* Payment Security & Trust Section */}
            {task.requires_payment && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-blue-600 rounded-xl">
                    <ShieldCheckIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payment Protection</h3>
                    <p className="text-gray-700">
                      Your payment is protected by our secure escrow system
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-lg">1</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Secure Escrow</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Funds are held securely until work is completed
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-lg">2</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Work Delivery</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Freelancer completes and delivers the work
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-lg">3</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">Payment Release</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      You approve and payment is released to freelancer
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Fee Structure</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Task Budget:</span>
                          <span className="font-semibold">{formatCurrency(task.budget)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Platform Fee (15%):</span>
                          <span className="font-semibold">{formatCurrency(task.budget * 0.15)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-900 font-medium">Freelancer Receives:</span>
                          <span className="font-bold text-green-600">{formatCurrency(task.budget * 0.85)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <LockClosedIcon className="w-4 h-4 text-green-600" />
                    <span>256-bit Encryption</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-green-600" />
                    <span>PCI DSS Compliant</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span>Money-back Guarantee</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Reviews Section - Only for completed tasks */}
            {task.status === 'COMPLETED' && (
              <Card>
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">Reviews & Ratings</h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                    {task.average_rating > 0 && (
                      <div className="flex items-center gap-2">
                        <StarRating
                          value={task.average_rating}
                          readOnly
                          showValue
                          totalReviews={reviews.length}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Form - Show if user is eligible to review */}
                {isOwner && task.assigned_to && !showReviewForm && !reviews.some(r => r.reviewer?.id === user?.id) && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl hover:border-purple-400 dark:hover:border-purple-600 transition-all group"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                          <StarRating value={5} readOnly size="sm" />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            Share Your Experience
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Rate your experience with {task.assigned_to.username}
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Review Form */}
                {showReviewForm && (
                  <div className="mb-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Write a Review
                      </h3>
                      <button
                        onClick={() => setShowReviewForm(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <ReviewForm
                      onSubmit={handleSubmitReview}
                      loading={submittingReview}
                      placeholder={`How was your experience working with ${task.assigned_to?.username}?`}
                    />
                  </div>
                )}

                {/* Reviews List */}
                <ReviewList
                  reviews={reviews}
                  loading={loadingReviews}
                  showHelpful={true}
                  onHelpful={handleReviewHelpful}
                />
              </Card>
            )}

            {/* Applications Section - Only visible to task owner */}
            {isOwner && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Applications ({applications.length})
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Review and manage freelancer applications
                      </p>
                    </div>
                    {applications.length > 0 && (
                      <div className="flex items-center gap-2">
                        <UserGroupIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {applications.filter(a => a.status === 'PENDING').length} pending
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {loadingApplications ? (
                  <div className="text-center py-12">
                    <Loading />
                  </div>
                ) : applications.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserGroupIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No Applications Yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Freelancers will see your task and can apply to work with you.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications
                      .sort((a, b) => calculateSuitabilityScore(b) - calculateSuitabilityScore(a))
                      .map((application) => {
                        const suitabilityScore = calculateSuitabilityScore(application);
                        const scoreColor = getScoreColor(suitabilityScore);
                        const scoreLabel = getScoreLabel(suitabilityScore);

                        return (
                          <div
                            key={application.id}
                            className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-all bg-white dark:bg-gray-750"
                          >
                            {/* Header with Freelancer Info and Score */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start gap-4 flex-1">
                                <Avatar user={application.freelancer} size="lg" />
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                      {application.freelancer?.username}
                                    </h3>
                                    <Badge variant={
                                      application.status === 'ACCEPTED' ? 'success' :
                                      application.status === 'REJECTED' ? 'danger' : 'warning'
                                    }>
                                      {application.status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm">
                                    <div className="flex items-center">
                                      <span className="text-yellow-500">★</span>
                                      <span className="ml-1 font-semibold text-gray-900 dark:text-white">
                                        {application.freelancer?.average_rating || 0}
                                      </span>
                                      <span className="text-gray-500 dark:text-gray-400 ml-1">
                                        ({application.freelancer?.total_reviews || 0})
                                      </span>
                                    </div>
                                    <span className="text-gray-300 dark:text-gray-600">|</span>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {application.freelancer?.tasks_completed || 0} tasks completed
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Suitability Score */}
                              <div className={`px-4 py-3 rounded-xl border ${scoreColor} text-center min-w-[140px]`}>
                                <div className="text-3xl font-bold mb-1">{suitabilityScore}%</div>
                                <div className="text-xs font-semibold uppercase tracking-wide">
                                  {scoreLabel}
                                </div>
                              </div>
                            </div>

                            {/* Proposal */}
                            <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                Proposal
                              </p>
                              <p className="text-gray-700 dark:text-gray-300 leading-relaxed break-words overflow-hidden">
                                {application.proposal || 'No proposal provided'}
                              </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Offered Price</p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                  {formatCurrency(application.offered_price)}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Est. Time</p>
                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                  {application.estimated_time || 'Not specified'}
                                </p>
                              </div>
                              <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Applied</p>
                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                  {formatRelativeTime(application.created_at)}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                              <Link
                                to={`/messages?user=${application.freelancer?.id}`}
                                className="flex-1"
                              >
                                <button className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-primary-600 dark:border-primary-500 text-primary-600 dark:text-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex items-center justify-center gap-2">
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                  </svg>
                                  Contact
                                </button>
                              </Link>

                              {application.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleAcceptApplication(application)}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                  >
                                    <CheckCircleIcon className="w-5 h-5" />
                                    Accept
                                  </button>
                                  <button
                                    onClick={() => handleRejectApplication(application)}
                                    className="px-4 py-3 bg-white dark:bg-gray-800 border-2 border-red-500 dark:border-red-600 text-red-600 dark:text-red-500 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2"
                                  >
                                    <XMarkIcon className="w-5 h-5" />
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
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

            {/* Payment Timeline */}
            {task.requires_payment && (isOwner || task.assigned_to?.id === user?.id) && (
              <PaymentTimeline task={task} />
            )}

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

            {/* Pay Now Card - Show when task is completed but not paid yet */}
            {isOwner && task.status === 'COMPLETED' && task.requires_payment &&
             !['escrowed', 'released'].includes(task.payment_status) && (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BanknotesIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Pay Freelancer</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Task completed! Pay the freelancer for their work.
                </p>
                {task.assigned_to && (
                  <div className="bg-white rounded-lg p-3 mb-4 border border-blue-200">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Payment Amount:</span>
                      <span className="font-semibold">{task.final_amount || task.budget} EGP</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Platform Fee (15%):</span>
                      <span className="font-semibold">{((task.final_amount || task.budget) * 0.15).toFixed(2)} EGP</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Freelancer Receives:</span>
                      <span className="font-bold text-green-600">{((task.final_amount || task.budget) * 0.85).toFixed(2)} EGP</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={handlePayNow}
                  disabled={isCreatingPayment}
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreatingPayment ? (
                    <>Creating Payment...</>
                  ) : (
                    <>
                      <BanknotesIcon className="w-5 h-5 mr-2" />
                      Pay Now
                    </>
                  )}
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

        {/* Cancel Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelConfirm}
          title="Cancel This Task?"
          message={`This action cannot be undone. All pending applications will be automatically rejected. Task: "${task?.title}"`}
          confirmText="Yes, Cancel Task"
          cancelText="Keep Task"
          variant="danger"
          loading={canceling}
        />

        {/* Accept Application Confirmation Modal */}
        {showAcceptModal && selectedApplication && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
            onClick={(e) => {
              if (e.target === e.currentTarget && !accepting) {
                setShowAcceptModal(false);
              }
            }}
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-scaleIn">
              <div className="p-8">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-900/40 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                  Accept This Application?
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                  This will assign the task to this freelancer and notify them to begin work.
                </p>

                {/* Freelancer Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-5 mb-6 border-2 border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar user={selectedApplication.freelancer} size="md" />
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 dark:text-white">
                        {selectedApplication.freelancer?.username}
                      </p>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-yellow-500">★</span>
                        <span className="ml-1 font-semibold">
                          {selectedApplication.freelancer?.average_rating || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Offered Price:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(selectedApplication.offered_price)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowAcceptModal(false)}
                    disabled={accepting}
                    className="flex-1 px-6 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAcceptConfirm}
                    disabled={accepting}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {accepting ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Accepting...
                      </span>
                    ) : (
                      'Yes, Accept Application'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reject Application Confirmation Dialog */}
        {selectedApplication && (
          <ConfirmDialog
            isOpen={showRejectModal}
            onClose={() => {
              setShowRejectModal(false);
              setSelectedApplication(null);
            }}
            onConfirm={handleRejectConfirm}
            title="Reject This Application?"
            message={`This will decline the application from ${selectedApplication.freelancer?.username} and notify them.`}
            confirmText="Yes, Reject Application"
            cancelText="Cancel"
            variant="danger"
            loading={rejecting}
          />
        )}

        {/* Payment Modal */}
        {showPaymentModal && paymentIntent && selectedApplication && (
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={handlePaymentCancel}
            clientSecret={paymentIntent.client_secret}
            amount={parseFloat(paymentIntent.amount)}
            platformFee={parseFloat(paymentIntent.platform_fee)}
            onSuccess={handlePaymentSuccess}
            taskInfo={{
              id: task.id,
              title: task.title,
            }}
          />
        )}

        {/* Complete Task Modal */}
        {showCompleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-scaleIn">
              <div className="p-8">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-900/40 rounded-full flex items-center justify-center shadow-lg">
                      <CheckCircleIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                  Mark Task as Complete?
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-center mb-2 leading-relaxed">
                  Confirm that this task has been completed successfully.
                </p>

                {/* Payment Notice */}
                {task.requires_payment && task.payment_status === 'not_required' && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                      <BanknotesIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                          Payment After Completion
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-400">
                          After marking complete, you'll be able to pay the freelancer for their work.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Task Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-5 mb-6 border-2 border-gray-200 dark:border-gray-600">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Task</p>
                    <p className="font-bold text-gray-900 dark:text-white">{task.title}</p>
                    {task.assigned_to && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Completed by: <span className="font-semibold">{task.assigned_to.username}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowCompleteModal(false)}
                    disabled={completing}
                    className="flex-1 px-6 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCompleteConfirm}
                    disabled={completing}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {completing ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Completing...
                      </span>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                        Yes, Mark as Complete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Release Payment Modal */}
        {showReleasePaymentModal && task.escrow && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-scaleIn">
              <div className="p-8">
                {/* Money Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 dark:from-green-900/40 dark:to-emerald-900/40 rounded-full flex items-center justify-center shadow-lg">
                      <BanknotesIcon className="w-12 h-12 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-3">
                  Release Payment?
                </h2>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 text-center mb-6 leading-relaxed">
                  This will transfer the funds to the freelancer. This action cannot be undone.
                </p>

                {/* Payment Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-750 rounded-xl p-5 mb-6 border-2 border-gray-200 dark:border-gray-600">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Payment Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Escrow Amount:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {parseFloat(task.escrow.total_amount).toFixed(2)} EGP
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Platform Fee:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {parseFloat(task.escrow.platform_fee_amount).toFixed(2)} EGP
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-300 dark:border-gray-600">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Freelancer Receives:</span>
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">
                        {parseFloat(task.escrow.freelancer_amount).toFixed(2)} EGP
                      </span>
                    </div>
                  </div>
                  {task.assigned_to && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Payment to: <span className="font-semibold text-gray-900 dark:text-white">{task.assigned_to.username}</span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Warning */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 dark:text-amber-300">
                      <span className="font-semibold">Important:</span> Once released, this payment cannot be reversed. Make sure the work is completed to your satisfaction.
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowReleasePaymentModal(false)}
                    disabled={isReleasingPayment}
                    className="flex-1 px-6 py-3.5 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReleasePaymentConfirm}
                    disabled={isReleasingPayment}
                    className="flex-1 px-6 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                  >
                    {isReleasingPayment ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Releasing Payment...
                      </span>
                    ) : (
                      <>
                        <BanknotesIcon className="w-5 h-5 inline mr-2" />
                        Yes, Release Payment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Report Task Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
               onClick={(e) => {
                 if (e.target === e.currentTarget) {
                   setShowReportModal(false);
                 }
               }}>
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform transition-all animate-scaleIn">
              <div className="p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <FlagIcon className="w-8 h-8 text-red-600" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                  Report This Task
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Help us maintain quality by reporting inappropriate content
                </p>

                {/* Report Reasons */}
                <div className="space-y-3 mb-6">
                  {[
                    'Inappropriate content',
                    'Misleading information',
                    'Suspected scam',
                    'Already completed elsewhere',
                    'Other reason'
                  ].map((reason) => (
                    <label key={reason} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input type="radio" name="report_reason" className="mr-3" />
                      <span className="text-gray-700">{reason}</span>
                    </label>
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      toast.success('Report submitted. We will review it shortly.');
                      setShowReportModal(false);
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Submit Report
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