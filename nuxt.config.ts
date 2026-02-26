// https://nuxt.com/docs/api/configuration/nuxt-config
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  nitro: {
    preset: process.env.VERCEL ? 'vercel' : undefined,
    compatibilityDate: '2025-09-04'
  },
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss'
  ],

  // 使用 alias 解決 Windows 下 xlsx 的載入問題
  // 關鍵：將 'xlsx-fixed' 對應到實際檔案，避開 'xlsx' 關鍵字遞迴
  alias: {
    'xlsx-fixed': resolve(currentDir, 'node_modules/xlsx/dist/xlsx.full.min.js')
  },
  
  build: {
    transpile: ['xlsx', 'xlsx-fixed']
  },
  
  css: [
    '~/styles/theme.css',
    '~/styles/tailwind.css'
  ],
  
  postcss: {
    plugins: {
      autoprefixer: {}
    }
  },

  ssr: false,

  app: {
    head: {
      title: '客訴統計搜尋工具',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '客訴資料統計與搜尋管理系統' }
      ]
    }
  },

  runtimeConfig: {
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || '',
    public: {
      apiBase: '/api'
    }
  }
})
