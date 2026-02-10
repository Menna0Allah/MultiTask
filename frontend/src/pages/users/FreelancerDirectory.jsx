import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import Empty from '../../components/common/Empty';
import Avatar from '../../components/common/Avatar';
import StarRating from '../../components/common/StarRating';
import userService from '../../services/userService';
import skillService from '../../services/skillService';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  StarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

const FreelancerDirectory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isClient, isFreelancer } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [skills, setSkills] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [heroReady, setHeroReady] = useState(false);
  const [hasInitialData, setHasInitialData] = useState(false);

  // Redirect freelancer-only users - Freelancer Directory is only for clients
  useEffect(() => {
    if (isAuthenticated && isFreelancer && !isClient) {
      toast.error('Freelancer directory is only available for clients');
      navigate('/recommendations');
    }
  }, [isAuthenticated, isFreelancer, isClient, navigate]);

  // Filter states
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    skill: searchParams.get('skill') || '',
    city: searchParams.get('city') || '',
    minRating: searchParams.get('minRating') || '',
    verified: searchParams.get('verified') === 'true',
    ordering: searchParams.get('ordering') || '-average_rating',
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('freelancerDirectoryCache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.freelancers)) {
          setFreelancers(parsed.freelancers);
          setTotalCount(parsed.totalCount || parsed.freelancers.length);
          setHasMore(Boolean(parsed.hasMore));
          setLoading(false);
          setHasInitialData(true);
        }
      }
    } catch (error) {
      console.error('Error loading freelancer cache:', error);
    }
  }, []);

  useEffect(() => {
    fetchFreelancers();
  }, [debouncedSearch, filters.skill, filters.city, filters.minRating, filters.verified, filters.ordering]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setHeroReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const fetchSkills = async () => {
    try {
      const data = await skillService.getSkills();
      setSkills(data.results || data || []);
    } catch (err) {
      console.error('Error fetching skills:', err);
    }
  };

  const fetchFreelancers = async (loadMore = false) => {
    try {
      if (!hasInitialData || loadMore) {
        setLoading(true);
      }

      const params = {
        user_type: 'freelancer',
        ordering: filters.ordering,
        page: loadMore ? page + 1 : 1,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (filters.city) params.city = filters.city;
      if (filters.verified) params.is_verified = true;

      // Update URL params
      const newParams = new URLSearchParams();
      if (filters.search) newParams.set('search', filters.search);
      if (filters.skill) newParams.set('skill', filters.skill);
      if (filters.city) newParams.set('city', filters.city);
      if (filters.minRating) newParams.set('minRating', filters.minRating);
      if (filters.verified) newParams.set('verified', 'true');
      if (filters.ordering !== '-average_rating') newParams.set('ordering', filters.ordering);
      setSearchParams(newParams);

      const data = await userService.getUsers(params);

      let filteredResults = data.results || data || [];

      // Client-side filtering for skills (if backend doesn't support)
      if (filters.skill) {
        filteredResults = filteredResults.filter(user =>
          user.skills?.toLowerCase().includes(filters.skill.toLowerCase())
        );
      }

      // Client-side filtering for minimum rating
      if (filters.minRating) {
        const minRating = parseFloat(filters.minRating);
        filteredResults = filteredResults.filter(user =>
          (parseFloat(user.average_rating) || 0) >= minRating
        );
      }

      if (loadMore) {
        setFreelancers(prev => {
          const next = [...prev, ...filteredResults];
          localStorage.setItem('freelancerDirectoryCache', JSON.stringify({
            freelancers: next,
            totalCount: data.count || next.length,
            hasMore: data.next !== null,
          }));
          return next;
        });
        setPage(page + 1);
      } else {
        setFreelancers(filteredResults);
        setPage(1);
        localStorage.setItem('freelancerDirectoryCache', JSON.stringify({
          freelancers: filteredResults,
          totalCount: data.count || filteredResults.length,
          hasMore: data.next !== null,
        }));
      }

      setTotalCount(data.count || filteredResults.length);
      setHasMore(data.next !== null);
      setHasInitialData(true);
    } catch (err) {
      console.error('Error fetching freelancers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      skill: '',
      city: '',
      minRating: '',
      verified: false,
      ordering: '-average_rating',
    });
  };

  const hasActiveFilters = filters.skill || filters.city || filters.minRating || filters.verified;

  const sortOptions = [
    { value: '-average_rating', label: 'Highest Rated' },
    { value: 'average_rating', label: 'Lowest Rated' },
    { value: '-total_reviews', label: 'Most Reviews' },
    { value: '-created_at', label: 'Newest Members' },
    { value: 'created_at', label: 'Oldest Members' },
  ];

  const ratingOptions = [
    { value: '', label: 'Any Rating' },
    { value: '4.5', label: '4.5+' },
    { value: '4', label: '4.0+' },
    { value: '3.5', label: '3.5+' },
    { value: '3', label: '3.0+' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-950 via-blue-950 to-amber-900/80 dark:from-slate-950 dark:via-blue-950 dark:to-amber-950 py-14 sm:py-20 md:py-24 overflow-hidden min-h-[62vh] flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-400/15 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-sky-400/10 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom relative z-10 px-4 sm:px-6 w-full">
          <div className="text-center mb-10 sm:mb-12">
            {/* Badge */}
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white mb-7 ${heroReady ? 'animate-fade-in' : 'opacity-0'}`}>
              <UserGroupIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{totalCount || 0} Talented Freelancers</span>
            </div>

            <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 sm:mb-7 px-4 ${heroReady ? 'animate-fade-in animation-delay-200' : 'opacity-0'}`}>
              Find Your Next
              <span className="block bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 bg-clip-text text-transparent mt-3">
                Perfect Freelancer
              </span>
            </h1>

            <p className={`text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto mb-9 px-4 ${heroReady ? 'animate-fade-in animation-delay-300' : 'opacity-0'}`}>
              Browse thousands of professionals and hire with confidence today
            </p>

            {/* Search Bar */}
            <div className={`max-w-3xl mx-auto px-4 ${heroReady ? 'animate-fade-in animation-delay-400' : 'opacity-0'}`}>
              <div className="bg-white/95 dark:bg-slate-900/80 rounded-2xl shadow-2xl p-2.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 backdrop-blur-lg border border-white/40 dark:border-white/10">
                <div className="flex items-center flex-1">
                  <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 mx-4" />
                  <input
                    type="text"
                    placeholder="Search for freelancers..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="flex-1 outline-none text-gray-900 dark:text-gray-100 bg-transparent px-2 py-4 text-base sm:text-lg placeholder-gray-500"
                  />
                </div>
                <Button
                  onClick={() => fetchFreelancers()}
                  variant="primary"
                  size="lg"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 w-full sm:w-auto"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container-custom py-8 px-6 md:px-8 lg:px-12">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg font-medium"
            >
              <FunnelIcon className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
              )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Skill Filter */}
              <select
                value={filters.skill}
                onChange={(e) => handleFilterChange('skill', e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Skills</option>
                {skills.slice(0, 20).map((skill) => (
                  <option key={skill.id} value={skill.name}>
                    {skill.name}
                  </option>
                ))}
              </select>

              {/* City Filter */}
              <input
                type="text"
                placeholder="City..."
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="w-32 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />

              {/* Rating Filter */}
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                {ratingOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Verified Toggle */}
              <label className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm">Verified Only</span>
              </label>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <XMarkIcon className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Sort:</span>
            <select
              value={filters.ordering}
              onChange={(e) => handleFilterChange('ordering', e.target.value)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mobile Filters Panel */}
        {showFilters && (
          <Card className="lg:hidden mb-6 dark:bg-gray-800">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Skill
                </label>
                <select
                  value={filters.skill}
                  onChange={(e) => handleFilterChange('skill', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                >
                  <option value="">All Skills</option>
                  {skills.slice(0, 20).map((skill) => (
                    <option key={skill.id} value={skill.name}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city..."
                  value={filters.city}
                  onChange={(e) => handleFilterChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                >
                  {ratingOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.verified}
                  onChange={(e) => handleFilterChange('verified', e.target.checked)}
                  className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Verified Only</span>
              </label>

              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" fullWidth>
                  Clear All Filters
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Results */}
        {loading && freelancers.length === 0 ? (
          <Loading />
        ) : freelancers.length === 0 ? (
          <Empty
            icon={UserGroupIcon}
            title="No freelancers found"
            description="Try adjusting your search or filters to find more results."
            action={
              hasActiveFilters && (
                <Button onClick={clearFilters} variant="primary">
                  Clear Filters
                </Button>
              )
            }
          />
        ) : (
          <>
            {/* Results Count */}
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Showing {freelancers.length} of {totalCount} freelancers
            </p>

            {/* Freelancer Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center mt-8">
                <Button
                  onClick={() => fetchFreelancers(true)}
                  variant="outline"
                  loading={loading}
                >
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// Freelancer Card Component
const FreelancerCard = ({ freelancer }) => {
  return (
    <Link to={`/users/${freelancer.username}`}>
      <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 h-full">
        <div className="text-center mb-4">
          {/* Avatar */}
          <div className="inline-block mb-3">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {freelancer.full_name?.[0] || freelancer.username?.[0]}
            </div>
          </div>

          {/* Name & Username */}
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">
            {freelancer.full_name || freelancer.username}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{freelancer.username}
          </p>

          {/* Verified Badge */}
          {freelancer.is_verified && (
            <span className="inline-flex items-center gap-1 mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-medium">
              <CheckCircleIcon className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>

        {/* Location */}
        {(freelancer.city || freelancer.country) && (
          <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
            <MapPinIcon className="w-4 h-4" />
            {freelancer.city}{freelancer.country ? `, ${freelancer.country}` : ''}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {parseFloat(freelancer.average_rating) > 0 ? (
            <>
              <StarRating value={parseFloat(freelancer.average_rating)} readOnly size="sm" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {parseFloat(freelancer.average_rating).toFixed(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({freelancer.total_reviews || 0})
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              No reviews yet
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {freelancer.total_reviews || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Reviews</div>
          </div>
          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {freelancer.average_rating ? parseFloat(freelancer.average_rating).toFixed(1) : '0.0'}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Rating</div>
          </div>
        </div>

        {/* View Profile Button */}
        <div className="mt-4">
          <Button variant="outline" fullWidth size="sm">
            View Profile
          </Button>
        </div>
      </Card>
    </Link>
  );
};

export default FreelancerDirectory;
