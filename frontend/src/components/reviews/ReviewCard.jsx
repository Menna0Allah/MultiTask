import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  UserCircleIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolidIcon } from '@heroicons/react/24/solid';
import StarRating from '../common/StarRating';

/**
 * ReviewCard Component
 *
 * Displays a single review with user info, rating, and review text
 *
 * @param {object} review - Review object with { id, rating, review_text, created_at, reviewer }
 * @param {boolean} showHelpful - Whether to show helpful/not helpful buttons
 * @param {function} onHelpful - Callback when helpful button is clicked
 */
const ReviewCard = ({
  review,
  showHelpful = false,
  onHelpful,
}) => {
  const [helpful, setHelpful] = useState(null); // null, 'yes', or 'no'

  if (!review) return null;

  const {
    id,
    rating,
    review_text,
    created_at,
    reviewer,
    helpful_count = 0,
  } = review;

  const handleHelpfulClick = (isHelpful) => {
    const newValue = helpful === (isHelpful ? 'yes' : 'no') ? null : (isHelpful ? 'yes' : 'no');
    setHelpful(newValue);
    if (onHelpful) {
      onHelpful(id, newValue);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      {/* Header: User Info & Rating */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3 flex-1">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {reviewer?.profile_picture ? (
              <img
                src={reviewer.profile_picture}
                alt={`${reviewer.first_name} ${reviewer.last_name}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <UserCircleIcon className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Link
                to={`/profile/${reviewer?.username}`}
                className="font-semibold text-gray-900 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              >
                {reviewer?.first_name} {reviewer?.last_name}
              </Link>
              {reviewer?.is_verified && (
                <CheckBadgeIcon
                  className="w-5 h-5 text-blue-500"
                  title="Verified User"
                />
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              @{reviewer?.username}
            </p>
          </div>
        </div>

        {/* Date */}
        <div className="text-right flex-shrink-0">
          <StarRating value={rating} readOnly size="sm" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {formatDate(created_at)}
          </p>
        </div>
      </div>

      {/* Review Text */}
      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {review_text}
        </p>
      </div>

      {/* Footer: Helpful Buttons */}
      {showHelpful && (
        <div className="flex items-center gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Was this helpful?
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleHelpfulClick(true)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-all
                ${
                  helpful === 'yes'
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-green-50 dark:hover:bg-green-900/20'
                }
              `}
            >
              {helpful === 'yes' ? (
                <HandThumbUpSolidIcon className="w-4 h-4" />
              ) : (
                <HandThumbUpIcon className="w-4 h-4" />
              )}
              <span>Yes</span>
              {helpful_count > 0 && helpful === 'yes' && (
                <span className="ml-1">({helpful_count})</span>
              )}
            </button>
            <button
              onClick={() => handleHelpfulClick(false)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium
                transition-all
                ${
                  helpful === 'no'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                }
              `}
            >
              <HandThumbDownIcon className="w-4 h-4" />
              <span>No</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
