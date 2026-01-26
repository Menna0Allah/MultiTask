import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Loading from '../../components/common/Loading';
import Empty from '../../components/common/Empty';
import StarRating from '../../components/common/StarRating';
import PortfolioCard from '../../components/portfolio/PortfolioCard';
import ReviewList from '../../components/reviews/ReviewList';
import userService from '../../services/userService';
import reviewService from '../../services/reviewService';
import taskService from '../../services/taskService';
import toast from 'react-hot-toast';
import {
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  StarIcon,
  ClockIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  RectangleStackIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  // Check if viewing own profile
  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  useEffect(() => {
    if (user) {
      fetchUserReviews();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await userService.getUserByUsername(username);
      setUser(userData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load user profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      setLoadingReviews(true);
      const data = await reviewService.getUserReviews(username);
      setReviews(data.results || data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleStartConversation = () => {
    if (!isAuthenticated) {
      toast.error('Please login to send a message');
      navigate('/login');
      return;
    }
    navigate('/messages', { state: { startConversationWith: user } });
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container-custom text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {error}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Link to="/freelancers">
              <Button variant="primary">
                Browse Freelancers
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const stats = [
    {
      label: 'Tasks Completed',
      value: user.total_tasks_completed || 0,
      icon: CheckCircleIcon,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    {
      label: 'Reviews',
      value: user.total_reviews || 0,
      icon: ChatBubbleLeftRightIcon,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    {
      label: 'Rating',
      value: user.average_rating ? parseFloat(user.average_rating).toFixed(1) : '0.0',
      icon: StarIcon,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-blue-600 dark:from-primary-700 dark:via-purple-700 dark:to-blue-700">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10 py-12 px-6 md:px-8 lg:px-12">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/30 shadow-2xl">
                <span className="text-5xl md:text-6xl font-bold text-white">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-white">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {user.full_name || user.username}
                </h1>
                {user.is_verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium border border-white/30">
                    <ShieldCheckIcon className="w-4 h-4" />
                    Verified
                  </span>
                )}
              </div>

              <p className="text-white/80 text-lg mb-1">@{user.username}</p>

              <div className="flex flex-wrap items-center gap-4 mt-4 text-white/90">
                {user.city && (
                  <span className="flex items-center gap-1">
                    <MapPinIcon className="w-5 h-5" />
                    {user.city}{user.country ? `, ${user.country}` : ''}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDaysIcon className="w-5 h-5" />
                  Member since {user.member_since}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.user_type === 'FREELANCER' ? 'bg-green-500/30 border border-green-400/50' :
                  user.user_type === 'CLIENT' ? 'bg-blue-500/30 border border-blue-400/50' :
                  'bg-purple-500/30 border border-purple-400/50'
                }`}>
                  {user.user_type}
                </span>
              </div>

              {/* Rating */}
              {parseFloat(user.average_rating) > 0 && (
                <div className="mt-4 flex items-center gap-2">
                  <StarRating value={parseFloat(user.average_rating)} readOnly size="lg" />
                  <span className="text-white font-semibold">
                    {parseFloat(user.average_rating).toFixed(1)}
                  </span>
                  <span className="text-white/70">
                    ({user.total_reviews} reviews)
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                {!isOwnProfile && (
                  <Button
                    onClick={handleStartConversation}
                    className="bg-white text-primary-600 hover:bg-gray-100 font-semibold shadow-lg"
                  >
                    <EnvelopeIcon className="w-5 h-5 mr-2" />
                    Send Message
                  </Button>
                )}
                {isOwnProfile && (
                  <Link to="/profile">
                    <Button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold shadow-lg">
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 text-center"
              >
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container-custom py-8 px-6 md:px-8 lg:px-12">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 pb-4">
          {[
            { id: 'overview', label: 'Overview', icon: UserIcon },
            { id: 'portfolio', label: 'Portfolio', icon: RectangleStackIcon, count: user.portfolio_items?.length },
            { id: 'reviews', label: 'Reviews', icon: ChatBubbleLeftRightIcon, count: reviews.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <>
                {/* Bio Section */}
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <UserIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    About
                  </h2>
                  {user.bio ? (
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {user.bio}
                    </p>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-500 italic">
                      No bio provided yet.
                    </p>
                  )}
                </Card>

                {/* Skills Section */}
                {(user.user_skills?.length > 0 || user.skills) && (
                  <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <SparklesIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      Skills & Expertise
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {user.user_skills?.length > 0 ? (
                        user.user_skills.map((skill) => (
                          <span
                            key={skill.id}
                            className="px-4 py-2 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-lg text-sm font-medium border border-primary-200 dark:border-primary-800"
                          >
                            {skill.name}
                          </span>
                        ))
                      ) : user.skills ? (
                        user.skills.split(',').map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
                          >
                            {skill.trim()}
                          </span>
                        ))
                      ) : null}
                    </div>
                  </Card>
                )}

                {/* Portfolio Preview */}
                {user.portfolio_items?.length > 0 && (
                  <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <RectangleStackIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        Portfolio Highlights
                      </h2>
                      <button
                        onClick={() => setActiveTab('portfolio')}
                        className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {user.portfolio_items.slice(0, 2).map((item) => (
                        <PortfolioCard key={item.id} item={item} isOwner={false} />
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <RectangleStackIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  Portfolio
                </h2>
                {user.portfolio_items?.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {user.portfolio_items.map((item) => (
                      <PortfolioCard key={item.id} item={item} isOwner={false} />
                    ))}
                  </div>
                ) : (
                  <Empty
                    icon={RectangleStackIcon}
                    title="No portfolio items"
                    description="This user hasn't added any portfolio items yet."
                  />
                )}
              </Card>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    Reviews
                  </h2>
                  {user.average_rating > 0 && (
                    <div className="flex items-center gap-2">
                      <StarRating value={user.average_rating} readOnly showValue size="lg" />
                    </div>
                  )}
                </div>
                {loadingReviews ? (
                  <Loading />
                ) : (
                  <ReviewList
                    reviews={reviews}
                    loading={loadingReviews}
                    showHelpful={false}
                    emptyMessage="No reviews yet."
                  />
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Completed</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.total_tasks_completed || 0}
                  </span>
                </div>

                {user.user_type !== 'FREELANCER' && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <BriefcaseIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Posted</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {user.total_tasks_posted || 0}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <StarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Rating</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.average_rating ? parseFloat(user.average_rating).toFixed(1) : '0.0'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Member Since</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {user.member_since}
                  </span>
                </div>
              </div>
            </Card>

            {/* Contact Card */}
            {!isOwnProfile && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-2 border-primary-200 dark:border-primary-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                  Interested in working together?
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Send a message to discuss your project or task requirements.
                </p>
                <Button
                  onClick={handleStartConversation}
                  variant="primary"
                  fullWidth
                  icon={EnvelopeIcon}
                >
                  Send Message
                </Button>
              </Card>
            )}

            {/* Browse More */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Looking for more?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Browse our directory of talented freelancers.
              </p>
              <Link to="/freelancers">
                <Button variant="outline" fullWidth>
                  Browse Freelancers
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
