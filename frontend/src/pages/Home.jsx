import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import {
  MagnifyingGlassIcon,
  BriefcaseIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const categories = [
    { name: 'Cleaning & Home', icon: '🧹', count: '150+' },
    { name: 'Tutoring', icon: '📚', count: '200+' },
    { name: 'Design', icon: '🎨', count: '180+' },
    { name: 'Programming', icon: '💻', count: '250+' },
    { name: 'Writing', icon: '✍️', count: '120+' },
    { name: 'Marketing', icon: '📊', count: '90+' },
  ];

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Matching',
      description: 'Our smart algorithm matches you with the perfect tasks or freelancers',
    },
    {
      icon: CheckCircleIcon,
      title: 'Verified Professionals',
      description: 'All freelancers are verified and rated by previous clients',
    },
    {
      icon: BriefcaseIcon,
      title: 'Secure Payments',
      description: 'Safe and secure payment system with buyer protection',
    },
    {
      icon: UserGroupIcon,
      title: '24/7 Support',
      description: 'Our support team is always here to help you',
    },
  ];

  const stats = [
    { label: 'Active Tasks', value: '5,000+' },
    { label: 'Freelancers', value: '10,000+' },
    { label: 'Tasks Completed', value: '50,000+' },
    { label: 'Success Rate', value: '98%' },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Find the Perfect Freelancer for Any Task
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Connect with talented professionals for cleaning, tutoring, design, programming, and more
            </p>

            {/* Search Bar */}
            <div className="bg-white rounded-lg shadow-lg p-2 flex items-center max-w-2xl mx-auto">
              <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 mx-3" />
              <input
                type="text"
                placeholder="What service do you need?"
                className="flex-1 outline-none text-gray-900 px-2 py-2"
              />
              <Button variant="primary" className="ml-2">
                Search
              </Button>
            </div>

            {/* CTA Buttons */}
            {!isAuthenticated && (
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register">
                  <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                    Sign Up as Client
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                    Join as Freelancer
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Popular Categories
            </h2>
            <p className="text-xl text-gray-600">
              Browse tasks by category
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/tasks?category=${category.name}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
              >
                <div className="text-5xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} tasks</p>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/tasks">
              <Button variant="outline" size="lg">
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Multitask?
            </h2>
            <p className="text-xl text-gray-600">
              The smart way to find freelancers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in 3 easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Post Your Task
              </h3>
              <p className="text-gray-600">
                Describe what you need and set your budget
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Choose Freelancer
              </h3>
              <p className="text-gray-600">
                Review applications and select the best match
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get It Done
              </h3>
              <p className="text-gray-600">
                Work together and complete the task
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of clients and freelancers on Multitask today
          </p>
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                  Create Free Account
                </Button>
              </Link>
              <Link to="/tasks">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Browse Tasks
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;