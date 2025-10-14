// frontend/src/components/Layout/Sidebar.jsx
// Navigation sidebar with menu items

import React from ‘react’;
import { NavLink } from ‘react-router-dom’;
import {
LayoutDashboard,
Users,
Upload,
FileText,
TrendingUp,
Bell,
Settings,
ChevronLeft,
ChevronRight,
BarChart3
} from ‘lucide-react’;
import { useAuth } from ‘../../contexts/AuthContext’;

const menuItems = [
{
name: ‘Dashboard’,
icon: LayoutDashboard,
path: ‘/dashboard’,
badge: null
},
{
name: ‘Clients’,
icon: Users,
path: ‘/clients’,
badge: null
},
{
name: ‘Upload Data’,
icon: Upload,
path: ‘/upload’,
badge: null
},
{
name: ‘Reports’,
icon: FileText,
path: ‘/reports’,
badge: null
},
{
name: ‘Forecasting’,
icon: TrendingUp,
path: ‘/forecasting’,
badge: ‘AI’
},
{
name: ‘Alerts’,
icon: Bell,
path: ‘/alerts’,
badge: null
},
{
name: ‘Settings’,
icon: Settings,
path: ‘/settings’,
badge: null
}
];

export default function Sidebar({ isOpen, onToggle }) {
const { user } = useAuth();

return (
<>
{/* Mobile Overlay */}
{isOpen && (
<div
className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden"
onClick={onToggle}
/>
)}


  {/* Sidebar */}
  <aside
    className={`fixed top-0 left-0 z-30 h-full bg-white border-r border-gray-200 transition-all duration-300 ${
      isOpen ? 'w-64' : 'w-20'
    } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
  >
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          {isOpen && (
            <div>
              <h1 className="text-lg font-bold text-gray-900">Insight Hunter</h1>
              <p className="text-xs text-gray-500">Auto-CFO Platform</p>
            </div>
          )}
        </div>
        
        {/* Toggle Button - Desktop Only */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-600"
        >
          {isOpen ? (
            <ChevronLeft className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                    {isOpen && (
                      <>
                        <span className="flex-1 font-medium">{item.name}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-600 rounded">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Plan Info */}
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600 uppercase">Your Plan</span>
              <span className="px-2 py-0.5 text-xs font-bold bg-blue-600 text-white rounded">
                {user?.plan?.toUpperCase() || 'FREE'}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-2">
              {getPlanDescription(user?.plan)}
            </p>
            <NavLink
              to="/settings"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              Upgrade Plan →
            </NavLink>
          </div>
        </div>
      )}

      {/* Collapsed Plan Badge */}
      {!isOpen && (
        <div className="p-4 border-t border-gray-200">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-white">
              {user?.plan?.charAt(0).toUpperCase() || 'F'}
            </span>
          </div>
        </div>
      )}
    </div>
  </aside>
</>


);
}

function getPlanDescription(plan) {
const descriptions = {
free: ‘Limited features. Upgrade for more clients and AI insights.’,
starter: ‘Great for freelancers. 5 clients included.’,
professional: ‘Perfect for small firms. Full AI features.’,
enterprise: ‘Unlimited everything. Best for agencies.’
};
return descriptions[plan?.toLowerCase()] || descriptions.free;
}
