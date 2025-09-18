import { useState, useEffect } from "react";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function Connections() {
  const [connectionsData, setConnectionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connections');

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/connections`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setConnectionsData(data);
      }
    } catch (error) {
      console.error("Failed to fetch connections", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/accept-connection/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        // Refresh data
        fetchConnections();
      }
    } catch (error) {
      console.error("Failed to accept request", error);
    }
  };

  const handleDeclineRequest = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/decline-connection/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        // Refresh data
        fetchConnections();
      }
    } catch (error) {
      console.error("Failed to decline request", error);
    }
  };

  const handleRemoveConnection = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/disconnect/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        // Refresh data
        fetchConnections();
      }
    } catch (error) {
      console.error("Failed to remove connection", error);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/follow/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        // Refresh data
        fetchConnections();
      }
    } catch (error) {
      console.error("Failed to follow user", error);
    }
  };

  const handleUnfollow = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/unfollow/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        // Refresh data
        fetchConnections();
      }
    } catch (error) {
      console.error("Failed to unfollow user", error);
    }
  };

  const UserCard = ({ user, actions }) => (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center justify-between hover:bg-gray-750 transition-colors">
      <Link to={`/profile/${user._id}`} className="flex items-center space-x-4 flex-grow">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
          {user.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-lg font-bold text-white">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </span>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-white">{user.name}</h3>
          <p className="text-gray-400 text-sm">@{user.username}</p>
          <p className="text-purple-400 text-sm capitalize">{user.role}</p>
        </div>
      </Link>
      <div className="flex space-x-2">
        {actions}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center items-center">
        <div className="text-white">Loading connections...</div>
      </div>
    );
  }

  if (!connectionsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center items-center">
        <div className="text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Failed to Load Connections
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
            There was an error loading your connections. Please try again.
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'connections', label: 'Connections', count: connectionsData.connectionsCount },
    { id: 'requests', label: 'Requests', count: connectionsData.connectionRequestsCount },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'connections':
        return (
          <div className="space-y-4">
            {connectionsData.connections.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No connections yet.</p>
            ) : (
              connectionsData.connections.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  actions={
                    <button
                      onClick={() => handleRemoveConnection(user._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  }
                />
              ))
            )}
          </div>
        );
      case 'requests':
        return (
          <div className="space-y-4">
            {connectionsData.connectionRequests.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No pending requests.</p>
            ) : (
              connectionsData.connectionRequests.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  actions={
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptRequest(user._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(user._id)}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                      >
                        Decline
                      </button>
                    </div>
                  }
                />
              ))
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-center">
            My Connections
          </h1>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center mb-8 border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-purple-400 border-b-2 border-purple-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-gray-800 rounded-lg p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
