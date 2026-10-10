import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev only: src/main.jsx loads addon_files/Resources/shared.css, as the game does.
  server: { fs: { allow: ['../..'] } },
})
