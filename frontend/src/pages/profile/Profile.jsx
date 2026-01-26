import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Loading from '../../components/common/Loading';
import SkillSelector from '../../components/profile/SkillSelector';
import ReviewList from '../../components/reviews/ReviewList';
import StarRating from '../../components/common/StarRating';
import skillService from '../../services/skillService';
import recommendationService from '../../services/recommendationService';
import paymentService from '../../services/paymentService';
import reviewService from '../../services/reviewService';
import portfolioService from '../../services/portfolioService';
import api from '../../services/api';
import toast from 'react-hot-toast';
import PortfolioCard from '../../components/portfolio/PortfolioCard';
import PortfolioForm from '../../components/portfolio/PortfolioForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  LockClosedIcon,
  CheckCircleIcon,
  StarIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  PencilIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  RectangleStackIcon,
  PlusIcon,
  TrashIcon,
  ExclamationCircleIcon,
  BellIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import authService from '../../services/authService';
import notificationService from '../../services/notificationService';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Account deletion state
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Notification preferences state
  const [notificationPrefs, setNotificationPrefs] = useState({
    email_task_applications: true,
    email_task_updates: true,
    email_messages: true,
    email_task_reminders: true,
    email_marketing: false,
    push_task_applications: true,
    push_task_updates: true,
    push_messages: true,
    push_task_reminders: true,
  });
  const [loadingNotifPrefs, setLoadingNotifPrefs] = useState(false);
  const [savingNotifPrefs, setSavingNotifPrefs] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone_number: '',
    city: '',
    country: '',
    skills: '',
  });

  // Skill IDs for structured skill selection
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  // Interests (categories from onboarding)
  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);

  // Stripe account status
  const [stripeAccount, setStripeAccount] = useState(null);
  const [loadingStripe, setLoadingStripe] = useState(true); // Start as true to prevent flash
  const [creatingStripeAccount, setCreatingStripeAccount] = useState(false);

  // Password data
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });

  // Reviews data
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Portfolio data
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolioItem, setEditingPortfolioItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPortfolioItem, setDeletingPortfolioItem] = useState(null);
  const [deletingPortfolio, setDeletingPortfolio] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        phone_number: user.phone_number || '',
        city: user.city || '',
        country: user.country || '',
        skills: user.skills || '',
      });

      // Load user's skills if freelancer
      if (user.is_freelancer) {
        loadUserSkills();
      }

      // Load user's interests (for all users)
      loadUserInterests();

      // Load Stripe account status (for freelancers)
      if (user.is_freelancer) {
        loadStripeAccount();
      }

      // Load user reviews
      loadUserReviews();

      // Load portfolio items
      loadPortfolioItems();
    }
  }, [user]);

  const loadUserSkills = async () => {
    try {
      const skills = await skillService.getUserSkills();
      console.log('Loaded user skills:', skills);
      const skillIds = skills
        .map(us => us.skill?.id)
        .filter(id => id != null); // Filter out null/undefined
      console.log('Extracted skill IDs:', skillIds);
      setSelectedSkillIds(skillIds);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const loadUserInterests = async () => {
    try {
      setLoadingInterests(true);
      // Get user preferences (includes interests as category IDs)
      const prefs = await recommendationService.getUserPreferences();
      const interestIds = prefs.interests || [];

      if (interestIds.length > 0) {
        // Fetch all categories
        const response = await api.get('/recommendations/categories/');
        const allCategories = response.data;

        // Filter to only user's interests
        const userInterests = allCategories.filter(cat =>
          interestIds.includes(cat.id)
        );

        setInterests(userInterests);
      } else {
        setInterests([]);
      }
    } catch (error) {
      console.error('Error loading interests:', error);
      setInterests([]);
    } finally {
      setLoadingInterests(false);
    }
  };

  const loadStripeAccount = async () => {
    try {
      setLoadingStripe(true);
      const accountData = await paymentService.getConnectStatus();
      setStripeAccount(accountData);
    } catch (error) {
      console.error('Error loading Stripe account:', error);
      // If error is 404 or account not found, set to null
      setStripeAccount(null);
    } finally {
      setLoadingStripe(false);
    }
  };

  const loadUserReviews = async () => {
    if (!user?.username) return;

    try {
      setLoadingReviews(true);
      const data = await reviewService.getUserReviews(user.username);
      setReviews(data.results || data || []);
    } catch (error) {
      console.error('Error loading user reviews:', error);
      // Don't show error toast - reviews are not critical
    } finally {
      setLoadingReviews(false);
    }
  };

  const loadPortfolioItems = async () => {
    try {
      setLoadingPortfolio(true);
      const data = await portfolioService.getMyPortfolio();
      setPortfolioItems(data);
    } catch (error) {
      console.error('Error loading portfolio items:', error);
      toast.error('Failed to load portfolio');
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const handleEditPortfolio = (item) => {
    setEditingPortfolioItem(item);
    setShowPortfolioForm(true);
  };

  const handleDeletePortfolio = (item) => {
    setDeletingPortfolioItem(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPortfolioItem) return;

    try {
      setDeletingPortfolio(true);
      await portfolioService.deletePortfolioItem(deletingPortfolioItem.id);
      toast.success('Portfolio item deleted successfully');
      setShowDeleteConfirm(false);
      setDeletingPortfolioItem(null);
      await loadPortfolioItems();
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast.error('Failed to delete portfolio item');
    } finally {
      setDeletingPortfolio(false);
    }
  };

  const handlePortfolioSuccess = async () => {
    await loadPortfolioItems();
  };

  const handleCreateStripeAccount = async () => {
    try {
      setCreatingStripeAccount(true);
      await paymentService.createConnectAccount();
      toast.success('Stripe account created! Redirecting to onboarding...');

      // Get onboarding link
      const { url } = await paymentService.getOnboardingLink();

      // Redirect to Stripe onboarding
      window.location.href = url;
    } catch (error) {
      console.error('Error creating Stripe account:', error);
      toast.error(error.response?.data?.error || 'Failed to create Stripe account');
      setCreatingStripeAccount(false);
    }
  };

  const handleStripeOnboarding = async () => {
    // If account is fully set up, open Stripe Dashboard
    if (stripeAccount?.onboarding_completed) {
      // For demo/mock accounts, open the general Stripe Dashboard
      if (stripeAccount?.stripe_account_id?.includes('mock') ||
          stripeAccount?.stripe_account_id?.includes('demo') ||
          stripeAccount?.stripe_account_id?.includes('connected')) {
        toast.success('Opening Stripe Dashboard...');
        window.open('https://dashboard.stripe.com/', '_blank');
        return;
      }

      // For real accounts, try to get the Express Dashboard login link
      try {
        const { url } = await paymentService.getOnboardingLink();
        window.open(url, '_blank');
      } catch (error) {
        console.error('Error getting dashboard link:', error);
        // Fallback to general Stripe dashboard
        window.open('https://dashboard.stripe.com/', '_blank');
      }
      return;
    }

    // If onboarding not complete, continue with onboarding flow
    try {
      const { url } = await paymentService.getOnboardingLink();
      window.location.href = url;
    } catch (error) {
      console.error('Error getting onboarding link:', error);
      toast.error('Failed to start onboarding process');
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillsChange = async (skillIds) => {
    // Filter out any null/undefined values
    const validSkillIds = skillIds.filter(id => id != null);

    console.log('Updating skills with IDs:', validSkillIds);

    // Optimistically update UI
    setSelectedSkillIds(validSkillIds);

    // Auto-save skills to backend
    try {
      const response = await skillService.updateUserSkills(validSkillIds);
      console.log('Skills saved successfully:', response);
      toast.success('✓ Skills updated successfully');

      // Reload user skills to ensure UI is in sync
      await loadUserSkills();
    } catch (error) {
      console.error('Error saving skills:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || 'Failed to save skills';
      toast.error(errorMsg);

      // Reload skills to revert UI on error
      await loadUserSkills();
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Don't include skills in profile update - skills are managed separately via structured skill system
      const { skills, ...profileDataWithoutSkills } = profileData;

      // Clean the data - only send non-empty fields
      const cleanedData = Object.entries(profileDataWithoutSkills).reduce((acc, [key, value]) => {
        // Only include non-empty values
        if (value !== null && value !== undefined && value !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});

      console.log('Submitting profile data:', cleanedData);

      const updatedUser = await updateProfile(cleanedData);

      // Re-sync profileData with updated user data to ensure consistency
      if (updatedUser) {
        setProfileData({
          first_name: updatedUser.first_name || '',
          last_name: updatedUser.last_name || '',
          bio: updatedUser.bio || '',
          phone_number: updatedUser.phone_number || '',
          city: updatedUser.city || '',
          country: updatedUser.country || '',
          skills: updatedUser.skills || '',
        });

        // Reload structured skills after profile update
        if (user.is_freelancer) {
          loadUserSkills();
        }

        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.detail ||
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password2) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(passwordData.old_password, passwordData.new_password);
      toast.success('Password changed successfully');
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password2: '',
      });
    } catch (error) {
      const errorMessage = error.response?.data?.old_password?.[0] ||
                          error.response?.data?.new_password?.[0] ||
                          error.response?.data?.detail ||
                          Object.values(error.response?.data || {}).flat().join(', ') ||
                          'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error('Please enter your password');
      return;
    }

    if (deleteConfirmation !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    try {
      setDeletingAccount(true);
      await authService.deleteAccount(deletePassword, deleteConfirmation);
      toast.success('Your account has been deleted');
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Delete account error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete account';
      toast.error(errorMessage);
    } finally {
      setDeletingAccount(false);
    }
  };

  // Fetch notification preferences when settings tab is opened
  useEffect(() => {
    if (activeTab === 'settings') {
      fetchNotificationPrefs();
    }
  }, [activeTab]);

  const fetchNotificationPrefs = async () => {
    try {
      setLoadingNotifPrefs(true);
      const data = await notificationService.getPreferences();
      setNotificationPrefs(data);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setLoadingNotifPrefs(false);
    }
  };

  const handleNotifPrefChange = (key) => {
    setNotificationPrefs(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const saveNotificationPrefs = async () => {
    try {
      setSavingNotifPrefs(true);
      await notificationService.updatePreferences(notificationPrefs);
      toast.success('Notification preferences saved');
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setSavingNotifPrefs(false);
    }
  };

  if (!user) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-6xl px-6 md:px-8 lg:px-12">
        {/* Modern Header with Gradient */}
        <div className="mb-8 relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-blue-600 dark:from-primary-700 dark:via-purple-700 dark:to-blue-700 rounded-3xl p-8 text-white shadow-xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-xl">
                  <span className="text-3xl font-bold text-white">
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-1">Profile Settings</h1>
                  <p className="text-white/90">Manage your account settings and preferences</p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                {user.is_verified ? (
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/30 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span className="font-semibold">Verified Account</span>
                  </div>
                ) : (
                  <div className="bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-yellow-400/30 flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span className="font-semibold">Unverified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6 lg:pl-2">
            {/* Profile Completion Card */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-2 border-primary-200 dark:border-primary-700 p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Profile Strength
              </h3>
              {(() => {
                const completionItems = [
                  { check: user.bio, label: 'Bio added' },
                  { check: user.phone_number, label: 'Phone number' },
                  { check: user.city, label: 'Location set' },
                  { check: user.is_freelancer && selectedSkillIds.length > 0, label: 'Skills added', freelancerOnly: true },
                  { check: user.is_verified, label: 'Account verified' },
                ];

                const totalItems = completionItems.filter(item => !item.freelancerOnly || user.is_freelancer).length;
                const completedItems = completionItems.filter(item => (!item.freelancerOnly || user.is_freelancer) && item.check).length;
                const percentage = Math.round((completedItems / totalItems) * 100);

                return (
                  <>
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">Completion</span>
                        <span className="font-bold text-primary-600 dark:text-primary-400">{percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                            percentage === 100 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            percentage >= 75 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                            percentage >= 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                            'bg-gradient-to-r from-red-500 to-pink-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {completionItems.filter(item => !item.freelancerOnly || user.is_freelancer).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          {item.check ? (
                            <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                          )}
                          <span className={item.check ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-500'}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                    {percentage < 100 && (
                      <div className="mt-4 p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                        <p className="text-xs text-primary-800 dark:text-primary-300 font-medium">
                          💡 Complete your profile to attract more {user.is_freelancer ? 'clients' : 'freelancers'}!
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
            </Card>

            <Card padding={false} className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-lg">
              {/* Profile Picture */}
              <div className="p-7 text-center border-b border-gray-200 dark:border-gray-700">
                <div className="inline-block mb-4">
                  <Avatar user={user} size="2xl" className="ring-4 ring-white dark:ring-gray-800" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{user.username}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    user.user_type === 'CLIENT' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                    user.user_type === 'FREELANCER' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                  }`}>
                    {user.user_type}
                  </span>
                  {user.is_verified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="p-3">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'profile'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'password'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <LockClosedIcon className="w-5 h-5" />
                  <span className="font-medium">Password</span>
                </button>

                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'stats'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span className="font-medium">Statistics</span>
                </button>

                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'portfolio'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <RectangleStackIcon className="w-5 h-5" />
                  <span className="font-medium">Portfolio</span>
                  {portfolioItems.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full">
                      {portfolioItems.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'reviews'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  <span className="font-medium">Reviews</span>
                  {reviews.length > 0 && (
                    <span className="ml-auto px-2 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 text-xs font-semibold rounded-full">
                      {reviews.length}
                    </span>
                  )}
                </button>

                {user.is_freelancer && (
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                      activeTab === 'payments'
                        ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <CreditCardIcon className="w-5 h-5" />
                    <span className="font-medium">Payments</span>
                    {(!stripeAccount || !stripeAccount.onboarding_completed) && (
                      <span className="ml-auto">
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-600" />
                      </span>
                    )}
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'settings'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span className="font-medium">Settings</span>
                </button>

                <hr className="my-2 dark:border-gray-700" />

                <button
                  onClick={() => setActiveTab('danger')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'danger'
                      ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ExclamationCircleIcon className="w-5 h-5" />
                  <span className="font-medium">Danger Zone</span>
                </button>
              </div>
            </Card>

            {/* Professional Tip Card */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700 p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                  <InformationCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">💡 Pro Tip</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {user.is_freelancer ? (
                      <>Add detailed skills and a compelling bio to increase your visibility by up to 70%!</>
                    ) : (
                      <>Provide clear task requirements and budgets to receive more quality applications!</>
                    )}
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Stats Card */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-lg p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                      <StarIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {typeof user.average_rating === 'number' ? user.average_rating.toFixed(1) : '0.0'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reviews</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.total_reviews || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.tasks_completed || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Stripe Connection Warning for Freelancers */}
                {user.is_freelancer && !loadingStripe && (!stripeAccount || !stripeAccount.onboarding_completed) && (
                  <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-full flex items-center justify-center">
                          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          ⚡ Action Required: Connect Payment Account
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 mb-4">
                          You need to connect your Stripe account to apply for tasks and receive payments. This is a required step for all freelancers.
                        </p>
                        <button
                          onClick={() => setActiveTab('payments')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
                        >
                          <CreditCardIcon className="w-4 h-4" />
                          Connect Stripe Now
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </Card>
                )}

                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <PencilIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          Edit Profile
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update your personal information and settings</p>
                      </div>
                      <div className="hidden md:block">
                        <div className="bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-lg">
                          <p className="text-xs text-primary-700 dark:text-primary-300 font-medium">Last updated today</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="first_name"
                      icon={UserIcon}
                      value={profileData.first_name}
                      onChange={handleProfileChange}
                      required
                    />

                    <Input
                      label="Last Name"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  {/* Email (readonly) */}
                  <Input
                    label="Email"
                    type="email"
                    value={user.email}
                    icon={EnvelopeIcon}
                    disabled
                  />

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={6}
                      placeholder="Tell us about yourself, your experience, what makes you unique..."
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                        resize-none transition-all duration-200
                        shadow-sm hover:shadow-md"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span>💡</span>
                      <span>Share your story, expertise, and what you're passionate about</span>
                    </p>
                  </div>

                  {/* Phone & Location */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      name="phone_number"
                      type="tel"
                      icon={PhoneIcon}
                      placeholder="+20 123 456 7890"
                      value={profileData.phone_number}
                      onChange={handleProfileChange}
                    />

                    <Input
                      label="City"
                      name="city"
                      icon={MapPinIcon}
                      placeholder="Cairo"
                      value={profileData.city}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <Input
                    label="Country"
                    name="country"
                    placeholder="Egypt"
                    value={profileData.country}
                    onChange={handleProfileChange}
                  />

                  {/* Skills (for freelancers) - STRUCTURED SELECTION */}
                  {user.is_freelancer && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <BriefcaseIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span>Skills & Expertise</span>
                          </div>
                          {selectedSkillIds.length > 0 && (
                            <Link
                              to="/dashboard"
                              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                              </svg>
                              View Recommendations
                            </Link>
                          )}
                        </div>
                      </label>
                      <SkillSelector
                        initialSkillIds={selectedSkillIds}
                        onSkillsChange={handleSkillsChange}
                      />
                    </div>
                  )}

                  {/* Interests Section */}
                  <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          <span>Your Interests</span>
                        </div>
                        {interests.length > 0 && (
                          <Link
                            to="/recommendations"
                            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                            </svg>
                            View Service Offerings
                          </Link>
                        )}
                      </div>
                    </label>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Categories you're interested in working with. These help us provide personalized service offering suggestions.
                    </p>

                    {loadingInterests ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : interests.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {interests.map((category) => (
                          <div
                            key={category.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg transition-all hover:shadow-md"
                          >
                            <span className="text-2xl">{category.icon || '📁'}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                        <SparklesIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          No interests selected yet
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                          Complete the onboarding survey to get personalized service offering recommendations
                        </p>
                        <Link
                          to="/recommendations"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <SparklesIcon className="w-5 h-5" />
                          Complete Onboarding
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      💡 Changes are saved immediately and visible to others
                    </p>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      className="px-8 py-3 shadow-lg hover:shadow-xl transition-all"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
              </div>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <LockClosedIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ensure your account is using a strong password</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <Input
                    label="Current Password"
                    name="old_password"
                    type="password"
                    icon={LockClosedIcon}
                    placeholder="Enter current password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    required
                  />

                  <Input
                    label="New Password"
                    name="new_password"
                    type="password"
                    icon={LockClosedIcon}
                    placeholder="Enter new password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    name="new_password2"
                    type="password"
                    icon={LockClosedIcon}
                    placeholder="Confirm new password"
                    value={passwordData.new_password2}
                    onChange={handlePasswordChange}
                    required
                  />

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Include numbers and letters</li>
                      <li>• Avoid common passwords</li>
                    </ul>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      🔒 Your password is encrypted and secure
                    </p>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                      className="px-8 py-3 shadow-lg hover:shadow-xl transition-all"
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <ChartBarIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      Account Statistics
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overview of your activity and performance</p>
                  </div>

                  {/* Performance Overview */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <StarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {typeof user.average_rating === 'number' ? user.average_rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {user.total_reviews || 0} reviews
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
                      <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {user.tasks_completed || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                        100% success rate
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                      <div className="w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BriefcaseIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {user.tasks_posted || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Posted</div>
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                        As client
                      </div>
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Activity Details</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-100 dark:border-blue-800 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Type</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            user.user_type === 'CLIENT' ? 'bg-blue-500 text-white' :
                            user.user_type === 'FREELANCER' ? 'bg-green-500 text-white' :
                            'bg-purple-500 text-white'
                          }`}>
                            {user.user_type}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-green-100 dark:border-green-800 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Status</span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500 text-white shadow-sm">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-100 dark:border-purple-800 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Member Since</span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border-2 border-yellow-100 dark:border-yellow-800 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Verification Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                            user.is_verified
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-400 dark:bg-gray-600 text-white'
                          }`}>
                            {user.is_verified ? '✓ Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Achievements Card */}
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                      <StarIcon className="w-5 h-5 text-yellow-500" />
                      Achievements
                    </h3>
                    <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-semibold">
                      {[
                        user.tasks_completed >= 1,
                        user.tasks_completed >= 5,
                        user.tasks_completed >= 10,
                        (user.average_rating || 0) >= 4.5
                      ].filter(Boolean).length} Unlocked
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {user.tasks_completed >= 1 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="w-12 h-12 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">First Task</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Completed your first task</div>
                        </div>
                      </div>
                    )}

                    {user.tasks_completed >= 5 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="w-12 h-12 bg-blue-400 dark:bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">⭐</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Rising Star</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Completed 5 tasks</div>
                        </div>
                      </div>
                    )}

                    {user.tasks_completed >= 10 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="w-12 h-12 bg-green-400 dark:bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🏆</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Expert</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Completed 10 tasks</div>
                        </div>
                      </div>
                    )}

                    {(user.average_rating || 0) >= 4.5 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="w-12 h-12 bg-purple-400 dark:bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">💎</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Top Rated</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">4.5+ star rating</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {(user.tasks_completed === 0 || user.tasks_completed === undefined) && (user.average_rating === 0 || user.average_rating === undefined || user.average_rating === null) && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Complete tasks to unlock achievements!</p>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Payments Tab */}
            {activeTab === 'payments' && user.is_freelancer && (
              <div className="space-y-6">
                {/* Stripe Connection Status */}
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <CreditCardIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      Payment Account
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Connect your Stripe account to receive payments
                    </p>
                  </div>

                  {loadingStripe ? (
                    <div className="text-center py-12">
                      <Loading />
                    </div>
                  ) : !stripeAccount || !stripeAccount.has_account ? (
                    /* No Stripe Account */
                    <div className="space-y-6">
                      {/* Warning Banner */}
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-1">
                              Payment Account Required
                            </h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                              You need to connect a Stripe account to receive payments for completed tasks.
                              This is required for all freelancers on our platform.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Benefits Section */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center mb-3">
                            <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Secure Payments</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Industry-leading security with Stripe
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center mb-3">
                            <BanknotesIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Fast Transfers</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get paid quickly after task completion
                          </p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center mb-3">
                            <CheckCircleIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2">Easy Setup</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            5-minute setup process
                          </p>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-xl p-6 text-white">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">Ready to Get Paid?</h3>
                            <p className="text-blue-100 dark:text-blue-200 mb-4">
                              Connect your Stripe account in just a few minutes and start receiving payments for your work.
                            </p>
                            <ul className="space-y-2 text-sm text-blue-100 dark:text-blue-200 mb-6">
                              <li className="flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                No setup fees
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                Secure and encrypted
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircleIcon className="w-4 h-4" />
                                Receive payments directly to your bank
                              </li>
                            </ul>
                            <Button
                              onClick={handleCreateStripeAccount}
                              disabled={creatingStripeAccount}
                              className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
                            >
                              {creatingStripeAccount ? (
                                <span className="flex items-center gap-2">
                                  <Loading size="sm" />
                                  Setting up...
                                </span>
                              ) : (
                                <span className="flex items-center gap-2">
                                  <CreditCardIcon className="w-5 h-5" />
                                  Connect Stripe Account
                                  <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                                </span>
                              )}
                            </Button>
                          </div>
                          <div className="hidden md:block">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                              <CreditCardIcon className="w-12 h-12 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info Box */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">What you'll need:</h4>
                            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
                              <li>• Valid government-issued ID</li>
                              <li>• Bank account information</li>
                              <li>• Business details (if applicable)</li>
                              <li>• Tax identification number</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : !stripeAccount.onboarding_completed ? (
                    /* Stripe Account Created but Onboarding Not Complete */
                    <div className="space-y-6">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                          <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-bold text-yellow-900 dark:text-yellow-200 mb-1">
                              Complete Your Stripe Onboarding
                            </h3>
                            <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-3">
                              Your Stripe account has been created, but you need to complete the onboarding process to receive payments.
                            </p>
                            <Button
                              onClick={handleStripeOnboarding}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg"
                            >
                              <span className="flex items-center gap-2">
                                Complete Onboarding
                                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                              </span>
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Status Info */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Account Created</span>
                            <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Onboarding Status</span>
                            <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 text-xs font-semibold rounded">
                              Incomplete
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Stripe Account Fully Set Up */
                    <div className="space-y-6">
                      {/* Success Banner */}
                      <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-400 p-4 rounded-r-lg">
                        <div className="flex items-start gap-3">
                          <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <h3 className="font-bold text-green-900 dark:text-green-200 mb-1">
                              Payment Account Connected
                            </h3>
                            <p className="text-sm text-green-800 dark:text-green-300">
                              Your Stripe account is fully set up and ready to receive payments!
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Account Status Grid */}
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                              <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Account Status</div>
                              <div className="font-bold text-gray-900 dark:text-white">Active</div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                              {stripeAccount.charges_enabled ? (
                                <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              ) : (
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Charges</div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {stripeAccount.charges_enabled ? 'Enabled' : 'Disabled'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                              {stripeAccount.payouts_enabled ? (
                                <CheckCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                              ) : (
                                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Payouts</div>
                              <div className="font-bold text-gray-900 dark:text-white">
                                {stripeAccount.payouts_enabled ? 'Enabled' : 'Disabled'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                              <CreditCardIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">Account Type</div>
                              <div className="font-bold text-gray-900 dark:text-white capitalize">
                                {stripeAccount.account_type || 'Standard'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={handleStripeOnboarding}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          Manage Stripe Account
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </Button>
                        <Link to="/wallet">
                          <Button className="flex items-center gap-2">
                            <BanknotesIcon className="w-4 h-4" />
                            View Wallet
                          </Button>
                        </Link>
                      </div>

                      {/* Info Note */}
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            <p className="font-semibold mb-1">How payments work:</p>
                            <ul className="space-y-1">
                              <li>• Clients pay into secure escrow when accepting your application</li>
                              <li>• Complete the task and mark it as done</li>
                              <li>• Payment is automatically released to your Stripe account</li>
                              <li>• Transfer funds to your bank account anytime from Stripe</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <RectangleStackIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          Portfolio
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Showcase your best work and projects
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          setEditingPortfolioItem(null);
                          setShowPortfolioForm(true);
                        }}
                        variant="primary"
                        icon={PlusIcon}
                        className="shadow-lg hover:shadow-xl"
                      >
                        Add Project
                      </Button>
                    </div>
                  </div>

                  {loadingPortfolio ? (
                    <div className="text-center py-12">
                      <Loading />
                    </div>
                  ) : portfolioItems.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="inline-block p-6 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <RectangleStackIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        No portfolio items yet
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Start building your portfolio by adding your best projects
                      </p>
                      <Button
                        onClick={() => {
                          setEditingPortfolioItem(null);
                          setShowPortfolioForm(true);
                        }}
                        variant="primary"
                        icon={PlusIcon}
                      >
                        Add Your First Project
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {portfolioItems.map((item) => (
                        <PortfolioCard
                          key={item.id}
                          item={item}
                          isOwner={true}
                          onEdit={handleEditPortfolio}
                          onDelete={handleDeletePortfolio}
                        />
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                          Reviews & Ratings
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          What others are saying about working with you
                        </p>
                      </div>
                      {user.average_rating > 0 && (
                        <div className="text-right">
                          <div className="flex items-center gap-2 mb-1">
                            <StarRating
                              value={user.average_rating}
                              readOnly
                              showValue
                              size="lg"
                            />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {loadingReviews ? (
                    <div className="text-center py-12">
                      <Loading />
                    </div>
                  ) : (
                    <ReviewList
                      reviews={reviews}
                      loading={loadingReviews}
                      showHelpful={false}
                      showFilters={reviews.length > 3}
                    />
                  )}
                </Card>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <BellIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      Notification Preferences
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Choose how and when you want to be notified
                    </p>
                  </div>

                  {loadingNotifPrefs ? (
                    <div className="py-12 text-center">
                      <Loading />
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Email Notifications */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                          Email Notifications
                        </h3>
                        <div className="space-y-4">
                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Task Applications</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Receive emails when someone applies to your tasks</p>
                            </div>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.email_task_applications}
                                onChange={() => handleNotifPrefChange('email_task_applications')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                          </label>

                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Task Updates</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Receive emails about task status changes</p>
                            </div>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.email_task_updates}
                                onChange={() => handleNotifPrefChange('email_task_updates')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                          </label>

                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Messages</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Receive emails for new messages</p>
                            </div>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.email_messages}
                                onChange={() => handleNotifPrefChange('email_messages')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                          </label>

                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Task Reminders</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Receive deadline and reminder emails</p>
                            </div>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.email_task_reminders}
                                onChange={() => handleNotifPrefChange('email_task_reminders')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                          </label>

                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Marketing & Promotions</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Receive emails about new features and promotions</p>
                            </div>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.email_marketing}
                                onChange={() => handleNotifPrefChange('email_marketing')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Push Notifications */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <BellIcon className="w-5 h-5 text-gray-500" />
                          In-App Notifications
                        </h3>
                        <div className="space-y-4">
                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Task Applications</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone applies to your tasks</p>
                            </div>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.push_task_applications}
                                onChange={() => handleNotifPrefChange('push_task_applications')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                          </label>

                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Task Updates</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about task status changes</p>
                            </div>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.push_task_updates}
                                onChange={() => handleNotifPrefChange('push_task_updates')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                          </label>

                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Messages</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Get notified for new messages</p>
                            </div>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.push_messages}
                                onChange={() => handleNotifPrefChange('push_messages')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                          </label>

                          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">Task Reminders</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">Get deadline and reminder notifications</p>
                            </div>
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={notificationPrefs.push_task_reminders}
                                onChange={() => handleNotifPrefChange('push_task_reminders')}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Save Button */}
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          onClick={saveNotificationPrefs}
                          variant="primary"
                          loading={savingNotifPrefs}
                        >
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Danger Zone Tab */}
            {activeTab === 'danger' && (
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                      <ExclamationCircleIcon className="w-6 h-6" />
                      Danger Zone
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Irreversible and destructive actions
                    </p>
                  </div>

                  {/* Delete Account Section */}
                  <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <TrashIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                          Delete Account
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          Once you delete your account, there is no going back. All your data, tasks, reviews, and portfolio items will be permanently removed.
                        </p>

                        {!showDeleteAccount ? (
                          <Button
                            onClick={() => setShowDeleteAccount(true)}
                            variant="danger"
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <TrashIcon className="w-4 h-4 mr-2" />
                            Delete My Account
                          </Button>
                        ) : (
                          <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                This action is permanent and cannot be undone!
                              </p>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Enter your password to confirm
                              </label>
                              <Input
                                type="password"
                                placeholder="Your password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Type <span className="font-bold text-red-600">DELETE</span> to confirm
                              </label>
                              <Input
                                type="text"
                                placeholder="Type DELETE"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={() => {
                                  setShowDeleteAccount(false);
                                  setDeletePassword('');
                                  setDeleteConfirmation('');
                                }}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleDeleteAccount}
                                variant="danger"
                                loading={deletingAccount}
                                disabled={deleteConfirmation !== 'DELETE' || !deletePassword}
                                className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                              >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Permanently Delete Account
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Form Modal */}
      <PortfolioForm
        isOpen={showPortfolioForm}
        onClose={() => {
          setShowPortfolioForm(false);
          setEditingPortfolioItem(null);
        }}
        item={editingPortfolioItem}
        onSuccess={handlePortfolioSuccess}
      />

      {/* Delete Portfolio Confirmation */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeletingPortfolioItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Portfolio Item?"
        message={`Are you sure you want to delete "${deletingPortfolioItem?.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deletingPortfolio}
      />
    </div>
  );
};

export default Profile;