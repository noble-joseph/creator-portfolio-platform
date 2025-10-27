import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

const DashboardWidget = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/10 ${className}`}>
      <div className="flex items-center mb-4">
        {icon && <div className="mr-3 text-purple-400">{icon}</div>}
        <h3 className="text-xl font-bold text-purple-400">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export const PortfolioStatsWidget = ({ userId }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/creators/portfolio`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (response.ok) {
          const portfolios = await response.json();
          setStats({
            total: portfolios.length,
            public: portfolios.filter(p => p.privacy === 'public').length,
            private: portfolios.filter(p => p.privacy === 'private').length,
          });
        }
      } catch (error) {
        console.error('Failed to fetch portfolio stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) {
    return (
      <DashboardWidget title="Portfolio Stats" icon="📊">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget title="Portfolio Stats" icon="📊">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Total Works</span>
          <span className="text-white font-semibold">{stats?.total || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Public</span>
          <span className="text-green-400 font-semibold">{stats?.public || 0}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-300">Private</span>
          <span className="text-yellow-400 font-semibold">{stats?.private || 0}</span>
        </div>
      </div>
    </DashboardWidget>
  );
};

export const RecentActivityWidget = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // This would typically fetch from an activities endpoint
        // For now, we'll simulate with recent portfolio items
        const response = await fetch(`${API_BASE}/api/creators/portfolio/latest?limit=3`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (response.ok) {
          const portfolios = await response.json();
          const mockActivities = portfolios.map(portfolio => ({
            id: portfolio._id,
            type: 'portfolio_created',
            message: `Created new portfolio: ${portfolio.title}`,
            timestamp: portfolio.createdAt,
          }));
          setActivities(mockActivities);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId]);

  if (loading) {
    return (
      <DashboardWidget title="Recent Activity" icon="🔔">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget title="Recent Activity" icon="🔔">
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="text-gray-300 text-sm">{activity.message}</p>
                <p className="text-gray-500 text-xs">
                  {new Date(activity.timestamp).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No recent activity</p>
        )}
      </div>
    </DashboardWidget>
  );
};

export const ConnectionRequestsWidget = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/auth/connections`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setRequests(data.connectionRequests || []);
        }
      } catch (error) {
        console.error('Failed to fetch connection requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [userId]);

  const handleAccept = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/accept-connection/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        setRequests(requests.filter(req => req._id !== userId));
      }
    } catch (error) {
      console.error('Failed to accept connection:', error);
    }
  };

  const handleDecline = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/decline-connection/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        setRequests(requests.filter(req => req._id !== userId));
      }
    } catch (error) {
      console.error('Failed to decline connection:', error);
    }
  };

  if (loading) {
    return (
      <DashboardWidget title="Connection Requests" icon="👥">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded"></div>
        </div>
      </DashboardWidget>
    );
  }

  return (
    <DashboardWidget title="Connection Requests" icon="👥">
      <div className="space-y-3">
        {requests.length > 0 ? (
          requests.slice(0, 3).map((request) => (
            <div key={request._id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                {request.profilePhoto ? (
                  <img
                    src={request.profilePhoto}
                    alt={request.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-white">
                      {request.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-white text-sm font-medium">{request.name}</p>
                  <p className="text-gray-400 text-xs">{request.specialization}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAccept(request._id)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDecline(request._id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No pending requests</p>
        )}
      </div>
    </DashboardWidget>
  );
};

export const QuickActionsWidget = ({ navigate }) => {
  const actions = [
    {
      label: 'Add Portfolio Item',
      icon: '➕',
      action: () => navigate('/portfolio'),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Discover Creators',
      icon: '🔍',
      action: () => navigate('/discover'),
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      label: 'View Messages',
      icon: '💬',
      action: () => navigate('/messages'),
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      label: 'Edit Profile',
      icon: '⚙️',
      action: () => navigate('/profile'),
      color: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ];

  return (
    <DashboardWidget title="Quick Actions" icon="⚡">
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`flex flex-col items-center justify-center p-4 ${action.color} text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg`}
          >
            <span className="text-2xl mb-2">{action.icon}</span>
            <span className="text-sm font-medium text-center">{action.label}</span>
          </button>
        ))}
      </div>
    </DashboardWidget>
  );
};

export default DashboardWidget;
