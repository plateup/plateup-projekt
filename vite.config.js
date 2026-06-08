import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: { enabled: true },
      manifest: {
        name: 'GymBlox',
        short_name: 'GymBlox',
        description: 'Elite workout tracker and social platform',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone'
      }
    })
  ],
})
