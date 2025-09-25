import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
      <div className={`relative z-10 text-center px-6 max-w-4xl mx-auto transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-indigo-200 bg-clip-text text-transparent leading-tight">
          Welcome to the Creator Platform
        </h1>
        <p className="text-gray-300 max-w-3xl mx-auto mb-8 text-xl leading-relaxed">
          Showcase your creativity, connect with other artists, and build your professional portfolio. 
          Join a community of musicians, photographers, and creative professionals.
        </p>
        
        {/* Feature highlights */}
        <div className="grid md:grid-cols-3 gap-6 mb-12 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-lg font-semibold mb-2">Showcase Your Work</h3>
            <p className="text-gray-300 text-sm">Create stunning portfolios that highlight your best work</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-lg font-semibold mb-2">Connect & Collaborate</h3>
            <p className="text-gray-300 text-sm">Network with fellow creators and find collaboration opportunities</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="text-lg font-semibold mb-2">Grow Your Career</h3>
            <p className="text-gray-300 text-sm">Build your professional presence and attract new opportunities</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-purple-500/30 text-center group"
          >
            <span className="group-hover:mr-2 transition-all duration-300">Login</span>
            <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">→</span>
          </Link>
          <Link
            to="/register"
            className="px-10 py-4 bg-gradient-to-r from-gray-700/80 to-gray-800/80 backdrop-blur-sm text-white font-semibold rounded-full hover:from-gray-600/80 hover:to-gray-700/80 transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-gray-500/30 text-center border border-white/20 group"
          >
            <span className="group-hover:mr-2 transition-all duration-300">Get Started</span>
            <span className="inline-block group-hover:translate-x-1 transition-transform duration-300">✨</span>
          </Link>
        </div>

        {/* Stats section */}
        <div className="mt-16 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-purple-400">1000+</div>
            <div className="text-gray-400 text-sm">Active Creators</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-400">5000+</div>
            <div className="text-gray-400 text-sm">Portfolio Views</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-pink-400">500+</div>
            <div className="text-gray-400 text-sm">Collaborations</div>
          </div>
        </div>
      </div>
    </div>
  );
}
