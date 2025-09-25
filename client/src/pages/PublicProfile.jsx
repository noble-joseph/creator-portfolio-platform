import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import { useAuth } from "../contexts/AuthContext";

// Domain-specific rendering components
const MusicianProfile = ({ user, portfolios, connectionStatus, handleConnect, handleAccept, handleDecline, handleRemove, currentUser, messageForm }) => (
  <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white">
    {/* Audio-focused header */}
    <div className="relative text-center mb-12 p-8">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-20"></div>
      <div className="relative z-10">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
          {user.name}
        </h1>
        <p className="text-purple-300 text-xl mb-2">🎵 {user.specialization}</p>
        <p className="text-gray-300 mb-4">{user.bio}</p>
        {/* Connection buttons */}
        {currentUser && currentUser._id !== user._id && (
          <div className="flex justify-center space-x-4 mt-6">
            {connectionStatus === 'none' && (
              <button onClick={handleConnect} className="px-8 py-3 rounded-full font-semibold bg-purple-600 hover:bg-purple-700 transition-colors">
                Connect
              </button>
            )}
            {connectionStatus === 'connected' && (
              <button onClick={handleRemove} className="px-8 py-3 rounded-full font-semibold bg-red-600 hover:bg-red-700 transition-colors">
                Remove Connection
              </button>
            )}
          </div>
        )}
              </div>
            </div>
            {/* Adjust container padding to reduce white space */}
            <style jsx>{`
              .relative.pt-48 {
                padding-top: 12rem !important; /* reduce from 48 to 12 rem */
              }
            `}</style>

    {/* Audio portfolio grid */}
    <div className="container mx-auto px-6 pb-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-purple-300">🎼 Musical Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {portfolios.map((item) => (
          <div key={item._id} className="relative group aspect-square rounded-lg overflow-hidden shadow-lg">
            <img
              src={item.thumbnail || 'https://via.placeholder.com/500'}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center">
              <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
              <div className="flex space-x-4">
                {item.mediaFiles?.find(m => m.type === 'audio') && (
                  <button
                    onClick={() => alert(`Playing: ${item.title}`)} // Placeholder for play functionality
                    className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                  >
                    ▶
                  </button>
                )}
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  🔗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message form for connected users */}
      {currentUser && connectionStatus === 'connected' && (
        <div className="mt-12 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Send a Message to {user.name}</h3>
          {messageForm}
        </div>
      )}
    </div>
  </div>
);

const PhotographerProfile = ({ user, portfolios, connectionStatus, handleConnect, handleAccept, handleDecline, handleRemove, currentUser, messageForm }) => (
  <div className="bg-gradient-to-br from-gray-900 to-black text-white">
    {/* Visual header */}
    <div className="relative text-center mb-12">
      {user.coverPhoto && (
        <div className="h-64 overflow-hidden">
          <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="relative -mt-16 z-10">
        <div className="inline-block">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center shadow-2xl">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>
        <h1 className="text-4xl font-bold mt-4 mb-2">{user.name}</h1>
        <p className="text-blue-400 text-xl">📸 {user.specialization}</p>
        <p className="text-gray-300 mb-4">{user.bio}</p>
        {/* Connection buttons */}
        {currentUser && currentUser._id !== user._id && (
          <div className="flex justify-center space-x-4 mt-6">
            {connectionStatus === 'none' && (
              <button onClick={handleConnect} className="px-8 py-3 rounded-full font-semibold bg-blue-600 hover:bg-blue-700 transition-colors">
                Connect
              </button>
            )}
            {connectionStatus === 'connected' && (
              <button onClick={handleRemove} className="px-8 py-3 rounded-full font-semibold bg-red-600 hover:bg-red-700 transition-colors">
                Remove Connection
              </button>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Visual portfolio grid */}
    <div className="container mx-auto px-6 pb-8">
      <h2 className="text-3xl font-bold mb-8 text-center text-blue-300">📷 Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map(item => (
          <div key={item._id} className="relative group aspect-square rounded-lg overflow-hidden shadow-lg">
            <img
              src={item.thumbnail || item.mediaFiles?.[0]?.url || 'https://via.placeholder.com/500'}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center">
              <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
              <div className="flex space-x-4">
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  🔗
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message form for connected users */}
      {currentUser && connectionStatus === 'connected' && (
        <div className="mt-12 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Send a Message to {user.name}</h3>
          {messageForm}
        </div>
      )}
    </div>
  </div>
);

export default function PublicProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('none'); // 'none', 'connected', 'request_sent', 'request_received'
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('appreciation');
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const [userRes, portfolioRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/profile/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          }),
          fetch(`${API_BASE}/api/creator/portfolio/public/${userId}`)
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
          setConnectionStatus(userData.connectionStatus || 'none');
        }

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolios(portfolioData);
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
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
        <option value="general">General</option>
      </select>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write your message..."
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        rows="4"
      />
      <button
        onClick={handleSendMessage}
        disabled={sendingMessage || !message.trim()}
        className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors"
      >
        {sendingMessage ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center items-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center items-center">
        <div className="text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            User Not Found
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
            The creator you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Determine which profile component to render based on user role
  const renderProfile = () => {
    if (user.role === 'musician') {
      return (
        <MusicianProfile
          user={user}
          portfolios={portfolios}
          connectionStatus={connectionStatus}
          handleConnect={handleSendConnectionRequest}
          handleAccept={handleAcceptConnectionRequest}
          handleDecline={handleDeclineConnectionRequest}
          handleRemove={handleRemoveConnection}
          currentUser={currentUser}
          messageForm={messageForm}
        />
      );
    } else if (user.role === 'photographer') {
      return (
        <PhotographerProfile
          user={user}
          portfolios={portfolios}
          connectionStatus={connectionStatus}
          handleConnect={handleSendConnectionRequest}
          handleAccept={handleAcceptConnectionRequest}
          handleDecline={handleDeclineConnectionRequest}
          handleRemove={handleRemoveConnection}
          currentUser={currentUser}
          messageForm={messageForm}
        />
      );
    } else {
      // Default profile layout for other roles
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
          <Navbar />
          <div className="container mx-auto px-6 py-8">
            {/* Profile Header */}
            <div className="relative text-center mb-12">
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
              {/* Profile Photo - Positioned to overlap cover photo */}
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
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  {user.name}
                </h1>
                <p className="text-gray-400 text-lg mb-2">@{user.username}</p>
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-4 md:px-6 py-8">
        {/* Profile Header */}
        <header className="relative mb-8">
          {/* Cover Photo */}
          <div className="h-48 md:h-64 bg-gray-800 rounded-2xl overflow-hidden">
            {user.coverPhoto ? (
              <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-purple-900 to-indigo-900"></div>
            )}
          </div>

                {/* Message Button */}
                {currentUser && currentUser._id !== userId && connectionStatus === 'connected' && (
                  <div className="mb-4">
                    <button
                      onClick={() => {
                        const messageSection = document.getElementById('message-form-section');
                        if (messageSection) {
                          messageSection.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="px-6 py-2 rounded-full font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                    >
                      Message
                    </button>
          {/* Profile Info Card */}
          <div className="relative -mt-24 md:-mt-32 max-w-4xl mx-auto">
            <div className="p-4 md:p-6 bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center md:items-end space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Picture */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-purple-500 bg-gray-700 flex-shrink-0 -mt-16 md:-mt-24 shadow-lg">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600">
                    <span className="text-5xl font-bold text-white">{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  </div>
                )}
              </div>

                <p className="text-purple-400 text-xl capitalize mb-2">{user.role}</p>
                <p className="text-gray-300 mb-4">{user.specialization}</p>
                {user.specializationDetails && (
                  <p className="text-gray-400 mb-4">{user.specializationDetails}</p>
                )}
                {user.bio && (
                  <p className="text-gray-300 max-w-2xl mx-auto">{user.bio}</p>
                )}
              {/* Name and Actions */}
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold">{user.name}</h1>
                <p className="text-gray-400">@{user.username}</p>
                <p className="text-purple-400 capitalize mt-1">{user.role} • {user.specialization}</p>
              </div>

                {/* Connect Button and Stats */}
                <div className="flex flex-col items-center space-y-4 mt-6">
                  {/* Connect Button */}
                  {currentUser && currentUser._id !== userId && (
                    <div className="flex flex-col space-y-2">
                      {/* Connection Button */}
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
                    </div>
                  )}
                </div>

                {/* Social Media Links */}
                {user.socialMedia && (
                  <div className="flex justify-center space-x-6 mt-6">
                    {user.socialMedia.facebook && (
                      <a href={user.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-400 transition-colors">
                        <span className="text-2xl">📘</span>
                      </a>
              {/* Connection Buttons */}
              <div className="flex-shrink-0">
                {currentUser && currentUser._id !== userId && (
                  <div className="flex space-x-2">
                    {connectionStatus === 'none' && <button onClick={handleSendConnectionRequest} className="px-6 py-2 rounded-full font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">Connect</button>}
                    {connectionStatus === 'request_sent' && <button disabled className="px-6 py-2 rounded-full font-semibold bg-gray-600 text-white cursor-not-allowed">Request Sent</button>}
                    {connectionStatus === 'request_received' && (
                      <>
                        <button onClick={handleAcceptConnectionRequest} className="px-6 py-2 rounded-full font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors">Accept</button>
                        <button onClick={handleDeclineConnectionRequest} className="px-6 py-2 rounded-full font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors">Decline</button>
                      </>
                    )}
                    {user.socialMedia.twitter && (
                      <a href={user.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                        <span className="text-2xl">🐦</span>
                      </a>
                    {connectionStatus === 'connected' && (
                      <>
                        <button onClick={() => document.getElementById('message-form-section')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-2 rounded-full font-semibold bg-purple-600 text-white hover:bg-purple-700 transition-colors">Message</button>
                        <button onClick={handleRemoveConnection} className="px-6 py-2 rounded-full font-semibold bg-gray-700 text-white hover:bg-gray-600 transition-colors">Connected</button>
                      </>
                    )}
                    {user.socialMedia.instagram && (
                      <a href={user.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400 transition-colors">
                        <span className="text-2xl">📷</span>
                      </a>
                    )}
                    {user.socialMedia.linkedin && (
                      <a href={user.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 transition-colors">
                        <span className="text-2xl">💼</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

            {/* Skills */}
        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-8">
            {/* About Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-300">About</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{user.bio || "No bio available."}</p>
            </div>

            {/* Skills Card */}
            {user.skills && user.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">Skills</h2>
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-purple-300">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span key={index} className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                    <span key={index} className="bg-purple-600/50 text-purple-200 px-3 py-1 rounded-full text-sm font-medium">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Experiences */}
            {user.experiences && user.experiences.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 text-purple-400">Experience</h2>
                <div className="space-y-4">
                  {user.experiences.map((exp, index) => (
                    <div key={index} className="bg-gray-800 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold">{exp.title}</h3>
                      <p className="text-purple-400">{exp.company}</p>
                      <p className="text-gray-400 text-sm">{exp.duration}</p>
                      {exp.description && <p className="text-gray-300 mt-2">{exp.description}</p>}
                    </div>
            {/* Social Media Card */}
            {user.socialMedia && Object.values(user.socialMedia).some(v => v) && (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-purple-300">On The Web</h2>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(user.socialMedia).map(([platform, link]) => link && (
                    <a key={platform} href={link} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-purple-400 transition-colors capitalize">{platform}</a>
                  ))}
                </div>
              </div>
            )}
          </div>

            {/* Public Portfolio */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-purple-400">Portfolio</h2>
          {/* Right Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Portfolio Card */}
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-300">Portfolio</h2>
              {portfolios.length === 0 ? (
                <p className="text-gray-400">No public portfolio items available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {portfolios.map((item) => (
                    <div key={item._id} className="relative group aspect-square rounded-lg overflow-hidden shadow-lg">
                      <img
                        src={item.thumbnail || 'https://via.placeholder.com/500'}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center">
                        <h3 className="text-xl font-bold mb-2 text-white">{item.title}</h3>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                        >
                          🔗
                        </a>
                      <img src={item.thumbnail || 'https://via.placeholder.com/500'} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center">
                        <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                        <div className="flex space-x-3">
                          {item.mediaFiles?.find(m => m.type === 'audio') && <button onClick={() => alert(`Playing: ${item.title}`)} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">▶</button>}
                          <a href={item.link} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors">🔗</a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Experience Card */}
            {user.experiences && user.experiences.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-purple-300">Experience</h2>
                <div className="space-y-6">
                  {user.experiences.map((exp, index) => (
                    <div key={index} className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-purple-500 before:rounded-full">
                      <h3 className="font-semibold text-white">{exp.title}</h3>
                      <p className="text-purple-400 text-sm">{exp.company}</p>
                      <p className="text-gray-400 text-xs mb-1">{exp.duration}</p>
                      {exp.description && <p className="text-gray-300 text-sm">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message form for connected users */}
            {currentUser && connectionStatus === 'connected' && (
              <div id="message-form-section" className="mt-12 bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Send a Message to {user.name}</h3>
              <div id="message-form-section" className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/80 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 text-purple-300">Send a Message to {user.name}</h3>
                {messageForm}
              </div>
            )}
            </div>
          </div>
        </div>
      );
    }
  };

  return renderProfile();
        </main>
      </div>
    </div>
  );
}
