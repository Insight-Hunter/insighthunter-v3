// frontend/src/components/Layout/Layout.jsx
// Main application layout with sidebar and header

import React, { useState } from ‘react’;
import { Outlet } from ‘react-router-dom’;
import Sidebar from ‘./Sidebar’;
import Header from ‘./Header’;

export default function Layout() {
const [sidebarOpen, setSidebarOpen] = useState(true);

return (
<div className="min-h-screen bg-gray-50">
{/* Sidebar */}
<Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />


  {/* Main Content Area */}
  <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'}`}>
    {/* Header */}
    <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

    {/* Page Content */}
    <main className="p-6 lg:p-8">
      <Outlet />
    </main>

    {/* Footer */}
    <footer className="border-t border-gray-200 bg-white py-4 px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
        <p>© 2025 Insight Hunter. All rights reserved.</p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="#" className="hover:text-blue-600">Privacy Policy</a>
          <a href="#" className="hover:text-blue-600">Terms of Service</a>
          <a href="#" className="hover:text-blue-600">Support</a>
        </div>
      </div>
    </footer>
  </div>
</div>


);
}
