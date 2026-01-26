import React from 'react';
import { Link } from 'react-router-dom';
import {
  LinkIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

/**
 * PortfolioCard Component
 *
 * Displays a single portfolio item with image, title, description, and technologies
 *
 * @param {object} item - Portfolio item data
 * @param {boolean} isOwner - Whether the current user owns this item
 * @param {function} onEdit - Callback when edit button is clicked
 * @param {function} onDelete - Callback when delete button is clicked
 */
const PortfolioCard = ({ item, isOwner = false, onEdit, onDelete }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
      {/* Image */}
      {item.image ? (
        <div className="relative h-48 sm:h-56 overflow-hidden">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {item.is_featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Featured
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="h-48 sm:h-56 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center">
          <div className="text-gray-400 dark:text-gray-500 text-center">
            <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">No image</p>
          </div>
          {item.is_featured && (
            <div className="absolute top-3 left-3">
              <span className="bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Featured
              </span>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        {/* Title and Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex-1 line-clamp-2">
            {item.title}
          </h3>
          {isOwner && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onEdit(item)}
                className="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                title="Edit"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item)}
                className="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                title="Delete"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
          {item.description}
        </p>

        {/* Technologies */}
        {item.technologies && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {item.technologies.split(',').map((tech, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md font-medium"
                >
                  {tech.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
          {/* Date */}
          {item.date_completed && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <CalendarIcon className="w-4 h-4" />
              <span>{format(new Date(item.date_completed), 'MMM yyyy')}</span>
            </div>
          )}

          {/* Project Link */}
          {item.project_url && (
            <a
              href={item.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium group/link"
            >
              <LinkIcon className="w-4 h-4 group-hover/link:translate-x-0.5 transition-transform" />
              <span>View Project</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioCard;
