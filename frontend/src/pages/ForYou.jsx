import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  HeartIcon,
  SparklesIcon,
  ArrowPathIcon,
  StarIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  FunnelIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  AdjustmentsHorizontalIcon,
  FireIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import recommendationService from '../services/recommendationService';
import taskService from '../services/taskService';
import userService from '../services/userService';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Empty from '../components/common/Empty';
import Avatar from '../components/common/Avatar';
import ServiceOfferingCard from '../components/recommendations/ServiceOfferingCard';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ForYou = () => {
  const navigate = useNavigate();
  const { user, isClient, isFreelancer } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [savedItems, setSavedItems] = useState(new Set());
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'services'
  const [stats, setStats] = useState({
    totalRecommended: 0,
    totalSaved: 0,
    matchingEnabled: true,
  });

  // Redirect client-only users - For You is only for freelancers
  useEffect(() => {
    if (!isFreelancer && isClient) {
      toast.error('For You recommendations are only available for freelancers');
      navigate('/freelancers');
    }
  }, [isFreelancer, isClient, navigate]);

  // Filtering and sorting
  const [sortBy, setSortBy] = useState('match'); // 'match', 'rating', 'completed'
  const [minMatchScore, setMinMatchScore] = useState(0); // 0, 70, 80, 90
  const [showFilters, setShowFilters] = useState(false);

  // Load saved items from localStorage on mount only
  useEffect(() => {
    const savedFromStorage = localStorage.getItem('forYouSavedItems');
    if (savedFromStorage) {
      try {
        const parsed = JSON.parse(savedFromStorage);
        setSavedItems(new Set(parsed));
      } catch (error) {
        console.error('Error loading saved items:', error);
      }
    }
  }, []);

  // Fetch recommendations when user type changes
  useEffect(() => {
    fetchRecommendations();
  }, [isClient, isFreelancer]);

  // Keep the active tab aligned with role
  useEffect(() => {
    if (isClient && !isFreelancer) {
      setActiveTab('services');
    } else if (isFreelancer && !isClient) {
      setActiveTab('tasks');
    }
  }, [isClient, isFreelancer]);

  // Save to localStorage whenever savedItems changes
  useEffect(() => {
    localStorage.setItem('forYouSavedItems', JSON.stringify([...savedItems]));
  }, [savedItems]);

  // Update stats based on filtered results
  useEffect(() => {
    let totalRecommended = 0;

    if (isClient && !isFreelancer) {
      let filteredFreelancers = [...freelancers];
      if (minMatchScore > 0) {
        filteredFreelancers = filteredFreelancers.filter(f => (f.match_score || 0) >= minMatchScore);
      }
      totalRecommended = filteredFreelancers.length;
    } else if (!isClient && isFreelancer) {
      let filteredTasks = [...tasks];
      if (minMatchScore > 0) {
        filteredTasks = filteredTasks.filter(t => (t.match_score || 0) >= minMatchScore);
      }
      totalRecommended = filteredTasks.length;
    } else if (isClient && isFreelancer) {
      if (activeTab === 'services') {
        let filteredFreelancers = [...freelancers];
        if (minMatchScore > 0) {
          filteredFreelancers = filteredFreelancers.filter(f => (f.match_score || 0) >= minMatchScore);
        }
        totalRecommended = filteredFreelancers.length;
      } else {
        let filteredTasks = [...tasks];
        if (minMatchScore > 0) {
          filteredTasks = filteredTasks.filter(t => (t.match_score || 0) >= minMatchScore);
        }
        totalRecommended = filteredTasks.length;
      }
    }

    setStats({
      totalRecommended,
      totalSaved: savedItems.size,
      matchingEnabled: true,
    });
  }, [tasks, freelancers, minMatchScore, savedItems.size, isClient, isFreelancer, activeTab]);

  const fetchRecommendations = async () => {
    if (!isFreelancer && !isClient) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const requests = [];
      if (isFreelancer) {
        requests.push(
          recommendationService.getRecommendedTasks({ force_refresh: true })
        );
      }
      if (isClient) {
        requests.push(
          userService.getFreelancers({ ordering: '-average_rating' })
        );
      }

      const results = await Promise.all(requests);
      let resultIndex = 0;

      if (isFreelancer) {
        const tasksData = results[resultIndex++];
        setTasks(tasksData.results || tasksData || []);
      }

      if (isClient) {
        const freelancersData = results[resultIndex++];
        setFreelancers(freelancersData.results || freelancersData || []);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
    toast.success('Recommendations refreshed!');
  };

  const handleSaveItem = async (itemId) => {
    try {
      const wasSaved = savedItems.has(itemId);

      if (wasSaved) {
        setSavedItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
        toast.success('Removed from saved');
      } else {
        setSavedItems((prev) => new Set(prev).add(itemId));
        toast.success('Saved successfully!');
      }

      // Stats will be updated by the useEffect that watches savedItems.size
    } catch (error) {
      console.error('Error saving item:', error);
      toast.error('Failed to save');
    }
  };

  const getMatchColor = (score) => {
    if (score >= 90) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 80) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (score >= 70) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-gray-500 to-slate-500';
  };

  const getCategoryColor = (category) => {
    const colors = {
      cleaning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      plumbing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      painting: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
      electrical: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      gardening: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      handyman: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      hvac: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
      carpentry: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    };
    const categoryName = typeof category === 'string' ? category : category?.name || '';
    return colors[categoryName.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  };

  // Filter and sort freelancers
  const getFilteredAndSortedFreelancers = () => {
    let filtered = [...freelancers];

    // Apply match score filter
    if (minMatchScore > 0) {
      filtered = filtered.filter(f => (f.match_score || 0) >= minMatchScore);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'match') {
        return (b.match_score || 0) - (a.match_score || 0);
      } else if (sortBy === 'rating') {
        return (b.average_rating || 0) - (a.average_rating || 0);
      } else if (sortBy === 'completed') {
        return (b.tasks_completed || 0) - (a.tasks_completed || 0);
      }
      return 0;
    });

    return filtered;
  };

  // Filter and sort tasks
  const getFilteredAndSortedTasks = () => {
    let filtered = [...tasks];

    // Apply match score filter
    if (minMatchScore > 0) {
      filtered = filtered.filter(t => (t.match_score || 0) >= minMatchScore);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'match') {
        return (b.match_score || 0) - (a.match_score || 0);
      } else if (sortBy === 'budget') {
        return (b.budget || 0) - (a.budget || 0);
      }
      return 0;
    });

    return filtered;
  };

  // Get match explanation
  const getMatchExplanation = (matchScore) => {
    if (matchScore >= 90) {
      return 'Excellent match based on your profile, location, and work history';
    } else if (matchScore >= 80) {
      return 'Great match with strong alignment to your preferences';
    } else if (matchScore >= 70) {
      return 'Good match with several matching factors';
    }
    return 'Potential match worth exploring';
  };

  const getSkillsArray = (skills) => {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    if (typeof skills === 'string') {
      return skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
    }
    return [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 animate-fade-in">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
            <span className="text-white text-sm font-medium flex items-center gap-2">
              <SparklesIcon className="h-4 w-4" />
              AI-Powered Matching Active
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5 animate-fade-in animation-delay-200">
            <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
              {isClient && isFreelancer
                ? 'Discover Perfect Matches'
                : isClient
                ? 'Find Trusted Professionals'
                : 'Your Personalized Opportunities'}
            </span>
          </h1>

          <p className="text-base sm:text-lg text-purple-100 mb-6 max-w-3xl mx-auto animate-fade-in animation-delay-300">
            {isClient && isFreelancer
              ? 'AI-curated recommendations for both services and tasks, tailored to your unique profile'
              : isClient
              ? 'Discover quality freelancers perfectly matched to your project needs'
              : 'Smart task recommendations based on your skills, experience, and preferences'}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in animation-delay-400">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="group relative px-8 py-4 bg-white text-purple-600 font-semibold rounded-xl shadow-2xl hover:shadow-purple-500/50 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowPathIcon className={`h-5 w-5 inline mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh Recommendations'}
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="group relative px-8 py-4 bg-purple-600/20 backdrop-blur-sm border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-purple-600/30 transform hover:-translate-y-1 transition-all duration-300"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 inline mr-2" />
              Filter & Sort
            </button>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-24 sm:h-40 fill-gray-50 dark:fill-gray-900 drop-shadow-lg" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
          </svg>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        {/* Modern Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {/* Total Recommendations */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-purple-500/5 transition-all duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-md">
                  <RocketLaunchIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">
                {isClient && isFreelancer
                  ? 'Total Recommendations'
                  : isClient
                  ? 'Top Freelancers'
                  : 'Perfect Matches'}
              </h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {stats.totalRecommended}
              </p>
            </div>
          </div>

          {/* Saved Items */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/0 to-pink-500/0 group-hover:from-pink-500/10 group-hover:to-pink-500/5 transition-all duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg shadow-md">
                  <HeartSolidIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">
                Saved Favorites
              </h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                {stats.totalSaved}
              </p>
            </div>
          </div>

          {/* AI Status */}
          <div className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:to-green-500/5 transition-all duration-300"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg shadow-md relative">
                  <SparklesIcon className="h-5 w-5 text-white" />
                  <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-gray-600 dark:text-gray-400 text-sm font-semibold mb-1">
                AI Matching
              </h3>
              <p className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Active
              </p>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl border border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <FunnelIcon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filter & Sort Options</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="match">Match Score (Highest)</option>
                  {isClient ? (
                    <>
                      <option value="rating">Rating (Highest)</option>
                      <option value="completed">Tasks Completed (Most)</option>
                    </>
                  ) : (
                    <option value="budget">Budget (Highest)</option>
                  )}
                </select>
              </div>

              {/* Minimum Match Score */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Minimum Match Score
                </label>
                <select
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(Number(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="0">All Matches</option>
                  <option value="70">70% and above</option>
                  <option value="80">80% and above</option>
                  <option value="90">90% and above (Best Matches)</option>
                </select>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(sortBy !== 'match' || minMatchScore > 0) && (
              <div className="mt-6 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active filters:</span>
                    {sortBy !== 'match' && (
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-sm px-3 py-1">
                        Sort: {sortBy === 'rating' ? 'Rating' : sortBy === 'completed' ? 'Completed' : 'Budget'}
                      </Badge>
                    )}
                    {minMatchScore > 0 && (
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 text-sm px-3 py-1">
                        Min Match: {minMatchScore}%
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSortBy('match');
                      setMinMatchScore(0);
                    }}
                    className="text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Content Grid */}
        {isClient && isFreelancer ? (
          // Both Services and Tasks - Use Tabs
          <div className="pb-16">
            {/* Modern Tabs */}
            <div className="sticky top-20 z-30 bg-gray-50 dark:bg-gray-900 pb-4 mb-8">
              <div className="flex gap-4 p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === 'tasks'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <BriefcaseIcon className="w-5 h-5" />
                    <span>Tasks ({tasks.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`flex-1 px-6 py-4 font-semibold rounded-xl transition-all duration-300 ${
                    activeTab === 'services'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <UserGroupIcon className="w-5 h-5" />
                    <span>Freelancers ({freelancers.length})</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'services' ? (
              (() => {
                const filteredFreelancers = getFilteredAndSortedFreelancers();
                return filteredFreelancers.length === 0 ? (
                  <Empty
                    title={minMatchScore > 0 ? `No matches above ${minMatchScore}%` : "No Professional Freelancers Found"}
                    description={minMatchScore > 0 ? "Try adjusting your filters to see more results" : "We're finding the best professionals for you. Complete your profile for better matches!"}
                    actionLabel={minMatchScore > 0 ? "Clear Filters" : "Update Profile"}
                    onAction={() => minMatchScore > 0 ? setMinMatchScore(0) : navigate('/profile')}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFreelancers.map((freelancer) => (
                    <div
                      key={freelancer.id}
                      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
                    >
                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>

                      <div className="relative">
                        {/* Match Score Badge with Tooltip */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="group/tooltip relative">
                            <div className={`${getMatchColor(freelancer.match_score || 0)} text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 cursor-help`}>
                              <SparklesIcon className="h-3.5 w-3.5" />
                              <span>{freelancer.match_score || 0}% Match</span>
                              <InformationCircleIcon className="h-3.5 w-3.5" />
                            </div>
                            {/* Tooltip */}
                            <div className="absolute left-0 top-full mt-2 w-56 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-20">
                              <div className="font-semibold text-xs mb-1">Why this match?</div>
                              <div className="text-gray-300 text-xs leading-relaxed">{getMatchExplanation(freelancer.match_score || 0)}</div>
                              <div className="absolute top-0 left-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          </div>
                        </div>

                        {/* Freelancer Header */}
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar
                            user={freelancer}
                            size="md"
                            className="ring-2 ring-gray-100 dark:ring-gray-700 group-hover:ring-purple-200 dark:group-hover:ring-purple-800 transition-all"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-base text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                              {freelancer.full_name || freelancer.username}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <div className="flex items-center">
                                <StarSolidIcon className="w-3.5 h-3.5 text-yellow-400" />
                                <span className="ml-0.5 text-xs font-semibold text-gray-900 dark:text-white">
                                  {freelancer.average_rating ? Number(freelancer.average_rating).toFixed(1) : '0.0'}
                                </span>
                              </div>
                              <span className="text-gray-400 text-xs">•</span>
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {freelancer.total_reviews || 0} reviews
                              </span>
                            </div>
                            {freelancer.city && (
                              <div className="flex items-center gap-0.5 mt-0.5 text-xs text-gray-600 dark:text-gray-400">
                                <MapPinIcon className="w-3 h-3" />
                                {freelancer.city}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bio */}
                        {freelancer.bio && (
                          <p className="text-gray-600 dark:text-gray-300 text-xs mb-3 line-clamp-2">
                            {freelancer.bio}
                          </p>
                        )}

                        {/* User Type Badge */}
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs px-2 py-0.5">
                            {freelancer.user_type === 'both' ? 'Freelancer & Client' : 'Freelancer'}
                          </Badge>
                          {freelancer.is_verified && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-0.5">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>

                        {/* Skills */}
                        {getSkillsArray(freelancer.skills).length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1.5">
                              {getSkillsArray(freelancer.skills).slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {getSkillsArray(freelancer.skills).length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-400">
                                  +{getSkillsArray(freelancer.skills).length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-3 mb-3 pb-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                            <CheckCircleIcon className="w-3.5 h-3.5 text-green-500" />
                            <span className="font-medium">{freelancer.tasks_completed || 0} completed</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link
                            to={`/messages?user=${freelancer.id}`}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg text-sm font-semibold transition-all duration-300 text-center flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                            Contact
                          </Link>
                          <button
                            onClick={() => handleSaveItem(freelancer.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300"
                          >
                            {savedItems.has(freelancer.id) ? (
                              <HeartSolidIcon className="h-5 w-5 text-pink-500" />
                            ) : (
                              <HeartIcon className="h-5 w-5 text-gray-400 hover:text-pink-500 transition-colors" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                );
              })()
            ) : (
              // Tasks Tab
              (() => {
                const filteredTasks = getFilteredAndSortedTasks();
                return filteredTasks.length === 0 ? (
                  <Empty
                    title={minMatchScore > 0 ? `No matches above ${minMatchScore}%` : "No Tasks Available"}
                    description={minMatchScore > 0 ? "Try adjusting your filters to see more results" : "Check back soon for recommended tasks"}
                    actionLabel={minMatchScore > 0 ? "Clear Filters" : "Browse Tasks"}
                    onAction={() => minMatchScore > 0 ? setMinMatchScore(0) : navigate('/tasks')}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>

                      <div className="relative">
                        {/* Match Score Badge with Tooltip */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="group/tooltip relative" onClick={(e) => e.stopPropagation()}>
                            <div className={`${getMatchColor(task.match_score)} text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 cursor-help`}>
                              <SparklesIcon className="h-3.5 w-3.5" />
                              <span>{task.match_score}% Match</span>
                              <InformationCircleIcon className="h-3.5 w-3.5" />
                            </div>
                            {/* Tooltip */}
                            <div className="absolute left-0 top-full mt-2 w-56 p-2.5 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-20">
                              <div className="font-semibold text-xs mb-1">Why this match?</div>
                              <div className="text-gray-300 text-xs leading-relaxed">{getMatchExplanation(task.match_score)}</div>
                              <div className="absolute top-0 left-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                            {task.title}
                          </h3>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 text-xs">
                          {task.description}
                        </p>

                        {/* Category and Budget */}
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={getCategoryColor(task.category) + " text-xs px-2 py-0.5"}>
                            {typeof task.category === 'string' ? task.category : task.category?.name || 'Uncategorized'}
                          </Badge>
                          <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {task.budget} EGP
                          </span>
                        </div>

                        {/* Skills */}
                        {task.required_skills && task.required_skills.length > 0 && (
                          <div className="mb-3">
                            <div className="flex flex-wrap gap-1.5">
                              {task.required_skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {task.required_skills.length > 3 && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-400">
                                  +{task.required_skills.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            {task.proposals_count || 0} proposals
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveItem(task.id);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300"
                          >
                            {savedItems.has(task.id) ? (
                              <HeartSolidIcon className="h-5 w-5 text-pink-500" />
                            ) : (
                              <HeartIcon className="h-5 w-5 text-gray-400 hover:text-pink-500 transition-colors" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                );
              })()
            )}
          </div>
        ) : isClient ? (
          // Services for Clients only
          <div className="pb-16">
            {(() => {
              const filteredFreelancers = getFilteredAndSortedFreelancers();
              return filteredFreelancers.length === 0 ? (
                <Empty
                  title={minMatchScore > 0 ? `No matches above ${minMatchScore}%` : "No Professional Freelancers Found"}
                  description={minMatchScore > 0 ? "Try adjusting your filters to see more results" : "We're finding the best professionals for you. Update your profile for better matches!"}
                  actionLabel={minMatchScore > 0 ? "Clear Filters" : "Update Profile"}
                  onAction={() => minMatchScore > 0 ? setMinMatchScore(0) : navigate('/profile')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredFreelancers.map((freelancer) => (
                  <div
                    key={freelancer.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>

                    <div className="relative">
                      {/* Match Score Badge with Tooltip */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="group/tooltip relative">
                          <div className={`${getMatchColor(freelancer.match_score || 0)} text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2 cursor-help`}>
                            <SparklesIcon className="h-4 w-4" />
                            <span>{freelancer.match_score || 0}% Match</span>
                            <InformationCircleIcon className="h-4 w-4" />
                          </div>
                          {/* Tooltip */}
                          <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-20">
                            <div className="font-semibold mb-1">Why this match?</div>
                            <div className="text-gray-300">{getMatchExplanation(freelancer.match_score || 0)}</div>
                            <div className="absolute top-0 left-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>

                      {/* Freelancer Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <Avatar
                          user={freelancer}
                          size="lg"
                          className="ring-4 ring-gray-100 dark:ring-gray-700 group-hover:ring-purple-200 dark:group-hover:ring-purple-800 transition-all"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {freelancer.full_name || freelancer.username}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <StarSolidIcon className="w-4 h-4 text-yellow-400" />
                              <span className="ml-1 text-sm font-semibold text-gray-900 dark:text-white">
                                {freelancer.average_rating ? Number(freelancer.average_rating).toFixed(1) : '0.0'}
                              </span>
                            </div>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {freelancer.total_reviews || 0} reviews
                            </span>
                          </div>
                          {freelancer.city && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600 dark:text-gray-400">
                              <MapPinIcon className="w-4 h-4" />
                              {freelancer.city}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bio */}
                      {freelancer.bio && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
                          {freelancer.bio}
                        </p>
                      )}

                      {/* User Type Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                          {freelancer.user_type === 'both' ? 'Freelancer & Client' : 'Freelancer'}
                        </Badge>
                        {freelancer.is_verified && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            ✓ Verified
                          </Badge>
                        )}
                      </div>

                      {/* Skills */}
                      {getSkillsArray(freelancer.skills).length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {getSkillsArray(freelancer.skills).slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                              >
                                {skill}
                              </span>
                            ))}
                            {getSkillsArray(freelancer.skills).length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                +{getSkillsArray(freelancer.skills).length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mb-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400">
                          <CheckCircleIcon className="w-4 h-4 text-green-500" />
                          <span className="font-medium">{freelancer.tasks_completed || 0} completed</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3">
                        <Link
                          to={`/messages?user=${freelancer.id}`}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-300 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                          Contact
                        </Link>
                        <button
                          onClick={() => handleSaveItem(freelancer.id)}
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          {savedItems.has(freelancer.id) ? (
                            <HeartSolidIcon className="h-6 w-6 text-pink-500" />
                          ) : (
                            <HeartIcon className="h-6 w-6 text-gray-400 hover:text-pink-500 transition-colors" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
        ) : (
          // Tasks for Freelancers
          <div className="pb-16">
            {(() => {
              const filteredTasks = getFilteredAndSortedTasks();
              return filteredTasks.length === 0 ? (
                <Empty
                  title={minMatchScore > 0 ? `No matches above ${minMatchScore}%` : "No Recommendations Yet"}
                  description={minMatchScore > 0 ? "Try adjusting your filters to see more results" : "Complete your profile and browse tasks to help our AI understand your preferences"}
                  actionLabel={minMatchScore > 0 ? "Clear Filters" : "Update Profile"}
                  onAction={() => minMatchScore > 0 ? setMinMatchScore(0) : navigate('/profile')}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 overflow-hidden"
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>

                    <div className="relative">
                      {/* Match Score Badge with Tooltip */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="group/tooltip relative" onClick={(e) => e.stopPropagation()}>
                          <div className={`${getMatchColor(task.match_score)} text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2 cursor-help`}>
                            <SparklesIcon className="h-4 w-4" />
                            <span>{task.match_score}% Match</span>
                            <InformationCircleIcon className="h-4 w-4" />
                          </div>
                          {/* Tooltip */}
                          <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-20">
                            <div className="font-semibold mb-1">Why this match?</div>
                            <div className="text-gray-300">{getMatchExplanation(task.match_score)}</div>
                            <div className="absolute top-0 left-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
                          {task.title}
                        </h3>
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 text-sm">
                        {task.description}
                      </p>

                      {/* Category and Budget */}
                      <div className="flex items-center justify-between mb-4">
                        <Badge className={getCategoryColor(task.category)}>
                          {typeof task.category === 'string' ? task.category : task.category?.name || 'Uncategorized'}
                        </Badge>
                        <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {task.budget} EGP
                        </span>
                      </div>

                      {/* Skills */}
                      {task.required_skills && task.required_skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {task.required_skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                              >
                                {skill}
                              </span>
                            ))}
                            {task.required_skills.length > 3 && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900/30 dark:to-pink-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                                +{task.required_skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {task.proposals_count || 0} proposals
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSaveItem(task.id);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          {savedItems.has(task.id) ? (
                            <HeartSolidIcon className="h-6 w-6 text-pink-500" />
                          ) : (
                            <HeartIcon className="h-6 w-6 text-gray-400 hover:text-pink-500 transition-colors" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForYou;
