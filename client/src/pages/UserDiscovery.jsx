import { useState, useEffect } from "react";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function UserDiscovery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async (query) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/discover?search=${encodeURIComponent(query)}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length >= 3) {
      fetchUsers(value);
    } else {
      setUsers([]);
    }
  };

  const handleSendConnectionRequest = async (userId) => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/connect/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        alert("Connection request sent");
      } else {
        alert("Failed to send connection request");
      }
    } catch (error) {
      console.error("Failed to send connection request", error);
      alert("Failed to send connection request");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent text-center">
          Discover Users
        </h1>
        <input
          type="text"
          placeholder="Search users by name or username (min 3 chars)"
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 mb-6 text-white"
        />
        {loading && <p>Loading...</p>}
        {!loading && users.length === 0 && searchTerm.length >= 3 && (
          <p className="text-gray-400">No users found.</p>
        )}
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user._id} className="bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <Link to={`/profile/${user._id}`} className="flex items-center space-x-4 flex-grow">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  {user.profilePhoto ? (
                    <img
                      src={user.profilePhoto.startsWith("http") ? user.profilePhoto : `${API_BASE}/uploads/${user.profilePhoto}`}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-white">
                      {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{user.name}</h3>
                  <p className="text-gray-400 text-sm">@{user.username}</p>
                  <p className="text-purple-400 text-sm capitalize">{user.role}</p>
                </div>
              </Link>
              <button
                onClick={() => handleSendConnectionRequest(user._id)}
                className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
