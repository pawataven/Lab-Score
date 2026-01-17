<script setup lang="ts">
// ไม่ต้อง import useHead เพราะ Nuxt 3 auto-import ให้แล้ว

useHead({
  // 1. Title หลักของเว็บ
  title: 'ScoreSanan - ผลบอลสด โปรแกรมบอลวันนี้ ตารางคะแนน',

  // 2. Meta Tags พื้นฐาน
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'description', content: 'เช็คผลบอลสดวันนี้ โปรแกรมการแข่งขันฟุตบอลทุกลีกดัง พรีเมียร์ลีก ไทยลีก พร้อมตารางคะแนน อัปเดตเรียลไทม์ ฟรี!' },
    { name: 'keywords', content: 'ผลบอลสด, livescore, โปรแกรมบอล, ตารางคะแนน, พรีเมียร์ลีก, ไทยลีก' },
    { name: 'author', content: 'ScoreSanan Team' },

    // 3. Open Graph (สำหรับ Facebook/Line)
    { property: 'og:title', content: 'ScoreSanan - ผลบอลสด เรียลไทม์' },
    { property: 'og:description', content: 'เช็คผลบอลสดวันนี้ โปรแกรมการแข่งขันฟุตบอลทุกลีกดัง ฟรีตลอด 24 ชม.' },
    { property: 'og:type', content: 'website' },
    // รูปภาพเวลาแชร์ลิงก์ (ต้องมีไฟล์ชื่อนี้ในโฟลเดอร์ /public)
    { property: 'og:image', content: '/og-image.jpg' },

    // 4. Twitter Card (สำหรับ Twitter/X)
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'ScoreSanan - ผลบอลสด เรียลไทม์' },
    { name: 'twitter:description', content: 'เช็คผลบอลสดวันนี้ พร้อมตารางคะแนนทุกลีกดัง' },
    { name: 'twitter:image', content: '/og-image.jpg' },
  ],

  // 5. Attributes ของ HTML tag
  htmlAttrs: {
    lang: 'th'
  }
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
/* นำเข้า CSS หลักตรงนี้ หรือไปตั้งค่าใน nuxt.config.ts ก็ได้ */
@import "~/assets/css/main.css";
</style>