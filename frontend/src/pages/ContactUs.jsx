import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import toast from 'react-hot-toast';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  PaperAirplaneIcon,
  QuestionMarkCircleIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // Simulate API call - In production, this would send to backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: '',
      });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const contactMethods = [
    {
      icon: EnvelopeIcon,
      title: 'Email Us',
      description: 'Our team will respond within 24 hours',
      value: 'support@multitask.com',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Available 24/7 via our AI assistant',
      value: 'Click the chat icon',
      color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    },
    {
      icon: ClockIcon,
      title: 'Business Hours',
      description: 'Monday - Friday',
      value: '9:00 AM - 6:00 PM (EET)',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
  ];

  const categories = [
    { value: '', label: 'Select a category' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'account', label: 'Account Issues' },
    { value: 'payment', label: 'Payment & Billing' },
    { value: 'technical', label: 'Technical Support' },
    { value: 'feedback', label: 'Feedback & Suggestions' },
    { value: 'partnership', label: 'Business & Partnership' },
    { value: 'other', label: 'Other' },
  ];

  const quickLinks = [
    { icon: QuestionMarkCircleIcon, title: 'FAQ', description: 'Find answers to common questions', link: '/faq' },
    { icon: UserGroupIcon, title: 'Community', description: 'Join our freelancer community', link: '/freelancers' },
    { icon: BriefcaseIcon, title: 'Browse Tasks', description: 'Explore available opportunities', link: '/tasks' },
    { icon: ShieldCheckIcon, title: 'Trust & Safety', description: 'Learn about our security measures', link: '/terms' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-purple-600 to-blue-600 dark:from-primary-700 dark:via-purple-700 dark:to-blue-700 py-20">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10 px-6 md:px-8 lg:px-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Have questions or need help? We're here for you. Reach out and our team will get back to you as soon as possible.
          </p>
        </div>
      </div>

      <div className="container-custom py-12 px-6 md:px-8 lg:px-12">
        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 -mt-16 relative z-20 mb-12">
          {contactMethods.map((method, idx) => (
            <Card key={idx} className="dark:bg-gray-800 dark:border dark:border-gray-700 text-center shadow-xl">
              <div className={`w-14 h-14 ${method.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                <method.icon className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                {method.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {method.description}
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                {method.value}
              </p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 shadow-xl">
              <div className="border-b border-gray-200 dark:border-gray-700 pb-5 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <PaperAirplaneIcon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  Send Us a Message
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Fill out the form below and we'll respond within 24 hours
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <Input
                    label="Your Name"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Subject"
                    name="subject"
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    rows={6}
                    placeholder="Tell us more about your inquiry..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    We typically respond within 24 hours
                  </p>
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    icon={PaperAirplaneIcon}
                    className="px-8"
                  >
                    Send Message
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                Quick Links
              </h3>
              <div className="space-y-3">
                {quickLinks.map((link, idx) => (
                  <Link
                    key={idx}
                    to={link.link}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <link.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {link.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {link.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Office Info */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border-2 border-primary-200 dark:border-primary-700">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Our Office
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>MultiTask Headquarters</strong>
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  123 Innovation Street<br />
                  Cairo, Egypt 11511
                </p>
                <div className="pt-3 border-t border-primary-200 dark:border-primary-700">
                  <p className="text-gray-600 dark:text-gray-400">
                    <PhoneIcon className="w-4 h-4 inline mr-2" />
                    +20 123 456 7890
                  </p>
                </div>
              </div>
            </Card>

            {/* Response Time */}
            <Card className="dark:bg-gray-800 dark:border dark:border-gray-700">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ClockIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                  Fast Response Time
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Average response time: <span className="font-semibold text-green-600">4 hours</span>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
