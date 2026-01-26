import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import googleAuthService from '../../services/googleAuthService';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BriefcaseIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const Login = () => {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputFocus, setInputFocus] = useState({
    usernameOrEmail: false,
    password: false
  });
  const [showGoogleButton, setShowGoogleButton] = useState(true);
  const googleButtonRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Google Sign-In and render the button
    const initGoogle = async () => {
      try {
        await googleAuthService.initGoogleAuth();
        
        // Wait a bit for the script to fully load
        setTimeout(() => {
          if (googleButtonRef.current) {
            const success = googleAuthService.renderGoogleButton(
              'google-signin-button',
              () => {
                // Success callback
                toast.success('Welcome back!');
                window.location.href = '/dashboard';
              },
              (error) => {
                // Error callback
                console.error('Google login error:', error);
                toast.error('Google login failed. Please try again.');
              }
            );
            
            if (!success) {
              setShowGoogleButton(false);
            }
          }
        }, 500);
      } catch (error) {
        console.error('Failed to initialize Google Auth:', error);
        setShowGoogleButton(false);
      }
    };

    initGoogle();

    // Load remembered credentials
    const remembered = localStorage.getItem('rememberMe');
    if (remembered) {
      const credentials = JSON.parse(remembered);
      setFormData(prev => ({
        ...prev,
        usernameOrEmail: credentials.usernameOrEmail || '',
        rememberMe: true
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleInputFocus = (fieldName, isFocused) => {
    setInputFocus({
      ...inputFocus,
      [fieldName]: isFocused
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.usernameOrEmail.trim() || !formData.password.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await login(formData.usernameOrEmail, formData.password);

      // Handle remember me
      if (formData.rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify({
          usernameOrEmail: formData.usernameOrEmail
        }));
      } else {
        localStorage.removeItem('rememberMe');
      }

      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Error toast is already handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 mb-12">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-3xl">M</span>
            </div>
            <span className="text-3xl font-bold text-white">Multitask</span>
          </Link>

          <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
            Welcome Back to<br />Your Workspace
          </h1>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Connect with professionals, manage tasks, and grow your business all in one place.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Connect with Experts</h3>
                <p className="text-blue-100">Find and hire top freelancers for your projects</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <BriefcaseIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Manage Projects</h3>
                <p className="text-blue-100">Track progress and collaborate seamlessly</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Secure Payments</h3>
                <p className="text-blue-100">Protected transactions with escrow system</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-8">
          <div>
            <div className="text-4xl font-bold text-white mb-1">10K+</div>
            <div className="text-blue-100">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">50K+</div>
            <div className="text-blue-100">Tasks Completed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-white mb-1">4.9★</div>
            <div className="text-blue-100">Average Rating</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link to="/" className="inline-flex items-center space-x-3 mb-8 lg:hidden">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Multitask</span>
          </Link>

          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-10 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-blue-500/10 to-primary-500/10 rounded-full blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
                  <LockClosedIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  Welcome back
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Login to access your account and continue your journey
                </p>
              </div>

              {/* Google Login - Official Button Rendered Here */}
              {showGoogleButton && (
                <>
                  <div 
                    ref={googleButtonRef}
                    id="google-signin-button"
                    className="flex justify-center mb-6"
                  ></div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Input
                  label="Username or Email"
                  name="usernameOrEmail"
                  type="text"
                  placeholder="Enter your username or email"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('usernameOrEmail', true)}
                  onBlur={() => handleInputFocus('usernameOrEmail', false)}
                  icon={EnvelopeIcon}
                  required
                />
                {formData.usernameOrEmail && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-4 top-[42px]" />
                )}
              </div>

              <div className="relative">
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleInputFocus('password', true)}
                  onBlur={() => handleInputFocus('password', false)}
                  icon={LockClosedIcon}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>


              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    Remember me
                  </label>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={loading}
                  disabled={loading || !formData.usernameOrEmail || !formData.password}
                  className="group relative overflow-hidden h-12 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300"
                >
                  <span className="flex items-center justify-center gap-2 relative z-10 font-semibold">
                    {loading ? 'Logging in...' : 'Login to Account'}
                    {!loading && <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </form>

              {/* Additional Features */}
              <div className="mt-8 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex items-center justify-center">
                      <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                      Bank-Level Security
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      Your credentials are protected with 256-bit encryption and multi-layer security protocols.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sign up link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors inline-flex items-center gap-1 group"
                  >
                    Sign up for free
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">Secured with end-to-end encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;