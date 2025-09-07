// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("photographer");
  const [specialization, setSpecialization] = useState("");
  const [specializationDetails, setSpecializationDetails] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();
  


  const isValidUsername = (u) => /^[a-zA-Z0-9_]{3,20}$/.test(u);
  const getPasswordStrength = (pwd) => {
    if (pwd.length < 8) return "Too short";
    if (!/[A-Z]/.test(pwd)) return "Add uppercase";
    if (!/[a-z]/.test(pwd)) return "Add lowercase";
    if (!/\d/.test(pwd)) return "Add number";
    if (!/[\W_]/.test(pwd)) return "Add special character";
    return "Strong";
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();
    const sanitizedUsername = username.trim();
    const sanitizedName = name.trim();

    if (!sanitizedEmail || !sanitizedPassword || !sanitizedUsername || !sanitizedName) {
      return setErrorMsg("All fields are required.");
    }

    if (!isValidUsername(sanitizedUsername)) {
      return setErrorMsg("Username must be 3–20 characters, no spaces.");
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: sanitizedName,
          username: sanitizedUsername,
          email: sanitizedEmail,
          password: sanitizedPassword,
          role,
          specialization,
          specializationDetails,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.message || "Registration failed.");
        return;
      }

      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <AuthLayout role={role} setRole={setRole} showRoleSelector={true}>
      <h2 className="text-3xl font-bold">Register</h2>

      <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-4">
        <input
          type="text"
          placeholder="Full Name"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Username"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

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

        {password && (
          <div className="text-xs text-gray-400">
            Strength: {getPasswordStrength(password)}
          </div>
        )}

        <input
          type="text"
          placeholder="Specialization"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Specialization Details (Optional)"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={specializationDetails}
          onChange={(e) => setSpecializationDetails(e.target.value)}
        />

        {errorMsg && (
          <div className="text-red-400 text-sm font-medium">{errorMsg}</div>
        )}

        <button type="submit" className="w-full py-3 bg-green-600 rounded-lg">
          Sign Up
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          to="/login"
          className="inline-block w-full py-3 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
        >
          Back to Login
        </Link>
      </div>
    </AuthLayout>
  );
}
