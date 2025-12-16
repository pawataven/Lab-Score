<script setup lang="ts">
import { computed } from 'vue';

// รับ Props
const props = defineProps<{
    leagues: any[];
    modelValue: string[]; // รับค่า ID ที่ถูกเลือก
}>();

const emit = defineEmits(['update:modelValue']);

// จัดการ v-model ให้ส่งค่ากลับไปหน้าแม่(index.vue)
const selectedIds = computed({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
});
</script>

<template>
    <div class="bg-white rounded-xl border border-gray-100 p-4 pb-[30%] shadow-sm">
        <h3 class="font-bold text-gray-800 mb-3">เลือกลีกที่ต้องการดู</h3>
        <div class="relative mb-4">
            <input type="text" placeholder="ค้นหาลีก/ทีม..."
                class="w-full bg-slate-100 text-text-primary border border-gray-300 rounded-lg py-3 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50">
            <svg class="w-4 h-4 text-gray-500 absolute left-3 top-4" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
        </div>

        <div class="flex gap-2 mb-4">
            <button
                class="flex-1 text-xs bg-slate-100 border border-gray-500 cursor-pointer hover:bg-slate-200 py-2.5 rounded text-gray-600 transition">
                เลือกทั้งหมด
            </button>
            <button
                class="flex-1 text-xs bg-slate-100 border border-gray-500 cursor-pointer hover:bg-slate-200 py-2.5 rounded text-gray-600 transition">
                ล้างการเลือก
            </button>
        </div>

        <hr class="border-gray-100 mb-4">

        <div class="space-y-1"> <label v-for="league in leagues" :key="league.id" :class="[
            'flex items-center space-x-3 cursor-pointer group select-none py-2 px-3 rounded-lg transition-all duration-200',
            selectedIds.includes(league.id)
                ? 'bg-orange-50 border border-orange-100'  
                : 'hover:bg-menu-hover-background border border-transparent transition' 
        ]">
                <input type="checkbox" :value="league.id" v-model="selectedIds" class="peer sr-only">

                <div class="h-5 w-5 flex items-center justify-center rounded border-2 border-gray-300 bg-white transition-all duration-200 
               peer-checked:border-[#f97316] peer-checked:bg-[#f97316] peer-checked:[&_svg]:scale-100">
                    <svg class="h-3.5 w-3.5 text-white transform scale-0 transition-transform duration-200" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <div class="flex items-center space-x-2 text-text-primary">
                    <div v-if="!league.logo" class="w-6 h-6 rounded-full bg-gray-200 shrink-0"></div>
                    <img v-else :src="league.logo" class="w-6 h-6 rounded-full object-cover" />

                    <span class="text-sm font-medium transition-colors"
                        :class="selectedIds.includes(league.id) ? 'text-[#f97316] font-bold' : ''">
                        {{ league.name }}
                    </span>
                </div>

            </label>

        </div>
    </div>
</template>