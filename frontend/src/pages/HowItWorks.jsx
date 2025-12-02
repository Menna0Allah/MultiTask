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
        'Add any relevant files or references',
      ],
    },
    {
      number: 2,
      icon: MagnifyingGlassIcon,
      title: 'Review Applications',
      description: 'Receive applications from qualified freelancers. Review their profiles, ratings, portfolios, and proposed approaches.',
      details: [
        'Browse freelancer profiles',
        'Check ratings and reviews',
        'Compare proposals and prices',
        'Ask questions before hiring',
      ],
    },
    {
      number: 3,
      icon: UserIcon,
      title: 'Choose Your Freelancer',
      description: 'Select the best freelancer for your project based on their skills, experience, and proposal.',
      details: [
        'Compare multiple candidates',
        'Review past work samples',
        'Confirm availability',
        'Finalize project details',
      ],
    },
    {
      number: 4,
      icon: ChatBubbleLeftRightIcon,
      title: 'Collaborate & Communicate',
      description: 'Work together through our platform. Track progress, share files, and communicate in real-time.',
      details: [
        'Built-in messaging system',
        'Share files securely',
        'Track project milestones',
        'Provide feedback',
      ],
    },
    {
      number: 5,
      icon: CheckCircleIcon,
      title: 'Review & Approve',
      description: 'Review the completed work and request revisions if needed. Approve when you\'re satisfied.',
      details: [
        'Review deliverables',
        'Request revisions if needed',
        'Approve final work',
        'Mark task as complete',
      ],
    },
    {
      number: 6,
      icon: CurrencyDollarIcon,
      title: 'Pay Securely',
      description: 'Release payment securely through our platform. Rate your experience and leave a review.',
      details: [
        'Secure payment processing',
        'Protected transactions',
        'Rate the freelancer',
        'Build your reputation',
      ],
    },
  ];

  const freelancerSteps = [
    {
      number: 1,
      icon: UserIcon,
      title: 'Create Your Profile',
      description: 'Build a professional profile showcasing your skills, experience, portfolio, and expertise.',
      details: [
        'Add your skills and expertise',
        'Upload portfolio samples',
        'Set your hourly rate',
        'Complete verification',
      ],
    },
    {
      number: 2,
      icon: MagnifyingGlassIcon,
      title: 'Find Perfect Tasks',
      description: 'Browse available tasks or get AI-powered recommendations based on your skills and preferences.',
      details: [
        'Browse task categories',
        'Get personalized recommendations',
        'Filter by budget and deadline',
        'Save interesting tasks',
      ],
    },
    {
      number: 3,
      icon: ClipboardDocumentListIcon,
      title: 'Submit Your Proposal',
      description: 'Apply to tasks that match your skills. Write a compelling proposal explaining your approach.',
      details: [
        'Craft a tailored proposal',
        'Highlight relevant experience',
        'Set your price',
        'Include timeline estimate',
      ],
    },
    {
      number: 4,
      icon: BriefcaseIcon,
      title: 'Get Hired',
      description: 'Once selected, confirm project details with the client and begin working.',
      details: [
        'Review project requirements',
        'Clarify any questions',
        'Set clear expectations',
        'Start working',
      ],
    },
    {
      number: 5,
      icon: RocketLaunchIcon,
      title: 'Deliver Great Work',
      description: 'Complete the task to the best of your ability. Communicate regularly and meet deadlines.',
      details: [
        'Follow project guidelines',
        'Provide regular updates',
        'Meet agreed deadlines',
        'Deliver quality work',
      ],
    },
    {
      number: 6,
      icon: StarIcon,
      title: 'Get Paid & Reviewed',
      description: 'Receive payment after client approval. Build your reputation with positive reviews.',
      details: [
        'Get paid securely',
        'Receive client feedback',
        'Build your rating',
        'Grow your business',
      ],
    },
  ];

  const benefits = {
    client: [
      {
        icon: ShieldCheckIcon,
        title: 'Verified Professionals',
        description: 'All freelancers are verified and rated by previous clients',
      },
      {
        icon: CurrencyDollarIcon,
        title: 'Secure Payments',
        description: 'Payment protection with escrow system for your peace of mind',
      },
      {
        icon: SparklesIcon,
        title: 'AI Matching',
        description: 'Our smart algorithm connects you with the perfect freelancers',
      },
      {
        icon: ChatBubbleLeftRightIcon,
        title: '24/7 Support',
        description: 'Our dedicated support team is always here to help you',
      },
    ],
    freelancer: [
      {
        icon: BriefcaseIcon,
        title: 'Quality Projects',
        description: 'Access to thousands of high-quality tasks across all categories',
      },
      {
        icon: SparklesIcon,
        title: 'Smart Recommendations',
        description: 'AI-powered task recommendations based on your skills',
      },
      {
        icon: CurrencyDollarIcon,
        title: 'Fair Payment',
        description: 'Competitive rates and guaranteed secure payment system',
      },
      {
        icon: StarIcon,
        title: 'Build Reputation',
        description: 'Grow your freelance career with reviews and ratings',
      },
    ],
  };

  const currentSteps = activeTab === 'client' ? clientSteps : freelancerSteps;
  const currentBenefits = benefits[activeTab];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 text-white py-20">
        <div className="container-custom px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              How MultiTask Works
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8">
              Your complete guide to getting things done with MultiTask - whether you're hiring or working
            </p>
          </div>
        </div>
      </section>

      {/* Tab Switcher */}
      <section className="py-8 bg-gray-100 dark:bg-gray-800 sticky top-16 z-40 shadow-sm">
        <div className="container-custom px-6">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('client')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'client'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              I'm a Client
            </button>
            <button
              onClick={() => setActiveTab('freelancer')}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'freelancer'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              I'm a Freelancer
            </button>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container-custom px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {activeTab === 'client' ? 'How to Hire on MultiTask' : 'How to Work on MultiTask'}
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {activeTab === 'client'
                ? 'Follow these simple steps to find and hire the perfect freelancer'
                : 'Follow these simple steps to find work and grow your freelance career'}
            </p>
          </div>

          <div className="space-y-12">
            {currentSteps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row gap-8 items-start ${
                  index % 2 === 1 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Step Number and Icon */}
                <div className={`flex-shrink-0 w-full md:w-auto ${index % 2 === 1 ? 'md:ml-8' : 'md:mr-8'}`}>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                      {step.number}
                    </div>
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-center text-gray-700 dark:text-gray-300">
                          <CheckCircleIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-2 flex-shrink-0" />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-800">
        <div className="container-custom px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose MultiTask?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              {activeTab === 'client'
                ? 'Everything you need to find and hire great freelancers'
                : 'Everything you need to grow your freelance career'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {currentBenefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-shadow"
              >
                <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600 dark:bg-primary-700 text-white">
        <div className="container-custom px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            {activeTab === 'client'
              ? 'Post your first task and find the perfect freelancer today'
              : 'Create your profile and start finding great projects'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
                Sign Up Now
              </Button>
            </Link>
            <Link to={activeTab === 'client' ? '/tasks' : '/tasks'}>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                {activeTab === 'client' ? 'Browse Freelancers' : 'Browse Tasks'}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
