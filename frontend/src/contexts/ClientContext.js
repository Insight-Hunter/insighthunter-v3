var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    const loadClients = () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            setLoading(true);
            setError(null);
            const response = yield clientsAPI.getAll();
            const clientList = response.data.clients;
            setClients(clientList);
            // Auto-select first client if none selected
            if (!selectedClient && clientList.length > 0) {
                setSelectedClient(clientList[0]);
            }
        }
        catch (err) {
            setError(((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to load clients');
        }
        finally {
            setLoading(false);
        }
    });
    const addClient = (clientData) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield clientsAPI.create(clientData);
            const newClient = response.data.client;
            setClients((prev) => [...prev, newClient]);
            // Auto-select if it's the first client
            if (clients.length === 0) {
                setSelectedClient(newClient);
            }
            return { success: true, client: newClient };
        }
        catch (err) {
            return {
                success: false,
                error: ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to add client',
            };
        }
    });
    const updateClient = (clientId, updates) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const response = yield clientsAPI.update(clientId, updates);
            const updatedClient = response.data.client;
            setClients((prev) => prev.map((c) => (c.id === clientId ? updatedClient : c)));
            if ((selectedClient === null || selectedClient === void 0 ? void 0 : selectedClient.id) === clientId) {
                setSelectedClient(updatedClient);
            }
            return { success: true, client: updatedClient };
        }
        catch (err) {
            return {
                success: false,
                error: ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to update client',
            };
        }
    });
    const deleteClient = (clientId) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            yield clientsAPI.delete(clientId);
            setClients((prev) => prev.filter((c) => c.id !== clientId));
            // Update selected client after deletion
            if ((selectedClient === null || selectedClient === void 0 ? void 0 : selectedClient.id) === clientId) {
                setSelectedClient((prevSelected) => {
                    const remainingClients = clients.filter((c) => c.id !== clientId);
                    return remainingClients.length > 0 ? remainingClients[0] : null;
                });
            }
            return { success: true };
        }
        catch (err) {
            return {
                success: false,
                error: ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) || 'Failed to delete client',
            };
        }
    });
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
    return (<ClientContext.Provider value={value}>
      {children}
    </ClientContext.Provider>);
}
export function useClients() {
    const context = useContext(ClientContext);
    if (!context) {
        throw new Error('useClients must be used within a ClientProvider');
    }
    return context;
}
