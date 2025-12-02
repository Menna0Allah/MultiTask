import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import {
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Mock notifications - Replace with real API data later
  const notifications = [
    {
      id: 1,
      type: 'application',
      title: 'New Application',
      message: 'John Doe applied to your task "Website Development"',
      time: '5 min ago',
      read: false,
      link: '/my-tasks',
    },
    {
      id: 2,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message from Sarah Smith',
      time: '1 hour ago',
      read: false,
      link: '/messages',
    },
    {
      id: 3,
      type: 'task',
      title: 'Task Completed',
      message: 'Your task "Logo Design" has been marked as completed',
      time: '2 hours ago',
      read: true,
      link: '/my-tasks',
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="container-custom px-6">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-10 h-10 bg-primary-600 dark:bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Multitask</span>
          </Link>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <Link to="/categories" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">
              Categories
            </Link>
            <Link to="/tasks" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">
              Browse Tasks
            </Link>
            
            {isAuthenticated && (
              <>
                {user?.is_freelancer && (
                  <Link to="/recommendations" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">
                    For You
                  </Link>
                )}

                {user?.is_client && (
                  <Link to="/tasks/create" className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">
                    <PlusIcon className="w-5 h-5" />
                    <span>Post Task</span>
                  </Link>
                )}
              </>
            )}

            <Link to="/how-it-works" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">
              How it Works
            </Link>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 relative"
                  >
                    <BellIcon className="w-6 h-6" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {notificationsOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setNotificationsOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-20 border border-gray-200 dark:border-gray-700 max-h-96 overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              Notifications
                            </h3>
                            {unreadCount > 0 && (
                              <span className="text-xs text-primary-600 dark:text-primary-400">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto max-h-80">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <Link
                                key={notification.id}
                                to={notification.link}
                                onClick={() => setNotificationsOpen(false)}
                                className={`block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-0 ${
                                  !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2 h-2 mt-2 rounded-full ${
                                    !notification.read ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                                  }`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      {notification.time}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            ))
                          ) : (
                            <div className="px-4 py-8 text-center">
                              <BellIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                No notifications yet
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                            <button
                              onClick={() => {
                                setNotificationsOpen(false);
                                navigate('/notifications');
                              }}
                              className="text-sm text-primary-600 dark:text-primary-400 hover:underline w-full text-center"
                            >
                              View all notifications
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Messages */}
                <Link to="/messages" className="p-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 relative">
                  <ChatBubbleLeftRightIcon className="w-6 h-6" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Link>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Avatar user={user} size="sm" />
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user?.username}
                    </span>
                  </button>

                  {/* Dropdown */}
                  {profileMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setProfileMenuOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-20 border border-gray-200 dark:border-gray-700">
                        <Link
                          to="/dashboard"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Dashboard
                        </Link>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          My Profile
                        </Link>
                        <Link
                          to="/my-tasks"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          My Tasks
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Settings
                        </Link>
                        <hr className="my-1 dark:border-gray-700" />
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/login" className="btn btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 dark:text-gray-400"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/categories"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link
              to="/tasks"
              className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Tasks
            </Link>

            {isAuthenticated ? (
              <>
                {user?.is_freelancer && (
                  <Link
                    to="/recommendations"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    For You
                  </Link>
                )}

                {user?.is_client && (
                  <Link
                    to="/tasks/create"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Post Task
                  </Link>
                )}

                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                <Link
                  to="/my-tasks"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Tasks
                </Link>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-primary-600 dark:text-primary-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;