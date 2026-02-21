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
    // Dev proxy: avoid CORS by forwarding /api to Azure HTTPS (requests still hit the HTTPS university API)
    proxy: {
      '/api': {
        target: 'https://smart-university-api-hzbmh3eph8g5aucq.eastus-01.azurewebsites.net',
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

