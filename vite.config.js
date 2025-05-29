import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'], // Future-proof for TypeScript
    alias: {
      '@': path.resolve(__dirname, './src'), // Simplify imports
    },
  },
  server: {
    port: 5175, // Avoid conflict with frontend (5173)
    open: true,
    cors: {
      origin: [
        'http://localhost:3000', // Local backend
        'https://intercept-csa-backend.onrender.com', // Production backend
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    fs: {
      allow: ['.'],
    },
  },
  publicDir: 'public',
  base: '/',
  build: {
    outDir: './dist',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios', 'react-toastify'],
        },
      },
    },
  },
});