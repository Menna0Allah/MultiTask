import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import taskService from '../../services/taskService';
import chatbotService from '../../services/chatbotService';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import {
  SparklesIcon,
  XMarkIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClockIcon,
  DocumentTextIcon,
  TagIcon,
  LightBulbIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const TaskCreate = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [listingType, setListingType] = useState('task_request');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    task_type: 'PHYSICAL',
    listing_type: 'task_request',
    budget: '',
    is_negotiable: true,
    location: '',
    city: '',
    is_remote: false,
    deadline: '',
    estimated_duration: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);

  // AI Chatbot
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  // Character limits
  const TITLE_MAX = 100;
  const DESCRIPTION_MAX = 2000;

  useEffect(() => {
    fetchCategories();
    loadDraft();
  }, []);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (formData.title || formData.description) {
        saveDraft();
      }
    }, 30000);

    return () => clearInterval(timer);
  }, [formData]);

  const fetchCategories = async () => {
    try {
      const data = await taskService.getCategories();
      const categoriesArray = Array.isArray(data) ? data : (data.results || []);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const saveDraft = useCallback(() => {
    setAutoSaving(true);
    localStorage.setItem('taskDraft', JSON.stringify(formData));
    setTimeout(() => setAutoSaving(false), 1000);
  }, [formData]);

  const loadDraft = () => {
    const draft = localStorage.getItem('taskDraft');
    if (draft) {
      try {
        const parsedDraft = JSON.parse(draft);
        if (parsedDraft.title || parsedDraft.description) {
          toast.success('Draft restored!', { icon: '📝' });
          setFormData(parsedDraft);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('taskDraft');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Enforce character limits
    if (name === 'title' && value.length > TITLE_MAX) return;
    if (name === 'description' && value.length > DESCRIPTION_MAX) return;

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title should be at least 10 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description should be at least 50 characters for better clarity';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.budget || formData.budget < 10) {
      newErrors.budget = 'Budget must be at least 10 EGP';
    }

    if (formData.task_type === 'PHYSICAL' && !formData.is_remote && !formData.location) {
      newErrors.location = 'Location is required for physical tasks';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      const task = await taskService.createTask(formData);
      clearDraft();
      toast.success('Task created successfully!', {
        icon: '🎉',
        duration: 4000,
      });

      // Navigate to task detail if ID is available, otherwise go to My Tasks
      if (task?.id) {
        navigate(`/tasks/${task.id}`);
      } else {
        // Fallback: navigate to My Tasks page
        navigate('/my-tasks');
      }
    } catch (error) {
      toast.error('Failed to create task. Please try again.');
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate form completion percentage
  const getFormProgress = () => {
    const fields = ['title', 'description', 'category', 'budget'];
    const completed = fields.filter(field => formData[field]).length;
    return Math.round((completed / fields.length) * 100);
  };

  // AI Chatbot Functions
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages([...chatMessages, { sender: 'USER', message: userMessage }]);

    try {
      setChatLoading(true);
      const response = await chatbotService.sendMessage(
        userMessage,
        chatSessionId,
        { current_page: 'task_create', user_type: 'CLIENT' }
      );

      setChatSessionId(response.session_id);
      setChatMessages([
        ...chatMessages,
        { sender: 'USER', message: userMessage },
        ...response.messages.filter(m => m.sender === 'BOT')
      ]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast.error('Failed to get response from AI');
    } finally {
      setChatLoading(false);
    }
  };

  const handleExtractTaskInfo = async () => {
    if (!chatSessionId) {
      toast.error('No conversation to extract from');
      return;
    }

    try {
      const response = await chatbotService.extractTaskInfo(chatSessionId);

      if (response.success && response.task_info) {
        const taskInfo = response.task_info;

        setFormData({
          ...formData,
          title: taskInfo.title || formData.title,
          description: taskInfo.description || formData.description,
          budget: taskInfo.budget || formData.budget,
          location: taskInfo.location || formData.location,
        });

        if (taskInfo.category) {
          const matchedCategory = categories.find(
            cat => cat.name.toLowerCase().includes(taskInfo.category.toLowerCase())
          );
          if (matchedCategory) {
            setFormData(prev => ({ ...prev, category: matchedCategory.id }));
          }
        }

        toast.success('Task information extracted successfully!');
        setShowChatbot(false);
      } else {
        toast.error('Could not extract task information');
      }
    } catch (error) {
      console.error('Extract error:', error);
      toast.error('Failed to extract task information');
    }
  };

  const handleListingTypeChange = (type) => {
    setListingType(type);
    setFormData({ ...formData, listing_type: type });
  };

  const progress = getFormProgress();

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen py-8">
      <div className="container-custom max-w-6xl px-4 sm:px-6">
        {/* Header Section */}
        <div className="mb-8">
          {/* Tab Switcher */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-xl bg-white dark:bg-gray-800 p-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleListingTypeChange('task_request')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  listingType === 'task_request'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Post a Task
              </button>
              <button
                onClick={() => handleListingTypeChange('service_offer')}
                className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  listingType === 'service_offer'
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md transform scale-105'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Offer a Service
              </button>
            </div>
          </div>

          {/* Title & Description */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {listingType === 'task_request' ? 'Post a New Task' : 'Offer Your Service'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {listingType === 'task_request'
                ? 'Describe your task in detail and connect with talented freelancers'
                : 'Showcase your expertise and attract potential clients'}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-2xl mx-auto mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Form Completion
              </span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Auto-save indicator */}
          {autoSaving && (
            <div className="text-center">
              <span className="inline-flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Draft saved</span>
              </span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Basic Information
                    </h2>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Task Title <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-xs font-medium ${
                        formData.title.length > TITLE_MAX * 0.9
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formData.title.length}/{TITLE_MAX}
                      </span>
                    </div>
                    <input
                      type="text"
                      name="title"
                      placeholder="e.g., Need a professional logo designer for tech startup"
                      value={formData.title}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.title
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                        <InformationCircleIcon className="w-4 h-4" />
                        <span>{errors.title}</span>
                      </p>
                    )}
                    {!errors.title && formData.title.length > 0 && formData.title.length < 10 && (
                      <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                        <InformationCircleIcon className="w-4 h-4" />
                        <span>Add {10 - formData.title.length} more characters for a better title</span>
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Description <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-xs font-medium ${
                        formData.description.length > DESCRIPTION_MAX * 0.9
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {formData.description.length}/{DESCRIPTION_MAX}
                      </span>
                    </div>
                    <textarea
                      name="description"
                      rows={8}
                      placeholder="Describe your task in detail. Include:&#10;• What you need done&#10;• Any specific requirements&#10;• Deliverables expected&#10;• Additional context or preferences"
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${
                        errors.description
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                        <InformationCircleIcon className="w-4 h-4" />
                        <span>{errors.description}</span>
                      </p>
                    )}
                    {!errors.description && formData.description.length > 0 && formData.description.length < 50 && (
                      <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                        <InformationCircleIcon className="w-4 h-4" />
                        <span>Add {50 - formData.description.length} more characters for better clarity</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8"></div>

                {/* Category & Type Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <TagIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Category & Type
                    </h2>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.category
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                        <InformationCircleIcon className="w-4 h-4" />
                        <span>{errors.category}</span>
                      </p>
                    )}
                  </div>

                  {/* Task Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Task Type <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                      {[
                        { value: 'PHYSICAL', label: 'Physical', desc: 'On-site work' },
                        { value: 'DIGITAL', label: 'Digital', desc: 'Remote work' },
                        { value: 'BOTH', label: 'Hybrid', desc: 'Both types' },
                        { value: 'ONE_TIME', label: 'One Time', desc: 'Single task' },
                        { value: 'RECURRING', label: 'Recurring', desc: 'Ongoing work' }
                      ].map((type) => (
                        <label
                          key={type.value}
                          className={`relative flex flex-col items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 group ${
                            formData.task_type === type.value
                              ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="task_type"
                            value={type.value}
                            checked={formData.task_type === type.value}
                            onChange={handleChange}
                            className="sr-only"
                          />
                          {formData.task_type === type.value && (
                            <CheckCircleIcon className="absolute top-2 right-2 w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                          <span className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {type.label}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
                            {type.desc}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8"></div>

                {/* Budget Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CurrencyDollarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Budget
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Budget (EGP) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">
                          EGP
                        </span>
                        <input
                          type="number"
                          name="budget"
                          placeholder="500"
                          value={formData.budget}
                          onChange={handleChange}
                          min="10"
                          className={`w-full pl-16 pr-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            errors.budget
                              ? 'border-red-500 dark:border-red-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          required
                        />
                      </div>
                      {errors.budget && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                          <InformationCircleIcon className="w-4 h-4" />
                          <span>{errors.budget}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-end">
                      <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all bg-white dark:bg-gray-700 w-full">
                        <input
                          type="checkbox"
                          name="is_negotiable"
                          checked={formData.is_negotiable}
                          onChange={handleChange}
                          className="w-5 h-5 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                            Negotiable
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Open to discuss pricing
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8"></div>

                {/* Location Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Location
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        placeholder="Cairo"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Specific Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        placeholder="Nasr City, New Cairo"
                        value={formData.location}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                          errors.location
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}
                      />
                      {errors.location && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center space-x-1">
                          <InformationCircleIcon className="w-4 h-4" />
                          <span>{errors.location}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all bg-white dark:bg-gray-700">
                    <input
                      type="checkbox"
                      name="is_remote"
                      checked={formData.is_remote}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 dark:text-blue-500 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white block">
                        This is a remote task
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Can be completed from anywhere
                      </span>
                    </div>
                  </label>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-8"></div>

                {/* Timeline Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Timeline
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Deadline
                      </label>
                      <input
                        type="datetime-local"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        <ClockIcon className="w-4 h-4 inline mr-1" />
                        Estimated Duration
                      </label>
                      <input
                        type="text"
                        name="estimated_duration"
                        placeholder="e.g., 2 hours, 3 days, 1 week"
                        value={formData.estimated_duration}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => navigate(-1)}
                    className="order-2 sm:order-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                    className="order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? 'Creating Task...' : 'Post Task'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* AI Assistant Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* AI Assistant Card */}
              <Card className="shadow-xl border border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 dark:bg-gray-800">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg">
                    <SparklesIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Assistant</h3>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Let our AI help you create the perfect task description with professional guidance!
                </p>

                <Button
                  variant="primary"
                  fullWidth
                  icon={SparklesIcon}
                  onClick={() => setShowChatbot(true)}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get AI Help
                </Button>
              </Card>

              {/* Pro Tips Card */}
              <Card className="shadow-xl border border-gray-200 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center space-x-2 mb-4">
                  <LightBulbIcon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pro Tips</h3>
                </div>

                <ul className="space-y-3">
                  {[
                    { icon: '📝', text: 'Write a clear, specific title that explains the task' },
                    { icon: '📋', text: 'Include all details, requirements & deliverables' },
                    { icon: '💰', text: 'Set a realistic budget based on market rates' },
                    { icon: '📍', text: 'Specify location for physical tasks' },
                    { icon: '⏰', text: 'Add deadlines for time-sensitive work' },
                    { icon: '✨', text: 'Use AI assistant for better descriptions' },
                  ].map((tip, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-lg flex-shrink-0">{tip.icon}</span>
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800 dark:bg-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Platform Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Response Time</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">2-4 hours</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Active Freelancers</span>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">10,000+</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* AI Chatbot Modal */}
        {showChatbot && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full h-[700px] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-700 animate-scale-in">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-purple-600 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur">
                      <SparklesIcon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">AI Task Assistant</h2>
                      <p className="text-sm text-blue-100">Powered by Gemini 2.5 Flash</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowChatbot(false)}
                    className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
                {chatMessages.length === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl mb-4">
                      <SparklesIcon className="w-16 h-16 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      Welcome! I'm your AI assistant
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      Tell me about the task you want to post, and I'll help you create a professional, detailed listing!
                    </p>
                  </div>
                )}

                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                  >
                    <div
                      className={`max-w-[85%] px-5 py-3 rounded-2xl shadow-md ${
                        msg.sender === 'USER'
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start animate-slide-up">
                    <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2.5 h-2.5 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                        <div className="w-2.5 h-2.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="flex space-x-3 mb-3">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleChatSend()}
                    placeholder="Type your message here..."
                    className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <Button
                    variant="primary"
                    onClick={handleChatSend}
                    disabled={chatLoading || !chatInput.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                  >
                    Send
                  </Button>
                </div>

                {chatSessionId && chatMessages.length > 0 && (
                  <Button
                    variant="success"
                    size="sm"
                    fullWidth
                    onClick={handleExtractTaskInfo}
                    icon={ArrowPathIcon}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    Apply to Form
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TaskCreate;
