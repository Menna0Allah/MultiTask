import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  SparklesIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  HeartIcon,
  GlobeAltIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BriefcaseIcon,
  StarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

const AboutUs = () => {
  const stats = [
    { value: '10K+', label: 'Active Users', icon: UserGroupIcon },
    { value: '25K+', label: 'Tasks Completed', icon: CheckCircleIcon },
    { value: '4.8', label: 'Average Rating', icon: StarIcon },
    { value: '1M+', label: 'EGP Transacted', icon: CurrencyDollarIcon },
  ];

  const values = [
    {
      icon: ShieldCheckIcon,
      title: 'Trust & Security',
      description: 'We prioritize the safety of our users with secure payments, verified profiles, and a robust review system.',
    },
    {
      icon: HeartIcon,
      title: 'Community First',
      description: 'Our platform is built around a supportive community where freelancers and clients thrive together.',
    },
    {
      icon: LightBulbIcon,
      title: 'Innovation',
      description: 'We leverage AI and modern technology to create seamless experiences and smart recommendations.',
    },
    {
      icon: GlobeAltIcon,
      title: 'Accessibility',
      description: 'Everyone deserves opportunities. We make it easy for anyone to find work or get things done.',
    },
  ];

  const team = [
    {
      name: 'MultiTask Team',
      role: 'Development & Operations',
      description: 'A dedicated team of developers, designers, and support specialists working to make MultiTask the best platform for freelancers and clients.',
    },
  ];

  const milestones = [
    { year: '2024', event: 'MultiTask Founded', description: 'Started with a vision to connect local talent with opportunities' },
    { year: '2024', event: 'Platform Launch', description: 'Launched the beta version with core features' },
    { year: '2025', event: 'AI Integration', description: 'Added AI-powered chatbot and smart recommendations' },
    { year: '2025', event: 'Payment System', description: 'Integrated Stripe for secure escrow payments' },
    { year: '2026', event: 'Growing Community', description: 'Expanding to serve thousands of users nationwide' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-blue-600 dark:from-primary-700 dark:via-purple-700 dark:to-blue-700 py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10 px-6 md:px-8 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
            <SparklesIcon className="w-5 h-5" />
            Our Story
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Connecting Talent with<br />Opportunity
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            MultiTask is a revolutionary platform that bridges the gap between skilled freelancers
            and clients who need their expertise. We're building a community where anyone can
            find work or get things done.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 shadow-xl">
                Join Our Community
              </Button>
            </Link>
            <Link to="/tasks">
              <Button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-semibold px-8 py-3 border border-white/30">
                Browse Tasks
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container-custom px-6 md:px-8 lg:px-12 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="dark:bg-gray-800 dark:border dark:border-gray-700 text-center shadow-xl">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission Section */}
      <div className="container-custom py-20 px-6 md:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
              <RocketLaunchIcon className="w-4 h-4" />
              Our Mission
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Empowering People to Achieve More
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              We believe everyone has valuable skills to offer. MultiTask was created to give
              freelancers a platform to showcase their talents and find meaningful work, while
              helping clients connect with the right people for their projects.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Whether you're a student looking for your first gig, a professional seeking
              side projects, or a business owner needing help, MultiTask is here to make
              it happen.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/freelancers">
                <Button variant="primary" icon={UserGroupIcon}>
                  Find Freelancers
                </Button>
              </Link>
              <Link to="/how-it-works">
                <Button variant="outline" icon={ArrowRightIcon}>
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
            <Card className="relative dark:bg-gray-800 dark:border dark:border-gray-700 shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      Easy to Get Started
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Create your account in minutes and start browsing opportunities immediately.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ShieldCheckIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      Secure Payments
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our escrow system ensures freelancers get paid and clients get quality work.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                      AI-Powered Matching
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Our smart system recommends the best tasks and freelancers for your needs.
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="bg-white dark:bg-gray-800 py-20">
        <div className="container-custom px-6 md:px-8 lg:px-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
              <HeartIcon className="w-4 h-4" />
              Our Values
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              What We Stand For
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              These core values guide everything we do at MultiTask
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, idx) => (
              <Card key={idx} className="dark:bg-gray-700 dark:border dark:border-gray-600 text-center h-full">
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <value.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {value.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="container-custom py-20 px-6 md:px-8 lg:px-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-700 dark:text-primary-400 text-sm font-medium mb-4">
            <RocketLaunchIcon className="w-4 h-4" />
            Our Journey
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            The MultiTask Story
          </h2>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-purple-600"></div>

            <div className="space-y-8">
              {milestones.map((milestone, idx) => (
                <div key={idx} className="relative flex gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm z-10 shadow-lg flex-shrink-0">
                    {milestone.year}
                  </div>
                  <Card className="flex-1 dark:bg-gray-800 dark:border dark:border-gray-700">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                      {milestone.event}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {milestone.description}
                    </p>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-primary-600 via-purple-600 to-blue-600 dark:from-primary-700 dark:via-purple-700 dark:to-blue-700 py-20">
        <div className="container-custom px-6 md:px-8 lg:px-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Join thousands of users who are already finding success on MultiTask
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register">
              <Button className="bg-white text-primary-600 hover:bg-gray-100 font-semibold px-8 py-3 shadow-xl">
                Create Free Account
              </Button>
            </Link>
            <Link to="/contact">
              <Button className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 font-semibold px-8 py-3 border border-white/30">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
