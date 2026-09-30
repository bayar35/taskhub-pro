import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // ⚠️ ЧУХАЛ: @taskhub/shared-ийг dist руу заах (src биш!)
      '@taskhub/shared': path.resolve(__dirname, '../shared/dist'),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    host: 'localhost',
    fs: {
      // ⚠️ ЧУХАЛ: Monorepo-д workspace-ийн бусад файлуудыг зөвшөөрөх
      allow: ['..', '../..'],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-redux',
      '@reduxjs/toolkit',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'axios',
      'socket.io-client',
      'react-hot-toast',
    ],
    exclude: ['@taskhub/shared'],  // ⚠️ Shared-ийг optimize хийхгүй
  },
  build: {
    target: 'esnext',
    sourcemap: false,
  },
});