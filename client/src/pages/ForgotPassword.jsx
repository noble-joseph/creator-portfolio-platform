import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const isValidEmail = (e) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(e.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");

    const sanitizedEmail = email.trim().toLowerCase();

    if (!sanitizedEmail) {
      return setErrorMsg("Email is required.");
    }

    if (!isValidEmail(sanitizedEmail)) {
      return setErrorMsg("Please enter a valid email address.");
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Failed to send reset link.");
        return;
      }
      setMessage(data.message || "If an account with that email exists, a password reset link has been sent.");
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <AuthLayout showRoleSelector={false}>
      <h2 className="text-3xl font-bold">Forgot Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Enter your email"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200">
          Send Reset Link
        </button>
      </form>

      {message && <div className="text-green-400 text-sm font-medium mt-4">{message}</div>}
      {errorMsg && <div className="text-red-400 text-sm font-medium mt-4">{errorMsg}</div>}

      <div className="mt-6 text-center">
        <Link to="/login" className="text-purple-600 hover:underline">
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}
