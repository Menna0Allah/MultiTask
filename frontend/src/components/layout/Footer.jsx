import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-gray-300 dark:text-gray-400 mt-auto transition-colors duration-200">
      <div className="container-custom px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:divide-x md:divide-gray-700 dark:md:divide-gray-800" style={{"--tw-divide-opacity": "0.5"}}>
          {/* Brand */}
          <div className="col-span-1 md:pr-8">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 dark:bg-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-bold text-white">Multitask</span>
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Your AI-powered freelance marketplace connecting clients with talented professionals.
            </p>
          </div>

          {/* For Clients */}
          <div className="md:px-8">
            <h3 className="text-white font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tasks/create" className="hover:text-white transition">
                  Post a Task
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition">
                  How it Works
                </Link>
              </li>
              <li>
                <Link to="/tasks" className="hover:text-white transition">
                  Browse Services
                </Link>
              </li>
            </ul>
          </div>

          {/* For Freelancers */}
          <div className="md:px-8">
            <h3 className="text-white font-semibold mb-4">For Freelancers</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tasks" className="hover:text-white transition">
                  Find Work
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition">
                  Getting Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="md:px-8">
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-white transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-white transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-900 mt-8 pt-8 text-sm text-center">
          <p>&copy; {currentYear} Multitask. All rights reserved. Made with ❤️ in Egypt.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;