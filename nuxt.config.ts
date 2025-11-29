import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/seo'
  ],

  vite: {
    plugins: [tailwindcss()]
  },

  runtimeConfig: {
    apiFootballKey: process.env.API_FOOTBALL_KEY,
    public: {
      apiFootballBaseUrl: 'https://v3.football.api-sports.io'
    }
  },

  site: {
    url: 'https://your-domain.com',
    name: 'Lab Score',
    description: 'เว็บเช็คผลบอลและตารางแข่งบอลแบบเรียลไทม์',
    defaultLocale: 'th'
  }
})
