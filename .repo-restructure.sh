#!/bin/bash

# InsightHunter v3 Repository Restructure Script

# This script creates the target folder structure and moves existing files

set -e  # Exit on error

echo "🚀 InsightHunter v3 Repository Restructure"
echo "=========================================="
echo ""

# Colors for output

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the repository root

REPO_ROOT=$(pwd)
echo "📁 Working directory: $REPO_ROOT"
echo ""

# Function to create directory if it doesn't exist

create_dir() {
  if [ ! -d "$1" ]; then
    mkdir -p "$1"
    echo -e "${GREEN}✓${NC} Created: $1"
  else
    echo -e "${BLUE}→${NC} Exists: $1"
  fi
}

# Function to create placeholder file

create_placeholder() {
  local file=$1
  local content=$2

  if [ ! -f "$file" ]; then
    echo "$content" > "$file"
    echo -e "${GREEN}✓${NC} Created placeholder: $file"
  else
    echo -e "${BLUE}→${NC} Exists: $file"
  fi
}

# Function to move file if it exists

move_file() {
  local source=$1
  local dest=$2

  if [ -f "$source" ]; then
    mkdir -p "$(dirname "$dest")"
    mv "$source" "$dest"
    echo -e "${GREEN}✓${NC} Moved: $source → $dest"
  fi
}

echo "📦 Creating frontend structure..."
echo "=================================="

# Frontend directories

create_dir "frontend/src/pages"
create_dir "frontend/src/hooks"
create_dir "frontend/src/components"
create_dir "frontend/src/utils"
create_dir "frontend/public/icons"

# Try to move existing frontend files

move_file "frontend/src/pages/AnalyticsDashboard.jsx" "frontend/src/pages/AnalyticsDashboard.jsx"
move_file "src/pages/OnboardingPage.jsx" "frontend/src/pages/OnboardingPage.jsx"
move_file "src/pages/DashboardPage.jsx" "frontend/src/pages/DashboardPage.jsx"
move_file "src/pages/ClientsPage.jsx" "frontend/src/pages/ClientsPage.jsx"
move_file "src/pages/ReportsPage.jsx" "frontend/src/pages/ReportsPage.jsx"
move_file "src/pages/SettingsPage.jsx" "frontend/src/pages/SettingsPage.jsx"
move_file "src/components/CSVUpload.jsx" "frontend/src/components/CSVUpload.jsx"

# Create placeholder pages (marked as ⏳ in structure)

create_placeholder "frontend/src/hooks/useAuth.js" "// TODO: Implement authentication hook
export function useAuth() {
  // Authentication logic here
  return { user: null, loading: false, error: null };
}"

create_placeholder "frontend/src/hooks/useNotifications.js" "// TODO: Implement notifications hook
export function useNotifications() {
  // Notification logic here
  return { notifications: [], unread: 0 };
}"

create_placeholder "frontend/src/components/Layout.jsx" "// TODO: Implement Layout component
import React from 'react';

export default function Layout({ children }) {
  return <div>{children}</div>;
}"

create_placeholder "frontend/src/components/Navbar.jsx" "// TODO: Implement Navbar component
import React from 'react';

export default function Navbar() {
  return <nav>InsightHunter</nav>;
}"

create_placeholder "frontend/src/components/BottomNav.jsx" "// TODO: Implement BottomNav component
// Reference: MobileAppShell.jsx for bottom navigation
import React from 'react';

export default function BottomNav() {
  return <nav>Bottom Nav</nav>;
}"

create_placeholder "frontend/src/components/CSVUpload.jsx" "// TODO: Implement CSV Upload component
import React from 'react';

export default function CSVUpload() {
  return <div>CSV Upload</div>;
}"

create_placeholder "frontend/src/utils/api.js" "// API utility functions
const API_BASE = 'https://api.insighthunter.app';

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('authToken');
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  get: (endpoint) => apiRequest(endpoint),
  post: (endpoint, data) => apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
};"

create_placeholder "frontend/src/utils/helpers.js" "// Helper utility functions

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function calculatePercentageChange(current, previous) {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}"

create_placeholder "frontend/src/App.jsx" "// TODO: Implement main App component with routing
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import pages here
// import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<div>InsightHunter v3</div>} />
        {/* Add routes here */}
      </Routes>
    </Router>
  );
}

export default App;"

# Frontend config files

create_placeholder "frontend/package.json" "{
  \"name\": \"insighthunter-frontend\",
  \"version\": \"1.0.0\",
  \"type\": \"module\",
  \"scripts\": {
    \"dev\": \"vite\",
    \"build\": \"vite build\",
    \"preview\": \"vite preview\",
    \"deploy\": \"npm run build && wrangler pages publish dist\"
  },
  \"dependencies\": {
    \"react\": \"^18.2.0\",
    \"react-dom\": \"^18.2.0\",
    \"react-router-dom\": \"^6.20.0\",
    \"lucide-react\": \"^0.263.1\",
    \"recharts\": \"^2.5.0\"
  },
  \"devDependencies\": {
    \"@vitejs/plugin-react\": \"^4.2.0\",
    \"vite\": \"^5.0.0\",
    \"tailwindcss\": \"^3.3.0\",
    \"autoprefixer\": \"^10.4.14\",
    \"postcss\": \"^8.4.24\"
  }
}"

create_placeholder "frontend/vite.config.js" "import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true
  }
})"

create_placeholder "frontend/tailwind.config.js" "/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}"

create_placeholder "frontend/public/manifest.json" "{
  \"name\": \"InsightHunter\",
  \"short_name\": \"InsightHunter\",
  \"description\": \"AI-Powered Auto-CFO Platform\",
  \"start_url\": \"/\",
  \"display\": \"standalone\",
  \"background_color\": \"#ffffff\",
  \"theme_color\": \"#2563eb\",
  \"icons\": [
    {
      \"src\": \"/icons/icon-192.png\",
      \"sizes\": \"192x192\",
      \"type\": \"image/png\"
    },
    {
      \"src\": \"/icons/icon-512.png\",
      \"sizes\": \"512x512\",
      \"type\": \"image/png\"
    }
  ]
}"

create_placeholder "frontend/public/sw.js" "// Service Worker for InsightHunter PWA
const CACHE_NAME = 'insighthunter-v1';
const RUNTIME_CACHE = 'insighthunter-runtime';
const API_CACHE = 'insighthunter-api';

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  NETWORK_ONLY: 'network-only',
  CACHE_ONLY: 'cache-only',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker…');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()) // Activate immediately
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker…');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== API_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
    .then(() => self.clients.claim()) // Take control immediately
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin && !url.href.includes('api.insighthunter.app')) {
    return;
  }

  // API requests - Network First strategy with fallback
  if (url.pathname.startsWith('/api/') || url.host.includes('api.insighthunter.app')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Static assets - Cache First strategy
  if (request.destination === 'image' || request.destination === 'font' || request.destination === 'style') {
    event.respondWith(cacheFirstStrategy(request, RUNTIME_CACHE));
    return;
  }

  // HTML pages - Network First with fallback to cache
  if (request.destination === 'document' || request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
    return;
  }

  // Everything else - Stale While Revalidate
  event.respondWith(staleWhileRevalidateStrategy(request, RUNTIME_CACHE));
});

// Cache First Strategy - Check cache first, then network
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    console.log('[SW] Cache hit:', request.url);
    return cachedResponse;
  }

  console.log('[SW] Cache miss, fetching:', request.url);
  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network First Strategy - Try network first, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;

  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await cache.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page or error
    if (request.destination === 'document') {
      return caches.match('/offline.html') || new Response('Offline', { status: 503 });
    }

    return new Response('Network error', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Stale While Revalidate - Return cache immediately, update in background
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse && networkResponse.status === 200) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch((error) => {
    console.error('[SW] Background fetch failed:', error);
  });

  return cachedResponse || fetchPromise;
}

// Push notification event
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'InsightHunter';
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    data: data.data || {},
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window if not already open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event (for offline data sync)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  try {
    // Get pending transactions from IndexedDB
    const db = await openDatabase();
    const pendingTransactions = await db.getAll('pending_transactions');

    // Sync each transaction
    for (const transaction of pendingTransactions) {
      try {
        const response = await fetch('https://api.insighthunter.app/api/transactions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${transaction.token}`
          },
          body: JSON.stringify(transaction.data)
        });

        if (response.ok) {
          await db.delete('pending_transactions', transaction.id);
          console.log('[SW] Transaction synced:', transaction.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync transaction:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Helper: Open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('InsightHunterDB', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending_transactions')) {
        db.createObjectStore('pending_transactions', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      })
    );
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});
"

create_placeholder "frontend/public/offline.html" "<!DOCTYPE html>

<html lang=\"en\">
<head>
  <meta charset=\"UTF-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
  <title>Offline - InsightHunter</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  background: white;
  border-radius: 24px;
  padding: 40px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.icon {
  width: 80px;
  height: 80px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

h1 {
  font-size: 24px;
  color: #111827;
  margin-bottom: 12px;
}

p {
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 24px;
}

button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

button:active {
  transform: scale(0.95);
}

  </style>
</head>
<body>
  <div class=\"container\">
    <div class=\"icon\">
      <svg width=\"40\" height=\"40\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\">
        <circle cx=\"20\" cy=\"20\" r=\"18\"/>
        <path d=\"M8 20h24M20 8v24\"/>
      </svg>
    </div>
    <h1>You're Offline</h1>
    <p>It looks like you've lost your internet connection. Some features may be unavailable until you're back online.</p>
    <button onclick=\"window.location.reload()\">Try Again</button>
  </div>
</body>
</html>"

echo ""
echo "🔧 Creating backend structure..."
echo "=================================="

# Backend directories

create_dir "backend/workers"
create_dir "backend/durable-objects"
create_dir "backend/schemas"
create_dir "backend/utils"

# Move existing backend files

move_file "backend/workers/analytics-worker.js" "backend/workers/analytics-worker.js"

# Create backend placeholders

create_placeholder "backend/workers/analytics-worker.js" "// TODO: Implement analytics worker
export default {
  async fetch(request, env) {
    return new Response('Analytics Worker', { status: 200 });
  }
};"

create_placeholder "backend/workers/forecast-worker.js" "// TODO: Implement forecast worker
export default {
  async fetch(request, env) {
    return new Response('Forecast Worker', { status: 200 });
  }
};"

create_placeholder "backend/workers/auth-worker.js" "// TODO: Implement authentication worker
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth/login') {
      // Handle login
    }

    if (url.pathname === '/auth/register') {
      // Handle registration
    }

    return new Response('Auth Worker', { status: 200 });
  }
};"

create_placeholder "backend/schemas/database.sql" "-- InsightHunter Database Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  company_name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  mrr REAL DEFAULT 0,
  auto_reports TEXT,
  report_schedule TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT,
  type TEXT NOT NULL,
  receipt_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  type TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX idx_transactions_client_date ON transactions(client_id, date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_clients_user ON clients(user_id);"

create_placeholder "backend/utils/ai-insights.js" "// TODO: Implement AI insights generation

export async function generateInsights(transactions, historical) {
  const insights = [];

  // Revenue trend analysis
  const revenueGrowth = calculateGrowth(transactions.filter(t => t.type === 'income'));
  if (revenueGrowth > 10) {
    insights.push(`Revenue up \${revenueGrowth.toFixed(1)}% - strong growth momentum`);
  }

  // Expense anomaly detection
  const expenseAnomaly = detectAnomalies(transactions.filter(t => t.type === 'expense'));
  if (expenseAnomaly) {
    insights.push(`\${expenseAnomaly.category} expenses \${expenseAnomaly.change}% higher than normal`);
  }

  return insights;
}

function calculateGrowth(transactions) {
  // Implementation here
  return 0;
}

function detectAnomalies(transactions) {
  // Implementation here
  return null;
}"

create_placeholder "backend/utils/ml-forecasting.js" "// TODO: Implement ML forecasting

export function forecast(historicalData, days = 90) {
  const trend = calculateTrendLine(historicalData);
  const seasonality = detectSeasonality(historicalData);
  const predictions = [];

  for (let i = 1; i <= days; i++) {
    const baseValue = trend.slope * i + trend.intercept;
    const seasonalAdjustment = getSeasonalFactor(i, seasonality);
    const prediction = baseValue * seasonalAdjustment;

    predictions.push({
      date: addDays(new Date(), i),
      value: Math.round(prediction),
      confidence: calculateConfidence(i, historicalData)
    });
  }

  return predictions;
}

function calculateTrendLine(data) {
  // Simple linear regression
  return { slope: 100, intercept: 10000 };
}

function detectSeasonality(data) {
  return [];
}

function getSeasonalFactor(day, seasonality) {
  return 1.0;
}

function calculateConfidence(day, data) {
  return Math.max(0.5, 1 - (day * 0.005));
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString().split('T')[0];
}"

echo ""
echo "📚 Creating shared structure..."
echo "=================================="

create_dir "shared"

create_placeholder "shared/types.ts" "// Shared TypeScript types

export interface User {
  id: string;
  email: string;
  name: string;
  company_name: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  contact_person: string;
  email: string;
  status: 'active' | 'trial' | 'inactive';
  mrr: number;
}

export interface Transaction {
  id: string;
  client_id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  receipt_url?: string;
}

export interface CashFlowData {
  currentBalance: number;
  runway: { days: number; status: string };
  burnRate: { daily: number; weekly: number; monthly: number };
  projections: Record<string, number>;
}"

create_placeholder "shared/constants.js" "// Shared constants

export const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.insighthunter.app'
  : 'http://localhost:8787';

export const TRANSACTION_CATEGORIES = [
  'Payroll',
  'Marketing',
  'Office Supplies',
  'Software',
  'Travel',
  'Utilities',
  'Rent',
  'Other'
];

export const TRANSACTION_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense'
};

export const CLIENT_STATUS = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  INACTIVE: 'inactive'
};

export const REPORT_TYPES = {
  PL: 'pl',
  BALANCE_SHEET: 'balance_sheet',
  CASH_FLOW: 'cash_flow',
  FORECAST: 'forecast'
};"

echo ""
echo "📖 Creating docs structure..."
echo "=================================="

create_dir "docs"

# Docs are already created via artifacts, just create placeholders if missing

if [ ! -f "docs/API_SCHEMA.yaml" ]; then
  echo "# API Schema will be added here" > "docs/API_SCHEMA.yaml"
fi

if [ ! -f "docs/API_QUICK_REFERENCE.md" ]; then
  echo "# API Quick Reference will be added here" > "docs/API_QUICK_REFERENCE.md"
fi

if [ ! -f "docs/MOBILE_DESIGN_SYSTEM.md" ]; then
  echo "# Mobile Design System will be added here" > "docs/MOBILE_DESIGN_SYSTEM.md"
fi

if [ ! -f "docs/PAGES_OVERVIEW.md" ]; then
  echo "# Pages Overview will be added here" > "docs/PAGES_OVERVIEW.md"
fi

echo ""
echo "⚙️  Creating root configuration files..."
echo "=========================================="

create_placeholder "wrangler.toml" "[env.production]
name = \"insighthunter-api\"
main = \"backend/workers/main.js\"
compatibility_date = \"2024-01-01\"
workers_dev = false
route = \"api.insighthunter.app/*\"

[[d1_databases]]
binding = \"DB\"
database_name = \"insighthunter\"
database_id = \"your-database-id\"

[[r2_buckets]]
binding = \"REPORTS_BUCKET\"
bucket_name = \"insighthunter-reports\"

[[durable_objects.bindings]]
name = \"CASH_FLOW_SESSION\"
class_name = \"CashFlowSession\"
script_name = \"insighthunter-api\"

[triggers]
crons = [
\"0 8 * * 1\",
\"0 8 1 * *\",
\"0 */1 * * *\"
]"

create_placeholder "package.json" "{
  \"name\": \"insighthunter-v3\",
  \"version\": \"1.0.0\",
  \"description\": \"AI-Powered Auto-CFO Platform\",
  \"scripts\": {
    \"dev:frontend\": \"cd frontend && npm run dev\",
    \"dev:backend\": \"wrangler dev\",
    \"build\": \"cd frontend && npm run build\",
    \"deploy:frontend\": \"cd frontend && npm run deploy\",
    \"deploy:backend\": \"wrangler publish\",
    \"deploy\": \"npm run deploy:frontend && npm run deploy:backend\"
  },
  \"keywords\": [\"finance\", \"cfo\", \"ai\", \"cloudflare\"],
  \"author\": \"InsightHunter Team\",
  \"license\": \"MIT\"
}"

if [ ! -f "README.md" ]; then
  create_placeholder "README.md" "# InsightHunter v3

AI-Powered Auto-CFO Platform for Freelancers, Small Firms, and Fractional CFOs

## Features

- 📱 Mobile-first iPhone-native design
- ⚡ Real-time cash flow monitoring
- 🤖 AI-powered insights and forecasting
- 📊 Automated report generation
- 📸 Receipt scanning with OCR
- 🔄 WebSocket live updates

## Quick Start

\`\`\`bash
# Install dependencies

cd frontend && npm install
cd ../backend && npm install

# Run development servers

npm run dev:frontend   # Frontend on http://localhost:5173
npm run dev:backend    # Backend on http://localhost:8787
\`\`\`

## Documentation

See \`docs/\` folder for detailed documentation.

## Tech Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Cloudflare Workers + Durable Objects
- **Database:** Cloudflare D1 (SQLite)
- **Storage:** Cloudflare R2

## License

MIT"
fi

create_placeholder ".gitignore" "# Dependencies
node_modules/
.pnp
.pnp.js

# Testing

coverage/

# Production

dist/
build/

# Environment

.env
.env.local
.env.production

# IDE

.vscode/
.idea/
*.swp
*.swo

# OS

.DS_Store
Thumbs.db

# Wrangler

.wrangler/
wrangler.toml.local

# Logs

*.log
npm-debug.log*
yarn-debug.log*"

echo ""
echo "✨ Restructure complete!"
echo "======================="
echo ""
echo -e "${GREEN}✓${NC} Frontend structure created"
echo -e "${GREEN}✓${NC} Backend structure created"
echo -e "${GREEN}✓${NC} Shared modules created"
echo -e "${GREEN}✓${NC} Documentation structure created"
echo -e "${GREEN}✓${NC} Configuration files created"
echo ""
echo "📋 Next Steps:"
echo "  1. Review the created structure"
echo "  2. Install dependencies: cd frontend && npm install"
echo "  3. Copy your page components from artifacts to frontend/src/pages/"
echo "  4. Copy backend workers from artifacts to backend/workers/"
echo "  5. Run: npm run dev:frontend"
echo ""
echo "📚 Documentation available in docs/ folder"
echo "🎉 Happy coding!"
