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
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Professional gradient background */}
      <div className="absolute inset-0 bg-premium-dark z-0"></div>

      {/* Glass orbs with professional purple/teal colors */}
      <div className="absolute inset-0 z-0 overflow-hidden opacity-30">
        <div className="absolute w-96 h-96 bg-purple-900/40 rounded-full blur-3xl top-20 -left-20 animate-float"></div>
        <div className="absolute w-80 h-80 bg-blue-900/30 rounded-full blur-3xl top-40 right-10 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-72 h-72 bg-teal-900/25 rounded-full blur-3xl bottom-20 left-1/4 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl bottom-40 right-1/4 animate-float" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-16">
        <motion.div
          className="text-center max-w-5xl mx-auto w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 text-white leading-tight font-display"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          >
            Welcome to
            <span className="block bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 bg-clip-text text-transparent drop-shadow-lg"> Creator Platform</span>
          </motion.h1>
          <motion.p
            className="text-neutral-400 max-w-3xl mx-auto mb-12 text-xl leading-relaxed text-balance"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
          >
            Showcase your creativity, connect with other artists, and build your professional portfolio.
            Join a community of musicians, photographers, and creative professionals.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-16 text-center max-w-4xl mx-auto"
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
                className="card card-hover p-8 group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 + index * 0.1, ease: "easeOut" }}
              >
                <motion.div
                  className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-lg font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
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
                className="btn btn-primary btn-lg shadow-glow"
              >
                Login
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/register"
                className="btn btn-outline btn-lg"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats section */}
          <motion.div
            className="mt-20 grid grid-cols-3 gap-8 text-center max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4, ease: "easeOut" }}
          >
            {[
              { number: "1000+", label: "Active Creators" },
              { number: "5000+", label: "Portfolio Views" },
              { number: "500+", label: "Collaborations" }
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
                  className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-indigo-700 transition-all duration-300"
                  animate={{
                    textShadow: [
                      "0 0 0px rgba(139, 92, 246, 0)",
                      "0 0 15px rgba(139, 92, 246, 0.15)",
                      "0 0 0px rgba(139, 92, 246, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-neutral-400 text-sm mt-2">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
