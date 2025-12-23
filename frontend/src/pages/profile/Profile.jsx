import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Loading from '../../components/common/Loading';
import SkillSelector from '../../components/profile/SkillSelector';
import skillService from '../../services/skillService';
import recommendationService from '../../services/recommendationService';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  LockClosedIcon,
  CheckCircleIcon,
  StarIcon,
  ChartBarIcon,
  ClockIcon,
  SparklesIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    phone_number: '',
    city: '',
    country: '',
    skills: '',
  });

  // Skill IDs for structured skill selection
  const [selectedSkillIds, setSelectedSkillIds] = useState([]);

  // Interests (categories from onboarding)
  const [interests, setInterests] = useState([]);
  const [loadingInterests, setLoadingInterests] = useState(false);

  // Password data
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    new_password2: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        bio: user.bio || '',
        phone_number: user.phone_number || '',
        city: user.city || '',
        country: user.country || '',
        skills: user.skills || '',
      });

      // Load user's skills if freelancer
      if (user.is_freelancer) {
        loadUserSkills();
      }

      // Load user's interests (for all users)
      loadUserInterests();
    }
  }, [user]);

  const loadUserSkills = async () => {
    try {
      const skills = await skillService.getUserSkills();
      console.log('Loaded user skills:', skills);
      const skillIds = skills
        .map(us => us.skill?.id)
        .filter(id => id != null); // Filter out null/undefined
      console.log('Extracted skill IDs:', skillIds);
      setSelectedSkillIds(skillIds);
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const loadUserInterests = async () => {
    try {
      setLoadingInterests(true);
      // Get user preferences (includes interests as category IDs)
      const prefs = await recommendationService.getUserPreferences();
      const interestIds = prefs.interests || [];

      if (interestIds.length > 0) {
        // Fetch all categories
        const response = await api.get('/recommendations/categories/');
        const allCategories = response.data;

        // Filter to only user's interests
        const userInterests = allCategories.filter(cat =>
          interestIds.includes(cat.id)
        );

        setInterests(userInterests);
      } else {
        setInterests([]);
      }
    } catch (error) {
      console.error('Error loading interests:', error);
      setInterests([]);
    } finally {
      setLoadingInterests(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSkillsChange = async (skillIds) => {
    // Filter out any null/undefined values
    const validSkillIds = skillIds.filter(id => id != null);

    console.log('Updating skills with IDs:', validSkillIds);

    // Optimistically update UI
    setSelectedSkillIds(validSkillIds);

    // Auto-save skills to backend
    try {
      const response = await skillService.updateUserSkills(validSkillIds);
      console.log('Skills saved successfully:', response);
      toast.success('✓ Skills updated successfully');

      // Reload user skills to ensure UI is in sync
      await loadUserSkills();
    } catch (error) {
      console.error('Error saving skills:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || 'Failed to save skills';
      toast.error(errorMsg);

      // Reload skills to revert UI on error
      await loadUserSkills();
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Don't include skills in profile update - skills are managed separately via structured skill system
      const { skills, ...profileDataWithoutSkills } = profileData;

      const updatedUser = await updateProfile(profileDataWithoutSkills);

      // Re-sync profileData with updated user data to ensure consistency
      if (updatedUser) {
        setProfileData({
          first_name: updatedUser.first_name || '',
          last_name: updatedUser.last_name || '',
          bio: updatedUser.bio || '',
          phone_number: updatedUser.phone_number || '',
          city: updatedUser.city || '',
          country: updatedUser.country || '',
          skills: updatedUser.skills || '',
        });

        // Reload structured skills after profile update
        if (user.is_freelancer) {
          loadUserSkills();
        }
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.new_password !== passwordData.new_password2) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      setLoading(true);
      const authService = (await import('../../services/authService')).default;
      await authService.changePassword(passwordData.old_password, passwordData.new_password);
      toast.success('Password changed successfully');
      setPasswordData({
        old_password: '',
        new_password: '',
        new_password2: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-6xl px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <Card padding={false} className="dark:bg-gray-800 dark:border dark:border-gray-700">
              {/* Profile Picture */}
              <div className="p-6 text-center border-b border-gray-200 dark:border-gray-700">
                <div className="inline-block mb-4">
                  <Avatar user={user} size="2xl" className="ring-4 ring-white dark:ring-gray-800" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">{user.username}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    user.user_type === 'CLIENT' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                    user.user_type === 'FREELANCER' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                    'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                  }`}>
                    {user.user_type}
                  </span>
                  {user.is_verified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                      <CheckCircleIcon className="w-3 h-3 mr-1" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'profile'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'password'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <LockClosedIcon className="w-5 h-5" />
                  <span className="font-medium">Password</span>
                </button>

                <button
                  onClick={() => setActiveTab('stats')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                    activeTab === 'stats'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <ChartBarIcon className="w-5 h-5" />
                  <span className="font-medium">Statistics</span>
                </button>
              </div>
            </Card>

            {/* Quick Stats Card */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-yellow-500" />
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
                      <StarIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rating</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {typeof user.average_rating === 'number' ? user.average_rating.toFixed(1) : '0.0'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Reviews</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.total_reviews || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
                      <CheckCircleIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.tasks_completed || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {user.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Profile</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Update your personal information and settings</p>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      name="first_name"
                      icon={UserIcon}
                      value={profileData.first_name}
                      onChange={handleProfileChange}
                      required
                    />

                    <Input
                      label="Last Name"
                      name="last_name"
                      value={profileData.last_name}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>

                  {/* Email (readonly) */}
                  <Input
                    label="Email"
                    type="email"
                    value={user.email}
                    icon={EnvelopeIcon}
                    disabled
                  />

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={6}
                      placeholder="Tell us about yourself, your experience, what makes you unique..."
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        dark:bg-gray-700 dark:text-white dark:placeholder-gray-400
                        resize-none transition-all duration-200
                        shadow-sm hover:shadow-md"
                    />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span>💡</span>
                      <span>Share your story, expertise, and what you're passionate about</span>
                    </p>
                  </div>

                  {/* Phone & Location */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="Phone Number"
                      name="phone_number"
                      type="tel"
                      icon={PhoneIcon}
                      placeholder="+20 123 456 7890"
                      value={profileData.phone_number}
                      onChange={handleProfileChange}
                    />

                    <Input
                      label="City"
                      name="city"
                      icon={MapPinIcon}
                      placeholder="Cairo"
                      value={profileData.city}
                      onChange={handleProfileChange}
                    />
                  </div>

                  <Input
                    label="Country"
                    name="country"
                    placeholder="Egypt"
                    value={profileData.country}
                    onChange={handleProfileChange}
                  />

                  {/* Skills (for freelancers) - STRUCTURED SELECTION */}
                  {user.is_freelancer && (
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <BriefcaseIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            <span>Skills & Expertise</span>
                          </div>
                          {selectedSkillIds.length > 0 && (
                            <Link
                              to="/dashboard"
                              className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                              </svg>
                              View Recommendations
                            </Link>
                          )}
                        </div>
                      </label>
                      <SkillSelector
                        initialSkillIds={selectedSkillIds}
                        onSkillsChange={handleSkillsChange}
                      />
                    </div>
                  )}

                  {/* Interests Section */}
                  <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <SparklesIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                          <span>Your Interests</span>
                        </div>
                        {interests.length > 0 && (
                          <Link
                            to="/recommendations"
                            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                            </svg>
                            View Service Offerings
                          </Link>
                        )}
                      </div>
                    </label>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Categories you're interested in working with. These help us provide personalized service offering suggestions.
                    </p>

                    {loadingInterests ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                      </div>
                    ) : interests.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {interests.map((category) => (
                          <div
                            key={category.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg transition-all hover:shadow-md"
                          >
                            <span className="text-2xl">{category.icon || '📁'}</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
                        <SparklesIcon className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          No interests selected yet
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                          Complete the onboarding survey to get personalized service offering recommendations
                        </p>
                        <Link
                          to="/recommendations"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                        >
                          <SparklesIcon className="w-5 h-5" />
                          Complete Onboarding
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Change Password</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ensure your account is using a strong password</p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <Input
                    label="Current Password"
                    name="old_password"
                    type="password"
                    icon={LockClosedIcon}
                    placeholder="Enter current password"
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    required
                  />

                  <Input
                    label="New Password"
                    name="new_password"
                    type="password"
                    icon={LockClosedIcon}
                    placeholder="Enter new password"
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    required
                  />

                  <Input
                    label="Confirm New Password"
                    name="new_password2"
                    type="password"
                    icon={LockClosedIcon}
                    placeholder="Confirm new password"
                    value={passwordData.new_password2}
                    onChange={handlePasswordChange}
                    required
                  />

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 dark:text-blue-400 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                      <li>• At least 8 characters long</li>
                      <li>• Include numbers and letters</li>
                      <li>• Avoid common passwords</li>
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      loading={loading}
                    >
                      Update Password
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Statistics</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Overview of your activity and performance</p>
                  </div>

                  {/* Performance Overview */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8">
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <div className="w-12 h-12 bg-blue-500 dark:bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <StarIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {typeof user.average_rating === 'number' ? user.average_rating.toFixed(1) : '0.0'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Average Rating</div>
                      <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        {user.total_reviews || 0} reviews
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-100 dark:border-green-800">
                      <div className="w-12 h-12 bg-green-500 dark:bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircleIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {user.tasks_completed || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</div>
                      <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
                        100% success rate
                      </div>
                    </div>

                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-100 dark:border-purple-800">
                      <div className="w-12 h-12 bg-purple-500 dark:bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <BriefcaseIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {user.tasks_posted || 0}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Tasks Posted</div>
                      <div className="mt-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
                        As client
                      </div>
                    </div>
                  </div>

                  {/* Activity Details */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Activity Details</h3>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Account Type</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.user_type === 'CLIENT' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                            user.user_type === 'FREELANCER' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                            'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400'
                          }`}>
                            {user.user_type}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Account Status</span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                            Active
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Member Since</span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {new Date(user.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-white dark:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Verification Status</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.is_verified
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-400'
                          }`}>
                            {user.is_verified ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Achievements Card */}
                <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Achievements</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {user.tasks_completed >= 1 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="w-12 h-12 bg-yellow-400 dark:bg-yellow-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🎯</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">First Task</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Completed your first task</div>
                        </div>
                      </div>
                    )}

                    {user.tasks_completed >= 5 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="w-12 h-12 bg-blue-400 dark:bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">⭐</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Rising Star</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Completed 5 tasks</div>
                        </div>
                      </div>
                    )}

                    {user.tasks_completed >= 10 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="w-12 h-12 bg-green-400 dark:bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">🏆</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Expert</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">Completed 10 tasks</div>
                        </div>
                      </div>
                    )}

                    {(user.average_rating || 0) >= 4.5 && (
                      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="w-12 h-12 bg-purple-400 dark:bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-2xl">💎</span>
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">Top Rated</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">4.5+ star rating</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {(user.tasks_completed === 0 || user.tasks_completed === undefined) && (user.average_rating === 0 || user.average_rating === undefined || user.average_rating === null) && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-3xl">🎉</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Complete tasks to unlock achievements!</p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;