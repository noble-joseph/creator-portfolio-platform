import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaEnvelopeOpen, FaReply, FaTrash, FaArchive } from 'react-icons/fa';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [activeTab, setActiveTab] = useState('inbox');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      const response = await apiClient.patch(`/api/messages/${messageId}/read`);
      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true } : msg
        ));
      }
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const handleArchive = async (messageId) => {
    try {
      const response = await apiClient.patch(`/api/messages/${messageId}/archive`);
      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      }
    } catch (error) {
      console.error('Failed to archive message:', error);
    }
  };

  const handleDelete = async (messageId) => {
    try {
      const response = await apiClient.delete(`/api/messages/${messageId}`);
      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        setSelectedMessage(null);
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (activeTab === 'inbox') return !msg.isArchived;
    if (activeTab === 'archived') return msg.isArchived;
    if (activeTab === 'unread') return !msg.isRead && !msg.isArchived;
    return true;
  });

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Messages
          </h1>
          <p className="text-gray-300">Manage your conversations and feedback from other creators.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Message List */}
          <div className="lg:col-span-1">
            {/* Navigation Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex space-x-1 mb-6 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20"
            >
              {[
                { id: 'inbox', label: 'Inbox', icon: FaEnvelope },
                { id: 'unread', label: 'Unread', icon: FaEnvelopeOpen },
                { id: 'archived', label: 'Archived', icon: FaArchive }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors text-sm ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </motion.div>

            {/* Messages List */}
            <div className="space-y-2">
              {filteredMessages.length === 0 ? (
                <div className="text-center py-8">
                  <FaEnvelope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">No messages found</p>
                </div>
              ) : (
                filteredMessages.map((message, index) => (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedMessage?._id === message._id
                        ? 'bg-blue-600/20 border border-blue-500/30'
                        : 'bg-white/10 hover:bg-white/20 border border-white/20'
                    }`}
                    onClick={() => {
                      setSelectedMessage(message);
                      if (!message.isRead) {
                        handleMarkAsRead(message._id);
                      }
                    }}
                  >
                    <div className="flex items-start space-x-3">
                      <img
                        src={message.sender.profilePhoto || '/default-avatar.png'}
                        alt={message.sender.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className={`text-sm font-medium truncate ${
                            !message.isRead ? 'text-white' : 'text-gray-300'
                          }`}>
                            {message.sender.name}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className={`text-sm truncate ${
                          !message.isRead ? 'text-white' : 'text-gray-400'
                        }`}>
                          {message.subject}
                        </p>
                        {!message.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-2">
            {selectedMessage ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedMessage.sender.profilePhoto || '/default-avatar.png'}
                      alt={selectedMessage.sender.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {selectedMessage.sender.name}
                      </h2>
                      <p className="text-gray-400 text-sm">@{selectedMessage.sender.username}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleArchive(selectedMessage._id)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                      title="Archive"
                    >
                      <FaArchive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedMessage._id)}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Message Content */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {selectedMessage.subject}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>Type: {selectedMessage.type}</span>
                      <span>Priority: {selectedMessage.priority}</span>
                      <span>{new Date(selectedMessage.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>

                  {/* Reply Section */}
                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Reply</h4>
                    <textarea
                      placeholder="Type your reply..."
                      className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows="4"
                    />
                    <div className="flex justify-end mt-3">
                      <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                        <FaReply className="w-4 h-4" />
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 text-center"
              >
                <FaEnvelope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Select a message</h3>
                <p className="text-gray-400">
                  Choose a message from the list to view its content and reply.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
