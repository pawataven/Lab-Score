<script setup lang="ts">
/**
 * ใช้ไอคอนผ่าน @nuxt/icon
 * ไม่ต้อง import อะไรเพิ่ม แค่เรียก <Icon />
 */
</script>

<template>
  <header
    class="sticky top-0 p-2 z-50 w-full border-b border-slate-300 sm:px-5 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">

    <!-- โลโก้ + ชื่อเว็บ -->
    <div
      class="mx-auto flex max-w-full flex-col items-start gap-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between md:py-4 lg:mx-40">
      <div class="flex w-full items-center gap-4 md:w-1/2">
        <div class="flex h-14 items-center shrink-0 ml-1.5">
          <img class="h-full rounded-md object-cover items-center" src="/png.png" alt="Kaan Sanan logo" />
        </div>
        <div class="min-w-0">
          <h1 class="truncate text-2xl font-semibold text-black sm:text-3xl">
            สกอร์<span class="text-emerald-600">สนั่น</span>
          </h1>
          <p class="mt-0.5 text-xs text-slate-500 sm:text-sm lg:w-100">
            <span class="font-black text-black">Score-</span>
            <span class="font-black text-emerald-600">Sanan</span>
            <!-- Live Scores &amp; Results · Power by ArpaoDev -->
             ศูนย์รวมผลบอลสด โปรแกรมการแข่งขัน และตารางคะแนนฟุตบอลแบบเรียลไทม์ บริการฟรีสำหรับคนไทย
          </p>
        </div>
      </div>

      <!-- เมนูด้านขวา -->
      <nav
        class="flex w-full flex-wrap items-center justify-center gap-4 border-t border-slate-200 pt-3 text-sm sm:text-base sm:px-1 md:w-auto md:border-t-0 md:pt-0 md:justify-end">
        <NuxtLink to="/" class="cursor-pointer font-medium text-slate-900 transition-colors hover:text-orange-500">
          หน้าหลัก</NuxtLink>
        <NuxtLink to="/fixture"
          class="cursor-pointer font-medium text-slate-900 transition-colors hover:text-orange-500">
          โปรเเกรมการเเข่งขัน</NuxtLink>
        <NuxtLink to="/standings" class="cursor-pointer font-medium text-slate-900 transition-colors hover:text-orange-500">
          ตารางคะเเนน</NuxtLink>
      </nav>
    </div>
  </header>
</template>
