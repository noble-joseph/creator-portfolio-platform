import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isValidEmail = (e) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(e.trim());
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    if (!sanitizedEmail || !sanitizedPassword) {
      return setErrorMsg("Email and password are required.");
    }

    if (!isValidEmail(sanitizedEmail)) {
      return setErrorMsg("Please enter a valid email address.");
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Login failed.");
        return;
      }
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      window.location.href = "/dashboard";
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    }
  };

  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
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
        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200">
          Log In
        </button>
      </form>

      {errorMsg && (
        <div className="text-red-400 text-sm font-medium mt-4">{errorMsg}</div>
      )}

      {/* Google Sign-In Button */}
      <div className="mt-4 text-center">
        <button
          onClick={handleGoogleSignIn}
          className="w-full py-3 bg-red-600 rounded-lg hover:bg-red-700 transition text-white"
        >
          Sign in with Google
        </button>
      </div>

      {/* ✅ Register Button */}
      <div className="mt-6 text-center">
        <Link
          to="/register"
          className="inline-block w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors duration-200 text-center"
        >
          Create New Account
        </Link>
      </div>
      <div className="mt-4 text-center">
        <Link
          to="/forgot-password"
          className="inline-block w-full py-3 text-purple-600 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>
    </AuthLayout>
  );
}
