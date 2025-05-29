import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    open: true,
    cors: {
      origin: [
        'http://localhost:3000',
        'https://intercept-csa-backend.onrender.com',
      ],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
    proxy: {
      '/api': {
        target: 'https://intercept-csa-backend.onrender.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
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