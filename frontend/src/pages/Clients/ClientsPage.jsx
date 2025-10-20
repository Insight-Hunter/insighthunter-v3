import React, { useState } from 'react';
import { Search, Plus, Eye, Edit, Trash2, TrendingUp, TrendingDown, DollarSign, AlertCircle, Mail, Building } from 'lucide-react';

function ClientsPage() {
  const [clients, setClients] = useState([
    {
      id: 1,
      name: 'ABC Corporation',
      contact: 'John Smith',
      email: 'john@abc-corp.com',
      phone: '+1 (555) 123-4567',
      status: 'active',
      mrr: 2500,
      mrrChange: 12.5,
      lastActivity: '2 hours ago',
      nextReport: 'May 30, 2025'
    },
    {
      id: 2,
      name: 'XYZ Technologies',
      contact: 'Sarah Johnson',
      email: 'sarah@xyz-tech.com',
      phone: '+1 (555) 234-5678',
      status: 'active',
      mrr: 3500,
      mrrChange: 8.3,
      lastActivity: '1 day ago',
      nextReport: 'Jun 1, 2025'
    },
    {
      id: 3,
      name: 'Tech Startup Inc',
      contact: 'Mike Chen',
      email: 'mike@techstartup.io',
      phone: '+1 (555) 345-6789',
      status: 'trial',
      mrr: 0,
      mrrChange: 0,
      lastActivity: '3 days ago',
      nextReport: 'Jun 5, 2025'
    },
    {
      id: 4,
      name: 'Retail Solutions Co',
      contact: 'Emily Davis',
      email: 'emily@retail-sol.com',
      phone: '+1 (555) 456-7890',
      status: 'active',
      mrr: 1800,
      mrrChange: -5.2,
      lastActivity: '5 hours ago',
      nextReport: 'May 28, 2025'
    },
    {
      id: 5,
      name: 'Global Enterprises',
      contact: 'David Wilson',
      email: 'david@global-ent.com',
      phone: '+1 (555) 567-8901',
      status: 'inactive',
      mrr: 0,
      mrrChange: 0,
      lastActivity: '2 months ago',
      nextReport: 'N/A'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Edit and Add modal visibility and client data state
  const [clientFormVisible, setClientFormVisible] = useState(false);
  const [editingClient, setEditingClient] = useState(null); // null means adding new client

  const [clientFormData, setClientFormData] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    mrr: '',
    status: 'trial',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});

  // Open Add Client modal
  const openAddClientModal = () => {
    setEditingClient(null);
    setClientFormData({
      name: '',
      contact: '',
      email: '',
      phone: '',
      mrr: '',
      status: 'trial',
      notes: ''
    });
    setFormErrors({});
    setClientFormVisible(true);
  };

  // Open Edit Client modal
  const openEditClientModal = (client) => {
    setEditingClient(client);
    setClientFormData({
      name: client.name || '',
      contact: client.contact || '',
      email: client.email || '',
      phone: client.phone || '',
      mrr: client.mrr ? client.mrr.toString() : '',
      status: client.status || 'trial',
      notes: client.notes || ''
    });
    setFormErrors({});
    setClientFormVisible(true);
  };

  // Handler for form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setClientFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validation reused for both add/edit
  const validateForm = () => {
    const errors = {};
    if (!clientFormData.name.trim()) errors.name = 'Company Name is required';
    if (!clientFormData.contact.trim()) errors.contact = 'Contact Person is required';
    if (!clientFormData.email.trim()) {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientFormData.email)) errors.email = 'Email is invalid';
    }
    return errors;
  };

  // Form submit handler for add/edit
  const handleFormSubmit = (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingClient) {
      // Edit existing client
      setClients(prev =>
        prev.map(c =>
          c.id === editingClient.id
            ? {
                ...c,
                name: clientFormData.name,
                contact: clientFormData.contact,
                email: clientFormData.email,
                phone: clientFormData.phone,
                mrr: Number(clientFormData.mrr) || 0,
                status: clientFormData.status,
                notes: clientFormData.notes
              }
            : c
        )
      );
    } else {
      // Add new client
      const newClient = {
        id: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
        name: clientFormData.name,
        contact: clientFormData.contact,
        email: clientFormData.email,
        phone: clientFormData.phone,
        mrr: Number(clientFormData.mrr) || 0,
        status: clientFormData.status,
        notes: clientFormData.notes,
        mrrChange: 0,
        lastActivity: 'Just now',
        nextReport: 'N/A'
      };
      setClients(prev => [...prev, newClient]);
    }

    setClientFormVisible(false);
    setFormErrors({});
  };

  // Delete client with confirmation
  const handleDeleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(prev => prev.filter(c => c.id !== clientId));
    }
  };

  // Filter clients based on search and status
  const filteredClients = clients.filter(client => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: clients.length,
    active: clients.filter(c => c.status === 'active').length,
    trial: clients.filter(c => c.status === 'trial').length,
    totalMRR: clients.reduce((sum, c) => sum + c.mrr, 0)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600 mt-1">Manage your client portfolio</p>
          </div>
          <button
            onClick={openAddClientModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total Clients</span>
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Active</span>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.active}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Trial</span>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.trial}</div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600 text-sm font-medium">Total MRR</span>
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">${stats.totalMRR.toLocaleString()}</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MRR</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Report</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredClients.map(client => (
                  <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{client.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.contact}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="w-3 h-3" />
                        {client.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          client.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : client.status === 'trial'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${client.mrr.toLocaleString()}</div>
                      {client.mrrChange !== 0 && (
                        <div
                          className={`text-xs flex items-center gap-1 ${
                            client.mrrChange > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {client.mrrChange > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          {Math.abs(client.mrrChange)}%
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.lastActivity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.nextReport}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditClientModal(client)}
                          className="text-gray-600 hover:text-gray-900 p-2 rounded hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredClients.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-gray-500">
                      <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                      No clients found matching your criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Client Add/Edit Form Modal */}
      {clientFormVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </h2>
            <form className="space-y-4" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={clientFormData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="ABC Corporation"
                  />
                  {formErrors.name && <p className="text-red-600 text-xs mt-1">{formErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person *</label>
                  <input
                    type="text"
                    name="contact"
                    value={clientFormData.contact}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.contact ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Smith"
                  />
                  {formErrors.contact && <p className="text-red-600 text-xs mt-1">{formErrors.contact}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={clientFormData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@company.com"
                  />
                  {formErrors.email && <p className="text-red-600 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={clientFormData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Retainer (MRR)</label>
                  <input
                    type="number"
                    name="mrr"
                    value={clientFormData.mrr}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="2500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={clientFormData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="trial">Trial</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  rows="3"
                  value={clientFormData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional information about the client..."
                ></textarea>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setClientFormVisible(false);
                    setFormErrors({});
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientsPage;

