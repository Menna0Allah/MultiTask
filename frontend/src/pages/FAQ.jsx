import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  QuestionMarkCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  UserIcon,
  BriefcaseIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CogIcon,
} from '@heroicons/react/24/outline';

const FAQ = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openItems, setOpenItems] = useState({});

  const categories = [
    { id: 'all', label: 'All Questions', icon: QuestionMarkCircleIcon },
    { id: 'getting-started', label: 'Getting Started', icon: UserIcon },
    { id: 'tasks', label: 'Tasks & Projects', icon: BriefcaseIcon },
    { id: 'payments', label: 'Payments', icon: CreditCardIcon },
    { id: 'security', label: 'Trust & Safety', icon: ShieldCheckIcon },
    { id: 'account', label: 'Account', icon: CogIcon },
  ];

  const faqItems = [
    // Getting Started
    {
      id: 1,
      category: 'getting-started',
      question: 'How do I create an account on MultiTask?',
      answer: 'Creating an account is easy! Click the "Sign Up" button, fill in your details (name, email, password), choose whether you\'re a client or freelancer, and verify your email. You can also sign up quickly using your Google account.',
    },
    {
      id: 2,
      category: 'getting-started',
      question: 'What\'s the difference between a Client and Freelancer account?',
      answer: 'Clients post tasks and hire freelancers to complete them. Freelancers browse tasks and apply to work on them. You can also choose "Both" if you want to do both - post tasks as a client and apply for work as a freelancer.',
    },
    {
      id: 3,
      category: 'getting-started',
      question: 'Is it free to create an account?',
      answer: 'Yes! Creating an account on MultiTask is completely free. There are no subscription fees. We only charge a small platform fee (15%) when a task is successfully completed and payment is processed.',
    },
    {
      id: 4,
      category: 'getting-started',
      question: 'How do I complete my profile?',
      answer: 'Go to your Profile page and fill in your bio, skills, location, and contact information. If you\'re a freelancer, add portfolio items to showcase your work. A complete profile increases your chances of being hired.',
    },

    // Tasks & Projects
    {
      id: 5,
      category: 'tasks',
      question: 'How do I post a task?',
      answer: 'Click "Post a Task" from your dashboard. Fill in the task title, description, category, budget, deadline, and required skills. You can also upload images to better describe what you need. Once posted, freelancers can start applying.',
    },
    {
      id: 6,
      category: 'tasks',
      question: 'How do I apply for a task?',
      answer: 'Browse the Tasks page, find a task that matches your skills, click on it to view details, then click "Apply Now". Write a compelling proposal explaining why you\'re the best fit and suggest your price. The client will review applications and choose.',
    },
    {
      id: 7,
      category: 'tasks',
      question: 'What happens after my application is accepted?',
      answer: 'Once accepted, the client deposits funds into escrow (secure holding). You can start working on the task and communicate with the client through our messaging system. When the task is complete, mark it as done and the payment is released to you.',
    },
    {
      id: 8,
      category: 'tasks',
      question: 'Can I cancel a task after starting it?',
      answer: 'Yes, but cancellations should be avoided when possible. If you need to cancel, contact the client first to discuss. Depending on the situation, funds may be returned to the client or split. Frequent cancellations may affect your rating.',
    },
    {
      id: 9,
      category: 'tasks',
      question: 'What types of tasks can I post or find?',
      answer: 'MultiTask supports both physical tasks (cleaning, delivery, repairs) and digital tasks (design, programming, writing). You can specify the task type and location requirements when posting.',
    },

    // Payments
    {
      id: 10,
      category: 'payments',
      question: 'How does the payment system work?',
      answer: 'We use an escrow system for secure payments. When a client accepts a freelancer, they deposit the agreed amount into escrow. Once the task is completed and both parties are satisfied, funds are released to the freelancer minus our 15% platform fee.',
    },
    {
      id: 11,
      category: 'payments',
      question: 'How do I receive payments as a freelancer?',
      answer: 'You need to connect a Stripe account to receive payments. Go to Profile > Payments and click "Connect Stripe Account". Follow the setup process (takes about 5 minutes). Once connected, completed task payments are automatically deposited.',
    },
    {
      id: 12,
      category: 'payments',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, bank transfers, and other payment methods supported by Stripe. Payment options may vary by country.',
    },
    {
      id: 13,
      category: 'payments',
      question: 'How long does it take to receive payment?',
      answer: 'After a task is marked complete and approved, funds are released immediately to your Stripe account. Transfer to your bank typically takes 2-3 business days depending on your bank.',
    },
    {
      id: 14,
      category: 'payments',
      question: 'What is the platform fee?',
      answer: 'MultiTask charges a 15% platform fee on completed tasks. This fee is deducted from the freelancer\'s payment. For example, if a task pays 100 EGP, the freelancer receives 85 EGP.',
    },

    // Trust & Safety
    {
      id: 15,
      category: 'security',
      question: 'Is my payment information secure?',
      answer: 'Yes! We use Stripe for payment processing, which is PCI-DSS compliant and uses industry-leading security. We never store your full card details on our servers.',
    },
    {
      id: 16,
      category: 'security',
      question: 'How do reviews and ratings work?',
      answer: 'After a task is completed, both client and freelancer can leave reviews (1-5 stars with optional comments). Reviews are public and help build trust. Be honest and constructive in your feedback.',
    },
    {
      id: 17,
      category: 'security',
      question: 'What if there\'s a dispute?',
      answer: 'If there\'s a disagreement, first try to resolve it with the other party through messaging. If that doesn\'t work, contact our support team. We\'ll review the case and help mediate a fair resolution.',
    },
    {
      id: 18,
      category: 'security',
      question: 'How do I report a problem user?',
      answer: 'If you encounter inappropriate behavior, contact our support team with details. We take all reports seriously and will investigate. Users violating our terms may be suspended or banned.',
    },

    // Account
    {
      id: 19,
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Go to Profile > Password tab. Enter your current password and your new password twice. Click "Update Password". If you forgot your password, use the "Forgot Password" link on the login page.',
    },
    {
      id: 20,
      category: 'account',
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account from the Profile settings. Note that this action is permanent and will remove all your data, tasks, and reviews. Make sure to complete any ongoing tasks first.',
    },
    {
      id: 21,
      category: 'account',
      question: 'How do I verify my email?',
      answer: 'After registration, we send a verification link to your email. Click the link to verify. If you didn\'t receive it, check your spam folder or request a new link from your dashboard.',
    },
    {
      id: 22,
      category: 'account',
      question: 'Can I change my username or email?',
      answer: 'Username cannot be changed after registration. Email can be updated from Profile settings, but you\'ll need to verify the new email address.',
    },
  ];

  const toggleItem = (id) => {
    setOpenItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredItems = faqItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-blue-600 dark:from-primary-700 dark:via-purple-700 dark:to-blue-700 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10 px-6 md:px-8 lg:px-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
            <QuestionMarkCircleIcon className="w-5 h-5" />
            Help Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Find answers to common questions about MultiTask
          </p>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-lg border-0 shadow-xl focus:ring-4 focus:ring-white/30 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-12 px-6 md:px-8 lg:px-12">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 -mt-8 relative z-20">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow'
              }`}
            >
              <cat.icon className="w-5 h-5" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto">
          {filteredItems.length === 0 ? (
            <Card className="dark:bg-gray-800 text-center py-12">
              <QuestionMarkCircleIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                We couldn't find any questions matching your search.
              </p>
              <Button onClick={() => { setSearchQuery(''); setActiveCategory('all'); }} variant="outline">
                Clear Filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="dark:bg-gray-800 dark:border dark:border-gray-700 overflow-hidden"
                  padding={false}
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 dark:text-white pr-4">
                      {item.question}
                    </span>
                    {openItems[item.id] ? (
                      <ChevronUpIcon className="w-5 h-5 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openItems[item.id] && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Still Need Help */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-2 border-primary-200 dark:border-primary-700 text-center">
            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChatBubbleLeftRightIcon className="w-8 h-8 text-primary-600 dark:text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button variant="primary">
                  Contact Support
                </Button>
              </Link>
              <Button variant="outline" onClick={() => {
                // Trigger chatbot
                const chatButton = document.querySelector('[data-chatbot-trigger]');
                if (chatButton) chatButton.click();
              }}>
                Chat with AI Assistant
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
