import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import {
  ExclamationTriangleIcon,
  HomeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const ServerError = () => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-900/40 dark:to-orange-900/40 rounded-full flex items-center justify-center animate-pulse">
              <ExclamationTriangleIcon className="w-20 h-20 text-red-600 dark:text-red-400" />
            </div>
            <div className="absolute inset-0 bg-red-400 dark:bg-red-600 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Error Code */}
        <h1 className="text-9xl font-black text-gray-200 dark:text-gray-700 mb-4 select-none">
          500
        </h1>

        {/* Error Title */}
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Server Error
        </h2>

        {/* Error Description */}
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
          Oops! Something went wrong on our end. Our team has been notified and is working to fix the issue.
        </p>

        {/* Error Details (if any) */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            What can you do?
          </h3>
          <ul className="text-left text-gray-700 dark:text-gray-300 space-y-2">
            <li className="flex items-start">
              <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
              <span>Try refreshing the page</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
              <span>Go back to the homepage</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
              <span>Try again in a few minutes</span>
            </li>
            <li className="flex items-start">
              <span className="text-primary-600 dark:text-primary-400 mr-2">•</span>
              <span>Contact support if the problem persists</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <ArrowPathIcon className="w-5 h-5 mr-2" />
            Refresh Page
          </button>

          <Link to="/">
            <button className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              <HomeIcon className="w-5 h-5 mr-2" />
              Go to Homepage
            </button>
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need help? Contact us at{' '}
            <a
              href="mailto:support@multitask.com"
              className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
            >
              support@multitask.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServerError;
