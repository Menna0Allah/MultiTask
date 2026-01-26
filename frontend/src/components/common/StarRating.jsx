import React, { useState } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

/**
 * StarRating Component
 *
 * A reusable star rating component that can be used for both:
 * - Interactive rating input (when onChange is provided)
 * - Read-only rating display (when readOnly is true)
 *
 * @param {number} value - Current rating value (0-5)
 * @param {function} onChange - Callback when rating changes (optional, for interactive mode)
 * @param {boolean} readOnly - Whether the rating is read-only (default: false)
 * @param {string} size - Size variant: 'sm', 'md', 'lg' (default: 'md')
 * @param {boolean} showValue - Whether to show the numeric value (default: false)
 * @param {number} totalReviews - Total number of reviews (optional)
 */
const StarRating = ({
  value = 0,
  onChange,
  readOnly = false,
  size = 'md',
  showValue = false,
  totalReviews,
  className = ''
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  // Ensure value is always a number
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  };

  const starSize = sizeClasses[size] || sizeClasses.md;
  const isInteractive = !readOnly && onChange;

  const handleClick = (rating) => {
    if (isInteractive) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating) => {
    if (isInteractive) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    if (isInteractive) {
      setHoverValue(0);
    }
  };

  const displayValue = hoverValue || numericValue;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= displayValue;
          const isHovered = isInteractive && star <= hoverValue;

          return (
            <button
              key={star}
              type="button"
              onClick={() => handleClick(star)}
              onMouseEnter={() => handleMouseEnter(star)}
              onMouseLeave={handleMouseLeave}
              disabled={!isInteractive}
              className={`
                ${isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default'}
                ${isHovered ? 'transform scale-110' : ''}
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1 rounded
                disabled:cursor-default
              `}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              {isFilled ? (
                <StarIcon
                  className={`${starSize} ${
                    isHovered
                      ? 'text-yellow-400'
                      : 'text-yellow-500 dark:text-yellow-400'
                  } transition-colors`}
                />
              ) : (
                <StarOutlineIcon
                  className={`${starSize} ${
                    isInteractive
                      ? 'text-gray-300 dark:text-gray-600 hover:text-yellow-400'
                      : 'text-gray-300 dark:text-gray-600'
                  } transition-colors`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Numeric Value */}
      {showValue && (
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">
          {numericValue.toFixed(1)}
        </span>
      )}

      {/* Total Reviews Count */}
      {totalReviews !== undefined && (
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
};

export default StarRating;
