// frontend/src/pages/Auth/Login.jsx
// Login page component

import React, { useState } from ‘react’;
import { Link, useNavigate } from ‘react-router-dom’;
import { useAuth } from ‘../../contexts/AuthContext’;
import { Mail, Lock, AlertCircle } from ‘lucide-react’;

export default function Login() {
const navigate = useNavigate();
const { login } = useAuth();
const [loading, setLoading] = useState(false);
const [error, setError] = useState(’’);
const [formData, setFormData] = useState({
email: ‘’,
password: ‘’
});

const handleChange = (e) => {
const { name, value } = e.target;
setFormData(prev => ({
…prev,
[name]: value
}));
setError(’’);
};

const handleSubmit = async (e) => {
e.preventDefault();


if (!formData.email || !formData.password) {
  setError('Please fill in all fields');
  return;
}

setLoading(true);
setError('');

try {
  const result = await login(formData.email, formData.password);
  
  if (result.success) {
    navigate('/dashboard');
  } else {
    setError(result.error || 'Login failed');
  }
} catch (err) {
  setError('An unexpected error occurred');
} finally {
  setLoading(false);
}


};

return (
<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
<div className="max-w-md w-full">
{/* Logo and Header */}
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
<span className="text-2xl font-bold text-white">IH</span>
</div>
<h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
<p className="text-gray-600 mt-2">Sign in to your Insight Hunter account</p>
</div>


    {/* Login Form */}
    <div className="bg-white rounded-lg shadow-lg p-8">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>
          <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>

    {/* Footer */}
    <p className="text-center text-sm text-gray-600 mt-8">
      By signing in, you agree to our{' '}
      <a href="#" className="text-blue-600 hover:text-blue-700">Terms of Service</a>
      {' '}and{' '}
      <a href="#" className="text-blue-600 hover:text-blue-700">Privacy Policy</a>
    </p>
  </div>
</div>


);
}
