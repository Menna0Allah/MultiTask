import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    console.log('Toggle clicked! Current theme:', theme);
    toggleTheme();
    console.log('HTML classes:', document.documentElement.classList.toString());
  };

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <SunIcon className="w-5 h-5 text-yellow-400" />
      )}
    </button>
  );
};

export default ThemeToggle;
