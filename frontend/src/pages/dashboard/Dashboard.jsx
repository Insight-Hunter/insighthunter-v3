// frontend/src/pages/dashboard/Dashboard.jsx
// Main dashboard that incorporates CSV upload

import React, { useState, useEffect } from 'react';
import CSVUpload from '../components/CSVUpload';

function Dashboard() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);

  const handleUploadComplete = async (uploadResult) => {
    // When an upload completes, you might want to:
    // 1. Refresh the dashboard to show new data
    // 2. Show a success notification
    // 3. Navigate to the transactions view
    // 4. Trigger forecast recalculation
    
    console.log('Upload completed:', uploadResult);
    
    // Refresh recent uploads list
    fetchRecentUploads();
    
    // You could also trigger other updates here
    // like refreshing charts or forecasts
  };

  const fetchRecentUploads = async () => {
    // Fetch recent uploads from your management Worker
    // This would show users their upload history
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Financial Dashboard
        </h1>
        
        {/* Upload section */}
        <div className="mb-8">
          <CSVUpload 
            clientId={selectedClient?.id}
            onUploadComplete={handleUploadComplete}
          />
        </div>
        
        {/* Other dashboard components would go here */}
        {/* Like charts, recent transactions, alerts, etc. */}
      </div>
    </div>
  );
}

export default Dashboard;
