import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// Check if we should use mocks (only enable proxy when NOT using mocks)
const useMocks = process.env.VITE_USE_MOCKS === 'true'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  server: {
    // Hanya setup proxy jika tidak menggunakan mock data
    // Jika menggunakan mock, semua request akan diintercept oleh mock interceptor
    ...(useMocks
      ? {}
      : {
          proxy: {
            '/auth': {
              target: 'https://api-fintracker.suissetiawan.my.id',
              changeOrigin: true,
              // Jangan proxy GET ke /auth (refresh di halaman login/register).
              // GET /auth/login = request halaman SPA, bukan API — biarkan Vite serve index.html.
              bypass(req) {
                if (req.method === 'GET') return '/index.html'
              },
            },
            '/api': {
              target: 'https://api-fintracker.suissetiawan.my.id',
              changeOrigin: true,
            },
          },
        }),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
