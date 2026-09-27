import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';
import { existsSync } from 'fs';

// .env.test файл байгаа үед л ачаалах
if (existsSync('./.env.test')) {
  config({ path: './.env.test' });
}

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    testTimeout: 120000,
    hookTimeout: 300000,
    // ⬇️ COVERAGE ТОХИРГОО
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/**',
        'dist/**',
        'tests/**',
        '**/*.config.ts',
        '**/*.test.ts',
        'src/server.ts',
        'src/instrument.ts',
      ],
      thresholds: {
        lines: 30,
        functions: 30,
        branches: 30,
        statements: 30,
      },
    },
  },
});