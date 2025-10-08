// ============================================================================
// CSV PARSING
// Parse CSV content and validate structure
// ============================================================================

// frontend/src/components/CSVUpload.js
// React component for uploading and processing CSV files

import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';

function CSVUpload({ clientId = null, onUploadComplete }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    
    // Validate file type
    if (file && !file.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }
    
    // Validate file size (10MB limit)
    if (file && file.size > 10 * 1024 * 1024) {
      setError('File is too large. Maximum size is 10MB.');
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError(null);
    
    try {
      // Get the auth token from localStorage
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('You must be logged in to upload files');
      }
      
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Include client_id if we're uploading for a specific client
      if (clientId) {
        formData.append('client_id', clientId);
      }
      
      // Make the upload request to your Worker
      const response = await fetch('https://api.insighthunter.app/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        // Handle different error types appropriately
        if (response.status === 403 && result.limit) {
          // User hit their plan limit
          throw new Error(
            `You've reached your upload limit of ${result.limit} files per month. ` +
            `${result.upgradeMessage || 'Please upgrade your plan to continue.'}`
          );
        }
        
        throw new Error(result.error || 'Upload failed');
      }
      
      // Upload succeeded
      setUploadResult(result);
      
      // Notify parent component if callback provided
      if (onUploadComplete) {
        onUploadComplete(result);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Upload Financial Data
        </h2>
        
        <p className="text-gray-600 mb-6">
          Upload a CSV file containing your bank transactions or financial data. 
          Our AI will automatically categorize each transaction and prepare 
          forecasts based on the data.
        </p>
        
        {/* File selection input */}
        <div className="mb-6">
          <label className="block mb-2">
            <span className="text-gray-700 font-medium">Select CSV File</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              disabled={uploading}
              className="block w-full mt-2 text-sm text-gray-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </label>
          
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
            </div>
          )}
        </div>
        
        {/* Upload button */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium
            hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
            flex items-center justify-center transition"
        >
          {uploading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Upload and Process
            </>
          )}
        </button>
        
        {/* Error message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-900">Upload Failed</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}
        
        {/* Success message with results */}
        {uploadResult && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start mb-4">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Upload Successful!</p>
                <p className="text-sm text-green-700 mt-1">
                  Processed {uploadResult.processedTransactions} transactions 
                  from {uploadResult.filename}
                </p>
              </div>
            </div>
            
            {/* Categorization statistics */}
            <div className="bg-white rounded p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Categorization Methods:
              </p>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>AI + Semantic Learning:</span>
                  <span className="font-medium">{uploadResult.categorizationStats.vectorize}</span>
                </div>
                <div className="flex justify-between">
                  <span>Rule-based:</span>
                  <span className="font-medium">{uploadResult.categorizationStats.rules}</span>
                </div>
                <div className="flex justify-between">
                  <span>Needs Review:</span>
                  <span className="font-medium">{uploadResult.categorizationStats.default}</span>
                </div>
              </div>
            </div>
            
            {/* Preview of transactions */}
            {uploadResult.transactions && uploadResult.transactions.length > 0 && (
              <div className="bg-white rounded p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">
                  Transaction Preview:
                </p>
                <div className="space-y-2">
                  {uploadResult.transactions.slice(0, 5).map((tx, idx) => (
                    <div key={idx} className="text-sm border-l-4 border-blue-400 pl-3 py-1">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {tx.description}
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5">
                            {tx.date} • {tx.category}
                            {tx.confidence < 0.8 && (
                              <span className="ml-2 text-yellow-600">
                                (Low confidence - please review)
                              </span>
                            )}
                          </p>
                        </div>
                        <span className={`font-medium ml-4 ${
                          tx.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ${Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  {uploadResult.transactions.length > 5 && (
                    <p className="text-xs text-gray-500 text-center pt-2">
                      Showing 5 of {uploadResult.transactions.length} transactions
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Help text */}
        <div className="mt-6 text-sm text-gray-600">
          <p className="font-medium mb-2">CSV Format Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Must include columns for date, amount, and description</li>
            <li>Column names can vary (e.g., "Transaction Date" or "Date")</li>
            <li>Negative amounts represent expenses, positive are income</li>
            <li>Maximum file size is 10MB</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default CSVUpload;
