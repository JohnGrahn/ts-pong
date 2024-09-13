import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  base: './',
  publicDir: '../public',
  server: {
    open: true,
  },
  build: {
    outDir: '../dist',
  },
});