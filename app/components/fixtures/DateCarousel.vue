<template>
  <div class="w-full overflow-x-auto pb-2 scrollbar-hide">
    <div class="flex items-center space-x-2 min-w-max">
      
      <button 
        @click="selectDate('all')"
        class="flex flex-col items-center justify-center min-w-20 h-[72px] rounded-lg border transition-all duration-200"
        :class="modelValue === 'all' 
          ? 'bg-[#f97316] text-white border-[#f97316] shadow-md' 
          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-white hover:border-gray-300'"
      >
        <span class="text-sm font-bold">ทั้งหมด</span>
      </button>

      <button 
        v-for="(day, index) in days" 
        :key="index"
        @click="selectDate(day.fullDate)"
        class="flex flex-col items-center justify-center min-w-20 h-[72px] rounded-lg border transition-all duration-200 space-y-0.5"
        :class="modelValue === day.fullDate 
          ? 'bg-gray-100 border-gray-300 shadow-inner' 
          : 'bg-white border-gray-100 hover:border-gray-300'"
      >
        <span class="text-xs text-gray-500 font-medium">{{ day.dayName }}</span>
        <span class="text-sm font-bold text-gray-800">{{ day.dateDisplay }}</span>
        <span class="text-[10px] text-gray-400">{{ day.matchCount }} แมตช์</span>
      </button>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// 1. รับ Props และ Emits
const props = defineProps<{
  modelValue: string; 
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();

// 2. สร้าง Interface (โครงสร้างข้อมูล) ให้ชัดเจน
interface DayItem {
  fullDate: string;
  dayName: string;
  dateDisplay: string;
  matchCount: number;
}

// 3. Helper: สร้างข้อมูลวันที่
const days = computed<DayItem[]>(() => {
  const list: DayItem[] = []; // ประกาศตัวแปรว่าเป็น Array ของ DayItem แน่นอน
  const today = new Date();
  
  const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    // ✅ จุดสำคัญ: ใส่ || '' (หรือค่าว่าง) เพื่อแก้ Error "Type undefined is not assignable to string"
    const dayNameStr = thaiDays[d.getDay()] || ''; 
    const monthNameStr = thaiMonths[d.getMonth()] || '';

    list.push({
      fullDate: `${year}-${month}-${day}`,
      dayName: dayNameStr,
      dateDisplay: `${d.getDate()} ${monthNameStr}`,
      matchCount: Math.floor(Math.random() * 10) + 2
    });
  }
  return list;
});

// 4. Function เลือกวันที่
const selectDate = (val: string) => {
  emit('update:modelValue', val);
};
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>