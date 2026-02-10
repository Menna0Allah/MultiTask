import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import ThemeToggle from '../common/ThemeToggle';
import notificationService from '../../services/notificationService';
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
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const wsRef = useRef(null);

  const handleLogout = async () => {
    // Close WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    await logout();
    navigate('/login');
  };

  // Fetch notifications and unread count
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();

      // Small delay to prevent React Strict Mode double-mount issues
      const timer = setTimeout(() => {
        connectWebSocket();
      }, 100);

      return () => {
        clearTimeout(timer);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.close(1000, 'Component unmounting');
        }
      };
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ page_size: 5 });
      setNotifications(data.results || data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const connectWebSocket = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      wsRef.current = notificationService.connectWebSocket(token, (data) => {
        if (data.type === 'new_notification') {
          // Add new notification to the list
          setNotifications(prev => [data.notification, ...prev.slice(0, 4)]);
          fetchUnreadCount();
        } else if (data.type === 'unread_count') {
          setUnreadCount(data.count);
        }
      });
    } catch (error) {
      console.error('Error connecting to notification WebSocket:', error);
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      fetchUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50 transition-colors duration-200">
      <div className="container-custom px-6">
        <div className="flex justify-between items-center h-16 relative">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 rounded-lg flex items-center justify-center shadow-lg">
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
            {/* Freelancers link - only for clients (includes 'both' users) */}
            {isAuthenticated && user?.is_client && (
              <Link to="/freelancers" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium">
                Freelancers
              </Link>
            )}

            {isAuthenticated && (
              <>
                {/* For You (task recommendations) - only for freelancers (includes 'both' users) */}
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
                      <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl z-20 border border-gray-200/60 dark:border-white/10 max-h-96 overflow-hidden flex flex-col">
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/70">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                              Notifications
                            </h3>
                            {unreadCount > 0 && (
                              <span className="text-xs text-white bg-gradient-to-r from-indigo-600 to-purple-600 px-2 py-0.5 rounded-full">
                                {unreadCount} new
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Notifications List */}
                        <div className="overflow-y-auto flex-1">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <Link
                                key={notification.id}
                                to={notification.link || '#'}
                                onClick={() => {
                                  if (!notification.is_read) {
                                    notificationService.markAsRead(notification.id);
                                  }
                                  setNotificationsOpen(false);
                                }}
                                className={`block px-4 py-3 hover:bg-gray-50/80 dark:hover:bg-gray-800/80 border-b border-gray-100/70 dark:border-white/10 last:border-0 ${
                                  !notification.is_read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`w-2.5 h-2.5 mt-2 rounded-full ${
                                    !notification.is_read ? 'bg-primary-600 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]' : 'bg-gray-300 dark:bg-gray-600'
                                  }`}></div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                      {notification.title}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                      {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                      {notification.time_ago}
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
                          <div className="px-4 py-2 border-t border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-gray-900/70">
                            <button
                              onClick={() => {
                                setNotificationsOpen(false);
                                navigate('/notifications');
                              }}
                              className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 w-full text-center"
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
                          to="/saved-tasks"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileMenuOpen(false)}
                        >
                          Saved Tasks
                        </Link>
                        {user?.is_freelancer && (
                          <Link
                            to="/wallet"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setProfileMenuOpen(false)}
                          >
                            My Wallet
                          </Link>
                        )}
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
            {/* Freelancers link - only for clients (includes 'both' users) */}
            {isAuthenticated && user?.is_client && (
              <Link
                to="/freelancers"
                className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                onClick={() => setMobileMenuOpen(false)}
              >
                Freelancers
              </Link>
            )}

            {isAuthenticated ? (
              <>
                {/* For You (task recommendations) - only for freelancers (includes 'both' users) */}
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

                {user?.is_freelancer && (
                  <Link
                    to="/wallet"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Wallet
                  </Link>
                )}

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
