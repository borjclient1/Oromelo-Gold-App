import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      'Content-Security-Policy': "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://open.er-api.com https://api.emailjs.com"
    }
  }
})
