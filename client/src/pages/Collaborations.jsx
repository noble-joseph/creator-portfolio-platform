import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUsers, FaPlus, FaSearch } from 'react-icons/fa';
import AICollaborationMatchmaker from '../components/AICollaborationMatchmaker';
import ProjectWorkspace from '../components/ProjectWorkspace';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Collaborations = () => {
  const { user } = useAuth();
  const [selectedCollaboration, setSelectedCollaboration] = useState(null);

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
      case 'planning': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'on-hold': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (selectedCollaboration) {
    return (
      <div className="min-h-screen bg-black p-6">
        <ProjectWorkspace
          collaboration={selectedCollaboration}
          onBack={() => {
            setSelectedCollaboration(null);
            fetchCollaborations();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 py-16 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <h1 className="text-5xl font-bold mb-4 tracking-tighter uppercase">
            Collaborative Network
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Forge professional partnerships across the creative spectrum</p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-16">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {[
              { id: 'my-collaborations', label: 'My Workspace', icon: FaUsers },
              { id: 'ai-matches', label: 'Matchmaker', icon: FaPlus },
              { id: 'public', label: 'Open Gigs', icon: FaSearch }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 px-8 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest ${activeTab === tab.id
                  ? 'bg-white text-black shadow-xl scale-105'
                  : 'text-gray-500 hover:text-white'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'my-collaborations' && (
            <motion.div
              key="my"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              {collaborations.length === 0 ? (
                <div className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <FaUsers className="w-16 h-16 text-gray-700 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">No Active Initiatives</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Your workspace is currently quiet. Use the matchmaker to find your next creative project.
                  </p>
                  <button
                    onClick={() => setActiveTab('ai-matches')}
                    className="px-8 py-3 bg-[#008080] hover:bg-[#00CED1] text-white rounded-xl font-bold uppercase tracking-widest transition-all"
                  >
                    Initiate Matchmaking
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {collaborations.map((collab, index) => (
                    <motion.div
                      key={collab._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedCollaboration(collab)}
                      className="group bg-white/5 border border-white/10 rounded-3xl p-8 hover:border-[#008080] transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#008080] opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="flex items-center justify-between mb-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${getStatusColor(collab.status)}`}>
                          {collab.status}
                        </span>
                        <div className="flex -space-x-3">
                          {collab.participants.slice(0, 3).map((p, i) => (
                            <img
                              key={i}
                              src={p.user?.profilePhoto || '/default-avatar.png'}
                              className="w-8 h-8 rounded-full border-2 border-black object-cover"
                              alt="Member"
                            />
                          ))}
                          {collab.participants.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-black bg-gray-800 flex items-center justify-center text-[10px] font-bold">
                              +{collab.participants.length - 3}
                            </div>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#008080] transition-colors">
                        {collab.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-8 line-clamp-2 font-serif italic text-lg leading-relaxed">
                        "{collab.description}"
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-white/5">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#CC5500]">{collab.category}</span>
                          <span className="text-gray-700 font-bold">•</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{collab.projectType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-[#008080]" style={{ width: `${collab.progressPercentage || 0}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-[#008080]">{collab.progressPercentage || 0}%</span>
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
              key="ai"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <AICollaborationMatchmaker currentUser={user} />
            </motion.div>
          )}

          {activeTab === 'public' && (
            <motion.div
              key="public"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-24 bg-white/5 rounded-3xl border border-dashed border-white/10"
            >
              <FaSearch className="w-16 h-16 text-gray-700 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Public Registries</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Explore open calls for collaboration across the global network.
              </p>
              <button className="px-8 py-3 bg-white text-black rounded-xl font-bold uppercase tracking-widest hover:bg-[#008080] hover:text-white transition-all">
                Access Registry
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Collaborations;
