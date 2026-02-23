import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    VitePWA({
      registerType: 'autoUpdate',  // ← これを確認
      workbox: {
        cleanupOutdatedCaches: true,  // 追加
        skipWaiting: true,             // 追加
        clientsClaim: true             // 追加
      },
      manifest: {
      name: 'English Vocab App',
      short_name: 'Vocab',
      description: '英単語学習アプリ',
      theme_color: '#ffffff',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
      ]
    }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
})
