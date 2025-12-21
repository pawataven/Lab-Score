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
  
  components: [
    {
      path: '~/app/components',
      pathPrefix: false,
    },
  ],

  vite: {
    plugins: [tailwindcss()]
  },

   runtimeConfig: {
    apiFootball: {
      provider: process.env.API_FOOTBALL_PROVIDER, // apisports | rapidapi
      baseUrl: process.env.API_FOOTBALL_BASE_URL,
      key: process.env.API_FOOTBALL_KEY,
      host: process.env.API_FOOTBALL_HOST,
    },
    public: {},
  },

  site: {
    url: 'https://your-domain.com',
    name: 'Score Sanan - ผลบอลสด Livescore อัพเดทเรียลไทม์',
    description: 'เว็บเช็คผลบอลและตารางแข่งบอลแบบเรียลไทม์',
    defaultLocale: 'th'
  }
})
