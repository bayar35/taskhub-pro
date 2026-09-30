import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: {
      NODE_ENV: 'test', // ⬅️ Тест орчинд NODE_ENV=test
    },
    hookTimeout: 60000,
    testTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    fileParallelism: false,
    maxConcurrency: 1,
    sequence: {
      concurrent: false,
    },
  },
});