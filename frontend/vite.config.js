import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/RAG-Cloud-Computing-Project/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://raghelpdeskbackend.azurewebsites.net/',
        changeOrigin: true,
      },
    },
  },
})
