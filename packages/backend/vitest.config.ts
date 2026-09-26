import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// .env.test файлыг ачаалах
config({ path: './.env.test' });

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
    testTimeout: 30000,
    hookTimeout: 60000,
  },
});