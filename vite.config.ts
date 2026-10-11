/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173 },
  // Tailwind 4 va por su plugin de Vite. PostCSS en línea evita que Vite
  // tome un postcss.config de carpetas superiores del equipo.
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/pruebas/configuracion.ts'],
    css: false,
  },
})
