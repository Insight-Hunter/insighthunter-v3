var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';
export default function Signup() {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => (Object.assign(Object.assign({}, prev), { [name]: value })));
        if (error)
            setError('');
    };
    const handleSubmit = (e) => __awaiter(this, void 0, void 0, function* () {
        e.preventDefault();
        // Basic Validation
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        if (formData.password.length < 6) {
            setError('Password should be at least 6 characters');
            return;
        }
        try {
            setLoading(true);
            // Assuming signup API accepts (email, password, name) parameters.
            yield signup(formData.email, formData.password, formData.name);
            navigate('/dashboard');
        }
        catch (signupError) {
            setError((signupError === null || signupError === void 0 ? void 0 : signupError.message) || 'Failed to create an account');
            setLoading(false);
        }
    });
    return (<div className="signup-container max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

      {error && (<div className="error-message mb-4 flex items-center text-red-600 bg-red-50 border border-red-200 rounded p-3">
          <AlertCircle className="mr-2"/>
          <span>{error}</span>
        </div>)}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group mb-4">
          <label htmlFor="name" className="block mb-1 font-medium flex items-center gap-1">
            <User /> Name
          </label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} disabled={loading} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
        </div>

        <div className="form-group mb-4">
          <label htmlFor="email" className="block mb-1 font-medium flex items-center gap-1">
            <Mail /> Email
          </label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} disabled={loading} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
        </div>

        <div className="form-group mb-4">
          <label htmlFor="password" className="block mb-1 font-medium flex items-center gap-1">
            <Lock /> Password
          </label>
          <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} disabled={loading} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
        </div>

        <div className="form-group mb-6">
          <label htmlFor="confirmPassword" className="block mb-1 font-medium flex items-center gap-1">
            <Lock /> Confirm Password
          </label>
          <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} disabled={loading} className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded font-semibold hover:bg-blue-700 transition disabled:opacity-50">
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline">
          Log In
        </Link>
      </p>
    </div>);
}
