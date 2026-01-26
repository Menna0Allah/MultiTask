import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import googleAuthService from '../../services/googleAuthService';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  BriefcaseIcon,
  SparklesIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
    user_type: 'client',
    phone_number: '',
    city: '',
    country: 'Egypt',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  const [showGoogleButton, setShowGoogleButton] = useState(true);
  const googleButtonRef = useRef(null);
  const { register } = useAuth();
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
              'google-register-button',
              () => {
                // Success callback
                toast.success('Account created successfully!');
                window.location.href = '/dashboard';
              },
              (error) => {
                // Error callback
                console.error('Google registration error:', error);
                toast.error('Google registration failed. Please try again.');
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
  }, []);

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength) => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const getPasswordStrengthColor = (strength) => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Calculate password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }

    // Real-time username availability check
    if (name === 'username' && value.length >= 3) {
      setUsernameChecking(true);
      setUsernameAvailable(null);
      const timer = setTimeout(async () => {
        try {
          const isAvailable = await authService.checkUsername(value);
          setUsernameAvailable(isAvailable);
        } catch (error) {
          console.error('Error checking username:', error);
        } finally {
          setUsernameChecking(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    // Real-time email availability check
    if (name === 'email' && /\S+@\S+\.\S+/.test(value)) {
      setEmailChecking(true);
      setEmailAvailable(null);
      const timer = setTimeout(async () => {
        try {
          const isAvailable = await authService.checkEmail(value);
          setEmailAvailable(isAvailable);
        } catch (error) {
          console.error('Error checking email:', error);
        } finally {
          setEmailChecking(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!usernameAvailable) {
      newErrors.username = 'Username is already taken';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (!emailAvailable) {
      newErrors.email = 'Email is already registered';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Password is too weak. Add uppercase, numbers, or special characters';
    }

    if (formData.password !== formData.password2) {
      newErrors.password2 = 'Passwords do not match';
    }

    if (!formData.user_type) {
      newErrors.user_type = 'Please select account type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async (e) => {
    e.preventDefault();

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration error:', error);

      // Display specific error messages from backend
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        console.log('Backend error details:', errorData);
        console.log('Full error response:', JSON.stringify(errorData, null, 2));

        // Show specific field errors
        if (typeof errorData === 'object') {
          Object.keys(errorData).forEach(field => {
            const messages = Array.isArray(errorData[field]) ? errorData[field] : [errorData[field]];
            console.log(`${field} errors:`, messages);
            messages.forEach(msg => {
              toast.error(`${field}: ${msg}`, { duration: 5000 });
            });
          });
        } else if (errorData.message || errorData.error) {
          toast.error(errorData.message || errorData.error);
        } else {
          toast.error('Registration failed. Please check your information.');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-purple-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Left Side - Branding (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
          <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
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
            Join Our Growing<br />Community
          </h1>
          <p className="text-xl text-purple-100 mb-12 leading-relaxed">
            Start your journey to success. Connect, collaborate, and grow with thousands of professionals.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Free to Join</h3>
                <p className="text-purple-100">Create your account in minutes, no credit card required</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Global Network</h3>
                <p className="text-purple-100">Connect with professionals from around the world</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-1">Verified Profiles</h3>
                <p className="text-purple-100">Work with confidence through our verification system</p>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
          <p className="text-white text-lg italic mb-4">
            "Multitask has transformed how I manage my freelance business. The platform is intuitive and the community is amazing!"
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold">Menna Allah</p>
              <p className="text-purple-200 text-sm">Freelance Designer</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden inline-flex items-center space-x-2 mb-8">
            <div className="w-12 h-12 bg-primary-600 dark:bg-primary-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Multitask</span>
          </Link>

          {/* Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-10 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm relative overflow-hidden">
            {/* Decorative gradient overlay */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-primary-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-primary-500/10 rounded-full blur-3xl"></div>

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-primary-500/30">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  Create your account
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Step {step} of 3 - {step === 1 ? 'Basic Information' : step === 2 ? 'Security & Type' : 'Additional Details'}
                </p>
              </div>

              {/* Progress bar */}
              <div className="flex space-x-3 mb-8">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex-1 relative">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        s < step ? 'bg-gradient-to-r from-green-500 to-emerald-500 shadow-lg shadow-green-500/30' :
                        s === step ? 'bg-gradient-to-r from-primary-600 to-purple-600 shadow-lg shadow-primary-500/30 animate-pulse' :
                        'bg-gray-200 dark:bg-gray-600'
                      }`}
                    ></div>
                    {s <= step && (
                      <div className={`absolute -top-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full ${
                        s < step ? 'bg-green-500' : 'bg-primary-600'
                      } border-2 border-white dark:border-gray-800 shadow-md`}></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Google Register */}
              {step === 1 && showGoogleButton && (
                <>
                  <div 
                    ref={googleButtonRef}
                    id="google-register-button"
                    className="flex justify-center mb-6"
                  ></div>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-medium">
                        Or register with email
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Step 1: Basic Info */}
              {step === 1 && (
                <form onSubmit={handleNext} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="first_name"
                    placeholder="Menna"
                    value={formData.first_name}
                    onChange={handleChange}
                    error={errors.first_name}
                    required
                  />

                  <Input
                    label="Last Name"
                    name="last_name"
                    placeholder="Allah"
                    value={formData.last_name}
                    onChange={handleChange}
                    error={errors.last_name}
                    required
                  />
                </div>

                <div className="relative">
                  <Input
                    label="Username"
                    name="username"
                    placeholder="menna_allah"
                    value={formData.username}
                    onChange={handleChange}
                    icon={UserIcon}
                    error={errors.username}
                    required
                  />
                  {usernameChecking && (
                    <div className="absolute right-4 top-[42px]">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                  {!usernameChecking && usernameAvailable === true && formData.username.length >= 3 && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-4 top-[42px]" />
                  )}
                  {!usernameChecking && usernameAvailable === false && (
                    <XCircleIcon className="w-5 h-5 text-red-500 absolute right-4 top-[42px]" />
                  )}
                </div>

                <div className="relative">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="menna@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    icon={EnvelopeIcon}
                    error={errors.email}
                    required
                  />
                  {emailChecking && (
                    <div className="absolute right-4 top-[42px]">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    </div>
                  )}
                  {!emailChecking && emailAvailable === true && /\S+@\S+\.\S+/.test(formData.email) && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-4 top-[42px]" />
                  )}
                  {!emailChecking && emailAvailable === false && (
                    <XCircleIcon className="w-5 h-5 text-red-500 absolute right-4 top-[42px]" />
                  )}
                </div>

                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    className="group h-12 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300"
                    disabled={!formData.first_name || !formData.last_name || !formData.username || !formData.email || usernameAvailable === false || emailAvailable === false}
                  >
                    <span className="flex items-center justify-center gap-2 font-semibold">
                      Next Step
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Button>
                </form>
              )}

              {/* Step 2: Password & Account Type */}
              {step === 2 && (
                <form onSubmit={handleNext} className="space-y-5">
                <div className="relative">
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={handleChange}
                    icon={LockClosedIcon}
                    error={errors.password}
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

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            level <= passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-gray-200 dark:bg-gray-600'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className={`text-sm font-semibold ${
                      passwordStrength <= 2 ? 'text-red-600 dark:text-red-400' :
                      passwordStrength <= 3 ? 'text-yellow-600 dark:text-yellow-400' :
                      passwordStrength <= 4 ? 'text-blue-600 dark:text-blue-400' :
                      'text-green-600 dark:text-green-400'
                    }`}>
                      Password Strength: {getPasswordStrengthText(passwordStrength)}
                    </p>
                    <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800/50">
                      <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">Password Requirements:</p>
                      <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                        <li className={formData.password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}>
                          • At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(formData.password) && /[a-z]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}>
                          • Mix of uppercase and lowercase letters
                        </li>
                        <li className={/[0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}>
                          • At least one number
                        </li>
                        <li className={/[^a-zA-Z0-9]/.test(formData.password) ? 'text-green-600 dark:text-green-400' : ''}>
                          • At least one special character (!@#$%^&*)
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Input
                    label="Confirm Password"
                    name="password2"
                    type={showPassword2 ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    value={formData.password2}
                    onChange={handleChange}
                    icon={LockClosedIcon}
                    error={errors.password2}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword2(!showPassword2)}
                    className="absolute right-4 top-[42px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
                    tabIndex={-1}
                  >
                    {showPassword2 ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                  {formData.password2 && formData.password === formData.password2 && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500 absolute right-14 top-[42px]" />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    I want to <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.user_type === 'client'
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}>
                      <input
                        type="radio"
                        name="user_type"
                        value="client"
                        checked={formData.user_type === 'client'}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary-600 mt-0.5 cursor-pointer"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <BriefcaseIcon className="w-5 h-5 text-primary-600" />
                          <p className="font-semibold text-gray-900 dark:text-white">Hire Freelancers</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Post tasks and find talented professionals</p>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.user_type === 'freelancer'
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}>
                      <input
                        type="radio"
                        name="user_type"
                        value="freelancer"
                        checked={formData.user_type === 'freelancer'}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary-600 mt-0.5 cursor-pointer"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <UserIcon className="w-5 h-5 text-primary-600" />
                          <p className="font-semibold text-gray-900 dark:text-white">Work as Freelancer</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Find tasks and earn money doing what you love</p>
                      </div>
                    </label>

                    <label className={`flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      formData.user_type === 'both'
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}>
                      <input
                        type="radio"
                        name="user_type"
                        value="both"
                        checked={formData.user_type === 'both'}
                        onChange={handleChange}
                        className="w-5 h-5 text-primary-600 mt-0.5 cursor-pointer"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <UserGroupIcon className="w-5 h-5 text-primary-600" />
                          <p className="font-semibold text-gray-900 dark:text-white">Both Options</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Hire freelancers and work on tasks yourself</p>
                      </div>
                    </label>
                  </div>
                  {errors.user_type && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.user_type}</p>
                  )}
                </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={handleBack}
                      className="group h-12 hover:shadow-md transition-all duration-300"
                    >
                      <span className="flex items-center justify-center gap-2 font-semibold">
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back
                      </span>
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      className="group h-12 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300"
                      disabled={!formData.password || !formData.password2 || formData.password !== formData.password2 || passwordStrength < 3}
                    >
                      <span className="flex items-center justify-center gap-2 font-semibold">
                        Next Step
                        <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: Additional Info */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="mb-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100/50 dark:border-blue-800/50">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                          Almost There!
                        </h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                          These details help us personalize your experience and connect you with the right opportunities.
                        </p>
                      </div>
                    </div>
                  </div>

                <Input
                  label="Phone Number (Optional)"
                  name="phone_number"
                  type="tel"
                  placeholder="+20 123 456 7890"
                  value={formData.phone_number}
                  onChange={handleChange}
                  icon={PhoneIcon}
                />

                <Input
                  label="City (Optional)"
                  name="city"
                  placeholder="Cairo"
                  value={formData.city}
                  onChange={handleChange}
                  icon={MapPinIcon}
                />

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={handleBack}
                      className="group h-12 hover:shadow-md transition-all duration-300"
                    >
                      <span className="flex items-center justify-center gap-2 font-semibold">
                        <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back
                      </span>
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={loading}
                      className="group relative overflow-hidden h-12 shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all duration-300"
                    >
                      <span className="flex items-center justify-center gap-2 relative z-10 font-semibold">
                        {loading ? 'Creating Account...' : 'Create Account'}
                        {!loading && <CheckCircleIcon className="w-6 h-6" />}
                      </span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Button>
                  </div>
                </form>
              )}

              {/* Login link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-bold transition-colors inline-flex items-center gap-1 group"
                  >
                    Login here
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
              <span className="text-xs text-gray-500 dark:text-gray-400">Protected with industry-standard encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;