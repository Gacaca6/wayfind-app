import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    inspectAttr(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'wayfind-logo.jpeg', 'icons/*.png'],
      manifest: {
        name: 'Wayfind — Scripture for the searching heart',
        short_name: 'Wayfind',
        description: 'Find Bible verses for whatever you feel, and read the whole Bible (KJV & WEB) offline.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FAF7F2',
        theme_color: '#FAF7F2',
        categories: ['lifestyle', 'books', 'education'],
        icons: [
          { src: 'icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Search by feeling', short_name: 'Feel', url: '/?action=feel' },
          { name: 'Read the Bible', short_name: 'Bible', url: '/?action=reader' },
        ],
      },
      workbox: {
        // Precache the app shell (hashed JS/CSS/HTML + icons). The large Bible JSON
        // files are intentionally excluded here and cached at runtime on first use.
        globPatterns: ['**/*.{js,css,html,ico,png,jpeg,svg,woff2}'],
        globIgnores: ['**/bible/*.json', '**/hymns/*.json'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Full Bible text — immutable, cache forever once fetched (enables offline reading).
            urlPattern: ({ url }) => url.pathname.includes('/bible/') && url.pathname.endsWith('.json'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'wayfind-bible',
              expiration: { maxEntries: 6, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Hymnal (Gushimisha + Agakiza) — same offline-first treatment.
            urlPattern: ({ url }) => url.pathname.includes('/hymns/') && url.pathname.endsWith('.json'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'wayfind-hymns',
              expiration: { maxEntries: 2, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Study notes — refreshed in the background as new notes ship.
            urlPattern: ({ url }) => url.pathname.includes('/studies/') && url.pathname.endsWith('.json'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'wayfind-studies',
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'wayfind-fonts', cacheableResponse: { statuses: [0, 200] } },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
