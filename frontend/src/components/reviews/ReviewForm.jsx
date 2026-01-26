import React, { useState } from 'react';
import { ChatBubbleLeftIcon, StarIcon } from '@heroicons/react/24/outline';
import StarRating from '../common/StarRating';
import Button from '../common/Button';
import toast from 'react-hot-toast';

/**
 * ReviewForm Component
 *
 * A form for submitting reviews with star rating and text
 *
 * @param {function} onSubmit - Callback when form is submitted with { rating, review_text }
 * @param {boolean} loading - Whether the form is in loading state
 * @param {string} submitLabel - Custom label for submit button (default: 'Submit Review')
 * @param {string} placeholder - Custom placeholder for review text
 * @param {number} minLength - Minimum review text length (default: 10)
 * @param {number} maxLength - Maximum review text length (default: 500)
 */
const ReviewForm = ({
  onSubmit,
  loading = false,
  submitLabel = 'Submit Review',
  placeholder = 'Share your experience with this task and freelancer/client...',
  minLength = 10,
  maxLength = 500,
}) => {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!reviewText.trim()) {
      newErrors.reviewText = 'Review text is required';
    } else if (reviewText.trim().length < minLength) {
      newErrors.reviewText = `Review must be at least ${minLength} characters`;
    } else if (reviewText.length > maxLength) {
      newErrors.reviewText = `Review must not exceed ${maxLength} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    try {
      await onSubmit({
        rating,
        review_text: reviewText.trim(),
      });

      // Reset form on success
      setRating(0);
      setReviewText('');
      setErrors({});
    } catch (error) {
      console.error('Review submission error:', error);
      // Error handling is done by parent component
    }
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (errors.rating) {
      setErrors({ ...errors, rating: null });
    }
  };

  const handleTextChange = (e) => {
    setReviewText(e.target.value);
    if (errors.reviewText) {
      setErrors({ ...errors, reviewText: null });
    }
  };

  const remainingChars = maxLength - reviewText.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Section */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Your Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <StarRating
            value={rating}
            onChange={handleRatingChange}
            size="xl"
          />
          {rating > 0 && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {rating === 1 && '⭐ Poor'}
              {rating === 2 && '⭐⭐ Fair'}
              {rating === 3 && '⭐⭐⭐ Good'}
              {rating === 4 && '⭐⭐⭐⭐ Very Good'}
              {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
            </span>
          )}
        </div>
        {errors.rating && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.rating}
          </p>
        )}
      </div>

      {/* Review Text Section */}
      <div>
        <label
          htmlFor="review-text"
          className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3"
        >
          Your Review <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <textarea
            id="review-text"
            value={reviewText}
            onChange={handleTextChange}
            placeholder={placeholder}
            rows={5}
            maxLength={maxLength}
            className={`
              w-full px-4 py-3
              bg-white dark:bg-gray-800
              border-2 rounded-xl
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              transition-all resize-none
              ${
                errors.reviewText
                  ? 'border-red-500 dark:border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              }
            `}
          />
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <ChatBubbleLeftIcon className="w-4 h-4 text-gray-400" />
            <span
              className={`text-xs font-medium ${
                remainingChars < 50
                  ? 'text-orange-500 dark:text-orange-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {remainingChars} / {maxLength}
            </span>
          </div>
        </div>
        {errors.reviewText && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {errors.reviewText}
          </p>
        )}
        {!errors.reviewText && reviewText.length > 0 && reviewText.length < minLength && (
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {minLength - reviewText.length} more character{minLength - reviewText.length !== 1 ? 's' : ''} required
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          loading={loading}
          disabled={loading}
          icon={StarIcon}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default ReviewForm;
