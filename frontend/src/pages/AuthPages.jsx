import React, { useState } from ‘react’;
import { Activity, Mail, Lock, AlertCircle, Eye, EyeOff, User, CheckCircle } from ‘lucide-react’;

function AuthPages() {
const [currentPage, setCurrentPage] = useState(‘login’); // ‘login’ or ‘register’

return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
{/* Page Selector for Demo */}
<div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg p-2 flex gap-2">
<button
onClick={() => setCurrentPage(‘login’)}
className={`px-4 py-2 rounded-lg font-medium transition ${ currentPage === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`}
>
Login
</button>
<button
onClick={() => setCurrentPage(‘register’)}
className={`px-4 py-2 rounded-lg font-medium transition ${ currentPage === 'register' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200' }`}
>
Register
</button>
</div>


  {currentPage === 'login' ? <LoginPage /> : <RegisterPage />}
</div>


);
}

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

const handleSubmit = async () => {
if (!validateForm()) {
return;
}


setLoading(true);
setError('');

try {
  const response = await fetch('https://api.insighthunter.app/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.email,
      password: formData.password
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userInfo', JSON.stringify(data.user));
  
  alert('Login successful! Redirecting to dashboard...');
  // In production: window.location.href = '/dashboard';

} catch (err) {
  setError(err.message || 'An error occurred during login');
} finally {
  setLoading(false);
}


};

const handleDemoLogin = () => {
setFormData({
email: ‘demo@insighthunter.app’,
password: ‘demo123’,
rememberMe: false
});
setError(’’);
};

return (
<div className="flex items-center justify-center min-h-screen p-4">
<div className="w-full max-w-md">
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center mb-4">
<div className="bg-blue-600 p-3 rounded-xl shadow-lg">
<Activity className="w-8 h-8 text-white" />
</div>
</div>
<h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
<p className="text-gray-600">Sign in to your Insight Hunter account</p>
</div>
  
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@company.com"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Create a strong password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-600">Password Strength</span>
                <span className={`font-medium ${
                  passwordStrength <= 1 ? 'text-red-600' :
                  passwordStrength <= 3 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {getPasswordStrengthText()}
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="Confirm your password"
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
            disabled={loading}
          />
          <label className="ml-2 text-sm text-gray-700">
            I agree to the{' '}
            <button
              onClick={() => alert('Terms would open here')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Terms of Service
            </button>
            {' '}and{' '}
            <button
              onClick={() => alert('Privacy policy would open here')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Privacy Policy
            </button>
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </div>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Already have an account?</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => alert('Would navigate to /login')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Sign in instead →
        </button>
      </div>
    </div>

    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-center text-blue-900 font-medium mb-2">
        What you'll get with your free account:
      </p>
      <ul className="space-y-2 text-sm text-blue-800">
        <li className="flex items-center">
          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
          500 transactions per month
        </li>
        <li className="flex items-center">
          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
          5 CSV uploads per month
        </li>
        <li className="flex items-center">
          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
          12 months of historical data
        </li>
        <li className="flex items-center">
          <CheckCircle className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
          Basic forecasting and insights
        </li>
      </ul>
    </div>
  </div>
</div>


);
}

export default AuthPages;.com”
disabled={loading}
/>
</div>
</div>


        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
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
          <button
            onClick={() => alert('Forgot password flow would go here')}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </button>
        </div>

        <button
          onClick={handleSubmit}
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

        <button
          onClick={handleDemoLogin}
          className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition"
          disabled={loading}
        >
          Load Demo Credentials
        </button>
      </div>

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">New to Insight Hunter?</span>
        </div>
      </div>

      <div className="mt-6 text-center">
        <span className="text-gray-600 text-sm">Don't have an account? </span>
        <button
          onClick={() => alert('Would navigate to /register')}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Create your free account →
        </button>
      </div>
    </div>

    <div className="mt-8 text-center">
      <p className="text-sm text-gray-600 mb-4">Trusted by freelancers and CFOs</p>
      <div className="flex justify-center space-x-6 text-xs text-gray-500">
        <span className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
          Secure
        </span>
        <span className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
          AI-Powered
        </span>
        <span className="flex items-center">
          <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
          Easy to Use
        </span>
      </div>
    </div>
  </div>
</div>

);
}

function RegisterPage() {
const [formData, setFormData] = useState({
name: ‘’,
email: ‘’,
password: ‘’,
confirmPassword: ‘’,
acceptTerms: false
});
const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(’’);
const [passwordStrength, setPasswordStrength] = useState(0);

const calculatePasswordStrength = (password) => {
let strength = 0;
if (password.length >= 8) strength++;
if (password.length >= 12) strength++;
if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
if (/\d/.test(password)) strength++;
if (/[^a-zA-Z\d]/.test(password)) strength++;
return strength;
};

const handleInputChange = (e) => {
const { name, value, type, checked } = e.target;
setFormData(prev => ({
…prev,
[name]: type === ‘checkbox’ ? checked : value
}));

if (name === 'password') {
  setPasswordStrength(calculatePasswordStrength(value));
}

if (error) setError('');


};

const validateForm = () => {
if (!formData.name || formData.name.trim().length < 2) {
setError(‘Please enter your full name’);
return false;
}
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
if (formData.password.length < 8) {
setError(‘Password must be at least 8 characters’);
return false;
}
if (formData.password !== formData.confirmPassword) {
setError(‘Passwords do not match’);
return false;
}
if (!formData.acceptTerms) {
setError(‘You must accept the terms and conditions’);
return false;
}
return true;
};

const handleSubmit = async () => {
if (!validateForm()) {
return;
}


setLoading(true);
setError('');

try {
  const response = await fetch('https://api.insighthunter.app/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: formData.name,
      email: formData.email,
      password: formData.password
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  localStorage.setItem('authToken', data.token);
  localStorage.setItem('userInfo', JSON.stringify(data.user));
  
  alert('Registration successful! Welcome to Insight Hunter');
  // In production: window.location.href = '/onboarding';

} catch (err) {
  setError(err.message || 'An error occurred during registration');
} finally {
  setLoading(false);
}
  
};

const getPasswordStrengthColor = () => {
if (passwordStrength <= 1) return ‘bg-red-500’;
if (passwordStrength <= 3) return ‘bg-yellow-500’;
return ‘bg-green-500’;
};

const getPasswordStrengthText = () => {
if (passwordStrength <= 1) return ‘Weak’;
if (passwordStrength <= 3) return ‘Medium’;
return ‘Strong’;
};

return (
<div className="flex items-center justify-center min-h-screen p-4">
<div className="w-full max-w-md">
<div className="text-center mb-8">
<div className="inline-flex items-center justify-center mb-4">
<div className="bg-blue-600 p-3 rounded-xl shadow-lg">
<Activity className="w-8 h-8 text-white" />
</div>
</div>
<h1 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h1>
<p className="text-gray-600">Start your 14-day free trial</p>
</div>


    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              placeholder="you@company

            
