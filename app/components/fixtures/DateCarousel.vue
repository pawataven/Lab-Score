<script setup lang="ts">
import { computed, ref, onMounted, watch, nextTick } from 'vue';
import { getBangkokCurrentDate, addDays } from '~/utils/date';

// รับค่า Props (เพิ่ม backDays และ forwardDays)
// ใช้ withDefaults เพื่อกำหนดค่าเริ่มต้น ถ้าหน้าไหนไม่ส่งมา ก็จะใช้ค่าเดิมนี้
const props = withDefaults(defineProps<{
  modelValue: string; 
  backDays?: number;     // รับจำนวนวันย้อนหลัง
  forwardDays?: number;  // รับจำนวนวันล่วงหน้า
}>(), {
  backDays: 2,    // ค่า Default เดิม
  forwardDays: 5  // ค่า Default เดิม
});

// 2. ส่งค่าเมื่อมีการเลือก
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>();

interface DayItem {
  fullDate: string;
  dayName: string;
  dateDisplay: string;
  isToday: boolean;
}

// 3. สร้างรายการวันที่ (Dynamic ตาม Props)
const days = computed<DayItem[]>(() => {
  const list: DayItem[] = [];
  const thaiDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

  // หา "วันนี้" ตามเวลาฟุตบอลไทย (ตัดตี 5)
  const todayStr = getBangkokCurrentDate();

  // แก้ Loop: ใช้ props แทนตัวเลข Hardcode
  // ใช้เครื่องหมายลบหน้า backDays เพื่อให้นับถอยหลัง
  for (let i = -props.backDays; i <= props.forwardDays; i++) {
    const currentISODate = addDays(todayStr, i);
    const d = new Date(currentISODate);
    
    // ตั้งชื่อวันให้ดูง่าย (+ กันเหนียว undefined)
    let dayNameStr = thaiDays[d.getDay()] || '';
    if (i === 0) dayNameStr = 'วันนี้';
    if (i === -1) dayNameStr = 'เมื่อวาน';
    if (i === 1) dayNameStr = 'พรุ่งนี้'; // เพิ่มพรุ่งนี้ให้นิดนึงครับ ดู Friendly ดี

    list.push({
      fullDate: currentISODate,
      dayName: dayNameStr,
      dateDisplay: `${d.getDate()} ${thaiMonths[d.getMonth()] || ''}`,
      isToday: i === 0
    });
  }
  return list;
});

// ฟังก์ชันเลือกวัน
const selectDate = (val: string) => {
  emit('update:modelValue', val);
};

// Scroll ไปหาปุ่มที่เลือกอัตโนมัติ (UX)
const containerRef = ref<HTMLElement | null>(null);
const scrollToActive = () => {
  nextTick(() => {
    if (!containerRef.value) return;
    const activeBtn = containerRef.value.querySelector('.is-selected');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  });
};

onMounted(() => scrollToActive());
watch(() => props.modelValue, () => scrollToActive());
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>

<template>
  <div ref="containerRef" class="w-full overflow-x-auto pb-2 scrollbar-hide">
    <div class="flex items-center space-x-2 min-w-max px-2">
      
      <button 
        v-for="(day, index) in days" 
        :key="index"
        @click="selectDate(day.fullDate)"
        class="flex  flex-col items-center justify-center min-w-[72px] h-[72px] rounded-xl border transition-all duration-200 space-y-0.5 relative overflow-hidden"
        :class="[
          modelValue === day.fullDate 
            ? 'is-selected  bg-[#f97316] text-white border-[#f97316] shadow-md scale-105 z-10' 
            : 'bg-slate-100 text-gray-600 border-gray-100 hover:border-gray-300 hover:bg-gray-50',
          day.isToday && modelValue !== day.fullDate ? ' border-orange-400 bg-orange-50 ' : ''
        ]"
      >
        <span class="text-xs font-medium" :class="modelValue === day.fullDate ? 'text-orange-100' : 'text-gray-500'">
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