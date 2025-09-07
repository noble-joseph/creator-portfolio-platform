import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.message);
    localStorage.setItem("accessToken", data.accessToken);
    window.location.href = "/dashboard";
  };

  return (
    <AuthLayout showRoleSelector={false}>
      <h2 className="text-3xl font-bold">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full py-3 bg-purple-600 rounded-lg">
          Log In
        </button>
      </form>

      {/* ✅ Register Button */}
      <div className="mt-6 text-center">
        <Link
          to="/register"
          className="inline-block w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
        >
          Create New Account
        </Link>
      </div>
    </AuthLayout>
  );
}
