import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // SUSTITUYE 'nombre-de-tu-repositorio' por el nombre real en GitHub
  base: '/KorexDev/', 
  plugins: [
    react(),
    tailwindcss(),
  ],
})