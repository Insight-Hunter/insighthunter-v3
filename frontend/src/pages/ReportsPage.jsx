import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  Filter,
  Plus,
  TrendingUp,
  DollarSign,
  PieChart,
  BarChart3
} from 'lucide-react';

function ReportsPage() {
  const [selectedType, setSelectedType] = useState('all');
  const [selectedClient, setSelectedClient] = useState('all');

  const reportTypes = [
    { id: 'pl', name: 'Profit & Loss', icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { id: 'balance', name: 'Balance Sheet', icon: BarChart3, color: 'bg-blue-100 text-blue-600' },
    { id: 'cashflow', name: 'Cash Flow', icon: TrendingUp, color: 'bg-purple-100 text-purple-600' },
    { id: 'expense', name: 'Expense Analysis', icon: PieChart, color: 'bg-orange-100 text-orange-600' }
  ];

  const reports = [
    {
      id: 1,
      type: 'pl',
      title: 'Q2 2025 Profit & Loss Statement',
      client: 'ABC Corporation',
      dateGenerated: 'May 15, 2025',
      period: 'Q2 2025',
      status: 'completed',
      size: '2.4 MB'
    },
    {
      id: 2,
      type: 'cashflow',
      title: 'April 2025 Cash Flow Report',
      client: 'XYZ Technologies',
      dateGenerated: 'May 10, 2025',
      period: 'April 2025',
      status: 'completed',
      size: '1.8 MB'
    },
    {
      id: 3,
      type: 'balance',
      title: 'Year-End Balance Sheet 2024',
      client: 'Tech Startup Inc',
      dateGenerated: 'May 5, 2025',
      period: 'FY 2024',
      status: 'completed',
      size: '3.1 MB'
    },
    {
      id: 4,
      type: 'expense',
      title: 'Monthly Expense Breakdown',
      client: 'Retail Solutions Co',
      dateGenerated: 'May 18, 2025',
      period: 'May 2025',
      status: 'processing',
      size: 'N/A'
    },
    {
      id: 5,
      type: 'pl',
      title: 'Monthly P&L Summary',
      client: 'ABC Corporation',
      dateGenerated: 'May 1, 2025',
      period: 'April 2025',
      status: 'completed',
      size: '1.9 MB'
    }
  ];

  const filteredReports = reports.filter(report => {
    const typeMatch = selectedType === 'all' || report.type === selectedType;
    const clientMatch = selectedClient === 'all' || report.client === selectedClient;
    return typeMatch && clientMatch;
  });

  const stats = {
    total: reports.length,
    thisMonth: reports.filter(r => r.dateGenerated.includes('May 2025')).length,
    processing: reports.filter(r => r.status === 'processing').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600 mt-1">Generate and manage financial reports</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium">
              <Plus className="w-5 h-5" />
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Reports</span>
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">This Month</span>
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.thisMonth}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Processing</span>
              <div className="w-5 h-5">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.processing}</div>
          </div>
        </div>

        {/* Report Types Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {reportTypes.map(type => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`bg-white rounded-lg shadow-sm p-6 border-2 transition-all hover:shadow-md ${
                selectedType === type.id ? 'border-blue-500' : 'border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mb-3`}>
                <type.icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 text-sm">{type.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {reports.filter(r => r.type === type.id).length} reports
              </p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="pl">Profit & Loss</option>
              <option value="balance">Balance Sheet</option>
              <option value="cashflow">Cash Flow</option>
              <option value="expense">Expense Analysis</option>
            </select>
            <select
              value={selectedClient}
              onChange={e => setSelectedClient(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Clients</option>
              <option value="ABC Corporation">ABC Corporation</option>
              <option value="XYZ Technologies">XYZ Technologies</option>
              <option value="Tech Startup Inc">Tech Startup Inc</option>
              <option value="Retail Solutions Co">Retail Solutions Co</option>
            </select>
            {(selectedType !== 'all' || selectedClient !== 'all') && (
              <button
                onClick={() => {
                  setSelectedType('all');
                  setSelectedClient('all');
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Reports ({filteredReports.length})</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredReports.length > 0 ? (
              filteredReports.map(report => {
                const reportType = reportTypes.find(t => t.id === report.type);
                return (
                  <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 ${reportType.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <reportType.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {reportType.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Period: {report.period}
                          </span>
                          <span>Client: {report.client}</span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Generated: {report.dateGenerated}</span>
                          {report.size !== 'N/A' && <span>Size: {report.size}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {report.status === 'processing' ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-600 rounded-full animate-pulse"></div>
                          Processing
                        </span>
                      ) : (
                        <>
                          <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Report">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download Report">
                            <Download className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found matching your criteria</p>
                <button className="mt-4 text-blue-600 hover:text-blue-700 font-medium">Generate your first report</button>
              </div>
            )}
          </div>
        </div>

        {/* Report Templates */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg shadow-sm p-6 border border-blue-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Generate</h3>
          <p className="text-gray-700 mb-4">Create reports instantly using our templates:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <button className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium transition-colors">
              Monthly P&L
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium transition-colors">
              Quarterly Review
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium transition-colors">
              Cash Flow Forecast
            </button>
            <button className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-3 rounded-lg border border-gray-200 text-sm font-medium transition-colors">
              Year-End Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
