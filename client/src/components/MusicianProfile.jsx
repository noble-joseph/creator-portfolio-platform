import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaVolumeUp, FaHeart, FaShare, FaDownload } from 'react-icons/fa';
import AudioPlayer from './AudioPlayer';
import { API_BASE } from '../config';

const MusicianProfile = ({ user, isOwner = false }) => {
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const audioTracks = user.portfolio?.filter(item => item.category === 'music') || [];

  const handlePlayTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handlePauseTrack = () => {
    setIsPlaying(false);
  };

  const handleFavorite = (trackId) => {
    setFavorites(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Cover Photo Section */}
      <div className="relative h-96 overflow-hidden">
        {user.coverPhoto ? (
          <img 
            src={user.coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600" />
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
                  {user.genre} • {user.experienceLevel}
                </motion.p>
                <motion.div 
                  className="flex items-center space-x-4"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="text-gray-300">{user.location?.city}, {user.location?.country}</span>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Audio Player & Tracks */}
          <div className="lg:col-span-2 space-y-8">
            {/* Featured Track */}
            {audioTracks.length > 0 && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Featured Track</h2>
                <div className="bg-black/20 rounded-xl p-4">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={audioTracks[0].thumbnail || '/default-track.png'} 
                      alt={audioTracks[0].title}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{audioTracks[0].title}</h3>
                      <p className="text-gray-300">{audioTracks[0].description}</p>
                    </div>
                    <button
                      onClick={() => handlePlayTrack(audioTracks[0])}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full transition-colors"
                    >
                      <FaPlay className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Audio Player */}
                  {(() => {
                    if (!currentTrack) return null;
                    const raw = currentTrack.mediaFiles?.find(m => m.type === 'audio')?.url;
                    const src = raw ? (raw.startsWith('http') ? raw : `${API_BASE}/uploads/${raw}`) : undefined;
                    if (!src) return null;
                    return (
                      <AudioPlayer
                        src={src}
                        title={currentTrack.title}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {/* Track List */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Discography</h2>
              <div className="space-y-3">
                {audioTracks.map((track, index) => (
                  <motion.div
                    key={track._id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex items-center space-x-4 p-3 bg-black/20 rounded-lg hover:bg-black/30 transition-colors"
                  >
                    <span className="text-gray-400 w-8">{index + 1}</span>
                    <img 
                      src={track.thumbnail || '/default-track.png'} 
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{track.title}</h4>
                      <p className="text-gray-400 text-sm">{track.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFavorite(track._id)}
                        className={`p-2 rounded-full transition-colors ${
                          favorites.includes(track._id) 
                            ? 'text-red-500 bg-red-500/20' 
                            : 'text-gray-400 hover:text-red-500'
                        }`}
                      >
                        <FaHeart className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
                        <FaShare className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
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

            {/* Stats */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <h3 className="text-xl font-bold text-white mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-300">Profile Views</span>
                  <span className="text-white font-semibold">{user.analytics?.profileViews || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">Track Plays</span>
                  <span className="text-white font-semibold">{user.analytics?.portfolioViews || 0}</span>
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
              transition={{ delay: 0.7 }}
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
    </div>
  );
};

export default MusicianProfile;
