import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import taskService from '../../services/taskService';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Empty from '../../components/common/Empty';
import Badge from '../../components/common/Badge';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import { useDebounce } from '../../hooks/useDebounce';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  ClockIcon,
  BriefcaseIcon,
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

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('task_type') || '');
  const [selectedLocation, setSelectedLocation] = useState(searchParams.get('location_type') || '');
  const [minBudget, setMinBudget] = useState(searchParams.get('min_budget') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('max_budget') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('ordering') || '-created_at');

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, [debouncedSearch, selectedCategory, selectedType, selectedLocation, minBudget, maxBudget, sortBy]);

  useEffect(() => {
    // Scroll to top and fetch tasks when page or filters change
    window.scrollTo(0, 0);
    fetchTasks(currentPage);
  }, [currentPage, debouncedSearch, selectedCategory, selectedType, selectedLocation, minBudget, maxBudget, sortBy]);

  const fetchCategories = async () => {
    try {
      const data = await taskService.getCategories();
      // Handle both array and object responses
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

      // Build params object with only non-empty values
      const params = {
        page,
        status: 'OPEN', // Always filter for open tasks
        ordering: sortBy,
      };

      // Add filters only if they have values
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedType) params.task_type = selectedType;
      if (minBudget) params.min_budget = minBudget;
      if (maxBudget) params.max_budget = maxBudget;

      // Handle location filter
      if (selectedLocation === 'remote') {
        params.is_remote = 'true';
      } else if (selectedLocation === 'onsite') {
        params.is_remote = 'false';
      }
      // 'hybrid' or empty means no location filter

      // Update URL params
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
    setCurrentPage(1);
    setSearchParams({});
  };

  // Count active filters
  const activeFiltersCount = [
    selectedCategory,
    selectedType,
    selectedLocation,
    minBudget,
    maxBudget,
  ].filter(Boolean).length;

  const TaskCard = ({ task }) => (
    <Link to={`/tasks/${task.id}`}>
      <Card hover className="h-full">
        <div className="flex items-start justify-between mb-3">
          <Badge variant={task.status === 'OPEN' ? 'success' : 'gray'}>
            {task.status}
          </Badge>
          <div className="flex items-center space-x-2">
            {task.is_remote && (
              <Badge variant="info" size="sm">Remote</Badge>
            )}
            <Badge variant="primary" size="sm">{task.task_type}</Badge>
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2 hover:text-primary-600 transition">
          {task.title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-2">
          {truncateText(task.description, 120)}
        </p>

        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
          {task.location && (
            <div className="flex items-center space-x-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{task.city || task.location}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <ClockIcon className="w-4 h-4" />
            <span>{formatRelativeTime(task.created_at)}</span>
          </div>
          <div className="flex items-center space-x-1">
            <BriefcaseIcon className="w-4 h-4" />
            <span>{task.applications_count || 0} applications</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <Avatar user={task.client} size="sm" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {task.client?.username}
              </p>
              <p className="text-xs text-gray-500">
                ⭐ {task.client?.average_rating || 0} ({task.client?.total_reviews || 0})
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600">
              {formatCurrency(task.budget)}
            </p>
            {task.is_negotiable && (
              <p className="text-xs text-gray-500">Negotiable</p>
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
      </Card>
    </Link>
  );

  // Calculate total pages from pagination data
  const totalPages = pagination ? Math.ceil(pagination.count / 12) : 1;

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Tasks</h1>
          <p className="text-gray-600">Find the perfect task for your skills</p>
        </div>

        {/* Search Bar - Centered */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FunnelIcon className="w-5 h-5 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </h2>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="px-3 py-1.5 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="PHYSICAL">Physical</option>
                    <option value="DIGITAL">Digital</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                {/* Location Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Locations</option>
                    <option value="onsite">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget Range (EGP)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort and Results Bar */}
            <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  {loading ? 'Loading...' : `Found ${pagination?.count || 0} tasks`}
                </span>
                {activeFiltersCount > 0 && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                    {activeFiltersCount} {activeFiltersCount === 1 ? 'filter' : 'filters'} active
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600 font-medium">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm focus:ring-2 focus:ring-primary-500"
                >
                  <option value="-created_at">Newest First</option>
                  <option value="created_at">Oldest First</option>
                  <option value="-budget">Highest Budget</option>
                  <option value="budget">Lowest Budget</option>
                  <option value="-applications_count">Most Popular</option>
                  <option value="deadline">Deadline (Soonest)</option>
                </select>
              </div>
            </div>

            {loading ? (
              <Loading />
            ) : tasks.length > 0 ? (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {tasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.count > 12 && (
                  <div className="flex items-center justify-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!pagination.previous}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {/* Page Numbers */}
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1;
                      // Show first 2, last 2, and current page with neighbors
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-4 py-2 border rounded-lg transition-colors ${
                              pageNum === currentPage
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      } else if (
                        pageNum === currentPage - 2 ||
                        pageNum === currentPage + 2
                      ) {
                        return <span key={pageNum} className="text-gray-500">...</span>;
                      }
                      return null;
                    })}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!pagination.next}
                      className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Empty
                icon={BriefcaseIcon}
                title="No tasks found"
                description="Try adjusting your filters or search query"
                action={
                  <Button variant="primary" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskList;