<script lang="ts" setup>
import { watch } from 'vue'
import DateCarousel from '../fixtures/DateCarousel.vue'
import { getBusinessDateString } from '~/utils/date'

const props = withDefaults(defineProps<{
  modelValue?: string
  filter?: string
}>(), {
  modelValue: () => getBusinessDateString(),
  filter: 'all',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'update:filter', value: string): void
}>()

const activeMenu = ref<'all' | 'live' | 'upcoming' | 'finished'>('all')

watch(activeMenu, (newVal) => {
  emit('update:filter', newVal)
})

watch(() => props.filter, (newVal) => {
  if (newVal && (newVal === 'all' || newVal === 'live' || newVal === 'upcoming' || newVal === 'finished')) {
    activeMenu.value = newVal
  }
}, { immediate: true })
</script>

<template>
  <div class="sticky top-0 z-50 w-full border-b border-slate-300 bg-white/95 backdrop-blur">
    <div class="mx-auto w-full max-w-7xl py-3 md:px-6 md:py-4">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div class="w-full overflow-hidden md:w-auto">
          <DateCarousel
            :model-value="modelValue ?? getBusinessDateString()"
            :back-days="3"
            :forward-days="3"
            @update:model-value="$emit('update:modelValue', $event)"
          />
        </div>

        <nav class="flex w-full flex-wrap items-center justify-center gap-2 px-2 md:w-auto md:justify-end md:px-0">
          <button
            class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            :class="activeMenu === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'"
            @click="activeMenu = 'all'"
          >
            ทั้งหมด
          </button>

          <button
            class="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            :class="activeMenu === 'live' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-red-50'"
            @click="activeMenu = 'live'"
          >
            <span class="relative flex h-2 w-2">
              <span
                v-if="activeMenu === 'live'"
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"
              />
              <span
                v-else
                class="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-600 opacity-75"
              />
              <span
                class="relative inline-flex h-2 w-2 rounded-full"
                :class="activeMenu === 'live' ? 'bg-white' : 'bg-red-600'"
              />
            </span>
            สด
          </button>

          <button
            class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            :class="activeMenu === 'upcoming' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'"
            @click="activeMenu = 'upcoming'"
          >
            ยังไม่เตะ
          </button>

          <button
            class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
            :class="activeMenu === 'finished' ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-green-50'"
            @click="activeMenu = 'finished'"
          >
            จบแล้ว
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>
