import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
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