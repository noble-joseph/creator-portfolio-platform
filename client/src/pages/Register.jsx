import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaSpinner, FaGoogle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import apiClient, { API_BASE } from '../utils/api';
import { isEmail, usernameValid, passwordStrength, describePasswordErrors, nonEmpty } from '../utils/validation';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    role: 'musician',
    genre: '',
    style: '',
    experienceLevel: 'beginner',
    specialization: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const fieldErrors = useMemo(() => {
    const errs = {};
    if (!nonEmpty(formData.name)) errs.name = 'Name is required';
    if (!isEmail(formData.email)) errs.email = 'Invalid email';
    if (!usernameValid(formData.username)) errs.username = '3-20 chars: letters, numbers, _ or .';
    const ps = passwordStrength(formData.password);
    if (!ps.strong) errs.password = `Weak password: ${describePasswordErrors(ps).join(', ')}`;
    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'Passwords do not match';

    if (formData.role === 'musician' && !nonEmpty(formData.genre)) errs.genre = 'Genre is required';
    if (formData.role === 'photographer' && !nonEmpty(formData.style)) errs.style = 'Style is required';
    if (!nonEmpty(formData.experienceLevel)) errs.experienceLevel = 'Experience level is required';
    if (!nonEmpty(formData.specialization)) errs.specialization = 'Specialization is required';
    return errs;
  }, [formData]);

  const formValid = useMemo(() => Object.keys(fieldErrors).length === 0, [fieldErrors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Client validation guard
    if (!formValid) { setLoading(false); return; }

    try {
      const response = await apiClient.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        role: formData.role,
        genre: formData.role === 'musician' ? formData.genre : undefined,
        style: formData.role === 'photographer' ? formData.style : undefined,
        experienceLevel: formData.experienceLevel,
        specialization: formData.specialization
      });

      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        login(response.data.token, response.data.refreshToken, response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError(`Network error. Please check if the server is reachable: ${API_BASE}`);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-premium-dark flex items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="card shadow-large">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-3xl font-bold text-white mb-2 font-display"
            >
              Create Account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-neutral-300"
            >
              Join our creator community
            </motion.p>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-error-50 border border-error-200 rounded-xl"
            >
              <p className="text-error-700 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Registration Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter your full name"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-error-600">{fieldErrors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input"
                placeholder="Enter your email"
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-error-600">{fieldErrors.email}</p>}
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-neutral-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="input"
                placeholder="Choose a username"
              />
              {fieldErrors.username && <p className="mt-1 text-xs text-error-600">{fieldErrors.username}</p>}
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-neutral-300 mb-2">
                Creator Type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="musician">Musician</option>
                <option value="photographer">Photographer</option>
              </select>
            </div>

            {/* Genre Selection (Musician only) */}
            {formData.role === 'musician' && (
              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-neutral-300 mb-2">
                  Primary Genre
                </label>
                <select
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Genre</option>
                  <option value="Classical">Classical</option>
                  <option value="Contemporary">Contemporary</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Rock">Rock</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.genre && <p className="mt-1 text-xs text-error-600">{fieldErrors.genre}</p>}
              </div>
            )}

            {/* Style Selection (Photographer only) */}
            {formData.role === 'photographer' && (
              <div>
                <label htmlFor="style" className="block text-sm font-medium text-neutral-300 mb-2">
                  Photography Style
                </label>
                <select
                  id="style"
                  name="style"
                  value={formData.style}
                  onChange={handleChange}
                  required
                  className="input"
                >
                  <option value="">Select Style</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Street">Street</option>
                  <option value="Portrait">Portrait</option>
                  <option value="Landscape">Landscape</option>
                  <option value="Cinematic">Cinematic</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.style && <p className="mt-1 text-xs text-error-600">{fieldErrors.style}</p>}
              </div>
            )}

            {/* Experience Level */}
            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-neutral-300 mb-2">
                Experience Level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                required
                className="input"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="professional">Professional</option>
              </select>
              {fieldErrors.experienceLevel && <p className="mt-1 text-xs text-error-600">{fieldErrors.experienceLevel}</p>}
            </div>

            {/* Specialization Field */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-neutral-300 mb-2">
                Specialization
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                className="input"
                placeholder={formData.role === 'musician' ? 'e.g., Rock, Jazz, Electronic' : 'e.g., Portrait, Landscape, Fashion'}
              />
              {fieldErrors.specialization && <p className="mt-1 text-xs text-error-600">{fieldErrors.specialization}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input pr-12"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {fieldErrors.password && <p className="mt-1 text-xs text-error-600">{fieldErrors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="mt-1 text-xs text-error-600">{fieldErrors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formValid}
              className="btn btn-primary btn-md w-full"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="my-6 flex items-center"
          >
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-4 text-neutral-400 text-sm">or</span>
            <div className="flex-1 border-t border-white/10"></div>
          </motion.div>

          {/* Google Registration */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            onClick={handleGoogleRegister}
            className="btn btn-outline btn-md w-full"
          >
            <FaGoogle className="text-error-500 mr-2" />
            Continue with Google
          </motion.button>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="mt-6 text-center"
          >
            <div className="text-neutral-400 text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-gold-500 hover:text-gold-400 transition-colors"
              >
                Sign in
              </Link>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;