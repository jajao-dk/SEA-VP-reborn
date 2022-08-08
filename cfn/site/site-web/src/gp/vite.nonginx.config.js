import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'

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
    https: {
      key: fs.readFileSync('./localhost-key.pem'),
      cert: fs.readFileSync('./localhost.pem')
    },
    proxy: {
      '/api': {
        target: 'https://vp.seapln-osr.pt-aws.wni.com/api',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api', '')
      },
      '/customer': {
        target: 'https://vp.seapln-osr.pt-aws.wni.com/customer',
        changeOrigin: true,
        rewrite: (path) => path.replace('/customer', '')
      }
    }
  }
})
