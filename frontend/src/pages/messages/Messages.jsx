import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import messagingService from '../../services/messagingService';
import { useWebSocket } from '../../hooks/useWebSocket';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Loading from '../../components/common/Loading';
import Empty from '../../components/common/Empty';
import Button from '../../components/common/Button';
import {
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  MagnifyingGlassIcon,
  FaceSmileIcon,
  InformationCircleIcon,
  XMarkIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { formatRelativeTime } from '../../utils/helpers';
import { toast } from 'react-hot-toast';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [creatingConversation, setCreatingConversation] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // Common emojis for quick access
  const commonEmojis = ['😊', '😂', '❤️', '👍', '🎉', '🔥', '✨', '💯', '🙏', '👏', '😍', '🤔', '😅', '💪', '🚀', '⭐', '✅', '💼', '📱', '💡'];

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // WebSocket
  const { isConnected, sendMessage: sendWSMessage } = useWebSocket(
    selectedConversation?.id,
    handleIncomingMessage
  );

  useEffect(() => {
    initializeMessages();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    // Always scroll to bottom when messages change
    if (messages.length > 0) {
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        scrollToBottom();
      });
    }
  }, [messages]);


  // Handle query parameter for starting conversation with specific user
  const initializeMessages = async () => {
    try {
      setLoading(true);
      const response = await messagingService.getConversations();

      // Handle paginated response
      const conversationList = Array.isArray(response) ? response : (response.results || []);
      setConversations(conversationList);

      const userId = searchParams.get('user');

      if (userId) {
        // Check if conversation with this user exists
        const existingConv = conversationList.find(c =>
          c.other_participant?.id === parseInt(userId)
        );

        if (existingConv) {
          setSelectedConversation(existingConv);
        } else {
          // Create new conversation with this user
          await createNewConversation(parseInt(userId));
        }
      } else if (conversationList.length > 0) {
        setSelectedConversation(conversationList[0]);
      }
    } catch (error) {
      console.error('Error initializing messages:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const createNewConversation = async (participantId, initialMessage = '') => {
    try {
      setCreatingConversation(true);
      const conversation = await messagingService.createConversation(
        participantId,
        null,
        initialMessage
      );

      // Add to conversations list
      setConversations(prev => [conversation, ...prev]);
      setSelectedConversation(conversation);

      // Clear the user query param
      setSearchParams({});

      toast.success('Conversation started!');
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
    } finally {
      setCreatingConversation(false);
    }
  };

  // Handle incoming WebSocket messages
  function handleIncomingMessage(data) {
    try {
      if (data.type === 'chat_message') {
        // Update conversation list first
        setConversations(prev => {
          const updated = prev.map(conv =>
            conv.id === data.message.conversation
              ? { ...conv, last_message_content: data.message.content, last_message_at: data.message.created_at, unread_count: conv.id === selectedConversation?.id ? 0 : (conv.unread_count || 0) + 1 }
              : conv
          );

          // Move the conversation to the top
          const convIndex = updated.findIndex(c => c.id === data.message.conversation);
          if (convIndex > 0) {
            const [conv] = updated.splice(convIndex, 1);
            updated.unshift(conv);
          }

          return updated;
        });

        // Update messages if this is for the current conversation
        if (selectedConversation && data.message.conversation === selectedConversation.id) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === data.message.id)) {
              return prev;
            }
            return [...prev, data.message];
          });
        }
      } else if (data.type === 'typing') {
        setIsTyping(data.is_typing);
      } else if (data.type === 'read_receipt') {
        // Update message read status
        setMessages(prev =>
          prev.map(msg =>
            msg.id === data.message_id ? { ...msg, is_read: true } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error handling incoming message:', error);
    }
  }

  const fetchMessages = async (conversationId) => {
    try {
      const data = await messagingService.getConversation(conversationId);
      setMessages(data.messages || []);
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
      throw error;
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await messagingService.markAsRead(conversationId);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, unread_count: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedConversation) return;

    const content = messageInput.trim();
    setMessageInput('');
    setShowEmojiPicker(false); // Close emoji picker

    try {
      setSending(true);

      if (isConnected) {
        // Send via WebSocket - message will come back via WebSocket
        sendWSMessage({
          type: 'chat_message',
          message: content
        });
      } else {
        // Fallback to HTTP if WebSocket is not connected
        const newMessage = await messagingService.sendMessage(selectedConversation.id, content);

        // Add message to UI
        setMessages(prev => [...prev, newMessage]);

        // Update conversation list
        setConversations(prev =>
          prev.map(conv =>
            conv.id === selectedConversation.id
              ? { ...conv, last_message_content: content, last_message_at: new Date().toISOString() }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      setMessageInput(content); // Restore message
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (isConnected) {
      sendWSMessage({
        type: 'typing',
        is_typing: true
      });

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 3 seconds
      typingTimeoutRef.current = setTimeout(() => {
        sendWSMessage({
          type: 'typing',
          is_typing: false
        });
      }, 3000);
    }
  };

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessageInput(prev => prev + emoji);
  };

  const filteredConversations = Array.isArray(conversations)
    ? conversations.filter(conv =>
        conv.other_participant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getMessageStatus = (msg) => {
    if (msg.sender.id !== user.id) return null;

    if (msg.is_read) {
      // Double check for read messages
      return (
        <div className="flex -space-x-1">
          <CheckIcon className="w-4 h-4 text-blue-500" />
          <CheckIcon className="w-4 h-4 text-blue-500" />
        </div>
      );
    }
    // Single check for delivered but not read
    return <CheckIcon className="w-4 h-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading />
      </div>
    );
  }

  if (creatingConversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loading />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Starting conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container-custom py-6">
        <div className="flex bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
          {/* Conversations Sidebar */}
          <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-96 border-r border-gray-200 dark:border-gray-700 flex-col`}>
            {/* Sidebar Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Messages</h1>

              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-100 dark:bg-gray-700 border-0 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition border-l-4 ${
                      selectedConversation?.id === conv.id
                        ? 'bg-blue-50 dark:bg-gray-700 border-blue-600'
                        : 'border-transparent'
                    }`}
                  >
                    <div className="relative">
                      <Avatar user={conv.other_participant} size="lg" />
                      {isConnected && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold truncate ${
                          conv.unread_count > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {conv.other_participant?.username}
                        </h3>
                        {conv.last_message_at && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {formatRelativeTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>

                      <p className={`text-sm truncate ${
                        conv.unread_count > 0 ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {conv.last_message_content || 'No messages yet'}
                      </p>

                      <div className="flex items-center mt-2">
                        {conv.task_title && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mr-2">
                            Task: {conv.task_title}
                          </span>
                        )}
                        {conv.unread_count > 0 && (
                          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-600 text-white">
                            {conv.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-8">
                  <Empty
                    icon={ChatBubbleLeftRightIcon}
                    title="No conversations"
                    description={searchQuery ? "No conversations match your search" : "Start messaging with clients or freelancers"}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <ArrowLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>

                  <div className="relative">
                    <Avatar user={selectedConversation.other_participant} size="lg" />
                    {isConnected && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedConversation.other_participant?.username}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {isConnected ? (
                        <span className="text-green-600 dark:text-green-400">● Online</span>
                      ) : (
                        'Offline'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {selectedConversation.task_title && (
                    <span className="hidden sm:inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      Task: {selectedConversation.task_title}
                    </span>
                  )}

                  <button
                    onClick={() => setShowUserInfo(!showUserInfo)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                    title="User info"
                  >
                    <InformationCircleIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900"
              >
                {messages.length > 0 ? (
                  messages.map((msg, index) => {
                    const isOwn = msg.sender.id === user.id;
                    const showAvatar = index === 0 || messages[index - 1].sender.id !== msg.sender.id;

                    return (
                      <div
                        key={msg.id || index}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
                      >
                        {!isOwn && showAvatar && (
                          <Avatar user={msg.sender} size="sm" className="mr-2 mt-auto" />
                        )}
                        {!isOwn && !showAvatar && (
                          <div className="w-8 mr-2"></div>
                        )}

                        <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                          {showAvatar && !isOwn && (
                            <span className="text-xs text-gray-600 dark:text-gray-400 mb-1 px-1">
                              {msg.sender.username}
                            </span>
                          )}

                          <div
                            className={`group relative ${
                              isOwn
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl rounded-br-md'
                                : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl rounded-bl-md shadow-sm'
                            } px-4 py-2.5 break-words`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                            <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${
                              isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              <span>{formatRelativeTime(msg.created_at)}</span>
                              {getMessageStatus(msg)}
                            </div>
                          </div>
                        </div>

                        {isOwn && showAvatar && (
                          <Avatar user={msg.sender} size="sm" className="ml-2 mt-auto" />
                        )}
                        {isOwn && !showAvatar && (
                          <div className="w-8 ml-2"></div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <Empty
                      icon={ChatBubbleLeftRightIcon}
                      title="No messages yet"
                      description="Start the conversation by sending a message"
                    />
                  </div>
                )}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-end space-x-2">
                  <div className="flex-1 relative">
                    <textarea
                      value={messageInput}
                      onChange={(e) => {
                        setMessageInput(e.target.value);
                        handleTyping();
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
                      rows="1"
                      className="w-full px-4 py-3 pr-14 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 resize-none"
                      style={{ minHeight: '48px', maxHeight: '120px' }}
                    />

                    <div className="absolute right-2 bottom-2">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                        title="Add emoji"
                      >
                        <FaceSmileIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                      <div ref={emojiPickerRef} className="absolute bottom-14 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-3 w-80 z-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quick Emojis</span>
                          <button
                            type="button"
                            onClick={() => setShowEmojiPicker(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-10 gap-1">
                          {commonEmojis.map((emoji, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => handleEmojiClick(emoji)}
                              className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!messageInput.trim() || sending}
                    className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </button>
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {isConnected ? (
                    <span className="text-green-600 dark:text-green-400">● Connected • Real-time messaging active</span>
                  ) : (
                    <span>Connecting...</span>
                  )}
                </p>
              </form>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex items-center justify-center bg-gray-50 dark:bg-gray-900">
              <Empty
                icon={ChatBubbleLeftRightIcon}
                title="Select a conversation"
                description="Choose a conversation from the list to start messaging"
              />
            </div>
          )}

          {/* User Info Sidebar - Desktop */}
          {showUserInfo && selectedConversation && (
            <div className="hidden lg:block w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-white">User Info</h3>
                <button
                  onClick={() => setShowUserInfo(false)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex flex-col items-center text-center mb-6">
                <Avatar user={selectedConversation.other_participant} size="2xl" className="mb-4" />
                <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                  {selectedConversation.other_participant?.username}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedConversation.other_participant?.user_type}
                </p>
              </div>

              {selectedConversation.other_participant?.bio && (
                <div className="mb-6">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedConversation.other_participant.bio}
                  </p>
                </div>
              )}

              {selectedConversation.task_title && (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Related Task</h5>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {selectedConversation.task_title}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* User Info Modal - Mobile/Tablet */}
          {showUserInfo && selectedConversation && (
            <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="bg-white dark:bg-gray-800 w-full sm:max-w-md sm:rounded-xl rounded-t-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white">User Info</h3>
                  <button
                    onClick={() => setShowUserInfo(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                <div className="p-6">
                  <div className="flex flex-col items-center text-center mb-6">
                    <Avatar user={selectedConversation.other_participant} size="2xl" className="mb-4" />
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {selectedConversation.other_participant?.username}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedConversation.other_participant?.user_type}
                    </p>
                  </div>

                  {selectedConversation.other_participant?.bio && (
                    <div className="mb-6">
                      <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bio</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedConversation.other_participant.bio}
                      </p>
                    </div>
                  )}

                  {selectedConversation.task_title && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">Related Task</h5>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        {selectedConversation.task_title}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;