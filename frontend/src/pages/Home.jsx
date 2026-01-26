import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import taskService from '../services/taskService';
import {
  MagnifyingGlassIcon,
  BriefcaseIcon,
  UserGroupIcon,
  SparklesIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  BoltIcon,
  ArrowRightIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await taskService.getCategories();
      const categoriesArray = Array.isArray(data) ? data : (data.results || []);
      setCategories(categoriesArray.slice(0, 8)); // Show only first 8
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/tasks');
    }
  };

  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Matching',
      description: 'Smart algorithms connect you with perfect matches instantly',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Professionals',
      description: 'Every freelancer is verified, rated, and trusted by our community',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: BoltIcon,
      title: 'Lightning Fast',
      description: 'Get matched and start working within minutes, not days',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: UserGroupIcon,
      title: 'Expert Support',
      description: 'World-class support team available 24/7 to help you succeed',
      color: 'from-green-500 to-emerald-500',
    },
  ];

  const stats = [
    { label: 'Active Tasks', value: '5,000+', icon: BriefcaseIcon },
    { label: 'Freelancers', value: '10,000+', icon: UserGroupIcon },
    { label: 'Completed', value: '50,000+', icon: CheckCircleIcon },
    { label: 'Success Rate', value: '98%', icon: StarIcon },
  ];

  const testimonials = [
    {
      name: 'Menna Allah',
      role: 'Small Business Owner',
      content: 'Multitask helped me find the perfect designer for my brand. The quality exceeded my expectations!',
      rating: 5,
    },
    {
      name: 'Rahma Youssri',
      role: 'Freelance Developer',
      content: 'I have found consistent, high-quality work through this platform. The payment system is seamless.',
      rating: 5,
    },
    {
      name: 'Saif eldein',
      role: 'Marketing Manager',
      content: 'The AI matching is incredible. I found exactly the right talent in minutes, not weeks.',
      rating: 5,
    },
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Animated Background */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom relative z-10 px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-8 animate-fade-in">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by 10,000+ users worldwide</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-white leading-tight animate-fade-in px-4">
              Find Your Perfect
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mt-2">
                Freelance Match
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl mb-10 text-gray-200 max-w-2xl mx-auto animate-fade-in animation-delay-200 px-4">
              Connect with world-class professionals for any task. From design to development, cleaning to consulting.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-10 animate-fade-in animation-delay-300 px-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0 max-w-2xl mx-auto backdrop-blur-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center flex-1">
                  <MagnifyingGlassIcon className="w-6 h-6 text-gray-400 mx-4" />
                  <input
                    type="text"
                    placeholder="What service are you looking for?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 outline-none text-gray-900 dark:text-gray-100 bg-transparent px-2 py-4 text-base sm:text-lg placeholder-gray-500"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 w-full sm:w-auto">
                  Search
                </Button>
              </div>
            </form>

            {/* CTA Buttons */}
            {!isAuthenticated && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-400 px-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-white !text-purple-700 hover:!text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all w-full sm:w-auto group">
                    <span className="text-purple-700 group-hover:text-white transition-colors">Get Started Free</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2 inline text-purple-700 group-hover:text-white transition-colors" />
                  </Button>
                </Link>
                <Link to="/tasks" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/10 px-6 sm:px-8 py-4 text-base sm:text-lg font-semibold backdrop-blur-sm w-full sm:w-auto">
                    Browse Tasks
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* Stats Section with Cards */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-900 relative">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-200 dark:border-gray-700">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3 sm:mb-4" />
                  <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                    {stat.value}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section with Modern Grid */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50 dark:bg-gray-800">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Popular Categories
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              Explore thousands of tasks across diverse categories
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                to={`/tasks?category=${category.id}`}
                className="group relative bg-white dark:bg-gray-700 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-center shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 dark:border-gray-600 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300"></div>

                <div className="relative z-10">
                  <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4 transform group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 text-sm sm:text-base md:text-lg">{category.name}</h3>
                  <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-semibold">{category.tasks_count} tasks</p>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12">
            <Link to="/categories">
              <Button variant="outline" size="lg" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold">
                View All Categories
                <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section with Gradient Cards */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Why Choose Multitask?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              The most advanced platform for finding and hiring talent
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:-translate-y-2 overflow-hidden">
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                  <div className="relative z-10">
                    <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 sm:mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              Loved by Thousands
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              See what our community has to say
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex gap-1 mb-3 sm:mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 px-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12 max-w-5xl mx-auto relative">
            {/* Connection Lines */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-1 bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 dark:from-purple-700 dark:via-pink-700 dark:to-purple-700"></div>

            {[
              {
                step: '01',
                title: 'Post Your Task',
                description: 'Describe your needs, set your budget, and publish in seconds',
                icon: BriefcaseIcon,
              },
              {
                step: '02',
                title: 'Get Matched',
                description: 'Our AI finds the perfect freelancers and they apply to your task',
                icon: SparklesIcon,
              },
              {
                step: '03',
                title: 'Work & Pay',
                description: 'Collaborate seamlessly and pay securely through our platform',
                icon: CheckCircleIcon,
              },
            ].map((item, index) => (
              <div key={index} className="text-center relative">
                <div className="relative inline-block mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto shadow-lg transform hover:scale-110 hover:rotate-6 transition-all duration-300 relative z-10">
                    <item.icon className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center border-3 sm:border-4 border-purple-100 dark:border-purple-900 font-bold text-purple-600 dark:text-purple-400 text-base sm:text-lg z-20">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 px-2">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed px-2">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-900 dark:via-pink-900 dark:to-indigo-900"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom relative z-10 text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white px-4">
            Ready to Transform Your Work?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 text-white/90 max-w-3xl mx-auto px-4">
            Join thousands of clients and freelancers who trust Multitask for their success
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            {!isAuthenticated ? (
              <>
                <Link to="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-white !text-purple-700 hover:!text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all w-full sm:w-auto group">
                    <span className="text-purple-700 group-hover:text-white transition-colors">Start Free Today</span>
                    <ArrowRightIcon className="w-5 h-5 ml-2 inline text-purple-700 group-hover:text-white transition-colors" />
                  </Button>
                </Link>
                <Link to="/tasks" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/20 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold backdrop-blur-sm w-full sm:w-auto">
                    Explore Tasks
                  </Button>
                </Link>
              </>
            ) : (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" className="bg-white hover:bg-purple-600 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold shadow-2xl !text-purple-600 hover:!text-white w-full sm:w-auto transition-all">
                  Go to Dashboard
                  <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
