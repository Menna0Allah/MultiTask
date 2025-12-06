import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, SparklesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import recommendationService from '../services/recommendationService';
import taskService from '../services/taskService';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Loading from '../components/common/Loading';
import Empty from '../components/common/Empty';
import { toast } from 'react-hot-toast';

const ForYou = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [savedTasks, setSavedTasks] = useState(new Set());
  const [stats, setStats] = useState({
    totalRecommended: 0,
    totalSaved: 0,
    matchingEnabled: true,
  });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const data = await recommendationService.getRecommendedTasks();
      setTasks(data.results || data);
      setStats({
        totalRecommended: (data.results || data).length,
        totalSaved: savedTasks.size,
        matchingEnabled: true,
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    setRefreshing(false);
    toast.success('Recommendations refreshed!');
  };

  const handleSaveTask = async (taskId) => {
    try {
      if (savedTasks.has(taskId)) {
        setSavedTasks((prev) => {
          const newSet = new Set(prev);
          newSet.delete(taskId);
          return newSet;
        });
        toast.success('Task removed from saved');
      } else {
        setSavedTasks((prev) => new Set(prev).add(taskId));
        toast.success('Task saved!');
      }
      setStats((prev) => ({
        ...prev,
        totalSaved: savedTasks.has(taskId) ? prev.totalSaved - 1 : prev.totalSaved + 1,
      }));
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error('Failed to save task');
    }
  };

  const handleTaskClick = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 60) return 'bg-gradient-to-r from-blue-500 to-cyan-500';
    if (score >= 40) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-gray-500 to-slate-500';
  };

  const getCategoryColor = (category) => {
    const colors = {
      design: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      development: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      writing: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      consulting: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    };
    const categoryName = typeof category === 'string' ? category : category?.name || '';
    return colors[categoryName.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <SparklesIcon className="h-12 w-12 text-yellow-300 mr-3" />
              <h1 className="text-4xl font-bold text-white">
                Tasks Picked Just For You
              </h1>
            </div>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              AI-powered recommendations based on your skills, experience, and preferences
            </p>
            <div className="mt-6 inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-white text-sm font-medium">AI Matching Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900 rounded-lg p-3">
                <SparklesIcon className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Recommended Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalRecommended}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-pink-100 dark:bg-pink-900 rounded-lg p-3">
                <HeartSolidIcon className="h-6 w-6 text-pink-600 dark:text-pink-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Saved Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalSaved}</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 dark:bg-green-900 rounded-lg p-3">
                <div className="h-6 w-6 flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-600 dark:bg-green-300 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Matching</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">Active</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Personalized Tasks</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Curated based on your profile and activity</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <Empty
            title="No Recommendations Yet"
            description="Complete your profile and browse tasks to help our AI understand your preferences"
            actionLabel="Update Profile"
            onAction={() => navigate('/profile')}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <Card
                key={task.id}
                className="bg-white dark:bg-gray-800 shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
              >
                {/* Match Score Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`${getMatchColor(task.match_score)} text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg`}>
                    {task.match_score}% Match
                  </div>
                </div>

                {/* Card Content */}
                <div onClick={() => handleTaskClick(task.id)} className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {task.title}
                    </h3>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                    {task.description}
                  </p>

                  {/* Category and Budget */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge className={getCategoryColor(task.category)}>
                      {typeof task.category === 'string' ? task.category : task.category?.name || 'Uncategorized'}
                    </Badge>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.budget} EGP
                    </span>
                  </div>

                  {/* Skills */}
                  {task.required_skills && task.required_skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {task.required_skills.slice(0, 3).map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          >
                            {skill}
                          </span>
                        ))}
                        {task.required_skills.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                            +{task.required_skills.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {task.proposals_count || 0} proposals
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveTask(task.id);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                      {savedTasks.has(task.id) ? (
                        <HeartSolidIcon className="h-6 w-6 text-pink-600" />
                      ) : (
                        <HeartIcon className="h-6 w-6 text-gray-400 hover:text-pink-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForYou;
