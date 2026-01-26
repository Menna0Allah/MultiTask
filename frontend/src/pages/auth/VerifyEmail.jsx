import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { EnvelopeIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import authService from '../../services/authService';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerifying(false);
      setError('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      setVerifying(true);
      await authService.verifyEmail(token);
      setSuccess(true);
      toast.success('Email verified successfully!');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Email verification error:', err);
      setError(err.response?.data?.detail || 'Verification failed. The link may have expired.');
      toast.error('Email verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email address not found. Please register again.');
      return;
    }

    try {
      setResending(true);
      await authService.resendVerificationEmail(email);
      toast.success('Verification email sent! Please check your inbox.');
    } catch (err) {
      console.error('Resend verification error:', err);
      toast.error(err.response?.data?.detail || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
            <Loading />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Verifying your email address...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700 text-center">
          {success ? (
            // Success State
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-6">
                <CheckCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Email Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your email has been successfully verified. You can now sign in to your account.
              </p>
              <div className="flex items-center justify-center space-x-2 text-purple-600 dark:text-purple-400 mb-6">
                <span className="text-sm">Redirecting to login</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
              <Link to="/login">
                <Button
                  fullWidth
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  Continue to Login
                </Button>
              </Link>
            </>
          ) : (
            // Error State
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full mb-6">
                <ExclamationCircleIcon className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {error}
              </p>

              <div className="space-y-3">
                {email && (
                  <Button
                    fullWidth
                    onClick={handleResendVerification}
                    loading={resending}
                    icon={ArrowPathIcon}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Resend Verification Email
                  </Button>
                )}
                <Link to="/login">
                  <Button fullWidth variant="secondary">
                    Back to Login
                  </Button>
                </Link>
              </div>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Need help?</strong> Contact support at{' '}
                  <a href="mailto:support@multitask.com" className="underline hover:no-underline font-semibold">
                    support@multitask.com
                  </a>
                </p>
              </div>
            </>
          )}
        </div>

        {/* Additional Options */}
        {!success && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
