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
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import recommendationService from '../services/recommendationService';
import taskService from '../services/taskService';
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

  // Save to localStorage whenever savedItems changes
  useEffect(() => {
    localStorage.setItem('forYouSavedItems', JSON.stringify([...savedItems]));
  }, [savedItems]);

  // Update stats based on filtered results
  useEffect(() => {
    // Filter freelancers
    let filteredFreelancers = [...freelancers];
    if (minMatchScore > 0) {
      filteredFreelancers = filteredFreelancers.filter(f => (f.match_score || 0) >= minMatchScore);
    }

    // Filter tasks
    let filteredTasks = [...tasks];
    if (minMatchScore > 0) {
      filteredTasks = filteredTasks.filter(t => (t.match_score || 0) >= minMatchScore);
    }

    setStats({
      totalRecommended: isClient && isFreelancer
        ? filteredFreelancers.length + filteredTasks.length
        : isClient
        ? filteredFreelancers.length
        : filteredTasks.length,
      totalSaved: savedItems.size,
      matchingEnabled: true,
    });
  }, [freelancers, tasks, minMatchScore, savedItems.size, isClient, isFreelancer]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      // Fetch freelancer recommendations for clients
      if (isClient) {
        // Fetch AI-powered freelancer recommendations
        // Uses multi-factor matching: category, location, quality, availability, budget
        const freelancerData = await recommendationService.discoverFreelancers({ limit: 10 });
        setFreelancers(freelancerData || []);
      }

      // BACKUP: Old mock data (keeping for reference, not used)
      if (false) {
        const mockFreelancers = [
          {
            id: 1,
            username: 'Sarah Johnson',
            first_name: 'Sarah',
            last_name: 'Johnson',
            service_title: 'Professional House Cleaning Services',
            service_description: 'Expert cleaning services with 5+ years experience. Specialized in deep cleaning, regular maintenance, and eco-friendly solutions.',
            category: 'Cleaning',
            hourly_rate: 150,
            average_rating: 4.8,
            total_reviews: 45,
            tasks_completed: 120,
            skills: ['Deep Cleaning', 'Organization', 'Eco-Friendly Products'],
            location: 'Cairo',
            match_score: 95
          },
          {
            id: 2,
            username: 'Ahmed Hassan',
            first_name: 'Ahmed',
            last_name: 'Hassan',
            service_title: 'Skilled Plumbing & Maintenance',
            service_description: 'Licensed plumber offering comprehensive plumbing services. Quick response time and quality workmanship guaranteed.',
            category: 'Plumbing',
            hourly_rate: 200,
            average_rating: 4.9,
            total_reviews: 78,
            tasks_completed: 156,
            skills: ['Pipe Repair', 'Installation', 'Emergency Service'],
            location: 'Giza',
            match_score: 92
          },
          {
            id: 3,
            username: 'Layla Mohamed',
            first_name: 'Layla',
            last_name: 'Mohamed',
            service_title: 'Professional Painting Services',
            service_description: 'Transform your space with professional painting services. Interior and exterior painting with attention to detail.',
            category: 'Painting',
            hourly_rate: 180,
            average_rating: 4.7,
            total_reviews: 34,
            tasks_completed: 89,
            skills: ['Interior Painting', 'Exterior Painting', 'Color Consultation'],
            location: 'Cairo',
            match_score: 88
          },
          {
            id: 4,
            username: 'Omar Khalil',
            first_name: 'Omar',
            last_name: 'Khalil',
            service_title: 'Expert Electrician Services',
            service_description: 'Certified electrician with expertise in residential and commercial electrical work. Safety is my priority.',
            category: 'Electrical',
            hourly_rate: 220,
            average_rating: 5.0,
            total_reviews: 62,
            tasks_completed: 145,
            skills: ['Wiring', 'Lighting Installation', 'Electrical Repair'],
            location: 'Alexandria',
            match_score: 96
          },
          {
            id: 5,
            username: 'Nour Ahmed',
            first_name: 'Nour',
            last_name: 'Ahmed',
            service_title: 'Garden Design & Landscaping',
            service_description: 'Create beautiful outdoor spaces with professional landscaping and garden maintenance services.',
            category: 'Gardening',
            hourly_rate: 170,
            average_rating: 4.6,
            total_reviews: 28,
            tasks_completed: 67,
            skills: ['Landscape Design', 'Plant Care', 'Irrigation'],
            location: 'Cairo',
            match_score: 85
          },
          {
            id: 6,
            username: 'Karim Fathy',
            first_name: 'Karim',
            last_name: 'Fathy',
            service_title: 'Handyman Services - All Repairs',
            service_description: 'Your one-stop solution for all home repairs and maintenance. No job too small!',
            category: 'Handyman',
            hourly_rate: 160,
            average_rating: 4.8,
            total_reviews: 51,
            tasks_completed: 132,
            skills: ['General Repairs', 'Furniture Assembly', 'Home Maintenance'],
            location: 'Giza',
            match_score: 90
          },
          {
            id: 7,
            username: 'Mariam Saeed',
            first_name: 'Mariam',
            last_name: 'Saeed',
            service_title: 'Move-in/Move-out Cleaning',
            service_description: 'Specialized cleaning services for moving in or out. Make your space spotless!',
            category: 'Cleaning',
            hourly_rate: 140,
            average_rating: 4.9,
            total_reviews: 39,
            tasks_completed: 98,
            skills: ['Deep Cleaning', 'Sanitization', 'Fast Service'],
            location: 'Cairo',
            match_score: 87
          },
          {
            id: 8,
            username: 'Hassan Ali',
            first_name: 'Hassan',
            last_name: 'Ali',
            service_title: 'HVAC Installation & Repair',
            service_description: 'Professional heating and cooling services. Keep your home comfortable year-round.',
            category: 'HVAC',
            hourly_rate: 250,
            average_rating: 4.7,
            total_reviews: 44,
            tasks_completed: 103,
            skills: ['AC Installation', 'Heating Repair', 'Maintenance'],
            location: 'Alexandria',
            match_score: 83
          },
          {
            id: 9,
            username: 'Yasmin Ibrahim',
            first_name: 'Yasmin',
            last_name: 'Ibrahim',
            service_title: 'Professional Carpet Cleaning',
            service_description: 'Restore your carpets to like-new condition with professional steam cleaning.',
            category: 'Cleaning',
            hourly_rate: 130,
            average_rating: 4.8,
            total_reviews: 56,
            tasks_completed: 134,
            skills: ['Steam Cleaning', 'Stain Removal', 'Odor Elimination'],
            location: 'Cairo',
            match_score: 91
          },
          {
            id: 10,
            username: 'Mahmoud Reda',
            first_name: 'Mahmoud',
            last_name: 'Reda',
            service_title: 'Furniture Repair & Restoration',
            service_description: 'Breathe new life into your furniture with expert repair and restoration services.',
            category: 'Carpentry',
            hourly_rate: 190,
            average_rating: 4.9,
            total_reviews: 33,
            tasks_completed: 76,
            skills: ['Wood Repair', 'Refinishing', 'Upholstery'],
            location: 'Giza',
            match_score: 84
          }
        ];

        setFreelancers(mockFreelancers);
      }

      // Always fetch tasks for freelancers (both freelancer-only and both)
      if (isFreelancer) {
        // Fetch recommended tasks for freelancers
        // Use force_refresh=true to bypass cache (recommendations update immediately)
        const data = await recommendationService.getRecommendedTasks({ force_refresh: true });
        setTasks(data.results || data || []);
      }

      // Stats will be updated by the useEffect that watches for data changes
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 dark:from-primary-700 dark:to-blue-700">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon className="h-12 w-12 text-yellow-300 mr-3" />
              <h1 className="text-4xl font-bold text-white">
                {isClient && isFreelancer
                  ? 'Recommendations For You'
                  : isClient
                  ? 'Recommended Services For You'
                  : 'Tasks Picked Just For You'}
              </h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {isClient && isFreelancer
                ? 'Discover services from professionals and find tasks that match your skills'
                : isClient
                ? 'Discover trusted professionals offering quality services tailored to your needs'
                : 'AI-powered task recommendations based on your skills, experience, and preferences'}
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-white text-sm font-medium">AI Matching Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900/30 rounded-lg p-3">
                <SparklesIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {isClient && isFreelancer
                    ? 'Total Recommendations'
                    : isClient
                    ? 'Professional Freelancers'
                    : 'Recommended Tasks'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRecommended}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900/30 rounded-lg p-3">
                <HeartSolidIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSaved}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 rounded-lg p-3">
                <div className="h-6 w-6 flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Matching</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">Active</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isClient && isFreelancer
                ? 'Professional Freelancers & Tasks'
                : isClient
                ? 'Professional Freelancers'
                : 'Your Personalized Tasks'}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isClient && isFreelancer
                ? 'Discover skilled professionals and tasks that match your expertise'
                : isClient
                ? 'Top-rated professionals ready to help with your projects'
                : 'Curated based on your profile and activity'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
              <ChevronDownIcon className={`h-4 w-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg transition-colors disabled:opacity-50 shadow-md"
            >
              <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filter & Sort Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Match Score
                  </label>
                  <select
                    value={minMatchScore}
                    onChange={(e) => setMinMatchScore(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                      {sortBy !== 'match' && (
                        <Badge className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                          Sort: {sortBy === 'rating' ? 'Rating' : sortBy === 'completed' ? 'Completed' : 'Budget'}
                        </Badge>
                      )}
                      {minMatchScore > 0 && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                          Min Match: {minMatchScore}%
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSortBy('match');
                        setMinMatchScore(0);
                      }}
                      className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Content Grid */}
        {isClient && isFreelancer ? (
          // Both Services and Tasks - Use Tabs
          <div>
            {/* Tabs */}
            <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`px-6 py-3 font-semibold text-sm transition-all ${
                  activeTab === 'tasks'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BriefcaseIcon className="w-5 h-5" />
                  <span>Tasks ({tasks.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`px-6 py-3 font-semibold text-sm transition-all ${
                  activeTab === 'services'
                    ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserGroupIcon className="w-5 h-5" />
                  <span>Professional Freelancers ({freelancers.length})</span>
                </div>
              </button>
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
                    <Card
                      key={freelancer.id}
                      className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                    >
                      {/* Match Score Badge with Tooltip */}
                      <div className="absolute top-4 right-4 z-10 group/tooltip">
                        <div className={`${getMatchColor(freelancer.match_score || 0)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 cursor-help`}>
                          {freelancer.match_score || 0}% Match
                          <InformationCircleIcon className="h-4 w-4" />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-20">
                          <div className="font-semibold mb-1">Why this match?</div>
                          <div className="text-gray-300">{getMatchExplanation(freelancer.match_score || 0)}</div>
                          <div className="absolute top-0 right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Freelancer Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <Avatar
                            user={freelancer}
                            size="lg"
                            className="ring-2 ring-gray-200 dark:ring-gray-700"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                              {freelancer.full_name || freelancer.username}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center">
                                <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
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
                          <Badge className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                            {freelancer.user_type === 'both' ? 'Freelancer & Client' : 'Freelancer'}
                          </Badge>
                          {freelancer.is_verified && (
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              ✓ Verified
                            </Badge>
                          )}
                        </div>

                        {/* Skills */}
                        {freelancer.skills && freelancer.skills.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2">
                              {freelancer.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {freelancer.skills.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                  +{freelancer.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircleIcon className="w-4 h-4 text-green-500" />
                            <span>{freelancer.tasks_completed || 0} completed</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link
                            to={`/messages?user=${freelancer.id}`}
                            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-2"
                          >
                            <ChatBubbleLeftRightIcon className="w-5 h-5" />
                            Contact
                          </Link>
                          <button
                            onClick={() => handleSaveItem(freelancer.id)}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            {savedItems.has(freelancer.id) ? (
                              <HeartSolidIcon className="h-6 w-6 text-pink-600" />
                            ) : (
                              <HeartIcon className="h-6 w-6 text-gray-400 hover:text-pink-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </Card>
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
                    <Card
                      key={task.id}
                      className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      {/* Match Score Badge with Tooltip */}
                      <div className="absolute top-4 right-4 z-10 group/tooltip">
                        <div
                          className={`${getMatchColor(task.match_score)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 cursor-help`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {task.match_score}% Match
                          <InformationCircleIcon className="h-4 w-4" />
                        </div>
                        {/* Tooltip */}
                        <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-20">
                          <div className="font-semibold mb-1">Why this match?</div>
                          <div className="text-gray-300">{getMatchExplanation(task.match_score)}</div>
                          <div className="absolute top-0 right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                        </div>
                      </div>

                      <div className="p-6">
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                            {task.title}
                          </h3>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                          {task.description}
                        </p>

                        {/* Category and Budget */}
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={getCategoryColor(task.category)}>
                            {typeof task.category === 'string' ? task.category : task.category?.name || 'Uncategorized'}
                          </Badge>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">
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
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                                >
                                  {skill}
                                </span>
                              ))}
                              {task.required_skills.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                                  +{task.required_skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {task.proposals_count || 0} proposals
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveItem(task.id);
                            }}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                          >
                            {savedItems.has(task.id) ? (
                              <HeartSolidIcon className="h-6 w-6 text-pink-600" />
                            ) : (
                              <HeartIcon className="h-6 w-6 text-gray-400 hover:text-pink-600" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </Card>
                  ))}
                </div>
                );
              })()
            )}
          </div>
        ) : isClient ? (
          // Services for Clients only
          (() => {
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
                <Card
                  key={freelancer.id}
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Match Score Badge with Tooltip */}
                  <div className="absolute top-4 right-4 z-10 group/tooltip">
                    <div className={`${getMatchColor(freelancer.match_score || 0)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 cursor-help`}>
                      {freelancer.match_score || 0}% Match
                      <InformationCircleIcon className="h-4 w-4" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-20">
                      <div className="font-semibold mb-1">Why this match?</div>
                      <div className="text-gray-300">{getMatchExplanation(freelancer.match_score || 0)}</div>
                      <div className="absolute top-0 right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Freelancer Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <Avatar
                        user={freelancer}
                        size="lg"
                        className="ring-2 ring-gray-200 dark:ring-gray-700"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          {freelancer.full_name || freelancer.username}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center">
                            <StarIcon className="w-4 h-4 text-yellow-500 fill-yellow-500" />
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
                      <Badge className="bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                        {freelancer.user_type === 'both' ? 'Freelancer & Client' : 'Freelancer'}
                      </Badge>
                      {freelancer.is_verified && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                          Verified
                        </Badge>
                      )}
                    </div>

                    {/* Skills */}
                    {freelancer.skills && freelancer.skills.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {freelancer.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {freelancer.skills.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              +{freelancer.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                        <span>{freelancer.tasks_completed || 0} completed</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        to={`/messages?user=${freelancer.id}`}
                        className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-2"
                      >
                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        Contact
                      </Link>
                      <button
                        onClick={() => handleSaveItem(freelancer.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {savedItems.has(freelancer.id) ? (
                          <HeartSolidIcon className="h-6 w-6 text-pink-600" />
                        ) : (
                          <HeartIcon className="h-6 w-6 text-gray-400 hover:text-pink-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </Card>
              ))}
            </div>
            );
          })()
        ) : (
          // Tasks for Freelancers
          (() => {
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
                <Card
                  key={task.id}
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                >
                  {/* Match Score Badge with Tooltip */}
                  <div className="absolute top-4 right-4 z-10 group/tooltip">
                    <div
                      className={`${getMatchColor(task.match_score)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1 cursor-help`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {task.match_score}% Match
                      <InformationCircleIcon className="h-4 w-4" />
                    </div>
                    {/* Tooltip */}
                    <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-20">
                      <div className="font-semibold mb-1">Why this match?</div>
                      <div className="text-gray-300">{getMatchExplanation(task.match_score)}</div>
                      <div className="absolute top-0 right-4 -mt-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                        {task.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                      {task.description}
                    </p>

                    {/* Category and Budget */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={getCategoryColor(task.category)}>
                        {typeof task.category === 'string' ? task.category : task.category?.name || 'Uncategorized'}
                      </Badge>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
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
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            >
                              {skill}
                            </span>
                          ))}
                          {task.required_skills.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              +{task.required_skills.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {task.proposals_count || 0} proposals
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveItem(task.id);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        {savedItems.has(task.id) ? (
                          <HeartSolidIcon className="h-6 w-6 text-pink-600" />
                        ) : (
                          <HeartIcon className="h-6 w-6 text-gray-400 hover:text-pink-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </Card>
              ))}
            </div>
            );
          })()
        )}
      </div>
    </div>
  );
};

export default ForYou;
