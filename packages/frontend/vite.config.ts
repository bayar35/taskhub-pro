import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@taskhub/shared': path.resolve(__dirname, '../shared/src/index.ts'),
    },
    preserveSymlinks: false,
  },
  optimizeDeps: {
    exclude: ['@taskhub/shared'],
  },
});