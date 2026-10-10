import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // src/homebrew.js reuses the character sheet's readers (srdHelpers.js, feats.js),
  // so the forms produce exactly what the sheet reads.
  server: { fs: { allow: ['..'] } },
})
