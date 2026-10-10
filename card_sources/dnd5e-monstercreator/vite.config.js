import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // src/App.jsx reuses the monster card's monsterData.js and the sheet's srdHelpers.js,
  // so a created card shows exactly what the mapping produces.
  server: { fs: { allow: ['..'] } },
})
