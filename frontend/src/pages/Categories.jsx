import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';
import Loading from '../components/common/Loading';
import {
  MagnifyingGlassIcon,
  BriefcaseIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch all categories by setting a large page_size
      const response = await api.get(`${API_ENDPOINTS.CATEGORIES}?page_size=100`);
      console.log('Categories API response:', response.data);
      // Handle both array and paginated response
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = Array.isArray(categories)
    ? categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="container-custom px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Browse Categories
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore our wide range of services and find the perfect freelancer for your needs
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center justify-center gap-8 mb-16 text-center">
          <div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
          </div>
          <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
          <div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {categories.reduce((sum, cat) => sum + (cat.tasks_count || 0), 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available Tasks</div>
          </div>
          <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
          <div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-1">
              {searchTerm
                ? filteredCategories.length
                : categories.filter(cat => cat.tasks_count > 0).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {searchTerm ? 'Search Results' : 'Active Categories'}
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                to={`/tasks?category=${category.id}`}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {category.icon || '📦'}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {category.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <BriefcaseIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {category.tasks_count || 0} {category.tasks_count === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </div>

                {/* Description */}
                {category.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
                    {category.description}
                  </p>
                )}

                {/* View Tasks Button */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-primary-600 dark:text-primary-400 font-medium group-hover:underline">
                    Browse Tasks
                  </span>
                  <div className="flex items-center space-x-1">
                    {category.tasks_count > 0 && (
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 text-xs font-medium rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No categories found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search terms
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20 flex justify-center">
          <div className="max-w-3xl w-full bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 rounded-2xl p-8 md:p-12 text-center text-white shadow-xl">
            <h2 className="text-3xl font-bold mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-xl text-primary-100 dark:text-primary-200 mb-8">
              Post your custom task and let freelancers come to you
            </p>
            <Link
              to="/tasks/create"
              className="inline-block px-8 py-3 bg-white text-primary-600 dark:bg-gray-100 dark:text-primary-700 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors shadow-lg"
            >
              Post a Task
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
