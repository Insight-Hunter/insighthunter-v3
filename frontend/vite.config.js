// frontend/vite.config.js
// Configuration for building the React frontend

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    port: 3000,
    proxy: {
      // When developing locally, proxy API requests to your local Workers
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true
      },
      '/auth': {
        target: 'http://localhost:8787',
        changeOrigin: true
      }
    }
  }
});
