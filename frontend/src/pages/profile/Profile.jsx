import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  LockClosedIcon,
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
    }
  }, [user]);

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

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await updateProfile(profileData);
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
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container-custom max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card padding={false}>
              {/* Profile Picture */}
              <div className="p-6 text-center border-b border-gray-200">
                <Avatar user={user} size="2xl" className="mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900">{user.username}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="mt-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    user.user_type === 'CLIENT' ? 'bg-blue-100 text-blue-800' :
                    user.user_type === 'FREELANCER' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {user.user_type}
                  </span>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition ${
                    activeTab === 'profile'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>

                <button
                  onClick={() => setActiveTab('password')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition ${
                    activeTab === 'password'
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LockClosedIcon className="w-5 h-5" />
                  <span className="font-medium">Password</span>
                </button>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-semibold text-gray-900">
                    ⭐ {user.average_rating || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Reviews</span>
                  <span className="font-semibold text-gray-900">
                    {user.total_reviews || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Member Since</span>
                  <span className="font-semibold text-gray-900">
                    {new Date(user.created_at).getFullYear()}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      rows={4}
                      placeholder="Tell us about yourself..."
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      className="textarea-field"
                    />
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

                  {/* Skills (for freelancers) */}
                  {user.is_freelancer && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center space-x-2">
                          <BriefcaseIcon className="w-5 h-5" />
                          <span>Skills</span>
                        </div>
                      </label>
                      <textarea
                        name="skills"
                        rows={3}
                        placeholder="Python, Django, React, Design..."
                        value={profileData.skills}
                        onChange={handleProfileChange}
                        className="textarea-field"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Comma-separated list of your skills
                      </p>
                    </div>
                  )}

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
              <Card>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Password</h2>

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

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Password Requirements:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;