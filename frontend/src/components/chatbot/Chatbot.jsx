import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  ArrowPathIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import { ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid } from '@heroicons/react/24/solid';
import chatbotService from '../../services/chatbotService';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Chatbot = ({ position = 'bottom-right' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  // Detect action commands in bot response with comprehensive pattern matching
  const detectAction = (text) => {
    const lowerText = text.toLowerCase();

    // Profile page - detect various phrasings
    if (lowerText.match(/\b(profile|account|settings|edit profile)\b/)) {
      return { type: 'navigate', path: '/profile', label: 'Go to Profile' };
    }

    // My Tasks page - user's tasks
    if (lowerText.match(/\b(my tasks?|your tasks?|tasks you|posted tasks?)\b/)) {
      return { type: 'navigate', path: '/my-tasks', label: 'View My Tasks' };
    }

    // Dashboard/Home
    if (lowerText.match(/\b(dashboard|home ?page|main page|overview)\b/)) {
      return { type: 'navigate', path: '/dashboard', label: 'Go to Dashboard' };
    }

    // Browse/Search Tasks
    if (lowerText.match(/\b(browse|search|find|look for|all tasks?|available tasks?)\b/)) {
      return { type: 'navigate', path: '/tasks', label: 'Browse Tasks' };
    }

    // For You / Recommendations page
    if (lowerText.match(/\b(for you|recommendations?|recommended|personalized|ai recommendations?|matches?)\b/)) {
      return { type: 'navigate', path: '/recommendations', label: 'View Recommendations' };
    }

    // Messages/Inbox
    if (lowerText.match(/\b(messages?|inbox|chat|conversations?)\b/)) {
      return { type: 'navigate', path: '/messages', label: 'Go to Messages' };
    }

    // Create Task
    if (lowerText.match(/\b(create|post|add|new) ?(a )?tasks?\b/)) {
      return { type: 'navigate', path: '/tasks/create', label: 'Create New Task' };
    }

    return null;
  };

  const handleAction = (action) => {
    if (action.type === 'navigate') {
      navigate(action.path);
      setIsOpen(false);
      toast.success(`Navigating to ${action.label.replace('Go to ', '').replace('View ', '')}`);
    }
  };

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      initializeChat();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && chatInputRef.current) {
      chatInputRef.current.focus();
    }
  }, [isOpen]);

  const initializeChat = async () => {
    const welcomeMessage = {
      id: 'welcome',
      text: `Hi ${user?.username || 'there'}! 👋 I'm your intelligent AI assistant.\n\nI can help you:\n• Find perfect tasks for your skills\n• Navigate anywhere on the platform\n• Create compelling task posts\n• Answer questions about Multitask\n• Provide personalized guidance\n\nJust ask naturally! Try:\n"Show me recommended tasks"\n"Go to my profile"\n"Help me create a task"`,
      sender: 'bot',
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(inputMessage, sessionId);

      if (!sessionId && response.session_id) {
        setSessionId(response.session_id);
      }

      // Extract bot message from messages array (it's the second message)
      const botResponseData = response.messages && response.messages.length > 1
        ? response.messages[1]
        : null;

      if (botResponseData) {
        const action = detectAction(botResponseData.message);

        const botMessage = {
          id: botResponseData.id || Date.now().toString(),
          text: botResponseData.message,
          sender: 'bot',
          timestamp: botResponseData.created_at || new Date().toISOString(),
          messageId: botResponseData.id,
          action: action,
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now().toString(),
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleRateMessage = async (messageId, rating) => {
    try {
      // Convert 'positive'/'negative' to 1-5 rating
      const numericRating = rating === 'positive' ? 5 : 1;
      await chatbotService.rateMessage(messageId, numericRating);
      toast.success('Thank you for your feedback!');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.messageId === messageId ? { ...msg, rated: rating } : msg
        )
      );
    } catch (error) {
      console.error('Error rating message:', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleNewSession = () => {
    setSessionId(null);
    setMessages([]);
    initializeChat();
    toast.success('New conversation started');
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col animate-scaleIn border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-800 rounded-t-2xl p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg mr-3">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">AI Assistant</h3>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-blue-100 text-xs">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleNewSession}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                title="New conversation"
              >
                <ArrowPathIcon className="h-5 w-5 text-white" />
              </button>
              <button
                onClick={toggleChat}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-2xl rounded-br-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm shadow-sm border border-gray-200 dark:border-gray-700'
                  } px-4 py-3`}
                >
                  {message.sender === 'bot' && (
                    <div className="flex items-center mb-2">
                      <SparklesIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mr-1" />
                      <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                        AI Assistant
                      </span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>

                  {/* Action Button */}
                  {message.action && (
                    <button
                      onClick={() => handleAction(message.action)}
                      className="mt-3 w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <span>{message.action.label}</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </button>
                  )}

                  {message.sender === 'bot' && message.messageId && !message.rated && !message.action && (
                    <div className="flex items-center space-x-2 mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Was this helpful?</span>
                      <button
                        onClick={() => handleRateMessage(message.messageId, 'positive')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Good response"
                      >
                        <HandThumbUpIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-green-600" />
                      </button>
                      <button
                        onClick={() => handleRateMessage(message.messageId, 'negative')}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        title="Bad response"
                      >
                        <HandThumbDownIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 hover:text-red-600" />
                      </button>
                    </div>
                  )}

                  {message.rated && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-xs text-gray-500 dark:text-gray-400 italic">
                        Thanks for your feedback!
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 rounded-b-2xl border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                ref={chatInputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-xl border-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full p-4 shadow-2xl hover:shadow-xl transition-all transform hover:scale-110 group"
        title="Open AI Assistant"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftRightIconSolid className="h-6 w-6 group-hover:animate-pulse" />
        )}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
        )}
      </button>
    </div>
  );
};

export default Chatbot;
