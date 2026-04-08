<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { addDays, getBusinessDateString } from '~/utils/date'

const props = withDefaults(defineProps<{
  modelValue: string
  backDays?: number
  forwardDays?: number
}>(), {
  backDays: 2,
  forwardDays: 5,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

interface DayItem {
  fullDate: string
  dayName: string
  dateDisplay: string
  isToday: boolean
}

const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.']
const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

const parseIsoAsLocalDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(year || 0, (month || 1) - 1, day || 1)
}

const days = computed<DayItem[]>(() => {
  const list: DayItem[] = []
  const todayStr = getBusinessDateString()

  for (let i = -props.backDays; i <= props.forwardDays; i++) {
    const currentISODate = addDays(todayStr, i)
    const date = parseIsoAsLocalDate(currentISODate)

    let dayName = thaiDays[date.getDay()] || ''
    if (i === 0) dayName = 'วันนี้'
    else if (i === -1) dayName = 'เมื่อวาน'
    else if (i === 1) dayName = 'พรุ่งนี้'

    list.push({
      fullDate: currentISODate,
      dayName,
      dateDisplay: `${date.getDate()} ${thaiMonths[date.getMonth()] || ''}`,
      isToday: i === 0,
    })
  }

  return list
})

const selectDate = (value: string) => {
  emit('update:modelValue', value)
}

const containerRef = ref<HTMLElement | null>(null)

const scrollToActive = async (isSmooth = true) => {
  await nextTick()

  setTimeout(() => {
    const container = containerRef.value
    const activeBtn = container?.querySelector('.is-selected') as HTMLElement | null

    if (!container || !activeBtn) return

    const scrollLeft = activeBtn.offsetLeft - (container.clientWidth / 2) + (activeBtn.clientWidth / 2)
    container.scrollTo({ left: scrollLeft, behavior: isSmooth ? 'smooth' : 'auto' })
  }, isSmooth ? 0 : 300)
}

onMounted(() => scrollToActive(false))
watch(() => props.modelValue, () => scrollToActive(true))
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

<template>
  <div ref="containerRef" class="w-full overflow-x-auto pb-2 scrollbar-hide" style="contain: content;">
    <div class="flex min-w-max items-center space-x-2 px-2">
      <button
        v-for="day in days"
        :key="day.fullDate"
        type="button"
        class="relative flex h-18 min-w-18 flex-col items-center justify-center space-y-0.5 overflow-hidden rounded-xl border transition-all duration-200"
        :class="[
          modelValue === day.fullDate
            ? 'is-selected z-10 scale-105 border-[#f97316] bg-[#f97316] text-gray-900 shadow-md'
            : 'border-gray-100 bg-slate-100 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
          day.isToday && modelValue !== day.fullDate ? 'border-orange-400 bg-orange-50' : ''
        ]"
        @click="selectDate(day.fullDate)"
      >
        <span class="text-xs font-medium" :class="modelValue === day.fullDate ? 'text-gray-900' : 'text-gray-700'">
          {{ day.dayName }}
        </span>

        <span class="text-sm font-bold">
          {{ day.dateDisplay.split(' ')[0] }}
          <span class="text-[10px] font-normal">{{ day.dateDisplay.split(' ')[1] }}</span>
        </span>
      </button>
    </div>
  </div>
</template>
