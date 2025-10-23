// src/pages/Register.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";

const specializationOptions = {
  photographer: ["Portrait", "Landscape", "Wedding", "Fashion", "Wildlife", "Sports"],
  musician: ["Vocalist", "Guitarist", "Pianist", "Drummer", "Composer", "DJ"]
};

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("photographer");
  const [specialization, setSpecialization] = useState("");
  const [specializationDetails, setSpecializationDetails] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (specialization && !specializationOptions[role]?.includes(specialization)) {
      setSpecialization("");
    }
  }, [role]);
  


  const isValidUsername = (u) => {
    // Stricter: 3-20 chars, lowercase letters/numbers/underscores, no leading/trailing spaces or underscores
    const trimmed = u.trim();
    if (trimmed !== u) return false; // No leading/trailing spaces
    if (!/^[a-z0-9_]{3,20}$/.test(trimmed)) return false;
    if (trimmed.startsWith('_') || trimmed.endsWith('_')) return false; // No leading/trailing underscores
    if (/__/.test(trimmed)) return false; // No consecutive underscores
    return true;
  };

  // Instant validation handlers
  const handleUsernameChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    if (!isValidUsername(val)) {
      setUsernameError("Username must be 3–20 chars, lowercase letters, numbers, underscores only. No leading/trailing underscores or spaces.");
    } else {
      setUsernameError("");
    }
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (!isValidEmail(val)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (!isPasswordValid(val)) {
      setPasswordError("Password must be at least 8 characters with uppercase, lowercase, number, and special character.");
    } else {
      setPasswordError("");
    }
  };

  const isValidEmail = (e) => {
    // Stricter email regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(e.trim());
  };

  const getPasswordStrength = (pwd) => {
    if (pwd.length < 8) return "Too short";
    if (!/[A-Z]/.test(pwd)) return "Add uppercase";
    if (!/[a-z]/.test(pwd)) return "Add lowercase";
    if (!/\d/.test(pwd)) return "Add number";
    if (!/[\W_]/.test(pwd)) return "Add special character";
    return "Strong";
  };

  const isPasswordValid = (pwd) => getPasswordStrength(pwd) === "Strong";

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
      return setErrorMsg("Username must be 3–20 characters, lowercase letters, numbers, underscores only. No leading/trailing underscores or spaces.");
    }

    if (!isValidEmail(sanitizedEmail)) {
      return setErrorMsg("Please enter a valid email address.");
    }

    if (!isPasswordValid(sanitizedPassword)) {
      return setErrorMsg("Password must be at least 8 characters with uppercase, lowercase, number, and special character.");
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/auth/register`, {
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
          onChange={handleUsernameChange}
        />
        {usernameError && (
          <div className="text-red-400 text-xs">{usernameError}</div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={email}
          onChange={handleEmailChange}
        />
        {emailError && (
          <div className="text-red-400 text-xs">{emailError}</div>
        )}

        <input
          type="password"
          placeholder="Password"
          className="px-4 py-3 rounded-lg bg-white/10 text-white border border-gray-700"
          value={password}
          onChange={handlePasswordChange}
        />
        {passwordError && (
          <div className="text-red-400 text-xs">{passwordError}</div>
        )}

        {password && (
          <div className="text-xs text-gray-400">
            Strength: {getPasswordStrength(password)}
          </div>
        )}

        <select
          className="px-4 py-3 rounded-lg bg-white text-black border border-gray-700"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          required
        >
          <option value="" disabled>
            Select Specialization
          </option>
          {specializationOptions[role]?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

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
