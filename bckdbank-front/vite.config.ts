import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],
    server: {
      proxy: {
        // Toda petición del navegador a /api/... se reenvía al backend Spring Boot.
        '/api': { target: env.VITE_BACKEND_URL || 'http://localhost:8080', changeOrigin: true },
      },
    },
  }
})
