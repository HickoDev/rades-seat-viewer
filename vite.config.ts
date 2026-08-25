import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    // Three.js itself is one intentionally deferred, tree-shaken vendor
    // module. Its production chunk is ~730 kB raw (~186 kB gzip).
    chunkSizeWarningLimit: 750,
    rolldownOptions: {
      output: {
        strictExecutionOrder: true,
        codeSplitting: {
          groups: [
            {
              name: 'react-three-vendor',
              test: /node_modules[\\/]@react-three[\\/]/,
              includeDependenciesRecursively: false,
              priority: 40,
            },
            {
              name: 'bvh-vendor',
              test: /node_modules[\\/]three-mesh-bvh[\\/]/,
              includeDependenciesRecursively: false,
              priority: 35,
            },
            {
              name: 'three-vendor',
              test: /node_modules[\\/]three[\\/]/,
              includeDependenciesRecursively: false,
              priority: 30,
            },
            {
              name: 'react-vendor',
              test: /node_modules[\\/](?:react|react-dom|scheduler|zustand|@tanstack)[\\/]/,
              includeDependenciesRecursively: false,
              priority: 20,
            },
            {
              name: 'simulation-vendor',
              test: /node_modules[\\/](?:gsap|luxon|suncalc|zod)[\\/]/,
              includeDependenciesRecursively: false,
              priority: 10,
            },
          ],
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
});
