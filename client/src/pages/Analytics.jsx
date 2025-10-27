import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChartLine, FaEye, FaHeart, FaUsers, FaDownload, FaTrendingUp } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/ai/analytics/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Analytics not available</h2>
          <p className="text-gray-400">Unable to load your analytics data.</p>
        </div>
      </div>
    );
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
            Creator Analytics
          </h1>
          <p className="text-gray-300">Insights and performance metrics for your creative journey.</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: 'Profile Views', 
              value: analytics.profilePerformance.views, 
              icon: FaEye, 
              color: 'from-blue-500 to-cyan-500',
              change: analytics.profilePerformance.growth
            },
            { 
              label: 'Engagement Rate', 
              value: `${analytics.profilePerformance.engagement}%`, 
              icon: FaHeart, 
              color: 'from-red-500 to-pink-500',
              change: '+5.2%'
            },
            { 
              label: 'Connections', 
              value: user.connections?.length || 0, 
              icon: FaUsers, 
              color: 'from-green-500 to-teal-500',
              change: '+3'
            },
            { 
              label: 'Collaboration Score', 
              value: `${analytics.collaborationPotential.score}/100`, 
              icon: FaChartLine, 
              color: 'from-purple-500 to-indigo-500',
              change: '+12'
            }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className={`bg-gradient-to-r ${stat.color} rounded-2xl p-6 text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-white/60 text-xs mt-1">{stat.change}</p>
                </div>
                <stat.icon className="w-8 h-8 text-white/60" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaTrendingUp className="w-5 h-5 text-green-400" />
              <span>Profile Performance</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Views</span>
                <span className="text-white font-semibold">{analytics.profilePerformance.views}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Growth Rate</span>
                <span className="text-green-400 font-semibold">+{analytics.profilePerformance.growth}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Engagement Rate</span>
                <span className="text-white font-semibold">{analytics.profilePerformance.engagement}%</span>
              </div>
            </div>

            {/* Mock Chart */}
            <div className="mt-6 h-32 bg-gray-800/50 rounded-lg flex items-end justify-center space-x-2 p-4">
              {[40, 60, 45, 80, 65, 90, 75].map((height, index) => (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t"
                  style={{ height: `${height}%`, width: '12%' }}
                />
              ))}
            </div>
          </motion.div>

          {/* Collaboration Potential */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaUsers className="w-5 h-5 text-purple-400" />
              <span>Collaboration Potential</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Collaboration Score</span>
                <span className="text-white font-semibold">{analytics.collaborationPotential.score}/100</span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                  style={{ width: `${analytics.collaborationPotential.score}%` }}
                />
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300">Suggestions:</h4>
                {analytics.collaborationPotential.suggestions.map((suggestion, index) => (
                  <p key={index} className="text-sm text-gray-400">• {suggestion}</p>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Market Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaChartLine className="w-5 h-5 text-blue-400" />
              <span>Market Trends</span>
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Role Demand</span>
                <span className={`font-semibold ${
                  analytics.marketTrends.roleDemand === 'High' ? 'text-green-400' :
                  analytics.marketTrends.roleDemand === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {analytics.marketTrends.roleDemand}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">Skill Trends:</h4>
                <div className="space-y-2">
                  {analytics.marketTrends.skillTrends.map((trend, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">{trend.skill}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          trend.trend === 'Growing' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {trend.trend}
                        </span>
                        <span className={`text-xs ${
                          trend.demand === 'High' ? 'text-green-400' : 'text-yellow-400'
                        }`}>
                          {trend.demand}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
          >
            <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
              <FaDownload className="w-5 h-5 text-yellow-400" />
              <span>Personalized Recommendations</span>
            </h2>
            
            <div className="space-y-3">
              {analytics.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/50 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-300 text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
