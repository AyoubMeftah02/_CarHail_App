import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

// Normalize path for Windows
const normalizePath = (path: string) => path.replace(/\\/g, '/');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: [
      // Basic @ alias to src
      { 
        find: /^@\/(.*)/, 
        replacement: normalizePath(path.resolve(__dirname, 'src/$1')) 
      },
      // Specific directory aliases with @/ prefix
      { 
        find: /^@\/pages(\/|$)/, 
        replacement: normalizePath(path.resolve(__dirname, 'src/_pages') + '/$1') 
      },
      { 
        find: /^@\/components(\/|$)/, 
        replacement: normalizePath(path.resolve(__dirname, 'src/components') + '/$1') 
      },
      { 
        find: /^@\/utils(\/|$)/, 
        replacement: normalizePath(path.resolve(__dirname, 'src/utils') + '/$1') 
      },
      { 
        find: /^@\/providers(\/|$)/, 
        replacement: normalizePath(path.resolve(__dirname, 'src/providers') + '/$1') 
      },
    ],
  },
  css: {
    postcss: './postcss.config.js',
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
});
