import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Ensure environment variables are properly exposed
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8000/api'),
  },
  server: {
    host: '0.0.0.0', // Allow access from other devices
    port: 3000,
    proxy: {
      // Proxy API requests to backend when in development
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
