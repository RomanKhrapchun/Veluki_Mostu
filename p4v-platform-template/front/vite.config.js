import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  html: {
    cspNonce: "**CSP_NONCE**",
  },
  build: {
    sourcemap: false,
  }
})
