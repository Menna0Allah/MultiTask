import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import taskService from '../../services/taskService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Empty from '../../components/common/Empty';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import SkillFilter from '../../components/tasks/SkillFilter';
import { useDebounce } from '../../hooks/useDebounce';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  ClockIcon,
  BriefcaseIcon,
  SparklesIcon,
  FireIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency, formatRelativeTime, truncateText } from '../../utils/helpers';
import { TASK_STATUS_COLORS } from '../../utils/constants';

const TaskList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('task_type') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location_type') || '');
  const [minBudget, setMinBudget] = useState(searchParams.get('min_budget') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('max_budget') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('ordering') || '-created_at');
  const [selectedSkills, setSelectedSkills] = useState([]);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedType, selectedLocation, minBudget, maxBudget, sortBy, selectedSkills]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchTasks(currentPage);
  }, [currentPage, debouncedSearch, selectedCategory, selectedType, selectedLocation, minBudget, maxBudget, sortBy, selectedSkills]);

  const fetchCategories = async () => {
    try {
      const data = await taskService.getCategories();
      const categoriesArray = Array.isArray(data) ? data : (data.results || []);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchTasks = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        status: 'OPEN',
        ordering: sortBy,
      };

      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.task_type = selectedType;
      if (minBudget) params.min_budget = minBudget;
      if (maxBudget) params.max_budget = maxBudget;

      if (selectedSkills.length > 0) {
        params['skills[]'] = selectedSkills;
      }

      if (selectedLocation === 'remote') {
        params.is_remote = 'true';
      } else if (selectedLocation === 'onsite') {
        params.is_remote = 'false';
      }

      setSearchParams(params, { replace: true });

      const data = await taskService.getTasks(params);
      setTasks(data.results || []);
      setPagination({
        count: data.count,
        next: data.next,
        previous: data.previous,
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedLocation('');
    setMinBudget('');
    setMaxBudget('');
    setSortBy('-created_at');
    setSelectedSkills([]);
    setCurrentPage(1);
    setSearchParams({});
  };

  const activeFiltersCount = [
    selectedCategory,
    selectedType,
    selectedLocation,
    minBudget,
    maxBudget,
    selectedSkills.length > 0 ? 'skills' : null,
  ].filter(Boolean).length;

  const TaskCard = ({ task, viewMode }) => (
    <Link to={`/tasks/${task.id}`}>
      <Card hover className={`h-full group relative overflow-hidden ${viewMode === 'list' ? 'flex flex-col sm:flex-row gap-4' : ''}`}>
        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>

        <div className="relative z-10 flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={task.status === 'OPEN' ? 'success' : 'gray'} className="font-semibold">
                {task.status}
              </Badge>
              {task.is_remote && (
                <Badge variant="info" size="sm">Remote</Badge>
              )}
              <Badge variant="primary" size="sm">{task.task_type}</Badge>
            </div>
            {task.is_urgent && (
              <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                <FireIcon className="w-4 h-4" />
                <span className="text-xs font-bold">Urgent</span>
              </div>
            )}
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition break-words line-clamp-2">
            {task.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 text-sm sm:text-base break-words">
            {truncateText(task.description, 120)}
          </p>

          <div className="flex items-center flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4">
            {task.location && (
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>{task.city || task.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <ClockIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{formatRelativeTime(task.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BriefcaseIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>{task.applications_count || 0} applications</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Avatar user={task.client} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {task.client?.username}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ⭐ {task.client?.average_rating || 0} ({task.client?.total_reviews || 0})
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatCurrency(task.budget)}
              </p>
              {task.is_negotiable && (
                <p className="text-xs text-gray-500 dark:text-gray-400">Negotiable</p>
              )}
            </div>
          </div>

          {task.category && (
            <div className="mt-3">
              <Badge variant="gray" size="sm">
                {task.category.name}
              </Badge>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );

  const totalPages = pagination ? Math.ceil(pagination.count / 12) : 1;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Calculate average budget
  const avgBudget = tasks.length > 0
    ? Math.round(tasks.reduce((sum, task) => sum + (Number(task.budget) || 0), 0) / tasks.length)
    : 0;

  const validAvgBudget = isNaN(avgBudget) || avgBudget === 0 ? null : avgBudget;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section with Gradient */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom relative z-10 px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-10">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6">
              <BriefcaseIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{pagination?.count || 0} Open Tasks Available</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 px-4">
              Find Your Next
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mt-2">
                Perfect Task
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-8 px-4">
              Browse thousands of tasks and start earning with your skills today
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto px-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 backdrop-blur-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center flex-1">
                  <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 mx-4" />
                  <input
                    type="text"
                    placeholder="Search for tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-gray-900 dark:text-gray-100 bg-transparent px-2 py-4 text-base sm:text-lg placeholder-gray-500"
                  />
                </div>
                <Button
                  onClick={() => fetchTasks(1)}
                  variant="primary"
                  size="lg"
                  className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Category Filters */}
          {categories.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 max-w-4xl mx-auto px-4">
              {categories.slice(0, 6).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id.toString());
                    setCurrentPage(1);
                  }}
                  className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all transform hover:scale-105 ${
                    selectedCategory === cat.id.toString()
                      ? 'bg-white text-purple-600 shadow-lg'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {cat.icon} {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                {pagination?.count || 0}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                {validAvgBudget ? formatCurrency(validAvgBudget) : '—'}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Avg. Budget</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                {categories.length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                {activeFiltersCount}
              </div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">Active Filters</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8 sm:py-12 bg-white dark:bg-gray-900">
        <div className="container-custom px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
            {/* Filters Sidebar */}
            <aside className="lg:w-72 flex-shrink-0">
              <div className="sticky top-20 z-40 space-y-6 max-h-[calc(100vh-6rem)] overflow-y-auto pb-4 self-start">
                {/* Main Filters Card */}
                <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white flex items-center">
                      <FunnelIcon className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold rounded-full">
                          {activeFiltersCount}
                        </span>
                      )}
                    </h2>
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={handleClearFilters}
                        className="px-3 py-1.5 text-xs sm:text-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all font-medium shadow-md"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 sm:space-y-6">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">All Categories</option>
                        {Array.isArray(categories) && categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Task Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Task Type
                      </label>
                      <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">All Types</option>
                        <option value="PHYSICAL">Physical</option>
                        <option value="DIGITAL">Digital</option>
                        <option value="BOTH">Both</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Location
                      </label>
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">All Locations</option>
                        <option value="onsite">On-site</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                      </select>
                    </div>

                    {/* Budget Range */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Budget Range (EGP)
                      </label>
                      <div className="space-y-2">
                        <input
                          type="number"
                          placeholder="Min Budget"
                          value={minBudget}
                          onChange={(e) => setMinBudget(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                        <input
                          type="number"
                          placeholder="Max Budget"
                          value={maxBudget}
                          onChange={(e) => setMaxBudget(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Skill Filter */}
                <SkillFilter
                  selectedSkills={selectedSkills}
                  onChange={setSelectedSkills}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                  <span className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                    {loading ? 'Loading...' : `${pagination?.count || 0} Tasks Found`}
                  </span>
                  {activeFiltersCount > 0 && (
                    <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-bold rounded-full">
                      {activeFiltersCount} filter{activeFiltersCount === 1 ? '' : 's'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                  {/* View Toggle */}
                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                      title="Grid View"
                    >
                      <Squares2X2Icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded ${viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''}`}
                      title="List View"
                    >
                      <ListBulletIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1 sm:flex-initial"
                  >
                    <option value="-created_at">Newest First</option>
                    <option value="created_at">Oldest First</option>
                    <option value="-budget">Highest Budget</option>
                    <option value="budget">Lowest Budget</option>
                    <option value="-applications_count">Most Popular</option>
                    <option value="deadline">Deadline Soon</option>
                  </select>
                </div>
              </div>

              {/* Tasks Grid/List */}
              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loading />
                </div>
              ) : tasks.length > 0 ? (
                <>
                  <div className={viewMode === 'grid' ? 'grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8' : 'space-y-4 sm:space-y-6 mb-8'}>
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} viewMode={viewMode} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination && pagination.count > 12 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Showing {((currentPage - 1) * 12) + 1} - {Math.min(currentPage * 12, pagination.count)} of {pagination.count}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!pagination.previous}
                          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-sm sm:text-base"
                        >
                          <ChevronLeftIcon className="w-4 h-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </button>

                        <div className="flex items-center gap-1 sm:gap-2">
                          {[...Array(totalPages)].map((_, index) => {
                            const pageNum = index + 1;
                            if (
                              pageNum === 1 ||
                              pageNum === totalPages ||
                              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 sm:px-4 py-2 border-2 rounded-lg transition-all text-sm sm:text-base ${
                                    pageNum === currentPage
                                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                                      : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            } else if (
                              pageNum === currentPage - 2 ||
                              pageNum === currentPage + 2
                            ) {
                              return <span key={pageNum} className="text-gray-500 px-1">...</span>;
                            }
                            return null;
                          })}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!pagination.next}
                          className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-1 text-sm sm:text-base"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-16 sm:py-20">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BriefcaseIcon className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    No tasks found
                  </h3>
                  <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto px-4">
                    Try adjusting your filters or search query to find more tasks
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleClearFilters}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TaskList;
