import React from 'react';
import { getAvatarUrl, getInitials } from '../../utils/helpers';

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
  
  const avatarUrl = getAvatarUrl(user);
  
  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden flex items-center justify-center bg-primary-600 text-white font-semibold ${className}`}>
      <img 
        src={avatarUrl} 
        alt={user?.username || 'User'} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default Avatar;