import React from 'react';

const Card = ({
  children,
  hover = false,
  padding = true,
  className = '',
  onClick
}) => {
  const baseStyles = 'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700';
  const hoverStyles = hover ? 'hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer' : 'transition-shadow';
  const paddingStyles = padding ? 'p-6' : '';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${paddingStyles} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;