<script setup lang="ts">
// รับข้อมูล Fixtures เข้ามา
defineProps<{
  fixtures: any[]
}>()
</script>

<template>
  <div class="space-y-4 md:space-y-6">
    <div v-for="league in fixtures" :key="league.id"
      class="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      <div
        class="flex items-center justify-between px-3 py-2 md:px-4 md:py-3 bg-gray-50/80 border-b border-gray-100 backdrop-blur-sm">
        <div class="flex items-center gap-2 md:gap-3">
          <div class="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center shrink-0">
            <img v-if="league.logo" :src="league.logo" class="w-full h-full object-contain" alt="league logo">
            <div v-else class="w-full h-full rounded-full bg-gray-200"></div>
          </div>

          <div class="min-w-0">
            <h3 class="font-bold text-gray-800 uppercase text-xs md:text-base leading-tight truncate pr-2">
              {{ league.name }}
            </h3>
            <span class="text-[10px] md:text-xs text-gray-500 font-medium block">
              {{ league.country }} • {{ league.season }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 text-[10px] md:text-xs font-medium shrink-0">
          <span v-if="league.liveCount > 0"
            class="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full animate-pulse">
            {{ league.liveCount }} สด
          </span>
        </div>
      </div>

      <div class="divide-y divide-gray-100">
        <div v-for="match in league.matches" :key="match.id"
          class="group relative flex items-center py-2 px-2 md:py-3 md:px-4 hover:bg-gray-50 transition-colors cursor-pointer select-none">

          <div class="w-14 md:w-20 shrink-0 flex flex-col items-center justify-center gap-1 mr-1 md:mr-2">
            <span class="text-xs md:text-sm font-bold tracking-tight" :class="{
              'text-[#f97316] animate-pulse': match.status === 'LIVE',
              'text-green-600': match.status === 'FT',
              'text-gray-500': match.status === 'UPCOMING'
            }">
              {{ match.timeDisplay }}
            </span>

            <span
              class="px-1.5 py-0.5 rounded-sm text-[9px] md:text-[10px] font-bold border text-center w-full max-w-[48px] uppercase tracking-wider"
              :class="{
                'bg-orange-50 text-[#f97316] border-orange-100': match.status === 'LIVE',
                'bg-green-50 text-green-600 border-green-100': match.status === 'FT',
                'bg-gray-100 text-gray-400 border-gray-200': match.status === 'UPCOMING'
              }">
              {{ match.statusText }}
            </span>
          </div>

          <div class="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-1 md:gap-3">

            <div class="flex items-center justify-end gap-1.5 md:gap-3 text-right overflow-hidden">
              <span class="text-xs md:text-base font-medium text-gray-900 truncate leading-tight">
                {{ match.home.name }}
              </span>
              <div class="w-6 h-6 md:w-9 md:h-9 flex items-center justify-center shrink-0">
                <img v-if="match.home.logo" :src="match.home.logo" class="w-full h-full object-contain drop-shadow-sm"
                  alt="home">
              </div>
            </div>

            <div class="w-10 md:w-16 flex justify-center items-center shrink-0">
              <div v-if="match.status === 'UPCOMING'" class="text-[10px] md:text-xs text-gray-400 font-medium">
                VS
              </div>
              <div v-else
                class="text-sm md:text-xl font-bold text-gray-800 tracking-wider bg-slate-100/50 px-1.5 md:px-3 py-0.5 rounded-md min-w-[32px] text-center">
                {{ match.home.score }}-{{ match.away.score }}
              </div>
            </div>

            <div class="flex items-center justify-start gap-1.5 md:gap-3 text-left overflow-hidden">
              <div class="w-6 h-6 md:w-9 md:h-9 flex items-center justify-center shrink-0">
                <img v-if="match.away.logo" :src="match.away.logo" class="w-full h-full object-contain drop-shadow-sm"
                  alt="away">
              </div>
              <span class="text-xs md:text-base font-medium text-gray-900 truncate leading-tight">
                {{ match.away.name }}
              </span>
            </div>

          </div>

          <div
            class="hidden md:flex w-8 justify-end opacity-0 group-hover:opacity-100 transition-opacity absolute right-4">
            <button class="text-gray-400 hover:text-[#f97316]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>