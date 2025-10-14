// frontend/src/pages/NotFound.jsx
// 404 Not Found page

import React from ‘react’;
import { Link } from ‘react-router-dom’;
import { Home, ArrowLeft } from ‘lucide-react’;

export default function NotFound() {
return (
<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
<div className="max-w-md w-full text-center">
<div className="mb-8">
<h1 className="text-9xl font-bold text-blue-600 mb-4">404</h1>
<h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
<p className="text-gray-600">
Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
</p>
</div>


    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Link
        to="/dashboard"
        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Home className="w-5 h-5 mr-2" />
        Go to Dashboard
      </Link>
      
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Go Back
      </button>
    </div>

    <div className="mt-12">
      <p className="text-sm text-gray-500">
        Need help?{' '}
        <a href="mailto:support@insighthunter.com" className="text-blue-600 hover:text-blue-700 font-medium">
          Contact Support
        </a>
      </p>
    </div>
  </div>
</div>


);
}
