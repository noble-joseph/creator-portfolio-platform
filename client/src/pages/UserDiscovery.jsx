import { useState, useEffect } from "react";
import { API_BASE } from "../config";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

export default function UserDiscovery() {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("search"); // "search" | "knn" | "nb" | "tree"

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

  const fetchKNNUsers = async () => {
    setLoading(true);
    setMode("knn");
    try {
      const response = await fetch(`${API_BASE}/api/ai/discover`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const recs = (data.recommendations || []).map(r => ({ ...r.user, reasons: r.reasons }));
        setUsers(recs);
      } else {
        console.error("Failed to fetch similar users: HTTP status", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch similar users", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNBSuggestions = async () => {
    setLoading(true);
    setMode("nb");
    try {
      const response = await fetch(`${API_BASE}/api/ai/nb-specialization-suggestions`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const suggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
        // Flatten example users and annotate with reasons
        const flattened = suggestions.flatMap(s =>
          (s.examples || []).map(ex => ({
            ...ex,
            reasons: [`Suggested specialization: ${s.specialization}`]
          }))
        );
        // Deduplicate by _id
        const seen = new Set();
        const unique = flattened.filter(u => {
          if (!u._id || seen.has(u._id)) return false;
          seen.add(u._id);
          return true;
        });
        setUsers(unique);
      } else {
        console.error("Failed to fetch NB suggestions: HTTP status", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch NB suggestions", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDTMatches = async () => {
    setLoading(true);
    setMode("tree");
    try {
      const response = await fetch(`${API_BASE}/api/ai/decision-tree-matches`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        const matches = (data.matches || []).map(m => ({ ...m.user, reasons: m.reasons }));
        setUsers(matches);
      } else {
        console.error("Failed to fetch Decision Tree matches: HTTP status", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch Decision Tree matches", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setMode("search");
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
        {searchTerm === "" && (
          <div className="text-center mb-6">
            <button
              onClick={fetchKNNUsers}
              className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors text-white font-semibold"
            >
              Discover Similar Users
            </button>
            <div className="mt-3 flex items-center justify-center gap-3 flex-wrap">
              <button
                onClick={fetchNBSuggestions}
                className="px-4 py-2 bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors text-white text-sm"
              >
                NB: Suggest Specializations
              </button>
              <button
                onClick={fetchDTMatches}
                className="px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors text-white text-sm"
              >
                Decision Tree Matches
              </button>
            </div>
          </div>
        )}
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
                      src={user.profilePhoto}
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
                  {(mode === "knn" || mode === "tree" || mode === "nb") && Array.isArray(user.reasons) && user.reasons.length > 0 && (
                    <ul className="mt-1 text-xs text-gray-400 list-disc list-inside space-y-0.5">
                      {user.reasons.slice(0,3).map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  )}
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
