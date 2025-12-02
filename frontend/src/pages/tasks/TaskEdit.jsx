import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import taskService from '../../services/taskService';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const TaskEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [task, setTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    task_type: 'PHYSICAL',
    budget: '',
    is_negotiable: true,
    location: '',
    city: '',
    is_remote: false,
    deadline: '',
    estimated_duration: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTask();
  }, [id]);

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

  const fetchTask = async () => {
    try {
      setLoading(true);
      const data = await taskService.getTask(id);

      // Check if user owns this task
      if (data.client.id !== user?.id) {
        toast.error('You can only edit your own tasks');
        navigate(`/tasks/${id}`);
        return;
      }

      // Check if task can be edited (only OPEN tasks)
      if (data.status !== 'OPEN') {
        toast.error('You can only edit open tasks');
        navigate(`/tasks/${id}`);
        return;
      }

      setTask(data);

      // Helper function to parse deadline to YYYY-MM-DD format
      const parseDeadline = (deadline) => {
        if (!deadline) return '';
        try {
          // Handle both "YYYY-MM-DD" and "YYYY-MM-DD HH:MM:SS" formats
          const dateStr = deadline.split('T')[0].split(' ')[0];
          return dateStr;
        } catch (e) {
          return '';
        }
      };

      // Pre-fill form with existing data
      setFormData({
        title: data.title || '',
        description: data.description || '',
        category: data.category?.id || '',
        task_type: data.task_type || 'PHYSICAL',
        budget: data.budget || '',
        is_negotiable: data.is_negotiable ?? true,
        location: data.location || '',
        city: data.city || '',
        is_remote: data.is_remote || false,
        deadline: parseDeadline(data.deadline),
        estimated_duration: data.estimated_duration || '',
      });
    } catch (error) {
      console.error('Error fetching task:', error);
      toast.error('Failed to load task');
      navigate('/my-tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
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
    if (!formData.budget || parseFloat(formData.budget) < 10) {
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
      setSubmitting(true);

      // Prepare data for submission
      const submitData = {
        ...formData,
        category: parseInt(formData.category),
        budget: parseFloat(formData.budget),
      };

      // Ensure deadline is in correct format (YYYY-MM-DD) or null
      if (submitData.deadline) {
        // Make sure it's just the date part
        submitData.deadline = submitData.deadline.split('T')[0].split(' ')[0];
      }

      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null || submitData[key] === undefined) {
          delete submitData[key];
        }
      });

      console.log('Submitting data:', submitData); // Debug log

      await taskService.updateTask(id, submitData);

      toast.success('Task updated successfully!');
      navigate(`/tasks/${id}`);
    } catch (error) {
      console.error('Error updating task:', error);

      if (error.response?.data) {
        const apiErrors = error.response.data;
        setErrors(apiErrors);

        // Show specific error messages
        const errorMessages = Object.entries(apiErrors)
          .map(([field, messages]) => {
            const message = Array.isArray(messages) ? messages[0] : messages;
            return `${field}: ${message}`;
          })
          .join('\n');

        toast.error(`Validation errors:\n${errorMessages}`);
      } else {
        toast.error('Failed to update task. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="container-custom max-w-4xl px-6">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom max-w-5xl px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Task</h1>
              <p className="text-gray-600">Update your task details to attract better freelancers</p>
            </div>
            <button
              onClick={() => navigate(`/tasks/${id}`)}
              className="inline-flex items-center px-6 py-3 bg-white border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:border-primary-600 hover:bg-primary-50 hover:text-primary-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Task
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Essential details about your task</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Task Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Need a professional logo designer for my startup"
                      className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        errors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {errors.title && (
                      <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={7}
                      className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe your task in detail... What needs to be done? What are your requirements?"
                      required
                    />
                    {errors.description && (
                      <p className="mt-2 text-sm text-red-600">{errors.description}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">
                      {formData.description.length} characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    >
                      <option value="">Select a category</option>
                      {Array.isArray(categories) && categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Task Details */}
              <Card>
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Task Details</h2>
                  <p className="text-sm text-gray-500 mt-1">Pricing, location, and timing</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Task Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="task_type"
                      value={formData.task_type}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="PHYSICAL">Physical (In-person)</option>
                      <option value="DIGITAL">Digital (Remote)</option>
                      <option value="BOTH">Both</option>
                      <option value="ONE_TIME">One Time</option>
                      <option value="RECURRING">Recurring</option>
                    </select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Budget (EGP) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        placeholder="500"
                        min="10"
                        className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          errors.budget ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                      />
                      {errors.budget && (
                        <p className="mt-2 text-sm text-red-600">{errors.budget}</p>
                      )}
                    </div>

                    <div className="flex items-end pb-1">
                      <label className="flex items-center space-x-3 cursor-pointer px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full">
                        <input
                          type="checkbox"
                          name="is_negotiable"
                          checked={formData.is_negotiable}
                          onChange={handleChange}
                          className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Budget is negotiable
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g., 123 Main Street"
                        className={`w-full px-4 py-3 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors ${
                          errors.location ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.location && (
                        <p className="mt-2 text-sm text-red-600">{errors.location}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g., Cairo"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      name="is_remote"
                      checked={formData.is_remote}
                      onChange={handleChange}
                      className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <label className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => handleChange({ target: { name: 'is_remote', type: 'checkbox', checked: !formData.is_remote }})}>
                      This task can be done remotely
                    </label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Deadline (Optional)
                      </label>
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estimated Duration (Optional)
                      </label>
                      <input
                        type="text"
                        name="estimated_duration"
                        value={formData.estimated_duration}
                        onChange={handleChange}
                        placeholder="e.g., 2 weeks, 3 days"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 self-start">
              <div className="sticky top-8 space-y-6 pb-8">
                <Card>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Actions</h3>

                  <div className="space-y-3">
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={submitting}
                      className="py-3"
                    >
                      {submitting ? 'Updating...' : '✓ Update Task'}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      fullWidth
                      onClick={() => navigate(`/tasks/${id}`)}
                      className="py-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-lg">💡</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900 mb-2">
                        Tips for Better Results
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-2">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Clear titles attract 3x more freelancers</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Detailed descriptions get better matches</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Realistic budgets speed up hiring</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="bg-yellow-50 border-yellow-200">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <h4 className="text-sm font-bold text-yellow-900 mb-1">
                        Note
                      </h4>
                      <p className="text-sm text-yellow-800">
                        You can only edit tasks with "Open" status
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskEdit;
