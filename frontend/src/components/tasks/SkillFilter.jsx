import React, { useState, useEffect } from 'react';
import skillService from '../../services/skillService';
import Loading from '../common/Loading';
import {
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';

const SkillFilter = ({ selectedSkills, onChange, forceLightMode = false }) => {
  const [allSkills, setAllSkills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const data = await skillService.getAllSkills();
      const skillList = Array.isArray(data) ? data : (data.results || []);
      setAllSkills(skillList);

      // Extract unique categories
      const uniqueCategories = [...new Set(
        skillList
          .filter(skill => skill.category)
          .map(skill => JSON.stringify(skill.category))
      )].map(cat => JSON.parse(cat));

      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter skills based on search query and selected category
  const filteredSkills = allSkills.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || skill.category?.id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Group skills by category
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    const categoryName = skill.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(skill);
    return acc;
  }, {});

  const handleToggleSkill = (skillId) => {
    if (selectedSkills.includes(skillId)) {
      onChange(selectedSkills.filter(id => id !== skillId));
    } else {
      onChange([...selectedSkills, skillId]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const getSelectedSkillNames = () => {
    return selectedSkills
      .map(id => allSkills.find(s => s.id === id))
      .filter(Boolean);
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${!forceLightMode ? 'dark:bg-gray-800 dark:border-gray-700' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FunnelIcon className={`w-5 h-5 text-gray-600 ${!forceLightMode ? 'dark:text-gray-400' : ''}`} />
          <h3 className={`font-semibold text-gray-900 ${!forceLightMode ? 'dark:text-white' : ''}`}>
            Filter by Skills
          </h3>
          {selectedSkills.length > 0 && (
            <span className={`px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full ${!forceLightMode ? 'dark:bg-primary-900/30 dark:text-primary-300' : ''}`}>
              {selectedSkills.length}
            </span>
          )}
        </div>
        {selectedSkills.length > 0 && (
          <button
            onClick={clearAll}
            className={`text-sm text-primary-600 hover:text-primary-700 font-medium ${!forceLightMode ? 'dark:text-primary-400 dark:hover:text-primary-300' : ''}`}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Selected Skills Tags */}
      {selectedSkills.length > 0 && (
        <div className={`flex flex-wrap gap-2 mb-4 pb-4 border-b border-gray-200 ${!forceLightMode ? 'dark:border-gray-700' : ''}`}>
          {getSelectedSkillNames().map(skill => (
            <span
              key={skill.id}
              className={`inline-flex items-center gap-1 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm font-medium ${!forceLightMode ? 'dark:bg-primary-900/30 dark:text-primary-300' : ''}`}
            >
              {skill.name}
              <button
                onClick={() => handleToggleSkill(skill.id)}
                className={`hover:text-primary-900 ml-1 ${!forceLightMode ? 'dark:hover:text-primary-100' : ''}`}
                aria-label={`Remove ${skill.name}`}
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search Input */}
      <div className="relative mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search skills..."
          className={`w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${!forceLightMode ? 'dark:border-gray-600 dark:bg-gray-700 dark:text-white' : ''}`}
        />
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="mb-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${!forceLightMode ? 'dark:border-gray-600 dark:bg-gray-700 dark:text-white' : ''}`}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Skill List */}
      <div className="max-h-96 overflow-y-auto space-y-3">
        {loading ? (
          <div className="py-8">
            <Loading />
          </div>
        ) : filteredSkills.length === 0 ? (
          <div className="text-center py-8">
            <p className={`text-gray-500 text-sm ${!forceLightMode ? 'dark:text-gray-400' : ''}`}>
              {searchQuery || selectedCategory !== 'all'
                ? 'No skills found matching your filters'
                : 'No skills available'}
            </p>
          </div>
        ) : (
          Object.entries(groupedSkills).map(([categoryName, skills]) => (
            <div key={categoryName} className="space-y-1">
              <h4 className={`text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 ${!forceLightMode ? 'dark:text-gray-400' : ''}`}>
                {categoryName}
              </h4>
              {skills.map(skill => (
                <label
                  key={skill.id}
                  className={`flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group ${!forceLightMode ? 'dark:hover:bg-gray-700/50' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill.id)}
                    onChange={() => handleToggleSkill(skill.id)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2 cursor-pointer"
                  />
                  <span className={`text-sm text-gray-700 group-hover:text-gray-900 font-medium flex-1 ${!forceLightMode ? 'dark:text-gray-300 dark:group-hover:text-white' : ''}`}>
                    {skill.name}
                  </span>
                  {skill.description && (
                    <span className={`text-xs text-gray-500 hidden group-hover:inline ${!forceLightMode ? 'dark:text-gray-400' : ''}`}>
                      {skill.description.substring(0, 30)}...
                    </span>
                  )}
                </label>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      {selectedSkills.length > 0 && (
        <div className={`mt-4 pt-4 border-t border-gray-200 ${!forceLightMode ? 'dark:border-gray-700' : ''}`}>
          <p className={`text-xs text-gray-500 text-center ${!forceLightMode ? 'dark:text-gray-400' : ''}`}>
            Showing tasks that require <span className={`font-semibold text-primary-600 ${!forceLightMode ? 'dark:text-primary-400' : ''}`}>any</span> of the selected skills
          </p>
        </div>
      )}
    </div>
  );
};

export default SkillFilter;
