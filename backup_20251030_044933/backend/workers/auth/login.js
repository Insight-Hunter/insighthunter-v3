import React, { useState } from ‘react’;
import { Activity, Mail, Lock, AlertCircle, Eye, EyeOff } from ‘lucide-react’;

function LoginPage() {
const [formData, setFormData] = useState({
email: ‘’,
password: ‘’,
rememberMe: false
});
  
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(’’);

const handleInputChange = (e) => {
const { name, value, type, checked } = e.target;
setFormData(prev => ({
…prev,
[name]: type === ‘checkbox’ ? checked : value
}));
// Clear error when user starts typing
if (error) setError(’’);
};

const validateForm = () => {
if (!formData.email) {
setError(‘Email is required’);
return false;
}
if (!/^[^\s@]+@[^\s@]+.[^\s@]+$/.test(formData.email)) {
setError(‘Please enter a valid email address’);
return false;
}
if (!formData.password) {
setError(‘Password is required’);
return false;
}
if (formData.password.length < 6) {
setError(‘Password must be at least 6 characters’);
return false;
}
return true;
};

const handleSubmit = async (e) => {
e.preventDefault();

if (!validateForm()) {
  return;
}

setLoading(true);
setError('');

try {
  const response = await fetch('https://api.insighthunter.app/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // Store the JWT token
  localStorage.setItem('authToken', data.token);
  
  // Store user info
  localStorage.setItem('userInfo', JSON.stringify(data.user));

  // Store remember me preference
  if (formData.rememberMe) {
    localStorage.setItem('rememberMe', 'true');
  }

  // Redirect to dashboard
  window.location.href = '/dashboard';

} catch (err) {
  setError(err.message || 'An error occurred during login');
} finally {
  setLoading(false);
}

};

const handleDemoLogin = () => {
// For demo purposes - pre-fill with test credentials
setFormData({
email: ‘demo@insighthunter.app’,
password: ‘demo123’,
rememberMe: false
});
setError(‘Demo credentials loaded. Click “Sign In” to continue.’);
};

return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
<div className="w-full max-w-md">
{/* Logo and Header */}
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center mb-4">
<div className="bg-blue-600 p-3 rounded-xl shadow-lg">
<Activity className="w-8 h-8 text-white" />
</div>
</div>
<h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
<p className="text-gray-600">Sign in to your Insight Hunter account</p>
</div>
  
    {/* Login Form */}
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700">Remember me</span>
          </label>
          <a
            href="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </a>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>

        {/* Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition"
          disabled={loading}
        >
          Load Demo Credentials
        </button>
      </form>

      {/* Divider */}
      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">New to Insight Hunter?</span>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <a
          href="/register"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Create your free account →
        </a>
      </div>
    </div>

    {/* Features Footer */}
    <div className="mt-8 text-center">
      <p className="text-sm text-gray-600 mb-4">Trusted by freelancers and CFOs</p>
      <div className="flex justify-center space-x-6 text-xs text-gray-500">
        <span className="flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Secure
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          AI-Powered
        </span>
        <span className="flex items-center">
          <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Easy to Use
        </span>
      </div>
    </div>
  </div>
</div>

);
}

export default LoginPage;
