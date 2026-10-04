import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],

    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/playwright-report/**',
      '**/test-results/**',
    ],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'tests/',
        'e2e/',
        'playwright-report/',
        'test-results/',
        '**/*.test.tsx',
        '**/*.test.ts',
        '**/dist/',
        '**/*.config.ts',
        '**/types/',
        '**/main.tsx',
        '**/vite-env.d.ts',
        'src/components/CalendarView.tsx',
        'src/components/ErrorBoundary.tsx',
        'src/components/FileUpload.tsx',
        'src/components/InstallPrompt.tsx',
        'src/components/OfflineBanner.tsx',
        'src/components/RecurringForm.tsx',
        'src/components/TwoFactorSetup.tsx',
        'src/features/file/**',
        'src/features/recurring/**',
        'src/lib/axios.ts',
        'src/lib/i18n.ts',
        'eslint.config.js',
        'postcss.config.js',
        'tailwind.config.js',
        'dev-dist/**',
      ],
      thresholds: {
        lines: 60,
        functions: 45,
        branches: 60,
        statements: 60,
      },
    },
  },
});