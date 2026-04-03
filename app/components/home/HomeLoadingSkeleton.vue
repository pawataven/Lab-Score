<script setup lang="ts">
</script>

<template>
  <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div class="absolute top-0 left-0 right-0 h-1 bg-slate-100 z-10">
      <div class="h-full bg-green-500 shimmer-bar"></div>
    </div>
    <div class="p-4 space-y-5 opacity-70 pointer-events-none">
      <div class="flex items-center gap-4 mb-4">
        <div class="h-10 w-10 rounded-full bg-slate-200 animate-pulse"></div>
        <div class="flex flex-col gap-2">
          <div class="h-5 w-32 rounded bg-slate-200 animate-pulse"></div>
          <div class="h-3 w-20 rounded bg-slate-100 animate-pulse"></div>
        </div>
      </div>
      <div v-for="i in 3" :key="i" class="flex items-center justify-between py-3 border-b border-slate-50">
        <div class="h-4 w-full rounded bg-slate-100 animate-pulse"></div>
      </div>
      <div class="text-center text-xs text-slate-400 pt-2">
        <slot>กำลังดึงข้อมูลล่าสุด...</slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shimmer-bar {
  width: 100%;
  animation: indeterminate 1.5s infinite linear;
  transform-origin: 0% 50%;
}

@keyframes indeterminate {
  0% { transform: translateX(0) scaleX(0); }
  40% { transform: translateX(0) scaleX(0.4); }
  100% { transform: translateX(100%) scaleX(0.5); }
}
</style>
