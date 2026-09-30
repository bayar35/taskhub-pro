import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'TaskHub Pro',
        short_name: 'TaskHub',
        description: 'Smart task management for teams',
        theme_color: '#2563eb',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
      devOptions: { enabled: false },
    }),
  ],

  // ✅ Зөвхөн alias (optimizeDeps ХАСАХ!)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@taskhub/shared': path.resolve(__dirname, '../shared/dist'),
    },
  },

  server: {
    port: 5173,
    strictPort: true,
    fs: {
      allow: ['..', '../..'],
    },
  },

  // ❌ optimizeDeps БҮРЭН ХАСАХ!
  // Vite өөрөө автоматаар optimiz хийнэ.

  build: {
    target: 'esnext',
  },
});