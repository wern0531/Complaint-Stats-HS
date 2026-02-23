// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    compatibilityDate: '2025-09-04'
  },
  devtools: { enabled: true },
  
  // 模組設定
  modules: [
    '@nuxtjs/tailwindcss'
  ],
  
  // 全域 CSS（主題變數需先載入）
  css: [
    '~/styles/theme.css',
    '~/styles/tailwind.css'
  ],
  
  // PostCSS 設定
  postcss: {
    plugins: {
      autoprefixer: {}
    }
  },

  // SSR 設定 - 改為 SPA 模式避免 SSR 問題
  ssr: false,

  // 元資料設定
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

  // 環境變數設定
  runtimeConfig: {
    // 私有環境變數（僅在伺服器端可用）- Firebase Admin
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY || '',

    // 公開環境變數（客戶端也可用）
    public: {
      apiBase: '/api'
    }
  }
})