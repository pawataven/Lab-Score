<script setup lang="ts">
import type { LeagueGroup } from '~/types/fixture'

const labelClassMap: Record<string, string> = {
  'เช้ามืด': 'bg-slate-700 text-white ring-1 ring-slate-500',   // เกือบดำ = ดึก/มืด
  'เช้า': 'bg-sky-400 text-white ring-1 ring-sky-200',           // ฟ้าสว่าง = เช้า
  'บ่าย': 'bg-amber-500 text-white ring-1 ring-amber-200',       // ส้ม = แดด
  'ค่ำ': 'bg-orange-700 text-white ring-1 ring-orange-500',      // น้ำตาลส้ม = พระอาทิตย์ตก
}

function getLabelClass(label: string): string {
  return labelClassMap[label] ?? 'bg-slate-600 text-white'
}

defineProps<{
  fixtures: LeagueGroup[]
}>()
</script>

<template>
  <div class="space-y-4 md:space-y-6">
    <div
      v-for="(league, index) in fixtures"
      :key="league.id"
      class="league-wrapper overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm md:rounded-xl"
    >
      <div
        class="flex items-center justify-between border-b border-gray-100 bg-gray-50/80 px-3 py-2 backdrop-blur-sm md:px-4 md:py-3"
      >
        <div class="flex items-center gap-2 md:gap-3">
          <div class="flex h-6 w-6 shrink-0 items-center justify-center md:h-8 md:w-8">
            <NuxtImg
              v-if="league.logo"
              :src="league.logo"
              format="webp"
              quality="80"
              :loading="index === 0 ? 'eager' : 'lazy'"
              :fetchpriority="index === 0 ? 'high' : 'auto'"
              class="h-full w-full object-contain"
              alt="league logo"
            />
            <div v-else class="h-full w-full rounded-full bg-gray-200" />
          </div>

          <div class="min-w-0">
            <h2 class="truncate pr-2 text-xs font-bold leading-tight text-gray-800 uppercase md:text-base">
              {{ league.name }}
            </h2>
            <span class="block text-[10px] font-medium text-gray-500 md:text-xs">
              {{ league.country }} • {{ league.season }}
            </span>
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-2 text-[10px] font-medium md:text-xs">
          <span
            v-if="league.liveCount > 0"
            class="rounded-full bg-orange-100 px-2 py-0.5 text-orange-600 animate-pulse"
          >
            {{ league.liveCount }} สด
          </span>
        </div>
      </div>

      <div>
        <section
          v-for="section in league.sections"
          :key="section.key"
          class="border-t border-gray-100 first:border-t-0"
        >
          <div class="bg-slate-50 px-3 py-2 text-xs font-semibold tracking-wide text-slate-600 md:px-4">
            {{ section.title }}
          </div>

          <div class="divide-y divide-gray-100">
            <div
              v-for="match in section.matches"
              :key="match.id"
              class="group relative flex cursor-pointer select-none items-center px-2 py-2 transition-colors hover:bg-gray-50 md:px-4 md:py-3"
            >
              <div class="mr-1 flex w-14 shrink-0 flex-col items-center justify-center gap-1 md:mr-2 md:w-24">
                <span
                  class="rounded-full px-2 py-0.5 text-[9px] font-semibold tracking-wide md:text-[10px]"
                  :class="getLabelClass(match.label)"
                >
                  {{ match.label }}
                </span>

                <span
                  class="text-xs font-bold tracking-tight md:text-sm"
                  :class="{
                    'text-[#f97316] animate-pulse': match.status === 'LIVE',
                    'text-green-700': match.status === 'FT',
                    'text-gray-800': match.status === 'UPCOMING',
                  }"
                >
                  {{ match.timeDisplay }}
                </span>

                <span
                  class="w-full max-w-12 rounded-sm border px-1.5 py-0.5 text-center text-[9px] font-bold uppercase tracking-wider md:text-[10px]"
                  :class="{
                    'bg-orange-50 text-[#f97316] border-orange-100': match.status === 'LIVE',
                    'bg-green-50 text-green-700 border-green-100': match.status === 'FT',
                    'bg-gray-100 text-gray-800 border-gray-200': match.status === 'UPCOMING',
                  }"
                >
                  {{ match.statusText }}
                </span>
              </div>

              <div class="grid flex-1 grid-cols-[1fr_auto_1fr] items-center gap-1 md:gap-3">
                <div class="flex items-center justify-end gap-1.5 overflow-hidden text-right md:gap-3">
                  <span class="truncate text-xs font-medium leading-tight text-gray-900 md:text-base">
                    {{ match.home.name }}
                  </span>
                  <div class="flex h-6 w-6 shrink-0 items-center justify-center md:h-9 md:w-9">
                    <NuxtImg
                      v-if="match.home.logo"
                      :src="match.home.logo"
                      format="webp"
                      quality="80"
                      :loading="index === 0 ? 'eager' : 'lazy'"
                      :fetchpriority="index === 0 ? 'high' : 'auto'"
                      class="h-full w-full object-contain drop-shadow-sm"
                      alt="home"
                    />
                  </div>
                </div>

                <div class="flex w-10 shrink-0 items-center justify-center md:w-16">
                  <div
                    v-if="match.status === 'UPCOMING'"
                    class="text-[10px] font-medium text-gray-900 md:text-xs"
                  >
                    VS
                  </div>
                  <div
                    v-else
                    class="min-w-8 rounded-md bg-slate-100/50 px-1.5 py-0.5 text-center text-sm font-bold tracking-wider text-gray-800 md:px-3 md:text-xl"
                  >
                    {{ match.home.score }}-{{ match.away.score }}
                  </div>
                </div>

                <div class="flex items-center justify-start gap-1.5 overflow-hidden text-left md:gap-3">
                  <div class="flex h-6 w-6 shrink-0 items-center justify-center md:h-9 md:w-9">
                    <NuxtImg
                      v-if="match.away.logo"
                      :src="match.away.logo"
                      format="webp"
                      quality="80"
                      :loading="index === 0 ? 'eager' : 'lazy'"
                      :fetchpriority="index === 0 ? 'high' : 'auto'"
                      class="h-full w-full object-contain drop-shadow-sm"
                      alt="away"
                    />
                  </div>
                  <span class="truncate text-xs font-medium leading-tight text-gray-900 md:text-base">
                    {{ match.away.name }}
                  </span>
                </div>
              </div>

              <div
                class="absolute right-4 hidden w-8 justify-end opacity-0 transition-opacity group-hover:opacity-100 md:flex"
              >
                <button class="text-gray-400 hover:text-[#f97316]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
