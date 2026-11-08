import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import { seoPlugin } from './build/seo-plugin';

// https://vite.dev/config/
export default defineConfig({
  base: '/partyjs/',
  build: {
    outDir: 'docs',
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  plugins: [react(), TanStackRouterVite(), seoPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
