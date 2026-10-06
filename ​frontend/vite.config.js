import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Configured dynamically for GitHub Pages deployment
  base: process.env.NODE_ENV === 'production' ? '/Cleancity-ai/' : '/',
})
