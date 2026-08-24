import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    fileParallelism: false,
    globals: true,
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    maxWorkers: 1,
    pool: 'threads',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
