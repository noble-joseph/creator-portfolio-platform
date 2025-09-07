import { useEffect, useState } from "react";
import { API_BASE } from "./config";

export default function Dashboard({ token, setToken }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/api/creator/dashboard`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setData(data))
      .catch((err) => setError(err.message));
  }, [token]);

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Creator Dashboard</h1>

      {error && <p className="text-red-500">Error: {error}</p>}
      {data ? (
        <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
      ) : (
        !error && <p>Loading...</p>
      )}

      <button
        onClick={logout}
        className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
