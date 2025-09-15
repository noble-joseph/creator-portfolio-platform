import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
<<<<<<< HEAD
import { useAuth } from "../contexts/AuthContext";

export default function PublicProfile() {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('none'); // 'none', 'connected', 'request_sent', 'request_received'
=======

export default function PublicProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const [userRes, portfolioRes] = await Promise.all([
<<<<<<< HEAD
          fetch(`${API_BASE}/api/auth/profile/${userId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          }),
=======
          fetch(`${API_BASE}/api/auth/profile/${userId}`),
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
          fetch(`${API_BASE}/api/creator/portfolio/public/${userId}`)
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
<<<<<<< HEAD
          setFollowing(userData.isFollowing || false);
          setConnectionStatus(userData.connectionStatus || 'none');
=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
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

<<<<<<< HEAD
  const handleFollow = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setFollowing(true);
        setUser(prev => ({
          ...prev,
          followersCount: prev.followersCount + 1,
          isFollowing: true
        }));
      }
    } catch (error) {
      console.error("Failed to follow user", error);
    }
  };

  const handleUnfollow = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/unfollow/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setFollowing(false);
        setUser(prev => ({
          ...prev,
          followersCount: prev.followersCount - 1,
          isFollowing: false
        }));
      }
    } catch (error) {
      console.error("Failed to unfollow user", error);
    }
  };

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

=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        {/* Profile Header */}
<<<<<<< HEAD
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
            <p className="text-purple-400 text-xl capitalize mb-2">{user.role}</p>
            <p className="text-gray-300 mb-4">{user.specialization}</p>
            {user.specializationDetails && (
              <p className="text-gray-400 mb-4">{user.specializationDetails}</p>
            )}
            {user.bio && (
              <p className="text-gray-300 max-w-2xl mx-auto">{user.bio}</p>
            )}

            {/* Connect Button and Stats */}
            <div className="flex flex-col items-center space-y-4 mt-6">
              {/* Follower/Following Stats */}
              <div className="flex space-x-8 text-gray-400">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.followersCount || 0}</div>
                  <div className="text-sm">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{user.followingCount || 0}</div>
                  <div className="text-sm">Following</div>
                </div>
              </div>

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

                  {/* Follow Button */}
                  <button
                    onClick={following ? handleUnfollow : handleFollow}
                    className={`px-8 py-3 rounded-full font-semibold transition-all duration-200 ${
                      following
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {following ? 'Following' : 'Follow'}
                  </button>
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
                )}
                {user.socialMedia.twitter && (
                  <a href={user.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                    <span className="text-2xl">🐦</span>
                  </a>
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
=======
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {user.name}
          </h1>
          <p className="text-gray-400 text-lg mb-2">@{user.username}</p>
          <p className="text-purple-400 text-xl capitalize mb-2">{user.role}</p>
          <p className="text-gray-300 mb-4">{user.specialization}</p>
          {user.specializationDetails && (
            <p className="text-gray-400 mb-4">{user.specializationDetails}</p>
          )}
          {user.bio && (
            <p className="text-gray-300 max-w-2xl mx-auto">{user.bio}</p>
          )}
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
        </div>

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span key={index} className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
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
              ))}
            </div>
          </div>
        )}

        {/* Public Portfolio */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Portfolio</h2>
          {portfolios.length === 0 ? (
            <p className="text-gray-400">No public portfolio items available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((item) => (
                <div key={item._id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="mb-2">{item.description}</p>
                  <p className="mb-2">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">
                      View Work
                    </a>
                  </p>
                  <p className="mb-2 text-sm text-gray-400">Category: {item.category}</p>
                  {item.tags && item.tags.length > 0 && (
                    <p className="text-sm text-gray-400">Tags: {item.tags.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
