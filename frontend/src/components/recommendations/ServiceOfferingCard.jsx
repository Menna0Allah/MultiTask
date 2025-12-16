import React from 'react';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Card from '../common/Card';

const ServiceOfferingCard = ({ offering, onSave, isSaved, getMatchColor }) => {
  return (
    <Card
      key={offering.id}
      className="bg-white dark:bg-gray-800 border dark:border-gray-700 shadow-md hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
    >
      {/* Match Score Badge */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`${getMatchColor(offering.match_score)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
          {offering.match_score}% Match
        </div>
      </div>

      <div className="p-6">
        {/* Category Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
            {offering.icon || '💼'}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white">
              {offering.name}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                offering.opportunity?.potential === 'High'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : offering.opportunity?.potential === 'Medium'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {offering.opportunity?.potential || 'Good'} Opportunity
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
          {offering.description}
        </p>

        {/* Reasons - Why this suggestion */}
        {offering.reasons && offering.reasons.length > 0 && (
          <div className="mb-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
            <h4 className="text-xs font-semibold text-primary-900 dark:text-primary-300 mb-2 flex items-center gap-1">
              <SparklesIcon className="w-4 h-4" />
              Why this suggestion:
            </h4>
            <ul className="space-y-1">
              {offering.reasons.map((reason, index) => (
                <li key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-1">
                  <CheckCircleIcon className="w-3 h-3 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunity Metrics */}
        {offering.opportunity && (
          <div className="grid grid-cols-2 gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {offering.opportunity.open_tasks}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Open Tasks</div>
            </div>
            <div className="text-center p-3 bg-gray-50 dark:bg-gray-750 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {offering.opportunity.avg_budget}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">Avg Budget (EGP)</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            to={`/tasks?category=${offering.id}`}
            className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg font-semibold transition-all text-center flex items-center justify-center gap-2"
          >
            <BriefcaseIcon className="w-5 h-5" />
            View Tasks
          </Link>
          <button
            onClick={() => onSave(offering.id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Save for later"
          >
            {isSaved ? (
              <HeartSolidIcon className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </Card>
  );
};

export default ServiceOfferingCard;
