import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import authService from '../../services/authService';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  PhoneIcon,
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
    user_type: 'CLIENT',
    phone_number: '',
    city: '',
    country: 'Egypt',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
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
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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
        // Check username availability
        try {
          const isAvailable = await authService.checkUsername(formData.username);
          if (!isAvailable) {
            setErrors({ ...errors, username: 'Username is already taken' });
            return;
          }
        } catch (error) {
          console.error('Error checking username:', error);
        }

        // Check email availability
        try {
          const isAvailable = await authService.checkEmail(formData.email);
          if (!isAvailable) {
            setErrors({ ...errors, email: 'Email is already registered' });
            return;
          }
        } catch (error) {
          console.error('Error checking email:', error);
        }

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">Multitask</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Step {step} of 3
          </p>
        </div>

        {/* Progress bar */}
        <div className="flex space-x-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? 'bg-primary-600' : 'bg-gray-200'
              }`}
            ></div>
          ))}
        </div>

        {/* Google Register (Placeholder) */}
        {step === 1 && (
          <div>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
              <span className="text-gray-700 font-medium">Continue with Google</span>
            </button>

            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or register with email</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                name="first_name"
                placeholder="John"
                value={formData.first_name}
                onChange={handleChange}
                error={errors.first_name}
                required
              />

              <Input
                label="Last Name"
                name="last_name"
                placeholder="Doe"
                value={formData.last_name}
                onChange={handleChange}
                error={errors.last_name}
                required
              />
            </div>

            <Input
              label="Username"
              name="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={handleChange}
              icon={UserIcon}
              error={errors.username}
              required
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              icon={EnvelopeIcon}
              error={errors.email}
              required
            />

            <Button type="submit" variant="primary" fullWidth>
              Next
            </Button>
          </form>
        )}

        {/* Step 2: Password & Account Type */}
        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-4">
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              icon={LockClosedIcon}
              error={errors.password}
              required
            />

            <Input
              label="Confirm Password"
              name="password2"
              type="password"
              placeholder="Re-enter password"
              value={formData.password2}
              onChange={handleChange}
              icon={LockClosedIcon}
              error={errors.password2}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
              I want to <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
              <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
              type="radio"
              name="user_type"
              value="CLIENT"
              checked={formData.user_type === 'CLIENT'}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600"
              />
              <div className="ml-3">
              <p className="font-medium text-gray-900">Hire freelancers</p>
              <p className="text-sm text-gray-500">Post tasks and find talent</p>
              </div>
              </label>
            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="user_type"
                value="FREELANCER"
                checked={formData.user_type === 'FREELANCER'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Work as a freelancer</p>
                <p className="text-sm text-gray-500">Find tasks and earn money</p>
              </div>
            </label>

            <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition">
              <input
                type="radio"
                name="user_type"
                value="BOTH"
                checked={formData.user_type === 'BOTH'}
                onChange={handleChange}
                className="w-4 h-4 text-primary-600"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Both</p>
                <p className="text-sm text-gray-500">Hire and work as freelancer</p>
              </div>
            </label>
          </div>
          {errors.user_type && (
            <p className="mt-1 text-sm text-red-600">{errors.user_type}</p>
          )}
        </div>

        <div className="flex space-x-4">
          <Button type="button" variant="secondary" fullWidth onClick={handleBack}>
            Back
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            Next
          </Button>
        </div>
      </form>
    )}

    {/* Step 3: Additional Info */}
    {step === 3 && (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Phone Number"
          name="phone_number"
          type="tel"
          placeholder="+20 123 456 7890"
          value={formData.phone_number}
          onChange={handleChange}
          icon={PhoneIcon}
        />

        <Input
          label="City"
          name="city"
          placeholder="Cairo"
          value={formData.city}
          onChange={handleChange}
        />

        <div className="flex space-x-4">
          <Button type="button" variant="secondary" fullWidth onClick={handleBack}>
            Back
          </Button>
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Create Account
          </Button>
        </div>
      </form>
    )}

    {/* Login link */}
    <p className="text-center text-sm text-gray-600">
      Already have an account?{' '}
      <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
        Login
      </Link>
    </p>
  </div>
</div>
);
};
export default Register;