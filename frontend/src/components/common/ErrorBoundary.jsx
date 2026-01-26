import React from 'react';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  HomeIcon,
  BugAntIcon,
} from '@heroicons/react/24/outline';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }

    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorCount: this.state.errorCount + 1,
    });

    // TODO: Log to error reporting service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    // Optionally navigate to home
    window.location.href = '/';
  };

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-6">
          <div className="max-w-2xl w-full text-center">
            {/* Animated Error Icon */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-red-100 to-orange-200 dark:from-red-900/40 dark:to-orange-900/40 rounded-full flex items-center justify-center animate-pulse">
                  <BugAntIcon className="w-20 h-20 text-red-600 dark:text-red-400" />
                </div>
                <div className="absolute inset-0 bg-red-400 dark:bg-red-600 rounded-full animate-ping opacity-20"></div>
              </div>
            </div>

            {/* Error Title */}
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Oops! Something Went Wrong
            </h1>

            {/* Error Description */}
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto leading-relaxed">
              We encountered an unexpected error. Don't worry, we've logged this issue and will fix it soon.
            </p>

            {/* Error Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-6 shadow-lg mb-8 text-left overflow-auto max-h-64">
                <div className="flex items-center mb-3">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-semibold text-yellow-500">
                    Error Details (Development)
                  </h3>
                </div>
                <pre className="text-xs text-red-400 font-mono whitespace-pre-wrap break-words">
                  {this.state.error.toString()}
                </pre>
                {this.state.errorInfo && (
                  <pre className="text-xs text-gray-400 font-mono mt-4 whitespace-pre-wrap break-words">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            {/* Quick Actions */}
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
                  <span>Clear your browser cache</span>
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
                onClick={this.handleRefresh}
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-primary-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Refresh Page
              </button>

              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Go to Homepage
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Error occurred {this.state.errorCount} time(s). Need help?{' '}
                <a
                  href="mailto:support@multitask.com"
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
