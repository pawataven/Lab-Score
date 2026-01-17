<template>
  <div class="w-full bg-[#f97316] text-white rounded-xl p-4 px-3 flex items-center justify-between shadow-sm">
    
    <div class="flex items-center gap-4">
      
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-5 w-5">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>

      <div class="flex flex-col">
        <span class="text-xl font-bold leading-tight">
          {{ matchCount }} แมตช์กำลังแข่งขันสดตอนนี้
        </span>
        <span class="text-sm font-light text-white/90">
          จากเเมตช์ทั้งหมด {{ TotalmatchCount }} แมตช์วันนี้
        </span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <span class="relative flex h-2.5 w-2.5">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-75"></span>
        <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-700"></span>
      </span>
      
      <span class=" font-bold tracking-wider text-2xl">
        สดตอนนี้
      </span>
    </div>

  </div>
</template>

<script setup lang="ts">
// รับค่าจำนวนแมตช์เข้ามา (Default ไว้ที่ 0 หรือ 5)
defineProps({
  matchCount: {
    type: Number,
  },
  TotalmatchCount: {
    type: Number,
  }
})
</script>