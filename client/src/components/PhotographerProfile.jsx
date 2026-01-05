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
    <div className="min-h-screen bg-[#080808] text-white">
      {/* Cinematic Hero Section */}
      <div className="relative h-screen max-h-[800px] overflow-hidden group">
        {user.coverPhoto ? (
          <img
            src={user.coverPhoto}
            alt="Hero"
            className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110 filter brightness-[0.4]"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#1a1a1a] to-[#080808]" />
        )}

        {/* Spotlight Effect */}
        <div className="absolute inset-0 bg-radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)" />

        {/* Overlay with Profile Info */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-8 max-w-4xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-[#008080] rounded-full blur-2xl opacity-20 animate-pulse" />
                <img
                  src={user.profilePhoto || '/default-avatar.png'}
                  alt={user.name}
                  className="w-48 h-48 rounded-full border-2 border-[#008080] shadow-[0_0_50px_rgba(0,128,128,0.3)] object-cover relative z-10"
                />
              </div>
            </motion.div>

            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, tracking: '0.1em' }}
                animate={{ opacity: 1, tracking: '0.5em' }}
                transition={{ duration: 1 }}
                className="text-[#008080] font-bold text-sm uppercase tracking-[0.5em] flex items-center justify-center space-x-4"
              >
                <span className="h-px w-8 bg-[#008080]" />
                <span>{user.style || 'Visual Artist'}</span>
                <span className="h-px w-8 bg-[#008080]" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8 }}
                className="text-7xl font-bold font-display uppercase tracking-tight"
              >
                {user.name}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center justify-center space-x-6 text-gray-400 font-medium"
              >
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-[#CC5500]" />
                  {user.location?.city || 'Worldwide'}
                </div>
                <div className="w-1 h-1 bg-gray-600 rounded-full" />
                <div className="flex items-center">
                  <FaCamera className="mr-2 text-[#CC5500]" />
                  {user.experienceLevel}
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={() => document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-[#008080] hover:text-white transition-all duration-300 rounded-sm"
              >
                View Manifest
              </button>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </div>
      </div>

      {/* Main Content Area */}
      <div id="gallery" className="container mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">

          {/* Sidebar Info */}
          <div className="lg:col-span-3 space-y-12">
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-[#008080] uppercase tracking-[0.3em]">The Vision</h3>
              <p className="text-gray-400 leading-relaxed font-serif text-lg italic">
                "{user.bio || 'Capturing the unseen moments of existence.'}"
              </p>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-bold text-[#008080] uppercase tracking-[0.3em]">Gear & Arsenal</h3>
              <div className="flex flex-wrap gap-3">
                {user.skills?.map((skill, index) => (
                  <span key={index} className="px-3 py-1 bg-[#1a1a1a] border border-gray-800 text-gray-500 rounded-sm text-xs font-bold hover:border-[#008080] hover:text-[#008080] transition-colors cursor-crosshair">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-bold text-[#008080] uppercase tracking-[0.3em]">Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: 'Exhibitions', value: photos.length, highlight: '#CC5500' },
                  { label: 'Interactions', value: user.analytics?.profileViews || 0, highlight: '#008080' },
                  { label: 'Network', value: user.connections?.length || 0, highlight: '#CC5500' }
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-end border-b border-gray-800 pb-2 group">
                    <span className="text-gray-500 text-xs font-bold uppercase group-hover:text-gray-300 transition-colors">{stat.label}</span>
                    <span className="text-2xl font-bold tracking-tight" style={{ color: stat.highlight }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h3 className="text-xs font-bold text-[#008080] uppercase tracking-[0.3em]">Social Feed</h3>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(user.socialMedia || {}).map(([platform, link], i) => link && (
                  <a key={platform} href={link} target="_blank" rel="noopener noreferrer" className="aspect-square bg-[#1a1a1a] flex items-center justify-center rounded-lg hover:bg-[#008080]/20 border border-gray-800 hover:border-[#008080] transition-all group">
                    <span className="text-gray-500 group-hover:text-white transition-colors uppercase text-[10px] font-bold">{platform.slice(0, 2)}</span>
                  </a>
                ))}
              </div>
            </section>
          </div>

          {/* Gallery Work */}
          <div className="lg:col-span-9 space-y-12">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="text-4xl font-bold tracking-tighter">Collection</h2>
                <div className="h-1 w-20 bg-[#CC5500]" />
              </div>

              <div className="flex space-x-8">
                {['all', 'portrait', 'landscape', 'street'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`text-xs font-bold uppercase tracking-widest transition-all ${filter === f ? 'text-[#008080] scale-110' : 'text-gray-600 hover:text-gray-400'
                      }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {filteredPhotos.map((photo, index) => (
                <motion.div
                  key={photo._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group cursor-none"
                >
                  <img
                    src={photo.mediaFiles?.[0]?.url || photo.thumbnail}
                    alt={photo.title}
                    className="w-full rounded-sm grayscale group-hover:grayscale-0 transition-all duration-700"
                  />

                  {/* Cinematic Hover Overlay */}
                  <div className="absolute inset-0 bg-[#008080]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-transparent to-transparent">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="flex items-center space-x-2 text-[#008080] mb-2">
                        <span className="h-px w-4 bg-[#008080]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{photo.tags?.[0] || 'Original'}</span>
                      </div>
                      <h4 className="text-xl font-bold text-white mb-4">{photo.title}</h4>

                      <div className="flex space-x-3">
                        <button onClick={() => openLightbox(photo)} className="p-3 bg-white/10 backdrop-blur-md rounded-full hover:bg-white text-white hover:text-black transition-all">
                          <FaExpand className="w-3 h-3" />
                        </button>
                        <button onClick={() => handleFavorite(photo._id)} className={`p-3 backdrop-blur-md rounded-full transition-all ${favorites.includes(photo._id) ? 'bg-[#CC5500] text-white' : 'bg-white/10 text-white hover:bg-white hover:text-black'}`}>
                          <FaHeart className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Lightbox - Specialized for Cinema */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8 lg:p-24"
            onClick={closeLightbox}
          >
            <button className="absolute top-10 right-10 text-gray-500 hover:text-white transition-colors z-[110]">
              <span className="text-xs font-bold uppercase tracking-widest">Close [Esc]</span>
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.mediaFiles?.[0]?.url || selectedImage.thumbnail}
                alt={selectedImage.title}
                className="max-w-full max-h-[80vh] object-contain shadow-[0_0_100px_rgba(0,128,128,0.2)]"
              />
              <div className="mt-8 text-center space-y-2">
                <h3 className="text-2xl font-bold tracking-wider uppercase text-white">{selectedImage.title}</h3>
                <p className="text-[#008080] font-medium tracking-widest text-xs uppercase">{selectedImage.tags?.join(' / ')}</p>
                <p className="text-gray-500 max-w-xl mx-auto pt-4 italic">"{selectedImage.description}"</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .cursor-none {
          cursor: crosshair;
        }
      `}</style>
    </div>
  );
};

export default PhotographerProfile;
