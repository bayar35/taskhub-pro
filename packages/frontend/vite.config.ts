import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',           // ✅ browser API (document, localStorage)
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],  // ✅ ЗӨВХӨН tests/, e2e-г оруулахгүй
    exclude: [
      'node_modules',
      'dist',
      'e2e/**',                     // ✅ Playwright тестүүдийг хасах
    ],
    css: true,
    testTimeout: 30000,
    hookTimeout: 30000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});