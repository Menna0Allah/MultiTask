import React, { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';

const TaskCreate = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [listingType, setListingType] = useState('task_request'); // 'task_request' or 'service_offer'
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
  
  // AI Chatbot
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSessionId, setChatSessionId] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await taskService.getCategories();
      // Handle both array and object responses
      const categoriesArray = Array.isArray(data) ? data : (data.results || []);
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // Clear error for this field
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
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
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
      toast.error('Please fix the errors');
      return;
    }

    try {
      setLoading(true);
      const task = await taskService.createTask(formData);
      toast.success('Task created successfully!');
      navigate(`/tasks/${task.id}`);
    } catch (error) {
      toast.error('Failed to create task');
      console.error('Error creating task:', error);
    } finally {
      setLoading(false);
    }
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
        
        // Update form with extracted info
        setFormData({
          ...formData,
          title: taskInfo.title || formData.title,
          description: taskInfo.description || formData.description,
          budget: taskInfo.budget || formData.budget,
          location: taskInfo.location || formData.location,
        });

        // Try to match category
        if (taskInfo.category) {
          const matchedCategory = categories.find(
            cat => cat.name.toLowerCase().includes(taskInfo.category.toLowerCase())
          );
          if (matchedCategory) {
            setFormData(prev => ({ ...prev, category: matchedCategory.id }));
          }
        }

        toast.success('Task information extracted!');
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

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen py-8">
      <div className="container-custom max-w-4xl px-6">
        {/* Tab Switcher */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
              <button
                onClick={() => handleListingTypeChange('task_request')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  listingType === 'task_request'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Post a Task
              </button>
              <button
                onClick={() => handleListingTypeChange('service_offer')}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  listingType === 'service_offer'
                    ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-md'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Offer a Service
              </button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {listingType === 'task_request' ? 'Post a New Task' : 'Offer Your Service'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {listingType === 'task_request'
                ? 'Describe your task and find the perfect freelancer'
                : 'Showcase your skills and attract clients'}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <Input
                  label="Task Title"
                  name="title"
                  placeholder="e.g., Need a house cleaner for 3-bedroom apartment"
                  value={formData.title}
                  onChange={handleChange}
                  error={errors.title}
                  required
                />

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={6}
                    placeholder="Describe your task in detail..."
                    value={formData.description}
                    onChange={handleChange}
                    className={`textarea-field ${errors.description ? 'input-error' : ''}`}
                    required
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`input-field ${errors.category ? 'input-error' : ''}`}
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
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {['PHYSICAL', 'DIGITAL', 'BOTH'].map((type) => (
                      <label
                        key={type}
                        className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition ${
                          formData.task_type === type
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="task_type"
                          value={type}
                          checked={formData.task_type === type}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <span className="font-medium text-gray-900">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Budget (EGP)"
                    name="budget"
                    type="number"
                    placeholder="500"
                    value={formData.budget}
                    onChange={handleChange}
                    error={errors.budget}
                    required
                  />

                  <div className="flex items-end">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_negotiable"
                        checked={formData.is_negotiable}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary-600 rounded"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Negotiable
                      </span>
                    </label>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      name="city"
                      placeholder="Cairo"
                      value={formData.city}
                      onChange={handleChange}
                    />

                    <Input
                      label="Location"
                      name="location"
                      placeholder="Nasr City"
                      value={formData.location}
                      onChange={handleChange}
                      error={errors.location}
                    />
                  </div>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_remote"
                      checked={formData.is_remote}
                      onChange={handleChange}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      This is a remote task
                    </span>
                  </label>
                </div>

                {/* Deadline & Duration */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Deadline"
                    name="deadline"
                    type="datetime-local"
                    value={formData.deadline}
                    onChange={handleChange}
                  />

                  <Input
                    label="Estimated Duration"
                    name="estimated_duration"
                    placeholder="e.g., 2 hours, 3 days"
                    value={formData.estimated_duration}
                    onChange={handleChange}
                  />
                </div>

                {/* Submit */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    fullWidth
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={loading}
                  >
                    Post Task
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* AI Assistant Sidebar */}
          <div>
            <Card className="sticky top-24">
              <div className="flex items-center space-x-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-900">AI Assistant</h3>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Let our AI help you create the perfect task description!
              </p>

              <Button
                variant="primary"
                fullWidth
                icon={SparklesIcon}
                onClick={() => setShowChatbot(true)}
              >
                Get AI Help
              </Button>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Tips:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Be specific about what you need</li>
                  <li>• Include deadline if time-sensitive</li>
                  <li>• Set a realistic budget</li>
                  <li>• Mention any special requirements</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>

        {/* AI Chatbot Modal */}
        {showChatbot && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full h-[600px] flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="w-6 h-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">AI Task Assistant</h2>
                </div>
                <button
                  onClick={() => setShowChatbot(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <SparklesIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Hi! I'm your AI assistant. Tell me about the task you want to post!</p>
                  </div>
                )}

                {chatMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        msg.sender === 'USER'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    </div>
                  </div>
                ))}

                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChatSend()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button
                    variant="primary"
                    onClick={handleChatSend}
                    disabled={chatLoading || !chatInput.trim()}
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
                  >
                    Extract Task Info
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCreate;