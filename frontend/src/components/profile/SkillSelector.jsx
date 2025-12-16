/**
 * Professional Skill Selector Component
 *
 * STRUCTURED DATA APPROACH:
 * - Loads skills from predefined database
 * - User selects from dropdown (not free text)
 * - Saves Skill IDs to backend
 * - Ensures data integrity for recommendations
 */

import React, { useState, useEffect } from 'react';
import skillService from '../../services/skillService';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SkillSelector = ({ onSkillsChange, initialSkillIds = [] }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkillIds, setSelectedSkillIds] = useState(initialSkillIds);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  // Group skills by category
  const [skillsByCategory, setSkillsByCategory] = useState({});

  useEffect(() => {
    loadSkills();
  }, []);

  useEffect(() => {
    // Only update if initialSkillIds actually changed
    const validInitialIds = (initialSkillIds || []).filter(id => id != null);
    console.log('SkillSelector: initialSkillIds changed to:', validInitialIds);
    setSelectedSkillIds(validInitialIds);
  }, [JSON.stringify(initialSkillIds)]); // Use JSON.stringify for deep comparison

  const loadSkills = async () => {
    try {
      setLoading(true);
      const skills = await skillService.getAllSkills();

      // Group by category
      const grouped = skills.reduce((acc, skill) => {
        const category = skill.category || 'other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(skill);
        return acc;
      }, {});

      setAllSkills(skills);
      setSkillsByCategory(grouped);
    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skillId) => {
    // Validate skillId
    if (skillId == null) {
      console.error('Invalid skill ID:', skillId);
      return;
    }

    let newSelectedIds;

    if (selectedSkillIds.includes(skillId)) {
      // Remove skill
      newSelectedIds = selectedSkillIds.filter(id => id !== skillId);
    } else {
      // Add skill
      newSelectedIds = [...selectedSkillIds, skillId];
    }

    // Filter out any null/undefined values
    newSelectedIds = newSelectedIds.filter(id => id != null);

    setSelectedSkillIds(newSelectedIds);
    onSkillsChange(newSelectedIds);
  };

  const handleRemoveSkill = (skillId) => {
    const newSelectedIds = selectedSkillIds
      .filter(id => id !== skillId)
      .filter(id => id != null); // Also filter out null/undefined
    setSelectedSkillIds(newSelectedIds);
    onSkillsChange(newSelectedIds);
  };

  // Filter skills based on search
  const filteredSkills = allSkills.filter(skill =>
    skill.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected skill objects
  const selectedSkills = allSkills.filter(skill =>
    selectedSkillIds.includes(skill.id)
  );

  // Category labels
  const categoryLabels = {
    technical: 'Technical',
    creative: 'Creative',
    business: 'Business',
    manual: 'Manual & Trade',
    service: 'Service',
    education: 'Education',
    health: 'Health & Wellness',
    other: 'Other'
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selected Skills Display */}
      {selectedSkills.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Skills ({selectedSkills.length})
          </label>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedSkills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200"
              >
                {skill.name}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.id)}
                  className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors"
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search & Dropdown */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Add Skills
        </label>

        {/* Search Input */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {filteredSkills.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No skills found
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(categoryLabels).map(([category, label]) => {
                  const categorySkills = filteredSkills.filter(
                    skill => skill.category === category
                  );

                  if (categorySkills.length === 0) return null;

                  return (
                    <div key={category} className="mb-3">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        {label}
                      </div>
                      {categorySkills.map((skill) => (
                        <button
                          key={skill.id}
                          type="button"
                          onClick={() => handleSkillToggle(skill.id)}
                          className={`w-full px-3 py-2 text-left rounded-md transition-colors ${
                            selectedSkillIds.includes(skill.id)
                              ? 'bg-primary-100 text-primary-900 dark:bg-primary-900 dark:text-primary-100'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span>{skill.name}</span>
                            {selectedSkillIds.includes(skill.id) && (
                              <span className="text-primary-600 dark:text-primary-400">✓</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Close Button */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-2">
              <button
                type="button"
                onClick={() => setShowDropdown(false)}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Text */}
      <div className="space-y-2">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          💡 Select skills from the list above. Your recommendations will be based on these skills.
        </p>
        {selectedSkills.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Skills are automatically saved
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Visit the Dashboard to see your updated recommendations
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillSelector;
