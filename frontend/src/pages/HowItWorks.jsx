import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import {
  UserIcon,
  BriefcaseIcon,
  MagnifyingGlassIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  StarIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ArrowRightIcon,
  UserGroupIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'freelancer'

  const clientSteps = [
    {
      number: 1,
      icon: ClipboardDocumentListIcon,
      title: 'Post Your Task',
      description: 'Create a detailed task posting with your requirements, budget, and timeline. Be specific about what you need done.',
      details: [
        'Describe your project clearly',
        'Set your budget range',
        'Choose a deadline',
        'Add relevant files',
      ],
      color: 'from-purple-500 to-pink-500',
    },
    {
      number: 2,
      icon: MagnifyingGlassIcon,
      title: 'Review Applications',
      description: 'Receive applications from qualified freelancers. Review their profiles, ratings, portfolios, and proposed approaches.',
      details: [
        'Browse freelancer profiles',
        'Check ratings and reviews',
        'Compare proposals',
        'Ask questions',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      number: 3,
      icon: UserIcon,
      title: 'Choose Your Freelancer',
      description: 'Select the best freelancer for your project based on their skills, experience, and proposal.',
      details: [
        'Compare candidates',
        'Review past work',
        'Confirm availability',
        'Finalize details',
      ],
      color: 'from-green-500 to-emerald-500',
    },
    {
      number: 4,
      icon: ChatBubbleLeftRightIcon,
      title: 'Collaborate',
      description: 'Work together through our platform. Track progress, share files, and communicate in real-time.',
      details: [
        'Built-in messaging',
        'Share files securely',
        'Track milestones',
        'Provide feedback',
      ],
      color: 'from-orange-500 to-red-500',
    },
    {
      number: 5,
      icon: CheckCircleIcon,
      title: 'Review & Approve',
      description: 'Review the completed work and request revisions if needed. Approve when you\'re satisfied.',
      details: [
        'Review deliverables',
        'Request revisions',
        'Approve work',
        'Mark complete',
      ],
      color: 'from-indigo-500 to-purple-500',
    },
    {
      number: 6,
      icon: CurrencyDollarIcon,
      title: 'Pay Securely',
      description: 'Release payment securely through our platform. Rate your experience and leave a review.',
      details: [
        'Secure payments',
        'Protected transactions',
        'Rate freelancer',
        'Build reputation',
      ],
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const freelancerSteps = [
    {
      number: 1,
      icon: UserIcon,
      title: 'Create Your Profile',
      description: 'Build a professional profile showcasing your skills, experience, portfolio, and expertise.',
      details: [
        'Add skills & expertise',
        'Upload portfolio',
        'Set your rates',
        'Complete verification',
      ],
      color: 'from-purple-500 to-pink-500',
    },
    {
      number: 2,
      icon: MagnifyingGlassIcon,
      title: 'Find Perfect Tasks',
      description: 'Browse available tasks or get AI-powered recommendations based on your skills and preferences.',
      details: [
        'Browse categories',
        'Get AI recommendations',
        'Filter by budget',
        'Save interesting tasks',
      ],
      color: 'from-blue-500 to-cyan-500',
    },
    {
      number: 3,
      icon: ClipboardDocumentListIcon,
      title: 'Submit Your Proposal',
      description: 'Apply to tasks that match your skills. Write a compelling proposal explaining your approach.',
      details: [
        'Craft tailored proposal',
        'Highlight experience',
        'Set your price',
        'Include timeline',
      ],
      color: 'from-green-500 to-emerald-500',
    },
    {
      number: 4,
      icon: BriefcaseIcon,
      title: 'Get Hired',
      description: 'Once selected, confirm project details with the client and begin working.',
      details: [
        'Review requirements',
        'Clarify questions',
        'Set expectations',
        'Start working',
      ],
      color: 'from-orange-500 to-red-500',
    },
    {
      number: 5,
      icon: RocketLaunchIcon,
      title: 'Deliver Great Work',
      description: 'Complete the task to the best of your ability. Communicate regularly and meet deadlines.',
      details: [
        'Follow guidelines',
        'Provide updates',
        'Meet deadlines',
        'Deliver quality',
      ],
      color: 'from-indigo-500 to-purple-500',
    },
    {
      number: 6,
      icon: StarIcon,
      title: 'Get Paid & Reviewed',
      description: 'Receive payment after client approval. Build your reputation with positive reviews.',
      details: [
        'Get paid securely',
        'Receive feedback',
        'Build rating',
        'Grow business',
      ],
      color: 'from-pink-500 to-rose-500',
    },
  ];

  const benefits = {
    client: [
      {
        icon: ShieldCheckIcon,
        title: 'Verified Professionals',
        description: 'All freelancers are verified and rated by previous clients',
        color: 'from-blue-500 to-cyan-500',
      },
      {
        icon: CurrencyDollarIcon,
        title: 'Secure Payments',
        description: 'Payment protection with escrow system for peace of mind',
        color: 'from-green-500 to-emerald-500',
      },
      {
        icon: SparklesIcon,
        title: 'AI Matching',
        description: 'Smart algorithm connects you with perfect freelancers',
        color: 'from-purple-500 to-pink-500',
      },
      {
        icon: ChatBubbleLeftRightIcon,
        title: '24/7 Support',
        description: 'Dedicated support team always here to help you',
        color: 'from-orange-500 to-red-500',
      },
    ],
    freelancer: [
      {
        icon: BriefcaseIcon,
        title: 'Quality Projects',
        description: 'Access thousands of high-quality tasks across categories',
        color: 'from-blue-500 to-cyan-500',
      },
      {
        icon: SparklesIcon,
        title: 'Smart Recommendations',
        description: 'AI-powered task recommendations based on your skills',
        color: 'from-purple-500 to-pink-500',
      },
      {
        icon: CurrencyDollarIcon,
        title: 'Fair Payment',
        description: 'Competitive rates and guaranteed secure payment',
        color: 'from-green-500 to-emerald-500',
      },
      {
        icon: StarIcon,
        title: 'Build Reputation',
        description: 'Grow your freelance career with reviews and ratings',
        color: 'from-orange-500 to-red-500',
      },
    ],
  };

  const currentSteps = activeTab === 'client' ? clientSteps : freelancerSteps;
  const currentBenefits = benefits[activeTab];

  const stats = [
    { icon: UserGroupIcon, number: '10,000+', label: 'Active Users' },
    { icon: BriefcaseIcon, number: '50,000+', label: 'Tasks Completed' },
    { icon: StarIcon, number: '4.9', label: 'Average Rating' },
    { icon: BoltIcon, number: '98%', label: 'Success Rate' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Hero Section with Gradient */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 py-16 sm:py-20 md:py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom relative z-10 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6 sm:mb-8">
              <SparklesIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Simple & Powerful Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 px-4">
              How
              <span className="block bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mt-2">
                MultiTask Works
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-8 sm:mb-10 px-4">
              Your complete guide to getting things done - whether you're hiring talent or offering your skills
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-800">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="py-8 sm:py-12 bg-white dark:bg-gray-900 sticky top-16 z-40 shadow-md">
        <div className="container-custom px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-6 sm:px-10 py-4 rounded-xl font-bold text-base sm:text-lg transition-all transform hover:scale-105 ${
                activeTab === 'client'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserGroupIcon className="w-5 h-5" />
                I'm a Client
              </div>
            </button>
            <button
              onClick={() => setActiveTab('freelancer')}
              className={`px-6 sm:px-10 py-4 rounded-xl font-bold text-base sm:text-lg transition-all transform hover:scale-105 ${
                activeTab === 'freelancer'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <BriefcaseIcon className="w-5 h-5" />
                I'm a Freelancer
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white dark:bg-gray-900">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 px-4">
              {activeTab === 'client' ? 'How to Hire on MultiTask' : 'How to Work on MultiTask'}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {activeTab === 'client'
                ? 'Follow these simple steps to find and hire the perfect freelancer'
                : 'Follow these simple steps to find work and grow your freelance career'}
            </p>
          </div>

          <div className="space-y-8 sm:space-y-12 max-w-6xl mx-auto">
            {currentSteps.map((step, index) => (
              <div
                key={index}
                className="relative"
              >
                {/* Wavy Connection Line */}
                {index < currentSteps.length - 1 && (
                  <div className="hidden md:block absolute left-[50px] top-[112px] w-8 h-[calc(100%+3rem)] z-0">
                    <svg className="w-full h-full" viewBox="0 0 32 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`wave-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" className="text-purple-500" stopColor="currentColor" />
                          <stop offset="50%" className="text-pink-500" stopColor="currentColor" />
                          <stop offset="100%" className="text-purple-500" stopColor="currentColor" />
                        </linearGradient>
                        <filter id={`glow-${index}`}>
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      {/* Wavy path with animation */}
                      <path
                        d="M 16 0 Q 24 30, 16 60 T 16 120 T 16 180 L 16 200"
                        stroke={`url(#wave-gradient-${index})`}
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                        filter={`url(#glow-${index})`}
                        className="animate-pulse"
                      />
                      {/* Animated dots flowing along the wave */}
                      <circle r="3" fill="white" className="animate-pulse" filter="url(#glow)">
                        <animateMotion dur="3s" repeatCount="indefinite" path="M 16 0 Q 24 30, 16 60 T 16 120 T 16 180 L 16 200" />
                      </circle>
                      <circle r="3" fill="white" className="animate-pulse" filter="url(#glow)">
                        <animateMotion dur="3s" repeatCount="indefinite" begin="1s" path="M 16 0 Q 24 30, 16 60 T 16 120 T 16 180 L 16 200" />
                      </circle>
                      <circle r="3" fill="white" className="animate-pulse" filter="url(#glow)">
                        <animateMotion dur="3s" repeatCount="indefinite" begin="2s" path="M 16 0 Q 24 30, 16 60 T 16 120 T 16 180 L 16 200" />
                      </circle>
                      {/* Arrow at the end */}
                      <path d="M 16 195 L 12 188 M 16 195 L 20 188" stroke={`url(#wave-gradient-${index})`} strokeWidth="2.5" strokeLinecap="round" className="animate-bounce"/>
                    </svg>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
                  {/* Step Number with Icon */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      {/* Main Circle with Number */}
                      <div className={`w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br ${step.color} rounded-full flex flex-col items-center justify-center shadow-xl relative z-10 ring-4 ring-white dark:ring-gray-900 transform transition-all duration-300 hover:scale-110`}>
                        <span className="text-2xl sm:text-3xl font-bold text-white mb-0.5">{step.number}</span>
                        <div className="w-12 h-12 flex items-center justify-center">
                          <step.icon className="w-8 h-8 text-white/90" />
                        </div>
                      </div>
                      {/* Glow Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-full blur-xl opacity-50 -z-10`}></div>
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1">
                      {/* Gradient Overlay on Hover */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl pointer-events-none`}></div>

                      <div className="relative z-10">
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {step.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-base sm:text-lg leading-relaxed">
                          {step.description}
                        </p>
                        <ul className="grid sm:grid-cols-2 gap-3">
                          {step.details.map((detail, idx) => (
                            <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                              <CheckCircleIcon className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2 flex-shrink-0" />
                              <span className="text-sm sm:text-base">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-gray-50 to-purple-50/30 dark:from-gray-800 dark:to-gray-900">
        <div className="container-custom px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 px-4">
              Why Choose MultiTask?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              {activeTab === 'client'
                ? 'Everything you need to find and hire great freelancers'
                : 'Everything you need to grow your freelance career'}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {currentBenefits.map((benefit, index) => (
              <div
                key={index}
                className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 text-center border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>

                <div className="relative z-10">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br ${benefit.color} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <benefit.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 dark:from-purple-900 dark:via-pink-900 dark:to-indigo-900"></div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container-custom relative z-10 text-center px-4 sm:px-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-white px-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 text-white/90 max-w-3xl mx-auto px-4">
            {activeTab === 'client'
              ? 'Post your first task and find the perfect freelancer today'
              : 'Create your profile and start finding great projects'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" className="bg-white hover:bg-gray-100 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all !text-purple-600 dark:!text-purple-700 w-full sm:w-auto">
                Sign Up Now
                <ArrowRightIcon className="w-5 h-5 ml-2 inline" />
              </Button>
            </Link>
            <Link to="/tasks" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white/20 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold backdrop-blur-sm w-full sm:w-auto">
                {activeTab === 'client' ? 'Browse Tasks' : 'Find Work'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
