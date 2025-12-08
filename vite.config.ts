import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import prismjsPlugin from 'vite-plugin-prismjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    ui({
      autoImport: {
        imports: [
          'vue',
          'vue-router'
        ]
      }
    }),
    vueDevTools(),
    prismjsPlugin({
      languages: 'all', 
      plugins: ['toolbar', 'show-language', 'copy-to-clipboard'], // 插件
      theme: 'tomorrow.min', 
      css: true 
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
