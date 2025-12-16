import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import notificationService from '../../services/notificationService';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import {
  BellIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon,
  TrashIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  ExclamationCircleIcon,
  CheckBadgeIcon,
  BellSlashIcon,
} from '@heroicons/react/24/outline';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState(null);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    loadPreferences();
  }, [filter, typeFilter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = { page };

      if (filter === 'unread') params.is_read = false;
      if (filter === 'read') params.is_read = true;
      if (typeFilter !== 'all') params.type = typeFilter;

      const data = await notificationService.getNotifications(params);

      if (page === 1) {
        setNotifications(data.results || data);
      } else {
        setNotifications(prev => [...prev, ...(data.results || data)]);
      }

      setHasMore(!!data.next);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
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

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
      fetchUnreadCount();
      toast.success('Marked as read');
    } catch (error) {
      console.error('Error marking as read:', error);
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm('Delete this notification?')) return;

    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Clear all read notifications?')) return;

    try {
      await notificationService.clearAll();
      setNotifications(prev => prev.filter(n => !n.is_read));
      toast.success('All read notifications cleared');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const handleSavePreferences = async () => {
    try {
      setLoadingPreferences(true);
      await notificationService.updatePreferences(preferences);
      toast.success('Preferences saved successfully');
      setShowPreferences(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoadingPreferences(false);
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = 'w-6 h-6';
    switch (type) {
      case 'task_application':
        return <BriefcaseIcon className={`${iconClass} text-blue-600 dark:text-blue-400`} />;
      case 'application_accepted':
        return <CheckBadgeIcon className={`${iconClass} text-green-600 dark:text-green-400`} />;
      case 'application_rejected':
        return <XMarkIcon className={`${iconClass} text-red-600 dark:text-red-400`} />;
      case 'new_message':
        return <ChatBubbleLeftRightIcon className={`${iconClass} text-purple-600 dark:text-purple-400`} />;
      case 'task_completed':
        return <CheckCircleIcon className={`${iconClass} text-green-600 dark:text-green-400`} />;
      case 'task_reminder':
        return <ClockIcon className={`${iconClass} text-amber-600 dark:text-amber-400`} />;
      case 'system':
        return <ExclamationCircleIcon className={`${iconClass} text-gray-600 dark:text-gray-400`} />;
      default:
        return <BellIcon className={`${iconClass} text-gray-600 dark:text-gray-400`} />;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group notifications by date
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const date = new Date(notification.created_at);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = 'Yesterday';
    } else {
      dateKey = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(notification);
    return groups;
  }, {});

  const notificationTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'task_application', label: 'Applications' },
    { value: 'new_message', label: 'Messages' },
    { value: 'application_accepted', label: 'Accepted' },
    { value: 'application_rejected', label: 'Rejected' },
    { value: 'task_completed', label: 'Completed' },
    { value: 'task_reminder', label: 'Reminders' },
    { value: 'system', label: 'System' },
  ];

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="container-custom max-w-5xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl">
                <BellIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                icon={Cog6ToothIcon}
                onClick={() => setShowPreferences(true)}
              >
                Preferences
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={CheckCircleIcon}
                  onClick={handleMarkAllAsRead}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Mark All Read
                </Button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Read/Unread Filter */}
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Notifications</option>
              <option value="unread">Unread Only</option>
              <option value="read">Read Only</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {Object.keys(groupedNotifications).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedNotifications).map(([date, notifications]) => (
              <div key={date}>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2 text-gray-400" />
                  {date}
                </h2>

                <div className="space-y-2">
                  {notifications.map((notification) => (
                    <Link
                      key={notification.id}
                      to={notification.link || '#'}
                      className={`block transition-all duration-200 ${
                        !notification.is_read ? 'transform hover:scale-[1.01]' : ''
                      }`}
                    >
                      <Card className={`hover:shadow-lg transition-all cursor-pointer border-l-4 dark:bg-gray-800 ${
                        !notification.is_read
                          ? 'border-l-blue-600 dark:border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                          : 'border-l-transparent'
                      }`}>
                        <div className="flex items-start space-x-4">
                          {/* Icon */}
                          <div className={`p-3 rounded-xl ${
                            !notification.is_read
                              ? 'bg-blue-100 dark:bg-blue-900/30'
                              : 'bg-gray-100 dark:bg-gray-700'
                          }`}>
                            {getNotificationIcon(notification.notification_type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h3 className={`font-semibold text-gray-900 dark:text-white mb-1 ${
                                  !notification.is_read ? 'font-bold' : ''
                                }`}>
                                  {notification.title}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                  {notification.time_ago}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center space-x-2">
                                {!notification.is_read && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleMarkAsRead(notification.id);
                                    }}
                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                    title="Mark as read"
                                  >
                                    <CheckCircleIcon className="w-5 h-5" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => handleDelete(notification.id, e)}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <TrashIcon className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center py-4">
                <Button
                  variant="secondary"
                  onClick={() => setPage(prev => prev + 1)}
                  loading={loading && page > 1}
                >
                  Load More
                </Button>
              </div>
            )}

            {/* Clear All Button */}
            {notifications.some(n => n.is_read) && (
              <div className="text-center py-4">
                <Button
                  variant="ghost"
                  icon={TrashIcon}
                  onClick={handleClearAll}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Clear All Read Notifications
                </Button>
              </div>
            )}
          </div>
        ) : (
          <Card className="text-center py-16 dark:bg-gray-800">
            <BellSlashIcon className="w-20 h-20 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery
                ? 'Try adjusting your search or filters'
                : "You're all caught up! Check back later for new notifications."}
            </p>
            {searchQuery && (
              <Button
                variant="secondary"
                onClick={() => {
                  setSearchQuery('');
                  setFilter('all');
                  setTypeFilter('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* Preferences Modal */}
      {showPreferences && preferences && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Cog6ToothIcon className="w-8 h-8 text-white" />
                  <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
                </div>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Email Notifications */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <EnvelopeIcon className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Email Notifications
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'email_task_applications', label: 'Task Applications', desc: 'Get notified when someone applies to your tasks' },
                    { key: 'email_task_updates', label: 'Task Updates', desc: 'Updates about your tasks and applications' },
                    { key: 'email_messages', label: 'New Messages', desc: 'Receive emails for new messages' },
                    { key: 'email_task_reminders', label: 'Task Reminders', desc: 'Reminders for upcoming deadlines' },
                    { key: 'email_marketing', label: 'Marketing & Updates', desc: 'Platform news and featured opportunities' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences[key]}
                        onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
                        className="w-5 h-5 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">{label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700"></div>

              {/* Push Notifications */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BellIcon className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  In-App Notifications
                </h3>
                <div className="space-y-3">
                  {[
                    { key: 'push_task_applications', label: 'Task Applications', desc: 'Real-time notifications for applications' },
                    { key: 'push_task_updates', label: 'Task Updates', desc: 'Instant updates about your tasks' },
                    { key: 'push_messages', label: 'New Messages', desc: 'Real-time message notifications' },
                    { key: 'push_task_reminders', label: 'Task Reminders', desc: 'Reminders and deadlines' },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-start space-x-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={preferences[key]}
                        onChange={(e) => setPreferences({ ...preferences, [key]: e.target.checked })}
                        className="w-5 h-5 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 dark:text-white">{label}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700 p-6 rounded-b-2xl">
              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => setShowPreferences(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  loading={loadingPreferences}
                  onClick={handleSavePreferences}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Save Preferences
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
