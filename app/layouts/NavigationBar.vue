<template>
  <header
    class="sticky top-0 z-50 w-full border-b border-slate-300 bg-white/95 p-2 backdrop-blur supports-backdrop-filter:bg-white/80"
  >
    <div
      class="mx-auto flex max-w-full flex-col items-start gap-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between md:py-4 lg:mx-40"
    >
      <div class="flex w-full items-center gap-4 md:w-1/2">
        <div class="ml-1.5 flex h-14 shrink-0 items-center">
          <NuxtImg
            src="/png.png"
            width="56"
            height="56"
            class="rounded-md object-contain"
            alt="ScoreSanan logo"
            preload
            loading="eager"
            fetchpriority="high"
          />
        </div>
        <div class="min-w-0">
          <h1 class="truncate text-2xl font-semibold text-black sm:text-3xl">
            สกอร์<span class="text-emerald-600">สนั่น</span>
          </h1>
          <p class="mt-0.5 text-xs text-slate-500 sm:text-sm lg:w-100">
            <span class="font-black text-black">Score-</span>
            <span class="font-black text-emerald-700">Sanan</span>
            ศูนย์รวมผลบอลสด โปรแกรมการแข่งขัน และตารางคะแนนฟุตบอลแบบเรียลไทม์
          </p>
        </div>
      </div>

      <nav
        class="flex w-full flex-wrap items-center justify-center gap-4 border-t border-slate-200 pt-3 text-sm sm:px-1 sm:text-base md:w-auto md:justify-end md:border-t-0 md:pt-0"
      >
        <NuxtLink to="/" class="cursor-pointer font-medium text-slate-900 transition-colors hover:text-orange-500">
          หน้าหลัก
        </NuxtLink>
        <NuxtLink to="/fixture" class="cursor-pointer font-medium text-slate-900 transition-colors hover:text-orange-500">
          โปรแกรมการแข่งขัน
        </NuxtLink>
        <NuxtLink to="/standings" class="cursor-pointer font-medium text-slate-900 transition-colors hover:text-orange-500">
          ตารางคะแนน
        </NuxtLink>
        <NuxtLink to="/backend-test" class="cursor-pointer font-medium text-slate-900 transition-colors hover:text-orange-500">
          Backend Test
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
