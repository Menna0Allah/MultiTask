import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Search, MapPin, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const OnboardingModal = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [searchSkill, setSearchSkill] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    preferred_location: '',
    prefer_remote: false,
    preferred_task_types: [],
  });

  // Load categories and skills
  useEffect(() => {
    if (isOpen) {
      loadCategoriesAndSkills();
    }
  }, [isOpen]);

  const loadCategoriesAndSkills = async () => {
    try {
      setDataLoading(true);
      const [categoriesRes, skillsRes] = await Promise.all([
        api.get('/recommendations/categories/'),
        api.get('/recommendations/skills/')
      ]);

      setCategories(categoriesRes.data || []);
      setSkills(skillsRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load onboarding data. Please try again.');
    } finally {
      setDataLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        if (prev.length >= 15) {
          toast.error('You can select up to 15 interests');
          return prev;
        }
        return [...prev, categoryId];
      }
    });
  };

  const toggleSkill = (skillId) => {
    setSelectedSkills(prev => {
      if (prev.includes(skillId)) {
        return prev.filter(id => id !== skillId);
      } else {
        if (prev.length >= 20) {
          toast.error('You can select up to 20 skills');
          return prev;
        }
        return [...prev, skillId];
      }
    });
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedCategories.length === 0) {
        toast.error('Please select at least one interest to continue');
        return;
      }
    } else if (step === 2) {
      if (selectedSkills.length === 0) {
        toast.error('Please select at least one skill to continue');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select at least one interest');
      return;
    }

    if (selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        interests: selectedCategories,
        skills: selectedSkills,
        preferred_task_types: formData.preferred_task_types,
        prefer_remote: formData.prefer_remote,
        preferred_location: formData.preferred_location || null,
      };

      console.log('Submitting onboarding:', payload);

      await api.post('/recommendations/onboarding/', payload);

      toast.success('🎉 Welcome! Your profile is ready!');
      onComplete();
      onClose();
    } catch (error) {
      console.error('Onboarding failed:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorData = error.response?.data;

      // Try to extract a meaningful error message
      let message = 'Failed to complete onboarding. Please try again.';

      if (errorData) {
        // Check for field-specific errors
        if (errorData.interests) {
          message = Array.isArray(errorData.interests) ? errorData.interests[0] : errorData.interests;
        } else if (errorData.skills) {
          message = Array.isArray(errorData.skills) ? errorData.skills[0] : errorData.skills;
        } else if (errorData.detail) {
          message = errorData.detail;
        } else if (errorData.non_field_errors) {
          message = Array.isArray(errorData.non_field_errors) ? errorData.non_field_errors[0] : errorData.non_field_errors;
        } else {
          // Show the full error for debugging
          message = JSON.stringify(errorData);
        }
      }

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Filter and group skills
  const filteredSkills = skills.filter(skill =>
    skill.name.toLowerCase().includes(searchSkill.toLowerCase())
  );

  const skillsByCategory = filteredSkills.reduce((acc, skill) => {
    const cat = skill.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill);
    return acc;
  }, {});

  const categoryLabels = {
    technical: '💻 Technical',
    creative: '🎨 Creative',
    business: '💼 Business',
    manual: '🔧 Manual & Trade',
    service: '🤝 Service',
    education: '📚 Education',
    health: '⚕️ Health & Wellness',
    other: '📦 Other'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden animate-slideUp">

        {/* Header with Gradient */}
        <div className="sticky top-0 bg-gradient-to-br from-primary-600 via-purple-600 to-pink-600 text-white p-8 z-10 shadow-lg">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
              <Sparkles size={32} className="text-yellow-300" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Welcome to MultiTask!</h2>
              <p className="text-white/90 text-sm mt-1">Let's personalize your experience</p>
            </div>
          </div>

          {/* Modern Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-2 text-sm">
              {['Interests', 'Skills', 'Preferences'].map((label, idx) => (
                <span key={idx} className={`transition-all ${step > idx ? 'text-white font-medium' : 'text-white/60'}`}>
                  {label}
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                    step >= s
                      ? 'bg-gradient-to-r from-yellow-300 to-yellow-400 shadow-lg shadow-yellow-500/50'
                      : 'bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(95vh - 280px)' }}>
          <div className="p-8">

            {/* Step 1: Interests */}
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    What interests you?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Select categories that match your interests (1-15 categories)
                  </p>
                </div>

                {dataLoading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading categories...</p>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-20">
                    <p className="text-gray-600 dark:text-gray-400">No categories available. Please contact support.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => toggleCategory(category.id)}
                          className={`group relative p-5 rounded-xl border-2 transition-all duration-200 text-left hover:scale-105 ${
                            selectedCategories.includes(category.id)
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              {category.icon && (
                                <div className="text-3xl mb-3">{category.icon}</div>
                              )}
                              <div className="font-bold text-gray-900 dark:text-white text-lg">
                                {category.name}
                              </div>
                              {category.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                                  {category.description}
                                </div>
                              )}
                            </div>
                            {selectedCategories.includes(category.id) && (
                              <CheckCircle2
                                size={24}
                                className="text-primary-600 flex-shrink-0 animate-scaleIn"
                              />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                          Selected: {selectedCategories.length} / 15
                        </span>
                        {selectedCategories.length === 0 && (
                          <span className="text-sm text-blue-700 dark:text-blue-400">
                            Select at least one to continue
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 2: Skills */}
            {step === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    What are your skills?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Select skills that best represent your expertise (1-20 skills)
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search for skills..."
                    value={searchSkill}
                    onChange={(e) => setSearchSkill(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 dark:text-white transition-all"
                  />
                </div>

                {/* Skills Grid */}
                {dataLoading ? (
                  <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-600 border-t-transparent mx-auto"></div>
                    <p className="mt-6 text-gray-600 dark:text-gray-400 font-medium">Loading skills...</p>
                  </div>
                ) : Object.keys(skillsByCategory).length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-400">
                      {searchSkill ? 'No skills found matching your search' : 'No skills available'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                      <div key={category}>
                        <h4 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                          <span>{categoryLabels[category] || '📦 Other'}</span>
                          <span className="text-sm font-normal text-gray-500">
                            ({categorySkills.length})
                          </span>
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {categorySkills.map((skill) => (
                            <button
                              key={skill.id}
                              onClick={() => toggleSkill(skill.id)}
                              className={`group p-4 rounded-lg border-2 transition-all duration-200 text-left hover:scale-105 ${
                                selectedSkills.includes(skill.id)
                                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 shadow-md'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className={`text-sm font-medium ${
                                  selectedSkills.includes(skill.id)
                                    ? 'text-primary-900 dark:text-primary-100'
                                    : 'text-gray-700 dark:text-gray-300'
                                }`}>
                                  {skill.name}
                                </span>
                                {selectedSkills.includes(skill.id) && (
                                  <CheckCircle2
                                    size={18}
                                    className="text-primary-600 flex-shrink-0 animate-scaleIn"
                                  />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Count */}
                <div className="sticky bottom-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800 shadow-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-green-900 dark:text-green-300">
                      ✓ Selected: {selectedSkills.length} / 20 skills
                    </span>
                    {selectedSkills.length === 0 && (
                      <span className="text-sm text-green-700 dark:text-green-400">
                        Select at least one skill
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <div className="space-y-8 animate-fadeIn max-w-3xl mx-auto">
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    Work Preferences
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Help us find the perfect tasks for you (optional)
                  </p>
                </div>

                {/* Location */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <label className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <MapPin size={24} className="text-primary-600" />
                    Preferred Work Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Cairo, Alexandria, Giza..."
                    value={formData.preferred_location}
                    onChange={(e) => setFormData({ ...formData, preferred_location: e.target.value })}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-gray-50 dark:bg-gray-900 dark:text-white"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Leave blank to see tasks from all locations
                  </p>
                </div>

                {/* Remote Work */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.prefer_remote}
                      onChange={(e) => setFormData({ ...formData, prefer_remote: e.target.checked })}
                      className="w-6 h-6 text-primary-600 border-gray-300 rounded focus:ring-primary-500 focus:ring-2 cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        I prefer remote/online work
                      </span>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Prioritize tasks that can be done remotely
                      </p>
                    </div>
                  </label>
                </div>

                {/* Task Types */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <label className="flex items-center gap-3 text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    <Briefcase size={24} className="text-primary-600" />
                    Task Type Preferences
                  </label>
                  <div className="space-y-3">
                    {[
                      { value: 'PHYSICAL', label: 'Physical Tasks', desc: 'In-person work, hands-on tasks' },
                      { value: 'DIGITAL', label: 'Digital Tasks', desc: 'Online work, remote projects' },
                      { value: 'HYBRID', label: 'Hybrid Tasks', desc: 'Mix of physical and digital work' }
                    ].map((type) => (
                      <label key={type.value} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group transition-all">
                        <input
                          type="checkbox"
                          checked={formData.preferred_task_types.includes(type.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                preferred_task_types: [...formData.preferred_task_types, type.value]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                preferred_task_types: formData.preferred_task_types.filter(t => t !== type.value)
                              });
                            }
                          }}
                          className="w-5 h-5 mt-0.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                            {type.label}
                          </span>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {type.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Success Message */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-6 border-2 border-green-200 dark:border-green-700">
                  <p className="text-center text-green-800 dark:text-green-300 font-medium text-lg">
                    🎉 You're all set! Click "Complete" to start finding perfect tasks
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between shadow-2xl">
          <button
            onClick={step > 1 ? handleBack : onClose}
            disabled={loading}
            className="px-6 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {step > 1 && <ArrowLeft size={20} />}
            <span>{step > 1 ? 'Back' : 'Skip for now'}</span>
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Step {step} of 3
            </span>
            <button
              onClick={step === 3 ? handleSubmit : handleNext}
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">{step === 3 ? '🚀 Complete Setup' : 'Continue'}</span>
                  {step < 3 && <ArrowRight size={20} />}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default OnboardingModal;
