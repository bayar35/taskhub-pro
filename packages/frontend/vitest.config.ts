import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'tests/',
          '**/*.config.*',
          '**/*.d.ts',
          '**/main.tsx',
          '**/vite-env.d.ts',
        ],
        thresholds: {
          statements: 70,
          branches: 75,
          functions: 45,
          lines: 70,
        },
      },
    },
  })
)