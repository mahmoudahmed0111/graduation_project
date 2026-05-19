import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    middlewareMode: false,
    // Dev proxy: avoid CORS by forwarding /api to the backend API
    proxy: {
      '/api': {
        target: 'http://4.232.14.242:3000',
        changeOrigin: true,
      },
    },
  },
  publicDir: 'public',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})

