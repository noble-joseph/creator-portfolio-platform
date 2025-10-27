import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUsers, FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import AICollaborationMatchmaker from '../components/AICollaborationMatchmaker';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Collaborations = () => {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('my-collaborations');

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/collaborations');
      if (response.ok) {
        const data = await response.json();
        setCollaborations(data);
      }
    } catch (error) {
      console.error('Failed to fetch collaborations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-yellow-500/20 text-yellow-400';
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

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
            Collaborations
          </h1>
          <p className="text-gray-300">Connect with other creators and work on amazing projects together.</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20"
        >
          {[
            { id: 'my-collaborations', label: 'My Collaborations', icon: FaUsers },
            { id: 'ai-matches', label: 'AI Matches', icon: FaPlus },
            { id: 'public', label: 'Public Projects', icon: FaSearch }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content */}
        {activeTab === 'my-collaborations' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            {collaborations.length === 0 ? (
              <div className="text-center py-12">
                <FaUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">No collaborations yet</h3>
                <p className="text-gray-400 mb-6">
                  Start collaborating with other creators to build amazing projects together.
                </p>
                <button
                  onClick={() => setActiveTab('ai-matches')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                >
                  Find Collaborators
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collaborations.map((collaboration, index) => (
                  <motion.div
                    key={collaboration._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collaboration.status)}`}>
                        {collaboration.status}
                      </span>
                      <span className="text-gray-400 text-sm">
                        {new Date(collaboration.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">
                      {collaboration.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {collaboration.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <span className="capitalize">{collaboration.category}</span>
                        <span>•</span>
                        <span className="capitalize">{collaboration.projectType}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400 text-sm">
                        <FaUsers className="w-3 h-3" />
                        <span>{collaboration.participants.length} participants</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <img
                        src={collaboration.initiator.profilePhoto || '/default-avatar.png'}
                        alt={collaboration.initiator.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-white text-sm font-medium">{collaboration.initiator.name}</p>
                        <p className="text-gray-400 text-xs">Initiator</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'ai-matches' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <AICollaborationMatchmaker currentUser={user} />
          </motion.div>
        )}

        {activeTab === 'public' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center py-12"
          >
            <FaSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Public Projects</h3>
            <p className="text-gray-400 mb-6">
              Browse and join public collaboration projects from creators around the world.
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
              Browse Public Projects
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Collaborations;
