import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBrain, FaUsers, FaLightbulb, FaHeart, FaMessage, FaStar } from 'react-icons/fa';
import apiClient from '../utils/api';

const AICollaborationMatchmaker = ({ currentUser }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [collaborationIdeas, setCollaborationIdeas] = useState([]);

  useEffect(() => {
    fetchAIMatches();
  }, [currentUser]);

  const fetchAIMatches = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/ai/collaboration-matches');
      if (response.ok) {
        const data = await response.json();
        setMatches(data.matches || []);
        setCollaborationIdeas(data.ideas || []);
      }
    } catch (error) {
      console.error('Failed to fetch AI matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCollaborationRequest = async (matchId, idea) => {
    try {
      const response = await apiClient.post('/api/collaboration/request', {
        recipientId: matchId,
        idea: idea,
        type: 'ai-suggested'
      });

      if (response.ok) {
        alert('Collaboration request sent!');
      } else {
        alert('Failed to send collaboration request');
      }
    } catch (error) {
      console.error('Failed to send collaboration request:', error);
      alert('Failed to send collaboration request');
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getMatchScoreBg = (score) => {
    if (score >= 90) return 'bg-green-500/20';
    if (score >= 80) return 'bg-blue-500/20';
    if (score >= 70) return 'bg-yellow-500/20';
    return 'bg-gray-500/20';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          <FaBrain className="w-8 h-8 text-blue-400" />
          <h2 className="text-3xl font-bold text-white">AI Collaboration Matchmaker</h2>
        </div>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Discover perfect collaboration partners based on your creative style, skills, and project interests.
        </p>
      </motion.div>

      {/* Collaboration Ideas */}
      {collaborationIdeas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
        >
          <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
            <FaLightbulb className="w-5 h-5 text-yellow-400" />
            <span>Suggested Collaboration Ideas</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collaborationIdeas.map((idea, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <h4 className="text-white font-semibold mb-2">{idea.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{idea.description}</p>
                <div className="flex flex-wrap gap-2">
                  {idea.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* AI Matches */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="space-y-6"
      >
        <h3 className="text-2xl font-bold text-white flex items-center space-x-2">
          <FaUsers className="w-6 h-6 text-purple-400" />
          <span>Your AI Matches</span>
        </h3>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <FaBrain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No matches found at the moment. Check back later!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.user._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                {/* Match Score */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreBg(match.score)} ${getMatchScoreColor(match.score)}`}>
                    {match.score}% Match
                  </div>
                  <div className="flex items-center space-x-1 text-yellow-400">
                    <FaStar className="w-4 h-4" />
                    <span className="text-sm">{match.compatibility}</span>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <img
                    src={match.user.profilePhoto || '/default-avatar.png'}
                    alt={match.user.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white/20"
                  />
                  <div>
                    <h4 className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                      {match.user.name}
                    </h4>
                    <p className="text-gray-400 text-sm">@{match.user.username}</p>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="space-y-2 mb-4">
                  <h5 className="text-sm font-medium text-gray-300">Why you match:</h5>
                  <ul className="space-y-1">
                    {match.reasons.slice(0, 3).map((reason, reasonIndex) => (
                      <li key={reasonIndex} className="text-sm text-gray-400 flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Collaboration Suggestions */}
                {match.suggestions && match.suggestions.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Collaboration Ideas:</h5>
                    <div className="space-y-1">
                      {match.suggestions.slice(0, 2).map((suggestion, suggestionIndex) => (
                        <div key={suggestionIndex} className="text-sm text-gray-400 bg-gray-800/50 rounded p-2">
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedMatch(match)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors flex items-center justify-center space-x-1"
                  >
                    <FaMessage className="w-3 h-3" />
                    <span>Connect</span>
                  </button>
                  <a
                    href={`/profile/${match.user._id}`}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors"
                  >
                    View
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Collaboration Request Modal */}
      {selectedMatch && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMatch(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Send Collaboration Request</h3>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Match Info */}
              <div className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-lg">
                <img
                  src={selectedMatch.user.profilePhoto || '/default-avatar.png'}
                  alt={selectedMatch.user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h4 className="text-white font-semibold">{selectedMatch.user.name}</h4>
                  <p className="text-gray-400">@{selectedMatch.user.username}</p>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreBg(selectedMatch.score)} ${getMatchScoreColor(selectedMatch.score)}`}>
                    {selectedMatch.score}% Match
                  </div>
                </div>
              </div>

              {/* Collaboration Ideas */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Suggested Collaborations:</h4>
                <div className="space-y-3">
                  {selectedMatch.suggestions?.map((suggestion, index) => (
                    <div key={index} className="p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                      <p className="text-gray-300">{suggestion}</p>
                      <button
                        onClick={() => handleSendCollaborationRequest(selectedMatch.user._id, suggestion)}
                        className="mt-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors"
                      >
                        Send Request
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AICollaborationMatchmaker;
