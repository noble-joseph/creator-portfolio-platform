import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";

export default function PublicProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const [userRes, portfolioRes] = await Promise.all([
          fetch(`${API_BASE}/api/auth/profile/${userId}`),
          fetch(`${API_BASE}/api/creator/portfolio/public/${userId}`)
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData);
        }

        if (portfolioRes.ok) {
          const portfolioData = await portfolioRes.json();
          setPortfolios(portfolioData);
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center items-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex justify-center items-center">
        <div className="text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            User Not Found
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8 text-lg">
            The creator you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {user.name}
          </h1>
          <p className="text-gray-400 text-lg mb-2">@{user.username}</p>
          <p className="text-purple-400 text-xl capitalize mb-2">{user.role}</p>
          <p className="text-gray-300 mb-4">{user.specialization}</p>
          {user.specializationDetails && (
            <p className="text-gray-400 mb-4">{user.specializationDetails}</p>
          )}
          {user.bio && (
            <p className="text-gray-300 max-w-2xl mx-auto">{user.bio}</p>
          )}
        </div>

        {/* Skills */}
        {user.skills && user.skills.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span key={index} className="bg-purple-600 px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experiences */}
        {user.experiences && user.experiences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Experience</h2>
            <div className="space-y-4">
              {user.experiences.map((exp, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold">{exp.title}</h3>
                  <p className="text-purple-400">{exp.company}</p>
                  <p className="text-gray-400 text-sm">{exp.duration}</p>
                  {exp.description && <p className="text-gray-300 mt-2">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Public Portfolio */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Portfolio</h2>
          {portfolios.length === 0 ? (
            <p className="text-gray-400">No public portfolio items available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolios.map((item) => (
                <div key={item._id} className="bg-gray-800 p-4 rounded-lg shadow-lg">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-full h-40 object-cover rounded mb-4"
                    />
                  )}
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="mb-2">{item.description}</p>
                  <p className="mb-2">
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-purple-400 underline">
                      View Work
                    </a>
                  </p>
                  <p className="mb-2 text-sm text-gray-400">Category: {item.category}</p>
                  {item.tags && item.tags.length > 0 && (
                    <p className="text-sm text-gray-400">Tags: {item.tags.join(", ")}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
