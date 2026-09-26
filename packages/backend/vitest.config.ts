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
  },
});