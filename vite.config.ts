import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
  },
  build: {
    target: 'esnext', // Minimize transpilation
    minify: 'terser', // Tenser for better compression
    chunkSizeWarningLimit: 1000, // Reduce chunk size to avoid memory spikes
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
});
