<template>
  <div class="w-full bg-linear-to-r from-[#f97316] to-orange-700 text-white rounded-xl p-3 md:p-4 flex items-center justify-between shadow-sm overflow-hidden">
    
    <div class="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
      
      <div class="flex h-8 w-8 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full bg-white/20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 md:h-6 md:w-6">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      </div>

      <div class="flex flex-col min-w-0">
        <span class="text-sm md:text-xl font-bold leading-tight truncate pr-2">
          {{ matchCount }} แมตช์กำลังแข่งสด
        </span>
        
        <span class="text-[10px] md:text-sm font-light text-orange-50 truncate">
          จากทั้งหมด {{ TotalmatchCount }} แมตช์วันนี้
        </span>
      </div>
    </div>

    <div class="flex items-center gap-1.5 md:gap-2 shrink-0 pl-2 border-l border-white/10 md:border-none md:pl-0">
      
      <span class="relative flex h-2 w-2 md:h-3 md:w-3">
        <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex h-full w-full rounded-full bg-red-500"></span>
      </span>
      
      <span class="font-bold tracking-wider text-xs md:text-2xl whitespace-nowrap">
        สด<span class="hidden md:inline">ตอนนี้</span>
      </span>
      </div>

  </div>
</template>

<script setup lang="ts">
defineProps({
  matchCount: {
    type: Number,
    default: 0
  },
  TotalmatchCount: {
    type: Number,
    default: 0
  }
})
</script>