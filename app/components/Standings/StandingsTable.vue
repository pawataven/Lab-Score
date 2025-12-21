<script setup lang="ts">
// กำหนด Props รับข้อมูล
defineProps<{
  standings: any[]
}>();
</script>

<template>
  <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-4 text-xs font-medium text-gray-500">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-green-500"></span> Champions League
      </div>
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-red-500"></span> Relegation
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-sm text-left">
        
        <thead class="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-4 py-3 font-semibold text-center w-12">#</th>
            <th class="px-4 py-3 font-semibold">Team</th>
            <th class="px-2 py-3 font-semibold text-center">P</th>
            <th class="hidden md:table-cell px-2 py-3 font-semibold text-center">W</th>
            <th class="hidden md:table-cell px-2 py-3 font-semibold text-center">D</th>
            <th class="hidden md:table-cell px-2 py-3 font-semibold text-center">L</th>
            <th class="hidden md:table-cell px-2 py-3 font-semibold text-center">GF</th>
            <th class="hidden md:table-cell px-2 py-3 font-semibold text-center">GA</th>
            <th class="hidden md:table-cell px-2 py-3 font-semibold text-center">GD</th>
            <th class="px-2 py-3 font-semibold text-center text-[#f97316]">Pts</th>
            <th class="hidden md:table-cell px-4 py-3 font-semibold text-center">Form</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-gray-100">
          <tr 
            v-for="team in standings" 
            :key="team.rank" 
            class="hover:bg-gray-50 transition-colors group relative"
          >
            <td class="relative px-4 py-3 text-center font-medium text-gray-600">
              <div v-if="team.rank <= 4" class="absolute left-0 top-0 bottom-0 w-1 bg-green-500"></div>
              <div v-if="team.rank >= 18" class="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
              
              {{ team.rank }}
            </td>

            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img :src="team.logo" class="w-6 h-6 object-contain" alt="logo">
                <span class="font-bold text-gray-800 whitespace-nowrap">{{ team.name }}</span>
              </div>
            </td>

            <td class="px-2 py-3 text-center text-gray-600">{{ team.played }}</td>
            
            <td class="hidden md:table-cell px-2 py-3 text-center text-gray-500">{{ team.win }}</td>
            <td class="hidden md:table-cell px-2 py-3 text-center text-gray-500">{{ team.draw }}</td>
            <td class="hidden md:table-cell px-2 py-3 text-center text-gray-500">{{ team.lose }}</td>
            <td class="hidden md:table-cell px-2 py-3 text-center text-gray-500">{{ team.goalsFor }}</td>
            <td class="hidden md:table-cell px-2 py-3 text-center text-gray-500">{{ team.goalsAgainst }}</td>
            
            <td class="hidden md:table-cell px-2 py-3 text-center font-medium" 
              :class="team.goalsDiff > 0 ? 'text-green-600' : (team.goalsDiff < 0 ? 'text-red-600' : 'text-gray-500')">
              {{ team.goalsDiff > 0 ? '+' : '' }}{{ team.goalsDiff }}
            </td>

            <td class="px-2 py-3 text-center font-bold text-[#f97316] text-base">{{ team.points }}</td>

            <td class="hidden md:table-cell px-4 py-3 text-center">
              <div class="flex items-center justify-center gap-1">
                <span 
                  v-for="(result, i) in team.form" 
                  :key="i"
                  class="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold text-white uppercase"
                  :class="{
                    'bg-green-500': result === 'W',
                    'bg-gray-400': result === 'D',
                    'bg-red-500': result === 'L'
                  }"
                >
                  {{ result }}
                </span>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

