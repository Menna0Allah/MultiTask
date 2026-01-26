import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';

const PrivacyPolicy = () => {
  const lastUpdated = 'January 4, 2026';

  const sections = [
    {
      icon: DocumentTextIcon,
      title: '1. Information We Collect',
      content: `We collect information that you provide directly to us, including:

      • Account information (name, email, password)
      • Profile information (bio, skills, location, phone number)
      • Payment information (processed securely through Stripe)
      • Communications and messages sent through our platform
      • Task and project information
      • User-generated content and feedback

      We also automatically collect certain information about your device and usage:
      • IP address and browser type
      • Device information and operating system
      • Usage data and analytics
      • Cookies and similar tracking technologies`,
    },
    {
      icon: LockClosedIcon,
      title: '2. How We Use Your Information',
      content: `We use the information we collect to:

      • Provide, maintain, and improve our services
      • Process transactions and send related information
      • Send you technical notices and support messages
      • Respond to your comments and questions
      • Match freelancers with relevant tasks using AI
      • Detect, prevent, and address fraud and security issues
      • Personalize your experience on the platform
      • Send marketing communications (with your consent)
      • Comply with legal obligations`,
    },
    {
      icon: UserGroupIcon,
      title: '3. Information Sharing',
      content: `We may share your information in the following circumstances:

      • With other users (profile information visible to matched users)
      • With service providers who help us operate our platform
      • With payment processors (Stripe) for transaction processing
      • When required by law or to protect rights and safety
      • In connection with a merger, sale, or acquisition
      • With your consent or at your direction

      We never sell your personal information to third parties.`,
    },
    {
      icon: EyeSlashIcon,
      title: '4. Your Privacy Rights',
      content: `You have the right to:

      • Access your personal information
      • Correct inaccurate or incomplete information
      • Delete your account and associated data
      • Object to or restrict certain processing activities
      • Data portability (receive your data in a structured format)
      • Withdraw consent for marketing communications
      • Opt-out of certain data collection practices

      To exercise these rights, please contact us at privacy@multitask.com`,
    },
    {
      icon: ShieldCheckIcon,
      title: '5. Data Security',
      content: `We implement appropriate technical and organizational measures to protect your personal information:

      • Encryption of data in transit and at rest
      • Regular security assessments and audits
      • Access controls and authentication requirements
      • Secure payment processing through PCI-compliant providers
      • Employee training on data protection

      However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.`,
    },
    {
      icon: GlobeAltIcon,
      title: '6. International Data Transfers',
      content: `Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place:

      • Standard contractual clauses approved by regulatory authorities
      • Adequacy decisions by relevant data protection authorities
      • Privacy Shield certification (where applicable)

      By using our services, you consent to the transfer of your information to these countries.`,
    },
    {
      icon: DocumentTextIcon,
      title: '7. Cookies and Tracking',
      content: `We use cookies and similar technologies to:

      • Maintain your session and preferences
      • Understand how you use our platform
      • Improve our services and user experience
      • Deliver relevant advertising

      You can control cookies through your browser settings. However, disabling cookies may limit your use of certain features.`,
    },
    {
      icon: LockClosedIcon,
      title: '8. Children\'s Privacy',
      content: `Our services are not directed to children under 13 (or 16 in the European Union). We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.`,
    },
    {
      icon: DocumentTextIcon,
      title: '9. Changes to This Policy',
      content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by:

      • Posting the new policy on this page
      • Updating the "Last Updated" date
      • Sending you an email notification (for significant changes)

      Your continued use of our services after changes become effective constitutes acceptance of the updated policy.`,
    },
    {
      icon: ShieldCheckIcon,
      title: '10. Contact Us',
      content: `If you have questions about this Privacy Policy or our data practices, please contact us:

      Email: privacy@multitask.com
      Address: [Your Company Address]
      Phone: [Your Phone Number]

      Data Protection Officer: dpo@multitask.com`,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white py-16">
        <div className="container-custom max-w-4xl px-4 sm:px-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <ShieldCheckIcon className="w-10 h-10" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-white/90 mb-2">Your privacy is important to us</p>
            <p className="text-sm text-white/70">Last Updated: {lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container-custom max-w-4xl px-4 sm:px-6 py-12">
        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 mb-8 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Introduction</h2>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
            Welcome to MultiTask. We respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our freelancing platform.
          </p>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Please read this Privacy Policy carefully. If you do not agree with the terms of this policy, please do not access or use our services.
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
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl">
                    <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
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

        {/* Footer Links */}
        <div className="mt-12 p-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 rounded-2xl border border-blue-200 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Related Documents</h3>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/terms"
              className="inline-flex items-center px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 border border-gray-200 dark:border-gray-600"
            >
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Terms of Service
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

export default PrivacyPolicy;
