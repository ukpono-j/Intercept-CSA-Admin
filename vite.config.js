import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Support TypeScript if needed
    alias: {
      '@': path.resolve(__dirname, './src'), // Simplify imports (e.g., '@/pages/ManageBlog')
    },
  },
  server: {
    port: 5174, // Different from frontend (5173) to avoid conflicts
    open: true, // Open browser on start
    cors: {
      origin: [
        'http://localhost:3000', // Local backend
        'https://intercept-csa-backend.onrender.com', // Production backend
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true, // For auth tokens
    },
    fs: {
      allow: ['.'], // Allow project root access
    },
  },
  publicDir: 'public', // Serve static assets
  base: '/', // Root path for Vercel
  build: {
    outDir: 'dist', // Output directory
    sourcemap: false, // Disable sourcemaps in production
    minify: 'esbuild', // Faster, smaller bundles
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios'], // Split vendor code
        },
      },
    },
  },
});