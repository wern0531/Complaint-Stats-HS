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
  
  // 全域 CSS
  css: [
    '~/styles/tailwind.css'
  ],
  
  // PostCSS 設定
  postcss: {
    plugins: {
      autoprefixer: {}
    }
  },

  // SSR 設定
  ssr: true,

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
    // 私有環境變數（僅在伺服器端可用）
    // mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/complaint-system',
    
    // 公開環境變數（客戶端也可用）
    public: {
      apiBase: '/api'
    }
  }
})