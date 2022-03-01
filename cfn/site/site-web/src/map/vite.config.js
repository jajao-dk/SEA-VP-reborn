import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => {
  const input = { map: resolve(__dirname, 'map.html') }
  if (command !== 'build') input.index = resolve(__dirname, 'index.html')

  return {
    plugins: [vue()],
    build: {
      rollupOptions: {
        input,
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
  }
})
