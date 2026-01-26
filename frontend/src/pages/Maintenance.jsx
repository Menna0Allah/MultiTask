import React from 'react';
import {
  WrenchScrewdriverIcon,
  ClockIcon,
  BellAlertIcon,
} from '@heroicons/react/24/outline';

const Maintenance = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        {/* Animated Maintenance Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-full flex items-center justify-center">
              <WrenchScrewdriverIcon className="w-20 h-20 text-blue-600 dark:text-blue-400 animate-bounce" />
            </div>
            <div className="absolute inset-0 bg-blue-400 dark:bg-blue-600 rounded-full animate-ping opacity-20"></div>
          </div>
        </div>

        {/* Maintenance Title */}
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Under Maintenance
        </h1>

        {/* Maintenance Description */}
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
          We're currently performing scheduled maintenance to improve your experience. We'll be back shortly!
        </p>

        {/* Status Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-200 dark:border-gray-700 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Estimated Time */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <ClockIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Estimated Time
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Should be back in 30-60 minutes
                </p>
              </div>
            </div>

            {/* Status Updates */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <BellAlertIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Get Notified
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Follow us on social media for updates
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* What We're Doing */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            What we're improving:
          </h3>
          <ul className="text-left text-gray-700 dark:text-gray-300 space-y-2 max-w-md mx-auto">
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span>Performance optimizations</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span>Security enhancements</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span>New features and improvements</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 dark:text-blue-400 mr-2">✓</span>
              <span>Bug fixes and stability updates</span>
            </li>
          </ul>
        </div>

        {/* Progress Animation */}
        <div className="max-w-md mx-auto mb-8">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-progress"></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Maintenance in progress...
          </p>
        </div>

        {/* Support Info */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Urgent issue? Contact us at{' '}
            <a
              href="mailto:support@multitask.com"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              support@multitask.com
            </a>
          </p>
        </div>
      </div>

      {/* Custom CSS for progress animation */}
      <style>
        {`
          @keyframes progress {
            0% {
              width: 0%;
            }
            50% {
              width: 70%;
            }
            100% {
              width: 100%;
            }
          }
          .animate-progress {
            animation: progress 3s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Maintenance;
