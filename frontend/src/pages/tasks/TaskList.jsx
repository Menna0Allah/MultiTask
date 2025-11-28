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
  
  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || 'OPEN');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [minBudget, setMinBudget] = useState(searchParams.get('min_budget') || '');
  const [maxBudget, setMaxBudget] = useState(searchParams.get('max_budget') || '');
  const [isRemote, setIsRemote] = useState(searchParams.get('is_remote') === 'true');
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [debouncedSearch, selectedCategory, selectedStatus, selectedType, minBudget, maxBudget, isRemote]);

  const fetchCategories = async () => {
    try {
      const data = await taskService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchTasks = async (page = 1) => {
    try {
      setLoading(true);

      const params = {
        page,
        search: debouncedSearch || undefined,
        category: selectedCategory || undefined,
        status: selectedStatus || undefined,
        task_type: selectedType || undefined,
        min_budget: minBudget || undefined,
        max_budget: maxBudget || undefined,
        is_remote: isRemote || undefined,
        ordering: '-created_at',
      };

      // Update URL params
      const newParams = {};
      Object.keys(params).forEach(key => {
        if (params[key]) newParams[key] = params[key];
      });
      setSearchParams(newParams);

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
    setSelectedStatus('OPEN');
    setSelectedType('');
    setMinBudget('');
    setMaxBudget('');
    setIsRemote(false);
    setSearchParams({});
  };

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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Tasks</h1>
          <p className="text-gray-600">Find the perfect task for your skills</p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 mb-4"
          >
            <FunnelIcon className="w-5 h-5" />
            <span className="font-medium">
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </span>
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <div className="grid md:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Status</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">All Types</option>
                    <option value="PHYSICAL">Physical</option>
                    <option value="DIGITAL">Digital</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>

                {/* Min Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Budget (EGP)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Max Budget */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Budget (EGP)
                  </label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                {/* Remote */}
                <div className="flex items-end">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRemote}
                      onChange={(e) => setIsRemote(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Remote Only
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="secondary" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <Loading />
        ) : tasks.length > 0 ? (
          <>
            <div className="mb-4 text-gray-600">
              Found {pagination?.count || 0} tasks
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.count > 12 && (
              <div className="flex justify-center space-x-4">
                {pagination.previous && (
                  <Button variant="outline" onClick={() => fetchTasks(pagination.previous)}>
                    Previous
                  </Button>
                )}
                {pagination.next && (
                  <Button variant="outline" onClick={() => fetchTasks(pagination.next)}>
                    Next
                  </Button>
                )}
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
  );
};

export default TaskList;