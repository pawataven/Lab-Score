<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import { getBangkokCurrentDate, addDays } from '~/utils/date';

// Props
const props = withDefaults(defineProps<{
  modelValue: string;
  backDays?: number;
  forwardDays?: number;
}>(), {
  backDays: 2,
  forwardDays: 5
});

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();

interface DayItem {
  fullDate: string;
  dayName: string;
  dateDisplay: string;
  isToday: boolean;
}

// Logic: Generate Days
const days = computed<DayItem[]>(() => {
  const list: DayItem[] = [];
  const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  const todayStr = getBangkokCurrentDate();

  for (let i = -props.backDays; i <= props.forwardDays; i++) {
    const currentISODate = addDays(todayStr, i);
    const d = new Date(currentISODate); 

    let dayNameStr = thaiDays[d.getDay()] || '';
    if (i === 0) dayNameStr = 'วันนี้';
    else if (i === -1) dayNameStr = 'เมื่อวาน';
    else if (i === 1) dayNameStr = 'พรุ่งนี้';

    list.push({
      fullDate: currentISODate,
      dayName: dayNameStr,
      dateDisplay: `${d.getDate()} ${thaiMonths[d.getMonth()] || ''}`,
      isToday: i === 0
    });
  }
  return list;
});

const selectDate = (val: string) => {
  emit('update:modelValue', val);
};

// ---------------------------------------------------------
// ✅ Logic นี้ถูกต้องแล้วครับ (Manual Scroll + Delay)
// ---------------------------------------------------------
const containerRef = ref<HTMLElement | null>(null);

const scrollToActive = async (isSmooth = true) => {
  await nextTick();

  setTimeout(() => {
    const container = containerRef.value;
    const activeBtn = container?.querySelector('.is-selected') as HTMLElement;

    if (!container || !activeBtn) return;

    const scrollLeft = activeBtn.offsetLeft - (container.clientWidth / 2) + (activeBtn.clientWidth / 2);

    container.scrollTo({
      left: scrollLeft,
      behavior: isSmooth ? 'smooth' : 'auto'
    });
  }, isSmooth ? 0 : 300);
};

onMounted(() => scrollToActive(false));
watch(() => props.modelValue, () => scrollToActive(true));
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

<template>
  <div 
    ref="containerRef" 
    class="w-full overflow-x-auto pb-2 scrollbar-hide"
    style="contain: content;"
  >
    <div class="flex items-center space-x-2 min-w-max px-2">
      <button 
        type="button" 
        v-for="day in days" 
        :key="day.fullDate" 
        @click="selectDate(day.fullDate)"
        class="flex flex-col items-center justify-center min-w-18 h-18 rounded-xl border transition-all duration-200 space-y-0.5 relative overflow-hidden"
        :class="[
          modelValue === day.fullDate
            ? 'is-selected bg-[#f97316] text-gray-900 border-[#f97316] shadow-md scale-105 z-10'
            : 'bg-slate-100 text-gray-700 border-gray-100 hover:border-gray-300 hover:bg-gray-50',
          day.isToday && modelValue !== day.fullDate ? 'border-orange-400 bg-orange-50' : ''
        ]"
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