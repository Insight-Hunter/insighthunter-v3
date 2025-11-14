import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Make sure this is set to '/'
  build: {
    outDir: 'dist',
    sourcemap: true, // Enable for debugging
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000,
  
  },
  serverAllowedHosts: {
    port: 4000,
    hosr: 8bacf20d-2717-4194-b592-52c920813778-00-g6v0dnc3yt8w.janeway.replit.dev
})
