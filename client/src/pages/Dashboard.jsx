import { useEffect, useState } from "react";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";

// src/pages/Dashboard.jsx
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Welcome to Whiz Dashboard
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Manage your creative portfolio, connect with other creators, and showcase your work to the world.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Profile Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/10">
            <h2 className="text-xl font-bold mb-2 text-purple-400">Profile</h2>
            <p className="text-gray-300 mb-4">Update your specialization and details</p>
            <Profile />
          </div>
          
          {/* Portfolio Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/10">
            <h2 className="text-xl font-bold mb-2 text-purple-400">My Portfolio</h2>
            <p className="text-gray-300 mb-4">Manage and showcase your creative work</p>
            <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300">
              View Portfolio
            </button>
          </div>
          
          {/* Connections Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/10">
            <h2 className="text-xl font-bold mb-2 text-blue-400">Connections</h2>
            <p className="text-gray-300 mb-4">Connect with other creators and collaborators</p>
            <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300">
              View Connections
            </button>
          </div>
          
          {/* Analytics Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-green-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-500/10">
            <h2 className="text-xl font-bold mb-2 text-green-400">Analytics</h2>
            <p className="text-gray-300 mb-4">Track your portfolio performance and engagement</p>
            <button className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300">
              View Analytics
            </button>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              localStorage.removeItem("accessToken");
              window.location.href = "/login";
            }}
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-full hover:from-red-700 hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-red-500/20"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
