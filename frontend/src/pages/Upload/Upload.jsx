// frontend/src/pages/Upload/Upload.jsx
// CSV upload page with preview and column mapping

import React, { useState, useEffect } from ‘react’;
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, X } from ‘lucide-react’;
import { clientsAPI, uploadAPI } from ‘../../services/api’;

export default function Upload() {
const [clients, setClients] = useState([]);
const [selectedClient, setSelectedClient] = useState(’’);
const [file, setFile] = useState(null);
const [uploading, setUploading] = useState(false);
const [processing, setProcessing] = useState(false);
const [uploadResult, setUploadResult] = useState(null);
const [error, setError] = useState(’’);
const [preview, setPreview] = useState([]);
const [columnMapping, setColumnMapping] = useState({});

useEffect(() => {
loadClients();
}, []);

const loadClients = async () => {
try {
const response = await clientsAPI.getAll();
setClients(response.data.clients);
if (response.data.clients.length > 0) {
setSelectedClient(response.data.clients[0].id);
}
} catch (err) {
setError(‘Failed to load clients’);
}
};

const handleFileSelect = (e) => {
const selectedFile = e.target.files[0];
if (!selectedFile) return;


if (!selectedFile.name.endsWith('.csv')) {
  setError('Please select a CSV file');
  return;
}

if (selectedFile.size > 10 * 1024 * 1024) {
  setError('File size must be less than 10MB');
  return;
}

setFile(selectedFile);
setError('');
setUploadResult(null);


};

const handleUpload = async () => {
if (!file || !selectedClient) {
setError(‘Please select a file and client’);
return;
}

setUploading(true);
setError('');

try {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('clientId', selectedClient);

  const response = await uploadAPI.uploadCSV(formData);
  
  setUploadResult(response.data);
  setPreview(response.data.preview || []);
  
  // Auto-detect column mapping from preview
  if (response.data.preview && response.data.preview.length > 0) {
    const detectedMapping = detectColumns(Object.keys(response.data.preview[0]));
    setColumnMapping(detectedMapping);
  }

} catch (err) {
  setError(err.response?.data?.error || 'Upload failed');
} finally {
  setUploading(false);
}


};

const handleProcess = async () => {
if (!uploadResult) return;


setProcessing(true);
setError('');

try {
  const response = await uploadAPI.processCSV(
    uploadResult.uploadId,
    selectedClient,
    columnMapping
  );

  alert(`Success! ${response.data.transactionsCreated} transactions created.`);
  
  // Reset form
  setFile(null);
  setUploadResult(null);
  setPreview([]);
  setColumnMapping({});

} catch (err) {
  setError(err.response?.data?.error || 'Processing failed');
} finally {
  setProcessing(false);
}

};

const detectColumns = (headers) => {
const mapping = {};


headers.forEach(header => {
  const lower = header.toLowerCase();
  
  if (!mapping.date && (lower.includes('date') || lower.includes('posted'))) {
    mapping.date = header;
  }
  if (!mapping.description && (lower.includes('description') || lower.includes('memo') || lower.includes('payee'))) {
    mapping.description = header;
  }
  if (!mapping.amount && (lower.includes('amount') || lower.includes('value'))) {
    mapping.amount = header;
  }
  if (!mapping.type && lower.includes('type')) {
    mapping.type = header;
  }
  if (!mapping.category && lower.includes('category')) {
    mapping.category = header;
  }
});

return mapping;


};

return (
<div className="max-w-4xl mx-auto space-y-6">
{/* Header */}
<div>
<h1 className="text-3xl font-bold text-gray-900">Upload Financial Data</h1>
<p className="text-gray-600 mt-1">Import CSV files with transactions, P&L, or balance sheets</p>
</div>


  {/* Error Alert */}
  {error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
      <div>
        <p className="text-sm text-red-800">{error}</p>
      </div>
      <button 
        onClick={() => setError('')}
        className="ml-auto text-red-600 hover:text-red-700"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )}

  {/* Upload Form */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select File and Client</h2>
    
    <div className="space-y-4">
      {/* Client Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Client
        </label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSV File
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          {!file ? (
            <div>
              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your CSV file here, or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      {file && !uploadResult && (
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedClient}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
    </div>
  </div>

  {/* Preview and Column Mapping */}
  {uploadResult && preview.length > 0 && (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Step 2: Review and Map Columns
      </h2>

      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-sm text-green-800">
            File uploaded successfully! Found {uploadResult.rowCount} rows.
          </p>
        </div>
      </div>

      {/* Column Mapping */}
      <div className="mb-6 space-y-3">
        <h3 className="font-medium text-gray-900">Map Your Columns</h3>
        
        {Object.keys(preview[0] || {}).map(column => (
          <div key={column} className="flex items-center gap-4">
            <span className="w-32 text-sm font-medium text-gray-700">{column}</span>
            <span className="text-gray-400">→</span>
            <select
              value={Object.keys(columnMapping).find(k => columnMapping[k] === column) || ''}
              onChange={(e) => setColumnMapping(prev => ({ ...prev, [e.target.value]: column }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Don't import</option>
              <option value="date">Date</option>
              <option value="description">Description</option>
              <option value="amount">Amount</option>
              <option value="type">Type</option>
              <option value="category">Category</option>
            </select>
          </div>
        ))}
      </div>

      {/* Data Preview */}
      <div className="overflow-x-auto mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Data Preview (first 5 rows)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {Object.keys(preview[0] || {}).map(header => (
                <th key={header} className="px-4 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, idx) => (
              <tr key={idx} className="border-t border-gray-200">
                {Object.values(row).map((value, vidx) => (
                  <td key={vidx} className="px-4 py-2 text-gray-600">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={processing || !columnMapping.date || !columnMapping.amount}
        className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : 'Process Transactions'}
      </button>

      {(!columnMapping.date || !columnMapping.amount) && (
        <p className="text-sm text-amber-600 mt-2 text-center">
          Please map at least Date and Amount columns to continue
        </p>
      )}
    </div>
  )}
</div>


);
}// frontend/src/pages/Upload/Upload.jsx
// CSV upload page with preview and column mapping

import React, { useState, useEffect } from ‘react’;
import { Upload as UploadIcon, FileText, CheckCircle, AlertCircle, X } from ‘lucide-react’;
import { clientsAPI, uploadAPI } from ‘../../services/api’;

export default function Upload() {
const [clients, setClients] = useState([]);
const [selectedClient, setSelectedClient] = useState(’’);
const [file, setFile] = useState(null);
const [uploading, setUploading] = useState(false);
const [processing, setProcessing] = useState(false);
const [uploadResult, setUploadResult] = useState(null);
const [error, setError] = useState(’’);
const [preview, setPreview] = useState([]);
const [columnMapping, setColumnMapping] = useState({});

useEffect(() => {
loadClients();
}, []);

const loadClients = async () => {
try {
const response = await clientsAPI.getAll();
setClients(response.data.clients);
if (response.data.clients.length > 0) {
setSelectedClient(response.data.clients[0].id);
}
} catch (err) {
setError(‘Failed to load clients’);
}
};

const handleFileSelect = (e) => {
const selectedFile = e.target.files[0];
if (!selectedFile) return;


if (!selectedFile.name.endsWith('.csv')) {
  setError('Please select a CSV file');
  return;
}

if (selectedFile.size > 10 * 1024 * 1024) {
  setError('File size must be less than 10MB');
  return;
}

setFile(selectedFile);
setError('');
setUploadResult(null);


};

const handleUpload = async () => {
if (!file || !selectedClient) {
setError(‘Please select a file and client’);
return;
}


setUploading(true);
setError('');

try {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('clientId', selectedClient);

  const response = await uploadAPI.uploadCSV(formData);
  
  setUploadResult(response.data);
  setPreview(response.data.preview || []);
  
  // Auto-detect column mapping from preview
  if (response.data.preview && response.data.preview.length > 0) {
    const detectedMapping = detectColumns(Object.keys(response.data.preview[0]));
    setColumnMapping(detectedMapping);
  }

} catch (err) {
  setError(err.response?.data?.error || 'Upload failed');
} finally {
  setUploading(false);
}


};

const handleProcess = async () => {
if (!uploadResult) return;


setProcessing(true);
setError('');

try {
  const response = await uploadAPI.processCSV(
    uploadResult.uploadId,
    selectedClient,
    columnMapping
  );

  alert(`Success! ${response.data.transactionsCreated} transactions created.`);
  
  // Reset form
  setFile(null);
  setUploadResult(null);
  setPreview([]);
  setColumnMapping({});

} catch (err) {
  setError(err.response?.data?.error || 'Processing failed');
} finally {
  setProcessing(false);
}


};

const detectColumns = (headers) => {
const mapping = {};


headers.forEach(header => {
  const lower = header.toLowerCase();
  
  if (!mapping.date && (lower.includes('date') || lower.includes('posted'))) {
    mapping.date = header;
  }
  if (!mapping.description && (lower.includes('description') || lower.includes('memo') || lower.includes('payee'))) {
    mapping.description = header;
  }
  if (!mapping.amount && (lower.includes('amount') || lower.includes('value'))) {
    mapping.amount = header;
  }
  if (!mapping.type && lower.includes('type')) {
    mapping.type = header;
  }
  if (!mapping.category && lower.includes('category')) {
    mapping.category = header;
  }
});

return mapping;


};

return (
<div className="max-w-4xl mx-auto space-y-6">
{/* Header */}
<div>
<h1 className="text-3xl font-bold text-gray-900">Upload Financial Data</h1>
<p className="text-gray-600 mt-1">Import CSV files with transactions, P&L, or balance sheets</p>
</div>


  {/* Error Alert */}
  {error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
      <div>
        <p className="text-sm text-red-800">{error}</p>
      </div>
      <button 
        onClick={() => setError('')}
        className="ml-auto text-red-600 hover:text-red-700"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  )}

  {/* Upload Form */}
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <h2 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Select File and Client</h2>
    
    <div className="space-y-4">
      {/* Client Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Client
        </label>
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {clients.map(client => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSV File
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          {!file ? (
            <div>
              <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Drag and drop your CSV file here, or click to browse
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                Choose File
              </label>
              <p className="text-xs text-gray-500 mt-2">Maximum file size: 10MB</p>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-600 mr-3" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      {file && !uploadResult && (
        <button
          onClick={handleUpload}
          disabled={uploading || !selectedClient}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>
      )}
    </div>
  </div>

  {/* Preview and Column Mapping */}
  {uploadResult && preview.length > 0 && (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Step 2: Review and Map Columns
      </h2>

      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
        <div>
          <p className="text-sm text-green-800">
            File uploaded successfully! Found {uploadResult.rowCount} rows.
          </p>
        </div>
      </div>

      {/* Column Mapping */}
      <div className="mb-6 space-y-3">
        <h3 className="font-medium text-gray-900">Map Your Columns</h3>
        
        {Object.keys(preview[0] || {}).map(column => (
          <div key={column} className="flex items-center gap-4">
            <span className="w-32 text-sm font-medium text-gray-700">{column}</span>
            <span className="text-gray-400">→</span>
            <select
              value={Object.keys(columnMapping).find(k => columnMapping[k] === column) || ''}
              onChange={(e) => setColumnMapping(prev => ({ ...prev, [e.target.value]: column }))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Don't import</option>
              <option value="date">Date</option>
              <option value="description">Description</option>
              <option value="amount">Amount</option>
              <option value="type">Type</option>
              <option value="category">Category</option>
            </select>
          </div>
        ))}
      </div>

      {/* Data Preview */}
      <div className="overflow-x-auto mb-6">
        <h3 className="font-medium text-gray-900 mb-3">Data Preview (first 5 rows)</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              {Object.keys(preview[0] || {}).map(header => (
                <th key={header} className="px-4 py-2 text-left font-medium text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, idx) => (
              <tr key={idx} className="border-t border-gray-200">
                {Object.values(row).map((value, vidx) => (
                  <td key={vidx} className="px-4 py-2 text-gray-600">
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Process Button */}
      <button
        onClick={handleProcess}
        disabled={processing || !columnMapping.date || !columnMapping.amount}
        className="w-full py-3 px-4 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {processing ? 'Processing...' : 'Process Transactions'}
      </button>

      {(!columnMapping.date || !columnMapping.amount) && (
        <p className="text-sm text-amber-600 mt-2 text-center">
          Please map at least Date and Amount columns to continue
        </p>
      )}
    </div>
  )}
</div>

);
}
