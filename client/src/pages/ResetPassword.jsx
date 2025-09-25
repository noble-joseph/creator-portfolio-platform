import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config";
import AuthLayout from "../components/AuthLayout";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [message, setMessage] = useState("");

  const validatePassword = (pwd) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pwd);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setMessage("");

    if (!password || !confirmPassword) {
      return setErrorMsg("Both password fields are required.");
    }

    if (password !== confirmPassword) {
      return setErrorMsg("Passwords do not match.");
    }

    if (!validatePassword(password)) {
      return setErrorMsg("Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.");
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Failed to reset password.");
        return;
      }
      setMessage(data.message || "Password has been reset successfully.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <AuthLayout showRoleSelector={false}>
      <h2 className="text-3xl font-bold">Reset Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="password"
          placeholder="New Password"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button type="submit" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200">
          Reset Password
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
