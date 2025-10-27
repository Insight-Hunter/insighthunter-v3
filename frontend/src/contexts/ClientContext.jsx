import React, { createContext, useContext, useState, useEffect } from 'react';
import { clientsAPI } from '../services/api';

const ClientContext = createContext(null);

export function ClientProvider({ children }) {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load clients on mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await clientsAPI.getAll();
      const clientList = response.data.clients;
      setClients(clientList);

      // Auto-select first client if none selected
      if (!selectedClient && clientList.length > 0) {
        setSelectedClient(clientList[0]);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (clientData) => {
    try {
      const response = await clientsAPI.create(clientData);
      const newClient = response.data.client;
      setClients((prev) => [...prev, newClient]);

      // Auto-select if it's the first client
      if (clients.length === 0) {
        setSelectedClient(newClient);
      }

      return { success: true, client: newClient };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to add client',
      };
    }
  };

  const updateClient = async (clientId, updates) => {
    try {
      const response = await clientsAPI.update(clientId, updates);
      const updatedClient = response.data.client;

      setClients((prev) =>
        prev.map((c) => (c.id === clientId ? updatedClient : c))
      );

      if (selectedClient?.id === clientId) {
        setSelectedClient(updatedClient);
      }

      return { success: true, client: updatedClient };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to update client',
      };
    }
  };

  const deleteClient = async (clientId) => {
    try {
      await clientsAPI.delete(clientId);

      setClients((prev) => prev.filter((c) => c.id !== clientId));

      // Update selected client after deletion
      if (selectedClient?.id === clientId) {
        setSelectedClient((prevSelected) => {
          const remainingClients = clients.filter((c) => c.id !== clientId);
          return remainingClients.length > 0 ? remainingClients[0] : null;
        });
      }

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Failed to delete client',
      };
    }
  };

  const selectClient = (client) => {
    setSelectedClient(client);
  };

  const getClientById = (clientId) => {
    return clients.find((c) => c.id === clientId);
  };

  const value = {
    clients,
    selectedClient,
    loading,
    error,
    loadClients,
    addClient,
    updateClient,
    deleteClient,
    selectClient,
    getClientById,
  };

  return (
    <ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClients() {
  const context = useContext(ClientContext);
  if (!context) {
    throw new Error('useClients must be used within a ClientProvider');
  }
  return context;
}
