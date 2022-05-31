import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      output: {
        manualChunks (id) {
          if (['mapbox', '@mapbox'].filter(el => id.includes(`node_modules/${el}`)).length > 0) {
            return 'mapbox'
          } else if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  },
  server: {
    host: true
  }
})
