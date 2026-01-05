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

  useEffect(() => {
    fetchKNNUsers();
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setMode("search");
    if (value.length >= 3) {
      fetchUsers(value);
    } else if (value === "") {
      fetchKNNUsers();
    } else {
      setUsers([]);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-5xl">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-4 tracking-tighter uppercase">
            Discovery Hub
          </h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Find your next creative collaborator</p>
        </header>

        <div className="relative mb-12">
          <input
            type="text"
            placeholder="Search by name, role, or craft..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:border-[#008080] focus:ring-1 focus:ring-[#008080] transition-all outline-none text-lg"
          />
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {mode !== "search" && (
          <div className="flex items-center space-x-4 mb-8">
            <h2 className="text-xl font-bold uppercase tracking-tight text-[#008080]">Recommended For You</h2>
            <div className="h-px flex-1 bg-white/10" />
            <div className="flex space-x-2">
              <button
                onClick={fetchKNNUsers}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'knn' ? 'bg-[#008080] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
              >
                Similar Craft
              </button>
              <button
                onClick={fetchNBSuggestions}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'nb' ? 'bg-[#CC5500] text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
              >
                AI Suggestions
              </button>
              <button
                onClick={fetchDTMatches}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${mode === 'tree' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500 hover:text-white'}`}
              >
                Matchmaker
              </button>
            </div>
          </div>
        )}

        {searchTerm !== "" && mode === "search" && (
          <h2 className="text-xl font-bold uppercase tracking-tight text-gray-500 mb-8">Search Results</h2>
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
                      {user.reasons.slice(0, 3).map((reason, idx) => (
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
