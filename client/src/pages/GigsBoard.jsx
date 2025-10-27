import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaMapMarkerAlt, FaClock, FaDollarSign, FaCalendarAlt, FaUser } from 'react-icons/fa';
import apiClient from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const GigsBoard = () => {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    experienceLevel: 'all',
    location: '',
    budgetMin: '',
    budgetMax: '',
    duration: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);

  useEffect(() => {
    fetchGigs();
  }, []);

  useEffect(() => {
    filterGigs();
  }, [gigs, searchTerm, filters]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/gigs');
      if (response.ok) {
        const data = await response.json();
        setGigs(data.gigs || []);
      }
    } catch (error) {
      console.error('Failed to fetch gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterGigs = () => {
    let filtered = [...gigs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(gig =>
        gig.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gig.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(gig => gig.category === filters.category);
    }

    // Experience level filter
    if (filters.experienceLevel !== 'all') {
      filtered = filtered.filter(gig => gig.experienceLevel === filters.experienceLevel);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(gig => 
        gig.location.city?.toLowerCase().includes(filters.location.toLowerCase()) ||
        gig.location.country?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Budget filter
    if (filters.budgetMin) {
      filtered = filtered.filter(gig => gig.budget.min >= parseInt(filters.budgetMin));
    }
    if (filters.budgetMax) {
      filtered = filtered.filter(gig => gig.budget.max <= parseInt(filters.budgetMax));
    }

    // Duration filter
    if (filters.duration !== 'all') {
      filtered = filtered.filter(gig => gig.duration === filters.duration);
    }

    setFilteredGigs(filtered);
  };

  const [filteredGigs, setFilteredGigs] = useState([]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'music': return '🎵';
      case 'photography': return '📸';
      case 'videography': return '🎬';
      case 'design': return '🎨';
      case 'writing': return '✍️';
      default: return '💼';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'music': return 'from-purple-500 to-pink-500';
      case 'photography': return 'from-blue-500 to-cyan-500';
      case 'videography': return 'from-red-500 to-orange-500';
      case 'design': return 'from-green-500 to-teal-500';
      case 'writing': return 'from-yellow-500 to-orange-500';
      default: return 'from-gray-500 to-gray-600';
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
            Gigs & Opportunities
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find amazing opportunities to showcase your talent and grow your career.
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
                placeholder="Search gigs, skills, locations..."
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Categories</option>
                      <option value="music">Music</option>
                      <option value="photography">Photography</option>
                      <option value="videography">Videography</option>
                      <option value="design">Design</option>
                      <option value="writing">Writing</option>
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

                  {/* Budget Min */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Min Budget</label>
                    <input
                      type="number"
                      placeholder="$0"
                      value={filters.budgetMin}
                      onChange={(e) => setFilters(prev => ({ ...prev, budgetMin: e.target.value }))}
                      className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Budget Max */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Max Budget</label>
                    <input
                      type="number"
                      placeholder="$10000"
                      value={filters.budgetMax}
                      onChange={(e) => setFilters(prev => ({ ...prev, budgetMax: e.target.value }))}
                      className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Duration Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Duration</label>
                    <select
                      value={filters.duration}
                      onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full p-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Durations</option>
                      <option value="1-day">1 Day</option>
                      <option value="1-week">1 Week</option>
                      <option value="1-month">1 Month</option>
                      <option value="3-months">3 Months</option>
                      <option value="6-months">6 Months</option>
                      <option value="ongoing">Ongoing</option>
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
            Showing {filteredGigs.length} of {gigs.length} opportunities
          </p>
        </motion.div>

        {/* Gigs Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredGigs.map((gig, index) => (
            <motion.div
              key={gig._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedGig(gig)}
            >
              {/* Category Badge */}
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${getCategoryColor(gig.category)} text-white mb-4`}>
                <span>{getCategoryIcon(gig.category)}</span>
                <span className="capitalize">{gig.category}</span>
              </div>

              {/* Title and Description */}
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                {gig.title}
              </h3>
              <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                {gig.description}
              </p>

              {/* Gig Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <FaDollarSign className="w-3 h-3" />
                  <span>${gig.budget.min} - ${gig.budget.max}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <FaClock className="w-3 h-3" />
                  <span className="capitalize">{gig.duration}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <FaMapMarkerAlt className="w-3 h-3" />
                  <span className="capitalize">{gig.location.type}</span>
                  {gig.location.city && <span>• {gig.location.city}</span>}
                </div>
                <div className="flex items-center space-x-2 text-gray-400 text-sm">
                  <FaUser className="w-3 h-3" />
                  <span className="capitalize">{gig.experienceLevel}</span>
                </div>
              </div>

              {/* Posted By */}
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src={gig.postedBy?.profilePhoto || '/default-avatar.png'}
                  alt={gig.postedBy?.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="text-white text-sm font-medium">{gig.postedBy?.name}</p>
                  <p className="text-gray-400 text-xs">Posted {new Date(gig.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{gig.applications} applications</span>
                <span>{gig.views} views</span>
              </div>

              {/* Urgent Badge */}
              {gig.isUrgent && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  Urgent
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* No Results */}
        {filteredGigs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-2">No gigs found</h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your search terms or filters to find more opportunities.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({
                  category: 'all',
                  experienceLevel: 'all',
                  location: '',
                  budgetMin: '',
                  budgetMax: '',
                  duration: 'all'
                });
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Gig Detail Modal */}
        <AnimatePresence>
          {selectedGig && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedGig(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">{selectedGig.title}</h2>
                  <button
                    onClick={() => setSelectedGig(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Gig Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Project Details</h3>
                      <p className="text-gray-300 mb-4">{selectedGig.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Budget:</span>
                          <span className="text-white">${selectedGig.budget.min} - ${selectedGig.budget.max}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white capitalize">{selectedGig.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Experience:</span>
                          <span className="text-white capitalize">{selectedGig.experienceLevel}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Location:</span>
                          <span className="text-white capitalize">{selectedGig.location.type}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                      <ul className="space-y-2">
                        {selectedGig.requirements?.map((req, index) => (
                          <li key={index} className="text-gray-300 flex items-start space-x-2">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>

                      <h3 className="text-lg font-semibold text-white mb-3 mt-6">Skills Needed</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedGig.skills?.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Apply Button */}
                  <div className="flex justify-center">
                    <button className="px-8 py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GigsBoard;
