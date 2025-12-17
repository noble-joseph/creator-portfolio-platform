import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaEye, FaEyeSlash, FaGoogle, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import apiClient, { API_BASE } from '../utils/api';
import { isEmail, nonEmpty } from '../utils/validation';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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
    if (formData.email && !isEmail(formData.email)) errs.email = 'Invalid email format';
    if (!nonEmpty(formData.password)) errs.password = 'Password is required';
    return errs;
  }, [formData]);

  const formValid = useMemo(() => Object.keys(fieldErrors).length === 0 && isEmail(formData.email) && nonEmpty(formData.password), [fieldErrors, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/api/auth/login', formData);

      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        login(response.data.token, response.data.refreshToken, response.data.user);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'NETWORK_ERROR' || err.message.includes('Network Error')) {
        setError(`Network error. Please check if the server is reachable: ${API_BASE}`);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-premium-dark flex items-center justify-center px-4">
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
              Welcome Back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-neutral-400"
            >
              Sign in to your creator account
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

          {/* Login Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
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
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formValid}
              className="btn btn-primary btn-md w-full"
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </motion.form>

          {/* Divider */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="my-6 flex items-center"
          >
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-4 text-neutral-400 text-sm">or</span>
            <div className="flex-1 border-t border-white/10"></div>
          </motion.div>

          {/* Google Login */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            onClick={handleGoogleLogin}
            className="btn btn-outline btn-md w-full"
          >
            <FaGoogle className="text-error-500 mr-2" />
            Continue with Google
          </motion.button>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-6 text-center space-y-2"
          >
            <Link
              to="/forgot-password"
              className="text-gold-500 hover:text-gold-400 text-sm transition-colors"
            >
              Forgot your password?
            </Link>
            <div className="text-neutral-400 text-sm">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-gold-500 hover:text-gold-400 transition-colors"
              >
                Sign up
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Server Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-6 text-center"
        >
          <div className="card bg-white/5 border-white/10">
            <h3 className="text-white font-semibold mb-2">Server Status</h3>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-neutral-400 text-sm">API: {API_BASE}</span>
            </div>
            <p className="text-neutral-500 text-xs mt-1">
              Make sure the server is running before logging in
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;