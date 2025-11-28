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
} from '@heroicons/react/24/outline';
import { formatRelativeTime } from '../../utils/helpers';

const Messages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // WebSocket
  const { isConnected, sendMessage: sendWSMessage } = useWebSocket(
    selectedConversation?.id,
    handleIncomingMessage
  );

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      markAsRead(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle incoming WebSocket messages
  function handleIncomingMessage(data) {
    if (data.type === 'chat_message') {
      setMessages(prev => [...prev, data.message]);
      scrollToBottom();
    } else if (data.type === 'typing') {
      // Handle typing indicator
      console.log('User is typing:', data.is_typing);
    }
  }

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await messagingService.getConversations();
      setConversations(data);

      // Auto-select conversation if user param is present
      const userId = searchParams.get('user');
      if (userId && data.length > 0) {
        const conv = data.find(c => 
          c.other_participant?.id === parseInt(userId)
        );
        if (conv) {
          setSelectedConversation(conv);
        }
      } else if (data.length > 0) {
        setSelectedConversation(data[0]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const data = await messagingService.getConversation(conversationId);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (conversationId) => {
    try {
      await messagingService.markAsRead(conversationId);
      // Update conversation unread count
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

    try {
      setSending(true);

      if (isConnected) {
        // Send via WebSocket
        sendWSMessage({
          type: 'chat_message',
          message: content
        });
      } else {
        // Fallback to HTTP
        await messagingService.sendMessage(selectedConversation.id, content);
        fetchMessages(selectedConversation.id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <Loading />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <div className="container-custom flex-1 py-4 flex">
        <div className="flex w-full h-full bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
              
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 flex items-start space-x-3 hover:bg-gray-50 transition ${
                      selectedConversation?.id === conv.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <Avatar user={conv.other_participant} size="md" />
                    
                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.other_participant?.username}
                        </h3>
                        {conv.last_message_at && (
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(conv.last_message_at)}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate">
                        {conv.last_message_content || 'No messages yet'}
                      </p>
                      
                      {conv.unread_count > 0 && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white">
                            {conv.unread_count}
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <Empty
                  icon={ChatBubbleLeftRightIcon}
                  title="No conversations"
                  description="Start messaging with clients or freelancers"
                />
              )}
            </div>
          </div>

          {/* Chat Area */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar user={selectedConversation.other_participant} size="md" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedConversation.other_participant?.username}
                    </h3>
                    {isConnected && (
                      <span className="text-xs text-green-600">● Online</span>
                    )}
                  </div>
                </div>

                {selectedConversation.task_title && (
                  <div className="text-sm text-gray-600">
                    Task: <span className="font-medium">{selectedConversation.task_title}</span>
                  </div>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      msg.sender.id === user.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] ${
                        msg.sender.id === user.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      } rounded-lg px-4 py-2`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className={`text-xs mt-1 ${
                        msg.sender.id === user.id ? 'text-primary-100' : 'text-gray-500'
                      }`}>
                        {formatRelativeTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!messageInput.trim() || sending}
                    icon={PaperAirplaneIcon}
                  >
                    Send
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <Empty
                icon={ChatBubbleLeftRightIcon}
                title="Select a conversation"
                description="Choose a conversation from the list to start messaging"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;