import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/web-lab6/',
  server: {
    proxy: {
      '/movies': 'http://localhost:3001',
      '/token': 'http://localhost:3001',
      '/docs': 'http://localhost:3001',
      '/openapi.json': 'http://localhost:3001'
    }
  },
})
