import React, { useState, useEffect, useMemo } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import AudioPlayer from "../components/AudioPlayer";
import { useAuth } from "../contexts/AuthContext";
import MusicianProfile from "../components/MusicianProfile";
import PhotographerProfile from "../components/PhotographerProfile";
import LoadingSpinner from "../components/LoadingSpinner";

export default function PublicProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('none');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('appreciation');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [debouncedMessage, setDebouncedMessage] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedMessage(message), 150);
    return () => clearTimeout(id);
  }, [message]);
  const quality = useMemo(() => svmMessageQuality(debouncedMessage), [debouncedMessage]);
  const [error, setError] = useState(null);
  const [showMessagePanel, setShowMessagePanel] = useState(false);
  const [showConnectCTA, setShowConnectCTA] = useState(false);
  // --- SVM message quality helpers ---
  const STOPWORDS = new Set(["the", "a", "an", "and", "or", "but", "if", "in", "on", "at", "to", "for", "of", "with", "is", "it", "this", "that", "as", "by", "from", "be"]);
  const tokenize = (text) => (text || "").toLowerCase().slice(0, 500).replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(t => t && !STOPWORDS.has(t));
  const svmMessageQuality = (text) => {
    const raw = (text || "").slice(0, 500);
    const toks = tokenize(raw);
    const len = raw.length;
    const words = toks.length;
    if (words === 0) return 0.0;
    const unique = new Set(toks).size;
    const upperRatio = (raw.replace(/[^A-Z]/g, "").length) / Math.max(len, 1);
    const linkCount = (raw.match(/https?:\/\//g) || []).length;
    const punctuationBursts = (raw.match(/[!?.]{3,}/g) || []).length;
    const hasGreeting = /(hello|hi|hey|dear)\b/i.test(raw) ? 1 : 0;
    const hasThanks = /(thanks|thank you|appreciate)\b/i.test(raw) ? 1 : 0;
    const asksQuestion = /\?/.test(raw) ? 1 : 0;
    const f_len = Math.max(0, 1 - Math.abs(words - 25) / 25);
    const f_unique = unique / words;
    const f_upper = -upperRatio;
    const f_links = -Math.min(linkCount, 2) * 0.6;
    const f_punct = -Math.min(punctuationBursts, 3) * 0.4;
    const f_greet = hasGreeting ? 0.2 : 0.0;
    const f_thanks = hasThanks ? 0.2 : 0.0;
    const f_question = asksQuestion ? 0.2 : 0.0;
    const z = 1.2 * f_len + 1.0 * f_unique + 0.8 * f_greet + 0.7 * f_thanks + 0.6 * f_question + 0.8 * f_upper + 1.0 * f_links + 0.8 * f_punct + 0.0;
    return 1 / (1 + Math.exp(-z));
  };
  const [playingAudio, setPlayingAudio] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userRes, portfolioRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/profile/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          }),
          fetch(`${API_BASE}/api/creator/portfolio/visible/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          })
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          setConnectionStatus(userData.connectionStatus || 'none');
        } else {
          setError('User not found');
        }

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolios(portfolioData);
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const handleSendConnectionRequest = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/connect/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnectionStatus('request_sent');
        setUser(prev => ({
          ...prev,
          connectionStatus: 'request_sent'
        }));
      }
    } catch (error) {
      console.error("Failed to send connection request", error);
    }
  };

  const handleAcceptConnectionRequest = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/accept-connection/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnectionStatus('connected');
        setUser(prev => ({
          ...prev,
          connectionStatus: 'connected'
        }));
      }
    } catch (error) {
      console.error("Failed to accept connection request", error);
    }
  };

  const handleDeclineConnectionRequest = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/decline-connection/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnectionStatus('none');
        setUser(prev => ({
          ...prev,
          connectionStatus: 'none'
        }));
      }
    } catch (error) {
      console.error("Failed to decline connection request", error);
    }
  };

  const handleRemoveConnection = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/disconnect/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setConnectionStatus('none');
        setUser(prev => ({
          ...prev,
          connectionStatus: 'none'
        }));
      }
    } catch (error) {
      console.error("Failed to remove connection", error);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    setSendingMessage(true);
    try {
      const response = await fetch(`${API_BASE}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: userId,
          content: message,
          type: messageType
        })
      });

      if (response.ok) {
        setMessage('');
        alert('Message sent successfully!');
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error("Failed to send message", error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const messageForm = (
    <div className="space-y-4">
      <select
        value={messageType}
        onChange={(e) => setMessageType(e.target.value)}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        <option value="appreciation">Appreciation</option>
        <option value="collaboration">Collaboration</option>
        <option value="feedback">Feedback</option>
        <option value="booking">Booking Request</option>
        <option value="general">General</option>
      </select>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message..."
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        rows="4"
      />
      <div className="text-xs text-purple-300 -mt-1 mb-2">Algorithm: Support Vector Machine (linear) — Message Quality: {quality.toFixed(2)} {quality < 0.3 ? <span className="text-red-400">(revise)</span> : quality < 0.6 ? <span className="text-yellow-400">(okay)</span> : <span className="text-green-400">(great)</span>}</div>
      <button
        onClick={handleSendMessage}
        disabled={sendingMessage || !message.trim() || quality < 0.3}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
      >
        {sendingMessage ? 'Sending...' : 'Send Message'}
      </button>
      {quality < 0.3 && (
        <div className="mt-2 text-xs text-red-300">Message quality is low. Consider adding a friendly greeting, a clear ask, and fewer links/punctuation.</div>
      )}
    </div>
  );

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center items-center">
        <motion.div
          className="text-center px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {error || 'User Not Found'}
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
            {error === 'User not found'
              ? "The creator you're looking for doesn't exist or has made their profile private."
              : "Something went wrong while loading this profile. Please try again later."
            }
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Determine which profile component to render based on user role
  const renderProfile = () => {
    if (user.role === 'musician') {
      return (
        <>
          <MusicianProfile
            user={{ ...user, portfolio: portfolios }}
            isOwner={currentUser?._id === user._id}
          />
          {currentUser && currentUser._id !== user._id && (
            <>
              <button
                onClick={() => {
                  if (connectionStatus === 'connected') {
                    setShowMessagePanel(true);
                    const el = document.getElementById('message-panel');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } else {
                    alert('Connect to send a direct message.');
                  }
                }}
                title="Send Message"
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-xl"
              >
                ✉️
              </button>
              {connectionStatus === 'connected' && showMessagePanel && (
                <div id="message-panel" className="fixed bottom-24 right-6 z-50 w-80 bg-gray-800/90 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold mb-3 text-purple-300">Message {user.name}</h3>
                  {messageForm}
                </div>
              )}
            </>
          )}
        </>
      );
    } else if (user.role === 'photographer') {
      return (
        <>
          <PhotographerProfile
            user={{ ...user, portfolio: portfolios }}
            isOwner={currentUser?._id === user._id}
          />
          {currentUser && currentUser._id !== user._id && (
            <>
              <button
                onClick={() => {
                  if (connectionStatus === 'connected') {
                    setShowMessagePanel(true);
                    const el = document.getElementById('message-panel');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } else {
                    alert('Connect to send a direct message.');
                  }
                }}
                title="Send Message"
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-xl"
              >
                ✉️
              </button>
              {connectionStatus === 'connected' && showMessagePanel && (
                <div id="message-panel" className="fixed bottom-24 right-6 z-50 w-80 bg-gray-800/90 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-4">
                  <h3 className="text-lg font-semibold mb-3 text-purple-300">Message {user.name}</h3>
                  {messageForm}
                </div>
              )}
            </>
          )}
        </>
      );
    } else {
      // Default profile layout for other roles (admin, etc.)
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
          <Navbar />
          <div className="container mx-auto px-6 py-8">
            {/* Profile Header */}
            <motion.div
              className="relative text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Cover Photo */}
              {user.coverPhoto && (
                <div className="absolute inset-x-0 top-0 h-48 overflow-hidden rounded-lg">
                  <img
                    src={user.coverPhoto}
                    alt="Cover"
                    className="w-full h-full object-cover filter brightness-75"
                  />
                </div>
              )}

              {/* Profile Photo */}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-32 z-10">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl ring-4 ring-gray-800">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${API_BASE}/uploads/${user.profilePhoto}`}
                      alt="Profile"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-3xl font-bold text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative pt-48">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent flex items-center justify-center gap-3">
                  {user.name}
                  {user.experienceLevel === 'professional' && (
                    <FaCheckCircle className="text-yellow-500 w-8 h-8" title="Professional Verified" />
                  )}
                </h1>
                <p className="text-gray-400 text-lg mb-2">@{user.username}</p>
                <p className="text-purple-400 text-xl capitalize mb-2">{user.role}</p>
                {user.bio && (
                  <p className="text-gray-300 max-w-2xl mx-auto">{user.bio}</p>
                )}
              </div>

              {/* Actions: Connect + Message */}
              {currentUser && currentUser._id !== userId && (
                <div className="flex justify-center mt-6">
                  {connectionStatus === 'none' && (
                    <button
                      onClick={handleSendConnectionRequest}
                      className="px-8 py-3 rounded-full font-semibold transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Connect
                    </button>
                  )}
                  {connectionStatus === 'request_sent' && (
                    <button
                      disabled
                      className="px-8 py-3 rounded-full font-semibold transition-all duration-200 bg-gray-600 text-white cursor-not-allowed"
                    >
                      Request Sent
                    </button>
                  )}
                  {connectionStatus === 'request_received' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleAcceptConnectionRequest}
                        className="px-6 py-3 rounded-full font-semibold transition-all duration-200 bg-green-600 text-white hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={handleDeclineConnectionRequest}
                        className="px-6 py-3 rounded-full font-semibold transition-all duration-200 bg-red-600 text-white hover:bg-red-700"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                  {connectionStatus === 'connected' && (
                    <button
                      onClick={handleRemoveConnection}
                      className="px-8 py-3 rounded-full font-semibold transition-all duration-200 bg-red-600 text-white hover:bg-red-700"
                    >
                      Remove Connection
                    </button>
                  )}
                  {/* Message Icon */
                  /* When not connected, show inline CTA instead of alert */}
                  <button
                    onClick={() => {
                      if (connectionStatus === 'connected') {
                        setShowMessagePanel(true);
                        const el = document.getElementById('message-panel');
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else {
                        setShowConnectCTA(true);
                      }
                    }}
                    title="Send Message"
                    className="ml-3 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center shadow-lg"
                  >
                    ✉️
                  </button>
                </div>
              )}
            </motion.div>

            {/* Main Content */}
            <motion.main
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              {/* Left Column */}
              <div className="lg:col-span-1 space-y-8">
                {/* About Card */}
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4 text-purple-300">About</h2>
                  <p className="text-gray-300 whitespace-pre-wrap">{user.bio || "No bio available."}</p>
                </div>

                {/* Skills Card */}
                {user.skills && user.skills.length > 0 && (
                  <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 text-purple-300">Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill, index) => (
                        <span key={index} className="bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Media Card */}
                {user.socialMedia && Object.values(user.socialMedia).some(v => v) && (
                  <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 text-purple-300">Connect</h2>
                    <div className="flex flex-wrap gap-4">
                      {Object.entries(user.socialMedia).map(([platform, link]) => link && (
                        <a key={platform} href={link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-purple-400 transition-colors capitalize">{platform}</a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className="lg:col-span-2 space-y-8">
                {/* Portfolio Card */}
                <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4 text-purple-300">Portfolio</h2>
                  {portfolios.length === 0 ? (
                    <p className="text-gray-400">No public portfolio items available.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                      {portfolios.map((item) => (
                        <div key={item._id} className="relative group aspect-square rounded-lg overflow-hidden shadow-lg">
                          <img src={item.thumbnail || 'https://via.placeholder.com/500'} alt={item.title} className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-110 ${item.isPublic ? '' : 'filter blur-[1px]'}`} />
                          {/* Lock badge for private items (only present when visible because you're the owner/connected) */}
                          {!item.isPublic && (
                            <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-full text-xs font-semibold bg-red-600/80 text-white backdrop-blur">
                              🔒 Private
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center">
                            <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                            <div className="flex space-x-3">
                              {item.mediaFiles?.find(m => m.type === 'audio') && (
                                <button
                                  onClick={() => setPlayingAudio(item._id)}
                                  className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                                >
                                  ▶
                                </button>
                              )}
                              {item.link && <a href={item.link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">🔗</a>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audio Player Modal */}
                {playingAudio && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                      {(() => {
                        const item = portfolios.find(p => p._id === playingAudio);
                        const audioFile = item?.mediaFiles?.find(m => m.type === 'audio');
                        const src = audioFile?.url
                          ? (audioFile.url.startsWith('http') ? audioFile.url : `${API_BASE}/uploads/${audioFile.url}`)
                          : undefined;
                        return src ? (
                          <AudioPlayer
                            src={src}
                            title={item.title}
                            onEnded={() => setPlayingAudio(null)}
                          />
                        ) : null;
                      })()}
                      <button
                        onClick={() => setPlayingAudio(null)}
                        className="mt-4 w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors"
                      >
                        Close Player
                      </button>
                    </div>
                  </div>
                )}

                {/* Message panel for connected users (opened by icon) */
                /* Inline CTA if not connected */}
                {currentUser && connectionStatus === 'connected' && showMessagePanel && (
                  <div id="message-panel" className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                    <h3 className="text-xl font-semibold mb-4 text-purple-300">Send a Message to {user.name}</h3>
                    {messageForm}
                  </div>
                )}
                {currentUser && connectionStatus !== 'connected' && showConnectCTA && (
                  <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-purple-300">Connect to message</h3>
                        <p className="text-gray-300 text-sm">Send a connection request to start messaging {user.name}.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {connectionStatus === 'none' && (
                          <button
                            onClick={async () => {
                              await handleSendConnectionRequest();
                              setShowConnectCTA(false);
                            }}
                            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                          >
                            Connect
                          </button>
                        )}
                        {connectionStatus === 'request_sent' && (
                          <span className="px-3 py-2 rounded-full bg-gray-700 text-gray-200 text-sm">Request sent</span>
                        )}
                        <button
                          onClick={() => setShowConnectCTA(false)}
                          className="px-3 py-2 rounded-full bg-gray-700 text-gray-200 hover:bg-gray-600 text-sm"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.main>
          </div>
        </div>
      );
    }
  };

  return renderProfile();
}