import React from 'react';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  ScaleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ShieldExclamationIcon,
  BellAlertIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

const TermsOfService = () => {
  const lastUpdated = 'January 4, 2026';

  const sections = [
    {
      icon: DocumentTextIcon,
      title: '1. Acceptance of Terms',
      content: `By accessing and using MultiTask ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.

      These terms apply to all users, including but not limited to freelancers, clients, visitors, and contributors.

      We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.`,
    },
    {
      icon: UserGroupIcon,
      title: '2. User Accounts',
      content: `To use certain features, you must create an account. You agree to:

      • Provide accurate, current, and complete information
      • Maintain the security of your password
      • Notify us immediately of any unauthorized access
      • Be responsible for all activities under your account
      • Not share your account with others
      • Be at least 18 years old (or legal age in your jurisdiction)

      We reserve the right to suspend or terminate accounts that violate these terms.`,
    },
    {
      icon: CheckBadgeIcon,
      title: '3. User Responsibilities',
      content: `As a user of MultiTask, you agree to:

      • Provide honest and accurate information in your profile
      • Communicate professionally with other users
      • Complete projects as agreed upon
      • Pay for services rendered (if you're a client)
      • Deliver quality work (if you're a freelancer)
      • Not engage in fraudulent or deceptive practices
      • Respect intellectual property rights
      • Comply with all applicable laws and regulations`,
    },
    {
      icon: CurrencyDollarIcon,
      title: '4. Payment Terms',
      content: `Freelancers and Clients agree to:

      • All payments are processed through Stripe
      • MultiTask charges a platform fee on transactions
      • Clients must fund escrow before work begins
      • Payments are released upon client approval
      • Refunds are subject to our dispute resolution process
      • Users are responsible for their own taxes
      • Currency conversion rates may apply

      Detailed fee structures are available on our Pricing page.`,
    },
    {
      icon: ScaleIcon,
      title: '5. Dispute Resolution',
      content: `In case of disputes between users:

      • First, attempt to resolve directly with the other party
      • If unresolved, contact our support team
      • We may mediate disputes but are not obligated to
      • Our decision in disputes is final
      • Disputed funds may be held in escrow pending resolution
      • Legal action should be a last resort

      Users agree to binding arbitration for disputes with MultiTask itself, except where prohibited by law.`,
    },
    {
      icon: ExclamationTriangleIcon,
      title: '6. Prohibited Activities',
      content: `You may not use our Platform to:

      • Post false, misleading, or fraudulent content
      • Harass, threaten, or defame other users
      • Violate intellectual property rights
      • Circumvent platform fees
      • Spam or send unsolicited messages
      • Hack, compromise, or disrupt the Platform
      • Use automated systems or bots
      • Engage in illegal activities
      • Discriminate based on protected characteristics
      • Solicit users to transact outside the Platform

      Violations may result in account suspension or termination.`,
    },
    {
      icon: ShieldExclamationIcon,
      title: '7. Intellectual Property',
      content: `• The Platform and its content are owned by MultiTask
      • Users retain ownership of their work and content
      • By posting content, you grant us a license to display it
      • Freelancers must have rights to any work delivered
      • Clients receive agreed-upon rights as per project terms
      • Trademark and copyright infringement is prohibited
      • DMCA takedown requests will be processed

      Report intellectual property violations to legal@multitask.com`,
    },
    {
      icon: BellAlertIcon,
      title: '8. Liability and Disclaimers',
      content: `THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND.

      • We do not guarantee continuous, error-free operation
      • We are not responsible for user-generated content
      • We do not guarantee work quality or project outcomes
      • Users interact at their own risk
      • We are not liable for indirect or consequential damages
      • Our liability is limited to fees paid in the last 12 months
      • Some jurisdictions do not allow liability limitations

      Users are independent contractors, not our employees.`,
    },
    {
      icon: DocumentTextIcon,
      title: '9. Termination',
      content: `We may suspend or terminate your account if you:

      • Violate these Terms of Service
      • Engage in fraudulent activity
      • Receive multiple complaints from users
      • Fail to pay platform fees
      • Remain inactive for an extended period

      You may terminate your account at any time through your settings.

      Upon termination:
      • You lose access to your account
      • Outstanding payments must be settled
      • Pending projects must be completed or cancelled
      • Some data may be retained as required by law`,
    },
    {
      icon: ScaleIcon,
      title: '10. Governing Law',
      content: `These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.

      Any legal action must be brought in courts located in [Your Location].

      If any provision is found unenforceable, the remaining provisions remain in effect.

      These Terms constitute the entire agreement between you and MultiTask.`,
    },
    {
      icon: DocumentTextIcon,
      title: '11. Contact Information',
      content: `Questions about these Terms? Contact us:

      Email: legal@multitask.com
      Address: [Your Company Address]
      Phone: [Your Phone Number]

      For support inquiries: support@multitask.com
      For privacy concerns: privacy@multitask.com`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 text-white py-16">
        <div className="container-custom max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <ScaleIcon className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-white/90 mb-2">Please read these terms carefully</p>
            <p className="text-sm text-white/70">Last Updated: {lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom max-w-4xl px-4 sm:px-6 py-12">
        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Welcome to MultiTask</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            These Terms of Service ("Terms") govern your use of the MultiTask platform, a marketplace connecting clients with freelancers for various projects and services.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            By using MultiTask, you agree to be bound by these Terms. If you do not agree, please do not use our services. We may update these Terms periodically, and your continued use constitutes acceptance of any changes.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-xl">
                    <IconComponent className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{section.title}</h2>
                </div>
                <div className="text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-line pl-16">
                  {section.content}
                </div>
              </div>
            );
          })}
        </div>

        {/* Important Notice */}
        <div className="mt-12 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-300 dark:border-amber-700">
          <div className="flex items-start gap-4">
            <ExclamationTriangleIcon className="w-8 h-8 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Important Notice</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                By using MultiTask, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy. These terms form a legally binding agreement between you and MultiTask.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 p-8 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-indigo-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Documents</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/privacy"
              className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 border border-gray-200 dark:border-gray-600"
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Privacy Policy
            </Link>
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 border border-gray-200 dark:border-gray-600"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
