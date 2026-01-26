import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { API_ENDPOINTS } from '../utils/constants';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import {
  MagnifyingGlassIcon,
  BriefcaseIcon,
  ChevronRightIcon,
  SparklesIcon,
  ArrowRightIcon,
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
      const response = await api.get(`${API_ENDPOINTS.CATEGORIES}?page_size=100`);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section with Gradient Background */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-16 sm:py-20 md:py-24 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom relative z-10 px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6 sm:mb-8">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{categories.length} Categories Available</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 px-4">
              Explore All
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mt-2">
                Categories
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 sm:mb-12 px-4">
              Discover thousands of talented freelancers across all service categories
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto px-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 flex items-center backdrop-blur-lg border border-gray-200 dark:border-gray-700">
                <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 mx-4" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 outline-none text-gray-900 dark:text-gray-100 bg-transparent px-2 py-4 text-base sm:text-lg placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {categories.length}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                Total Categories
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {categories.reduce((sum, cat) => sum + (cat.tasks_count || 0), 0)}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                Available Tasks
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {searchTerm
                  ? filteredCategories.length
                  : categories.filter(cat => cat.tasks_count > 0).length}
              </div>
              <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">
                {searchTerm ? 'Results' : 'Active'}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-gray-800">
        <div className="container-custom px-4 sm:px-6">
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filteredCategories.map((category, index) => (
                <Link
                  key={category.id}
                  to={`/tasks?category=${category.id}`}
                  className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700 overflow-hidden"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>

                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl flex items-center justify-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                          {category.icon || '📦'}
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {category.name}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <BriefcaseIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                              {category.tasks_count || 0} {category.tasks_count === 1 ? 'task' : 'tasks'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>

                    {/* Description */}
                    {category.description && (
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm text-purple-600 dark:text-purple-400 font-semibold group-hover:underline flex items-center">
                        Browse Tasks
                        <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </span>
                      {category.tasks_count > 0 && (
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 text-xs font-bold rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 sm:py-20">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="w-10 h-10 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                No categories found
              </h3>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto px-4">
                We couldn't find any categories matching "{searchTerm}"
              </p>
              <Button
                onClick={() => setSearchTerm('')}
                variant="primary"
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Clear Search
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-900 dark:via-pink-900 dark:to-indigo-900"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom relative z-10 text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white px-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 text-white/90 max-w-3xl mx-auto px-4">
            Post your custom task and let talented freelancers come to you
          </p>
          <Link to="/tasks/create" className="inline-block">
            <Button size="lg" className="bg-white hover:bg-purple-600 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all !text-purple-600 hover:!text-white">
              Post a Task
              <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Categories;
