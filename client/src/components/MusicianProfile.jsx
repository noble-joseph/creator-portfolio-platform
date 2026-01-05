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
    <div className="min-h-screen bg-[#1a120b] bg-[radial-gradient(circle_at_center,_#2a1d15_0%,_#1a120b_100%)]">
      {/* Cover Photo Section */}
      <div className="relative h-[450px] overflow-hidden">
        {user.coverPhoto ? (
          <img
            src={user.coverPhoto}
            alt="Cover"
            className="w-full h-full object-cover transform scale-105 filter brightness-50"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#3d2b1f] to-[#1a120b]" />
        )}

        {/* Overlay with Profile Info */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a120b] via-transparent to-transparent flex items-end">
          <div className="container mx-auto px-6 pb-12">
            <div className="flex items-end space-x-8">
              {/* Profile Photo */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.7 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-[#D4AF37] rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                <img
                  src={user.profilePhoto || '/default-avatar.png'}
                  alt={user.name}
                  className="w-40 h-40 rounded-full border-4 border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.3)] object-cover relative z-10"
                />
                {user.isVerified && (
                  <div className="absolute bottom-1 right-1 bg-[#D4AF37] text-[#1a120b] rounded-full p-2 z-20 shadow-xl">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </motion.div>

              {/* Profile Info */}
              <div className="pb-4">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center space-x-3 mb-2"
                >
                  <span className="px-3 py-1 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-full text-xs font-bold uppercase tracking-widest">
                    {user.experienceLevel}
                  </span>
                  <span className="text-[#D4AF37]/60">•</span>
                  <span className="text-[#D4AF37]/80 font-medium italic">{user.genre}</span>
                </motion.div>
                <motion.h1
                  className="text-5xl font-bold text-white mb-3 tracking-tight"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {user.name}
                </motion.h1>
                <motion.div
                  className="flex items-center space-x-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center text-gray-400">
                    <svg className="w-4 h-4 mr-2 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{user.location?.city || 'Worldwide'}</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <svg className="w-4 h-4 mr-2 text-[#D4AF37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>{user.analytics?.profileViews || 0} Professional Views</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column - Audio Player & Tracks */}
          <div className="lg:col-span-2 space-y-10">
            {/* Featured Track */}
            {audioTracks.length > 0 && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                className="bg-[#2a1d15]/50 backdrop-blur-md rounded-3xl p-8 border border-[#D4AF37]/20 shadow-2xl overflow-hidden relative"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24 text-[#D4AF37]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>

                <h2 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-6">Featured Masterpiece</h2>
                <div className="bg-black/40 rounded-2xl p-6 border border-[#D4AF37]/10">
                  <div className="flex items-center space-x-6 mb-8">
                    <div className="relative group">
                      <img
                        src={audioTracks[0].thumbnail || '/default-track.png'}
                        alt={audioTracks[0].title}
                        className="w-24 h-24 rounded-xl object-cover shadow-lg group-hover:scale-105 transition-transform"
                      />
                      <button
                        onClick={() => handlePlayTrack(audioTracks[0])}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"
                      >
                        <FaPlay className="text-[#D4AF37] w-6 h-6" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1 tracking-tight">{audioTracks[0].title}</h3>
                      <p className="text-gray-400 font-medium italic">{audioTracks[0].description}</p>
                    </div>
                  </div>

                  {/* Audio Player */}
                  {(() => {
                    if (!currentTrack) return null;
                    const raw = currentTrack.mediaFiles?.find(m => m.type === 'audio')?.url;
                    const src = raw ? (raw.startsWith('http') ? raw : `${API_BASE}/uploads/${raw}`) : undefined;
                    if (!src) return null;
                    return (
                      <div className="mt-4">
                        <AudioPlayer
                          src={src}
                          title={currentTrack.title}
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                          theme="wooden"
                        />
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}

            {/* Track List */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-[#2a1d15]/30 backdrop-blur-sm rounded-3xl p-8 border border-[#D4AF37]/10"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white tracking-tight">Discography</h2>
                <span className="text-xs font-bold text-[#D4AF37]/60 uppercase tracking-widest">{audioTracks.length} compositions</span>
              </div>
              <div className="space-y-4">
                {audioTracks.map((track, index) => (
                  <motion.div
                    key={track._id}
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center space-x-6 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300 group cursor-pointer border border-transparent hover:border-[#D4AF37]/20"
                  >
                    <span className="text-[#D4AF37]/30 font-bold w-6 text-sm">{String(index + 1).padStart(2, '0')}</span>
                    <div className="relative">
                      <img
                        src={track.thumbnail || '/default-track.png'}
                        alt={track.title}
                        className="w-14 h-14 rounded-lg object-cover shadow-md"
                      />
                      <button
                        onClick={() => handlePlayTrack(track)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                      >
                        <FaPlay className="text-[#D4AF37] w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-bold group-hover:text-[#D4AF37] transition-colors">{track.title}</h4>
                      <p className="text-gray-500 text-xs font-medium mt-0.5">{track.tags?.join(' • ') || 'Composition'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleFavorite(track._id); }}
                        className={`p-2 rounded-full transition-all ${favorites.includes(track._id)
                            ? 'text-red-500 bg-red-500/10'
                            : 'text-gray-600 hover:text-red-500 hover:bg-red-500/5'
                          }`}
                      >
                        <FaHeart className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-full transition-all">
                        <FaShare className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-[#D4AF37] hover:bg-[#D4AF37]/5 rounded-full transition-all">
                        <FaDownload className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Info & Stats */}
          <div className="space-y-8">
            {/* Bio Card */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="bg-[#2a1d15]/50 backdrop-blur-md rounded-3xl p-8 border border-[#D4AF37]/20 shadow-xl"
            >
              <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-4">The Narrative</h3>
              <p className="text-gray-300 leading-relaxed font-medium italic">
                "{user.bio || 'This creator is letting their work speak for itself.'}"
              </p>
            </motion.div>

            {/* Performance Stats */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-[#2a1d15]/30 backdrop-blur-sm rounded-3xl p-8 border border-[#D4AF37]/10"
            >
              <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-6">Performance</h3>
              <div className="space-y-5">
                {[
                  { label: 'Network Reach', value: user.connections?.length || 0, icon: '👥' },
                  { label: 'Audience', value: user.followers?.length || 0, icon: '📈' },
                  { label: 'Composition View', value: user.analytics?.portfolioViews || 0, icon: '🎵' },
                  { label: 'Profile Influence', value: user.analytics?.profileViews || 0, icon: '✨' }
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div className="flex items-center">
                      <span className="mr-3 filter grayscale group-hover:grayscale-0 transition-all">{stat.icon}</span>
                      <span className="text-gray-400 font-medium">{stat.label}</span>
                    </div>
                    <span className="text-white font-bold text-lg">{stat.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Social Presence */}
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-[#2a1d15]/30 backdrop-blur-sm rounded-3xl p-8 border border-[#D4AF37]/10"
            >
              <h3 className="text-sm font-bold text-[#D4AF37] uppercase tracking-[0.2em] mb-6">Social Canvas</h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(user.socialMedia || {}).map(([platform, link], i) => link && (
                  <a
                    key={platform}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center justify-center p-4 bg-white/5 rounded-2xl hover:bg-[#D4AF37]/10 border border-transparent hover:border-[#D4AF37]/30 transition-all duration-300 group"
                  >
                    <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                      {platform === 'instagram' ? '📷' : platform === 'twitter' ? '🐦' : platform === 'linkedin' ? '💼' : '🌐'}
                    </span>
                    <span className="text-gray-400 group-hover:text-white text-xs font-bold uppercase tracking-widest transition-colors">{platform}</span>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicianProfile;
