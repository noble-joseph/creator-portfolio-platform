import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import Profile from "../components/Profile";

// src/pages/Dashboard.jsx

export default function Dashboard() {
  const navigate = useNavigate();
<<<<<<< HEAD
  const [userData, setUserData] = useState(null);
  const [portfolio, setPortfolio] = useState([]);

  useEffect(() => {
    // Fetch user data including specialization and profile photo
    fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUserData(data))
      .catch((err) => console.error("Failed to fetch user data", err));

    // Fetch portfolio data (latest 3 works)
    fetch(`${API_BASE}/api/portfolio/latest?limit=3`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setPortfolio(data))
      .catch((err) => console.error("Failed to fetch portfolio", err));
  }, []);
=======
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        {/* Header Section */}
        {userData && (
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Welcome back, {userData.name}
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto capitalize">
              {userData.role} • {userData.specialization}
            </p>
          </div>
        )}

        {/* Cover Photo Section */}
        {userData && (
          <div className="relative bg-gray-800 rounded-lg overflow-hidden max-w-4xl mx-auto mb-20">
            {userData.coverPhoto ? (
              <img
                src={userData.coverPhoto}
                alt="Cover Photo"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.querySelector('.fallback-cover').style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className={`fallback-cover w-full h-48 bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center ${userData.coverPhoto ? 'hidden' : 'flex'}`}
            >
              <h2 className="text-3xl font-semibold text-white">
                {userData.specialization || "Your Specialization"}
              </h2>
            </div>
            {userData.coverPhoto && (
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <h2 className="text-3xl font-semibold text-white">
                  {userData.specialization || "Your Specialization"}
                </h2>
              </div>
            )}

            {/* Profile Photo */}
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-0 z-10">
              {userData.profilePhoto ? (
                <img
                  src={userData.profilePhoto}
                  alt="Profile Photo"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-2xl ring-4 ring-gray-800"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className={`w-32 h-32 rounded-full border-4 border-white bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl ring-4 ring-gray-800 ${userData.profilePhoto ? 'hidden' : 'flex'}`}
              >
                <span className="text-3xl font-bold text-white">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            </div>

          </div>
        )}

        {/* Profile Information Section */}
        {userData && (
          <div className="max-w-4xl mx-auto bg-gray-800 rounded-lg p-6 mb-12 shadow-lg">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">Profile Information</h2>
            <Profile />
          </div>
<<<<<<< HEAD
        )}

        {/* Portfolio Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold mb-4 text-purple-400">Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolio.length > 0 ? (
              portfolio.map((item) => (
                <div key={item._id} className="bg-gray-800 rounded-lg p-4 shadow hover:shadow-lg transition-shadow">
                  <img src={item.image || "/default-work.png"} alt={item.title} className="w-full h-40 object-cover rounded" />
                  <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-gray-400 text-sm">{item.description}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No portfolio items to display.</p>
            )}
=======
          
          {/* Portfolio Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-500/10">
            <h2 className="text-xl font-bold mb-2 text-purple-400">My Portfolio</h2>
            <p className="text-gray-300 mb-4">Manage and showcase your creative work</p>
            <button
              onClick={() => navigate("/portfolio")}
              className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors duration-300"
            >
              View Portfolio
            </button>
>>>>>>> 746cdbec88b25341f99baffe05720d1fc2a0d97d
          </div>
          <button
            onClick={() => navigate("/portfolio")}
            className="mt-4 px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors"
          >
            View More
          </button>
        </div>

        {/* Connections and Analytics Section */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Connections Card */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-blue-500/10">
            <h2 className="text-xl font-bold mb-2 text-blue-400">Connections</h2>
            <p className="text-gray-300 mb-4">Connect with other creators and collaborators</p>
            <button
              onClick={() => navigate("/connections")}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-300"
            >
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

        {/* Logout Button */}
        <div className="text-center">
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
