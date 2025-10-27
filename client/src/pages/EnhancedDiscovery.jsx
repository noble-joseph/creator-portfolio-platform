import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaMusic, FaCamera, FaStar, FaHeart, FaEye } from 'react-icons/fa';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EnhancedDiscovery = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    experienceLevel: 'all',
    location: 'all',
    sortBy: 'recent',
    availability: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/ai/discover');
      const recs = (response.data?.recommendations || []).map(r => ({ ...r.user, reasons: r.reasons }));
      setUsers(recs);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(user => user.role === filters.category);
    }

    // Experience level filter
    if (filters.experienceLevel !== 'all') {
      filtered = filtered.filter(user => user.experienceLevel === filters.experienceLevel);
    }

    // Location filter
    if (filters.location !== 'all') {
      filtered = filtered.filter(user => 
        user.location?.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        user.location?.country?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Availability filter
    if (filters.availability !== 'all') {
      filtered = filtered.filter(user => user.availability === filters.availability);
    }

    // Sort
    switch (filters.sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popular':
        filtered.sort((a, b) => (b.analytics?.profileViews || 0) - (a.analytics?.profileViews || 0));
        break;
      case 'connections':
        filtered.sort((a, b) => (b.connections?.length || 0) - (a.connections?.length || 0));
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    setFilteredUsers(filtered);
  };

  const handleFavorite = (userId) => {
    setFavorites(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'musician':
        return <FaMusic className="w-4 h-4" />;
      case 'photographer':
        return <FaCamera className="w-4 h-4" />;
      default:
        return <FaStar className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'musician':
        return 'from-purple-500 to-pink-500';
      case 'photographer':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-gray-500 to-gray-600';
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
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Discover Creators
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find amazing musicians, photographers, and creative professionals to connect and collaborate with.
          </p>
        </motion.div>

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search creators, genres, styles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <FaFilter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-gray-600"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="musician">Musicians</option>
                      <option value="photographer">Photographers</option>
                    </select>
                  </div>

                  {/* Experience Level Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Experience</label>
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                      className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Levels</option>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="professional">Professional</option>
                    </select>
                  </div>

                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                    <input
                      type="text"
                      placeholder="City, Country"
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Availability Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Availability</label>
                    <select
                      value={filters.availability}
                      onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                      className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All</option>
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                    </select>
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="recent">Most Recent</option>
                      <option value="popular">Most Popular</option>
                      <option value="connections">Most Connected</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <p className="text-gray-300">
            Showing {filteredUsers.length} of {users.length} creators
          </p>
        </motion.div>

        {/* User Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {filteredUsers.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              {/* Profile Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={user.profilePhoto || '/default-avatar.png'}
                    alt={user.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/20"
                  />
                  {user.isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {user.name}
                  </h3>
                  <p className="text-gray-400 text-sm">@{user.username}</p>
                </div>
                <button
                  onClick={() => handleFavorite(user._id)}
                  className={`p-2 rounded-full transition-colors ${
                    favorites.includes(user._id)
                      ? 'text-red-500 bg-red-500/20'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-500/20'
                  }`}
                >
                  <FaHeart className="w-4 h-4" />
                </button>
              </div>

              {/* Role Badge */}
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getRoleColor(user.role)} text-white mb-3`}>
                {getRoleIcon(user.role)}
                <span className="capitalize">{user.role}</span>
              </div>

              {/* Specialization */}
              <p className="text-gray-300 text-sm mb-3">
                {user.specialization || user.genre || user.style || 'General'}
              </p>

              {/* Reasons (from KNN) */}
              {Array.isArray(user.reasons) && user.reasons.length > 0 && (
                <ul className="mb-3 text-xs text-gray-400 list-disc list-inside space-y-0.5">
                  {user.reasons.slice(0,3).map((reason, i) => (
                    <li key={i}>{reason}</li>
                  ))}
                </ul>
              )}

              {/* Bio */}
              <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                {user.bio || 'No bio available.'}
              </p>

              {/* Location */}
              {user.location && (
                <div className="flex items-center space-x-1 text-gray-400 text-sm mb-4">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  <span>{user.location.city}, {user.location.country}</span>
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                <div className="flex items-center space-x-1">
                  <FaEye className="w-3 h-3" />
                  <span>{user.analytics?.profileViews || 0}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FaHeart className="w-3 h-3" />
                  <span>{user.connections?.length || 0}</span>
                </div>
                <span className="capitalize">{user.experienceLevel}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <a
                  href={`/profile/${user._id}`}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium text-center transition-colors"
                >
                  View Profile
                </a>
                <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white text-sm font-medium transition-colors">
                  Connect
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredUsers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No creators found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or filters to find more creators.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  category: 'all',
                  experienceLevel: 'all',
                  location: 'all',
                  sortBy: 'recent',
                  availability: 'all'
                });
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedDiscovery;
