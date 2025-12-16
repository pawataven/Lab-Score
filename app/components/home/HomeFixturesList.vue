<script setup lang="ts">
// รับข้อมูล Fixtures เข้ามา (เดี๋ยวเราจะ Mock ข้อมูลส่งเข้ามาจากหน้า index.vue)
defineProps<{
  fixtures: any[]
}>()
</script>

<template>
  <div class="space-y-6">
    <div 
      v-for="league in fixtures" 
      :key="league.id" 
      class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      
      <div class="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-b border-gray-100">
        <div class="flex items-center gap-3">
          <div v-if="league.logo" class="w-8 h-8 flex items-center justify-center bg-white rounded-full border border-gray-100 shadow-sm">
             <img :src="league.logo" class="w-5 h-5 object-contain" alt="league logo">
          </div>
          <div v-else class="w-8 h-8 rounded-full bg-gray-200"></div>

          <div>
            <h3 class="font-bold text-gray-800 uppercase text-sm md:text-base leading-tight">
              {{ league.name }}
            </h3>
            <span class="text-xs text-gray-500 font-medium">
              {{ league.country }} • {{ league.season }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs font-medium">
          <span class="text-gray-500">วันนี้ {{ league.matches.length }} แมตช์</span>
          <span v-if="league.liveCount > 0" class="px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full">
            {{ league.liveCount }} สด
          </span>
        </div>
      </div>

      <div class="divide-y divide-gray-100">
        <div 
          v-for="match in league.matches" 
          :key="match.id" 
          class="group flex flex-col md:flex-row items-center py-3 px-2 md:px-4 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          
          <div class="flex md:flex-col items-center justify-between md:justify-center w-full md:w-20 mb-2 md:mb-0 gap-2 md:gap-1">
            
            <span 
              class="text-sm font-bold w-12 text-center"
              :class="{
                'text-[#f97316] animate-pulse': match.status === 'LIVE',
                'text-green-600': match.status === 'FT',
                'text-gray-500': match.status === 'UPCOMING'
              }"
            >
              {{ match.timeDisplay }}
            </span>

            <span 
              class="px-3 py-0.5 rounded text-[10px] md:text-[11px] font-bold border min-w-[60px] text-center uppercase tracking-wide"
              :class="{
                'bg-orange-50 text-[#f97316] border-orange-100': match.status === 'LIVE',
                'bg-green-50 text-green-600 border-green-100': match.status === 'FT',
                'bg-gray-100 text-gray-400 border-gray-200': match.status === 'UPCOMING'
              }"
            >
              {{ match.statusText }}
            </span>
          </div>

          <div class="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-3 w-full">
            
            <div class="flex items-center justify-end gap-2 md:gap-3 text-right">
              <span class="text-sm md:text-base font-medium text-gray-900 line-clamp-1">
                {{ match.home.name }}
              </span>
              <div class="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0">
                <img v-if="match.home.logo" :src="match.home.logo" class="w-full h-full object-cover rounded-full">
              </div>
            </div>

            <div class="w-16 md:w-24 flex justify-center items-center">
              <div v-if="match.status === 'UPCOMING'" class="text-xs text-gray-400 font-medium">
                vs
              </div>
              <div v-else class="text-lg md:text-xl font-bold text-gray-800 tracking-widest bg-gray-50 px-2 rounded">
                {{ match.home.score }} - {{ match.away.score }}
              </div>
            </div>

            <div class="flex items-center justify-start gap-2 md:gap-3 text-left">
              <div class="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gray-100 border border-gray-200 shrink-0">
                 <img v-if="match.away.logo" :src="match.away.logo" class="w-full h-full object-cover rounded-full">
              </div>
              <span class="text-sm md:text-base font-medium text-gray-900 line-clamp-1">
                {{ match.away.name }}
              </span>
            </div>

          </div>

          <div class="hidden md:flex w-10 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <button class="text-gray-300 hover:text-[#f97316]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>