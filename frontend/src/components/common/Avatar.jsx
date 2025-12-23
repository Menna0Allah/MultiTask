import React from 'react';
import { getInitials } from '../../utils/helpers';

const Avatar = ({
  user,
  size = 'md',
  className = ''
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-2xl',
  };

  // Get initials from user's full name or username
  const initials = getInitials(user?.full_name || user?.username || 'User');

  // Generate consistent color based on username
  const getBackgroundColor = (username) => {
    if (!username) return 'bg-primary-600';

    const colors = [
      'bg-blue-600',
      'bg-purple-600',
      'bg-pink-600',
      'bg-red-600',
      'bg-orange-600',
      'bg-yellow-600',
      'bg-green-600',
      'bg-teal-600',
      'bg-cyan-600',
      'bg-indigo-600',
    ];

    // Use username to consistently pick a color
    const hash = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const bgColor = getBackgroundColor(user?.username);

  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center ${bgColor} text-white font-semibold ${className}`}>
      <span>{initials}</span>
    </div>
  );
};

export default Avatar;