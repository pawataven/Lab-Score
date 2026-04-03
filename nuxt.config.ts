import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // 1. ปิด Devtools ใน Production เพื่อความสะอาดและ Performance
  devtools: { enabled: true },

  modules: [
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/seo',
  ],
  
  css: ['~/assets/css/main.css'],

  // 2. ✅ The "Pro" Way: ให้ Module จัดการ Preload เอง (เสถียรและยั่งยืนกว่า)
  // ไม่ต้อง Hardcode ชื่อไฟล์ hash ยาวๆ ใน app.head อีกต่อไป
  fonts: {
    provider: 'google',
    families: [
      {
        name: 'Prompt',
        weights: [400, 600],
        preload: true, // สั่ง Preload ตรงนี้จบเลย Nuxt จัดการให้
      }
    ],
    defaults: {
      subsets: ['thai', 'latin'],
    },
  },

  // 1. เพิ่มส่วนนี้กลับเข้ามา เพื่อบังคับ Preload ฟอนต์ 100%
  app: {
    head: {
      link: [
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          // ชื่อไฟล์จากภาพ Lighthouse ของคุณ (OG5m...)
          href: '/_fonts/OG5mACXrFREU099zTinCuzHLqolbwPbbze0MgboouE0-MNEgCxpRmF80XCvVq6ft_5sCcXItpwSS-YiIVlZ9Ggw.woff2', 
          crossorigin: 'anonymous'
        },
        {
          rel: 'preload',
          as: 'font',
          type: 'font/woff2',
          // ชื่อไฟล์จากภาพ Lighthouse ของคุณ (octdz...)
          href: '/_fonts/octdzawj5gKM6UnR3ey-R1ZAXiQxhTzJkT4JlyA4E18-FAXOH8eWHpd_9fhtX4l0Ckfe1zTprISL5EzOtU2dLv8.woff2', 
          crossorigin: 'anonymous'
        }
      ]
    }
  },

  // 3. 🔒 Security: ปิด Sourcemap เพื่อไม่ให้คนอื่นเห็น Code ต้นฉบับ
  sourcemap: {
    server: false,
    client: false
  },

  // 4. 🚀 Performance: เปิด Compression ระดับ Server (Gzip/Brotli)
  nitro: {
    compressPublicAssets: true,
  },

  image: {
    domains: ['media.api-sports.io', 'media-4.api-sports.io'],
    format: ['webp'],
    quality: 85,
  },

  routeRules: {
    // แบบที่ 1: Server Cache (SWR)
    // '/': { swr: 600 },            // แคชหน้าแรกไว้ 60 วินาที
    // '/fixture': { swr: 600 },    // แคชหน้าตารางแข่งไว้ 10 นาที (600 วิ)
    // '/standings': { swr: 3600 }, // แคชหน้าตารางคะแนนไว้ 1 ชั่วโมง (3600 วิ)
    // '/api/fixtures': { swr: 60 }, // แคช API Route ไว้ 60 วินาที

    // แบบที่ 2: Browser Cache (Static Assets)
    '/png.png': { headers: { 'cache-control': 'public, max-age=31536000, immutable' } },
  },

  features: {
    inlineStyles: true
  },

  components: [
    {
      path: '~/app/components',
      pathPrefix: false,
    },
  ],

  vite: {
    plugins: [tailwindcss()],
    build: {
      assetsInlineLimit: 4096, // ปรับค่ามาตรฐาน (256kb ใหญ่ไปสำหรับการ Inline อาจทำให้ HTML บวม)
    }
  },

  experimental: {
    componentIslands: true
  },

  runtimeConfig: {
    apiFootball: {
      provider: process.env.API_FOOTBALL_PROVIDER,
      baseUrl: process.env.API_FOOTBALL_BASE_URL,
      key: process.env.API_FOOTBALL_KEY,
      host: process.env.API_FOOTBALL_HOST,
    },
    public: {
      fixtureFixedDate: process.env.FIXTURE_FIXED_DATE || "",
    },
  },

  site: {
    url: 'https://your-domain.com',
    name: 'Score Sanan - ผลบอลสด Livescore อัพเดทเรียลไทม์',
    description: 'เว็บเช็คผลบอลและตารางแข่งบอลแบบเรียลไทม์',
    defaultLocale: 'th'
  }
})