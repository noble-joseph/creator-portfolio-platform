import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaUsers, FaUserShield, FaChartLine, FaFlag, FaTrash, FaCheck, FaTimes, 
  FaEye, FaEdit, FaBan, FaUnlock, FaDownload, FaSearch, FaFilter 
} from 'react-icons/fa';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EnhancedAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    musicians: 0,
    photographers: 0,
    totalPortfolios: 0,
    flaggedContent: 0,
    activeUsers: 0
  });
  const [users, setUsers] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, flaggedRes] = await Promise.all([
        apiClient.get('/api/admin/stats'),
        apiClient.get('/api/admin/users'),
        apiClient.get('/api/admin/flagged-content')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

      if (flaggedRes.ok) {
        const flaggedData = await flaggedRes.json();
        setFlaggedContent(flaggedData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, action) => {
    try {
      const response = await apiClient.post(`/api/admin/users/${userId}/${action}`);
      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error(`Failed to ${action} user:`, error);
    }
  };

  const handleContentAction = async (contentId, action) => {
    try {
      const response = await apiClient.post(`/api/admin/content/${contentId}/${action}`);
      if (response.ok) {
        await fetchDashboardData();
      }
    } catch (error) {
      console.error(`Failed to ${action} content:`, error);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = userFilter === 'all' || user.role === userFilter;
    
    return matchesSearch && matchesFilter;
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
            Admin Dashboard
          </h1>
          <p className="text-gray-300">Manage users, content, and platform settings</p>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex space-x-1 mb-8 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20"
        >
          {[
            { id: 'overview', label: 'Overview', icon: FaChartLine },
            { id: 'users', label: 'Users', icon: FaUsers },
            { id: 'content', label: 'Content', icon: FaFlag },
            { id: 'settings', label: 'Settings', icon: FaUserShield }
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Total Users', value: stats.totalUsers, icon: FaUsers, color: 'from-blue-500 to-cyan-500' },
                { label: 'Musicians', value: stats.musicians, icon: FaUsers, color: 'from-purple-500 to-pink-500' },
                { label: 'Photographers', value: stats.photographers, icon: FaUsers, color: 'from-green-500 to-teal-500' },
                { label: 'Total Portfolios', value: stats.totalPortfolios, icon: FaChartLine, color: 'from-orange-500 to-red-500' },
                { label: 'Flagged Content', value: stats.flaggedContent, icon: FaFlag, color: 'from-red-500 to-pink-500' },
                { label: 'Active Users', value: stats.activeUsers, icon: FaUserShield, color: 'from-indigo-500 to-purple-500' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <stat.icon className="w-8 h-8 text-white/60" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  { action: 'New user registered', user: 'John Doe', time: '2 minutes ago', type: 'user' },
                  { action: 'Content flagged', user: 'Jane Smith', time: '15 minutes ago', type: 'content' },
                  { action: 'Portfolio uploaded', user: 'Mike Johnson', time: '1 hour ago', type: 'portfolio' },
                  { action: 'User verified', user: 'Sarah Wilson', time: '2 hours ago', type: 'verification' }
                ].map((activity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg"
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'content' ? 'bg-red-500' :
                      activity.type === 'portfolio' ? 'bg-green-500' : 'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-white font-medium">{activity.action}</p>
                      <p className="text-gray-400 text-sm">by {activity.user}</p>
                    </div>
                    <span className="text-gray-400 text-sm">{activity.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Search and Filter */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="musician">Musicians</option>
                  <option value="photographer">Photographers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">User</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Joined</th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.05 }}
                        className="hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={user.profilePhoto || '/default-avatar.png'}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className="text-white font-medium">{user.name}</p>
                              <p className="text-gray-400 text-sm">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                            user.role === 'musician' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => window.open(`/profile/${user._id}`, '_blank')}
                              className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
                              title="View Profile"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, 'verify')}
                              className="p-2 text-gray-400 hover:text-green-400 transition-colors"
                              title="Verify User"
                            >
                              <FaCheck className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, 'ban')}
                              className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                              title="Ban User"
                            >
                              <FaBan className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleUserAction(user._id, 'delete')}
                              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              title="Delete User"
                            >
                              <FaTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* Content Tab */}
        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">Flagged Content</h2>
              {flaggedContent.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No flagged content at this time.</p>
              ) : (
                <div className="space-y-4">
                  {flaggedContent.map((content, index) => (
                    <motion.div
                      key={content._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{content.title}</h3>
                          <p className="text-gray-400 text-sm mb-2">{content.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Reported by: {content.reportedBy}</span>
                            <span>Reason: {content.reason}</span>
                            <span>Date: {new Date(content.reportedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleContentAction(content._id, 'approve')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-white text-sm transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleContentAction(content._id, 'remove')}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-white text-sm transition-colors"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold mb-6">Platform Settings</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Registration Status
                  </label>
                  <select className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                    <option value="open">Open Registration</option>
                    <option value="invite">Invite Only</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Content Moderation
                  </label>
                  <select className="w-full p-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500">
                    <option value="auto">Automatic</option>
                    <option value="manual">Manual Review</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="maintenance"
                    className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="maintenance" className="text-gray-300">
                    Enable Maintenance Mode
                  </label>
                </div>

                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;
