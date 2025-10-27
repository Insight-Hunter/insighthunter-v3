// frontend/src/components/Layout/PublicLayout.jsx
// Layout for public pages (login, signup)

import React from 'react';
import { Outlet } from 'react-router-dom';

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Outlet />
    </div>
  );
}
