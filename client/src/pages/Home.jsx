import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import backgroundImage from '../assets/background.png'; 

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white flex justify-center items-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-purple-900/30 to-black/80 z-0"></div>
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div 
        className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent leading-tight font-display"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
        >
          Welcome to the Creator Platform
        </motion.h1>
        <motion.p 
          className="text-gray-300 max-w-3xl mx-auto mb-8 text-xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        >
          Showcase your creativity, connect with other artists, and build your professional portfolio. 
          Join a community of musicians, photographers, and creative professionals.
        </motion.p>
        
        {/* Feature highlights */}
        <motion.div 
          className="grid md:grid-cols-3 gap-6 mb-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          {[
            {
              icon: "🎨",
              title: "Showcase Your Work",
              description: "Create stunning portfolios that highlight your best work"
            },
            {
              icon: "🤝",
              title: "Connect & Collaborate",
              description: "Network with fellow creators and find collaboration opportunities"
            },
            {
              icon: "🚀",
              title: "Grow Your Career",
              description: "Build your professional presence and attract new opportunities"
            }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1, ease: "easeOut" }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <motion.div 
                className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: "easeOut" }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/login"
              className="px-10 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-full hover:from-primary-700 hover:to-secondary-700 transition-all duration-300 shadow-lg hover:shadow-primary-500/30 text-center group inline-block"
            >
              <span className="group-hover:mr-2 transition-all duration-300">Login</span>
              <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/register"
              className="px-10 py-4 bg-gradient-to-r from-dark-700/80 to-dark-800/80 backdrop-blur-sm text-white font-semibold rounded-full hover:from-dark-600/80 hover:to-dark-700/80 transition-all duration-300 shadow-lg hover:shadow-dark-500/30 text-center border border-white/20 group inline-block"
            >
              <span className="group-hover:mr-2 transition-all duration-300">Get Started</span>
              <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">✨</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats section */}
        <motion.div 
          className="mt-16 grid grid-cols-3 gap-8 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
        >
          {[
            { number: "1000+", label: "Active Creators", color: "text-primary-400" },
            { number: "5000+", label: "Portfolio Views", color: "text-secondary-400" },
            { number: "500+", label: "Collaborations", color: "text-accent-400" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="group"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.6 + index * 0.1, ease: "easeOut" }}
              whileHover={{ scale: 1.1 }}
            >
              <motion.div 
                className={`text-3xl font-bold ${stat.color} group-hover:scale-110 transition-transform duration-300`}
                animate={{ 
                  textShadow: [
                    "0 0 0px rgba(59, 130, 246, 0)",
                    "0 0 10px rgba(59, 130, 246, 0.5)",
                    "0 0 0px rgba(59, 130, 246, 0)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
              >
                {stat.number}
              </motion.div>
              <div className="text-gray-400 text-sm mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
