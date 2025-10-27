import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHeart, FaShare, FaDownload, FaExpand, FaCamera, FaMapMarkerAlt } from 'react-icons/fa';

const PhotographerProfile = ({ user, isOwner = false }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('all');

  const photos = user.portfolio?.filter(item => item.category === 'photography') || [];
  const filteredPhotos = filter === 'all' ? photos : photos.filter(photo => 
    photo.tags?.includes(filter.toLowerCase())
  );

  const handleFavorite = (photoId) => {
    setFavorites(prev => 
      prev.includes(photoId) 
        ? prev.filter(id => id !== photoId)
        : [...prev, photoId]
    );
  };

  const openLightbox = (photo) => {
    setSelectedImage(photo);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900">
      {/* Cover Photo Section */}
      <div className="relative h-96 overflow-hidden">
        {user.coverPhoto ? (
          <img 
            src={user.coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-600 to-blue-600" />
        )}
        
        {/* Overlay with Profile Info */}
        <div className="absolute inset-0 bg-black/40 flex items-end">
          <div className="container mx-auto px-6 pb-8">
            <div className="flex items-end space-x-6">
              {/* Profile Photo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <img 
                  src={user.profilePhoto || '/default-avatar.png'} 
                  alt={user.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-2xl object-cover"
                />
                {user.isVerified && (
                  <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full p-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </motion.div>

              {/* Profile Info */}
              <div className="text-white">
                <motion.h1 
                  className="text-4xl font-bold mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {user.name}
                </motion.h1>
                <motion.p 
                  className="text-xl text-gray-200 mb-2"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user.style} • {user.experienceLevel}
                </motion.p>
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-gray-300 flex items-center">
                    <FaMapMarkerAlt className="w-4 h-4 mr-1" />
                    {user.location?.city}, {user.location?.country}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-300">{user.analytics?.profileViews || 0} views</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Photo Gallery */}
          <div className="lg:col-span-3 space-y-8">
            {/* Filter Tabs */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex space-x-4"
            >
              {['all', 'portrait', 'landscape', 'wedding', 'commercial', 'street'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-full transition-colors ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </motion.div>

            {/* Photo Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo._id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20"
                >
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={photo.mediaFiles?.[0]?.url || photo.thumbnail} 
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                      <button
                        onClick={() => openLightbox(photo)}
                        className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                      >
                        <FaExpand className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleFavorite(photo._id)}
                        className={`p-3 rounded-full transition-colors ${
                          favorites.includes(photo._id) 
                            ? 'bg-red-500/20 text-red-500' 
                            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
                        }`}
                      >
                        <FaHeart className="w-4 h-4" />
                      </button>
                      <button className="bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors">
                        <FaShare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Photo Info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-semibold mb-1">{photo.title}</h3>
                    <p className="text-gray-300 text-sm">{photo.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-6">
            {/* Bio */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">About</h3>
              <p className="text-gray-300 leading-relaxed">{user.bio || 'No bio available.'}</p>
            </motion.div>

            {/* Equipment */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <FaCamera className="w-5 h-5 mr-2" />
                Equipment
              </h3>
              <div className="space-y-2">
                {user.skills?.map((skill, index) => (
                  <span key={index} className="inline-block bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm mr-2 mb-2">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Photos</span>
                  <span className="text-white font-semibold">{photos.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Profile Views</span>
                  <span className="text-white font-semibold">{user.analytics?.profileViews || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Connections</span>
                  <span className="text-white font-semibold">{user.connections?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Followers</span>
                  <span className="text-white font-semibold">{user.followers?.length || 0}</span>
                </div>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Connect</h3>
              <div className="space-y-3">
                {user.socialMedia?.instagram && (
                  <a href={user.socialMedia.instagram} className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                    <span className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">IG</span>
                    </span>
                    <span>Instagram</span>
                  </a>
                )}
                {user.socialMedia?.twitter && (
                  <a href={user.socialMedia.twitter} className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                    <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">TW</span>
                    </span>
                    <span>Twitter</span>
                  </a>
                )}
                {user.socialMedia?.facebook && (
                  <a href={user.socialMedia.facebook} className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors">
                    <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">FB</span>
                    </span>
                    <span>Facebook</span>
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={closeLightbox}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage.mediaFiles?.[0]?.url || selectedImage.thumbnail} 
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhotographerProfile;
