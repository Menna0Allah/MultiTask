import React, { useState } from 'react';
import ReviewCard from './ReviewCard';
import Empty from '../common/Empty';
import { ChatBubbleLeftRightIcon, FunnelIcon } from '@heroicons/react/24/outline';

/**
 * ReviewList Component
 *
 * Displays a list of reviews with filtering and sorting options
 *
 * @param {array} reviews - Array of review objects
 * @param {boolean} loading - Whether reviews are loading
 * @param {boolean} showHelpful - Whether to show helpful/not helpful buttons on reviews
 * @param {function} onHelpful - Callback when helpful button is clicked
 * @param {boolean} showFilters - Whether to show filter/sort options
 */
const ReviewList = ({
  reviews = [],
  loading = false,
  showHelpful = false,
  onHelpful,
  showFilters = true,
}) => {
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'rating-high', 'rating-low', 'helpful'
  const [filterRating, setFilterRating] = useState('all'); // 'all', '5', '4', '3', '2', '1'

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Filter reviews by rating
  const filteredReviews = filterRating === 'all'
    ? reviews
    : reviews.filter((review) => review.rating === parseInt(filterRating));

  // Sort reviews
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      case 'helpful':
        return (b.helpful_count || 0) - (a.helpful_count || 0);
      default:
        return 0;
    }
  });

  if (reviews.length === 0) {
    return (
      <Empty
        icon={ChatBubbleLeftRightIcon}
        title="No reviews yet"
        description="Be the first to share your experience with a review!"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Sorting */}
      {showFilters && reviews.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Filters:
            </span>
          </div>

          {/* Rating Filter */}
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 stars)</option>
            <option value="3">⭐⭐⭐ (3 stars)</option>
            <option value="2">⭐⭐ (2 stars)</option>
            <option value="1">⭐ (1 star)</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="recent">Most Recent</option>
              <option value="rating-high">Highest Rating</option>
              <option value="rating-low">Lowest Rating</option>
              {showHelpful && <option value="helpful">Most Helpful</option>}
            </select>
          </div>

          {/* Results Count */}
          <div className="w-full mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Showing <span className="font-semibold">{sortedReviews.length}</span> of{' '}
              <span className="font-semibold">{reviews.length}</span> review
              {reviews.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {sortedReviews.length > 0 ? (
        <div className="space-y-4">
          {sortedReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showHelpful={showHelpful}
              onHelpful={onHelpful}
            />
          ))}
        </div>
      ) : (
        <Empty
          icon={ChatBubbleLeftRightIcon}
          title="No reviews match your filters"
          description="Try adjusting your filters to see more reviews"
        />
      )}
    </div>
  );
};

export default ReviewList;
