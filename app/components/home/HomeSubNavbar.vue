<script lang="ts" setup>
import { ref, watch } from 'vue';
import DateCarousel from '../fixtures/DateCarousel.vue';

const selectedDate = ref(new Date().toISOString().slice(0, 10))

watch(selectedDate, (val) => {
    console.log('วันที่เลือก (สำหรับ API):', val) // 2025-12-11
});

const props = withDefaults(defineProps<{
    modelValue?: string;
    filter?: string;
}>(), {
    // ถ้าไม่มีค่าส่งมา หรือเป็น undefined ไปใช้วันที่ปัจจุบันแทน
    modelValue: () => new Date().toISOString().slice(0, 10),
    filter: 'all' // เพิ่มค่าเริ่มต้นสำหรับ filter
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
    (e: 'update:filter', value: string): void;
}>();

const activeMenu = ref<'all' | 'live' | 'upcoming' | 'finished'>('all')

//watch เพื่อส่งค่าเมื่อมีการกดเปลี่ยนเมนู
watch(activeMenu, (newVal) => {
    emit('update:filter', newVal) // ส่งค่า 'all', 'live', ... ออกไป
})

// watch คอยดูว่าถ้าไฟล์แม่เปลี่ยน filter ให้เราเปลี่ยนปุ่มตามด้วย
watch(() => props.filter, (newVal) => {
    if (newVal && (newVal === 'all' || newVal === 'live' || newVal === 'upcoming' || newVal === 'finished')) {
        activeMenu.value = newVal
    }
})

</script>

<template>
    <div class="sticky top-0 z-50 w-full border-b border-slate-300 bg-white/95 backdrop-blur">
        <div class="mx-auto w-full max-w-7xl py-3 md:py-4 md:px-6">

            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div class="w-full overflow-hidden md:w-auto">
                    <DateCarousel :model-value="modelValue ?? new Date().toISOString().slice(0, 10)"
                        @update:model-value="$emit('update:modelValue', $event)" :back-days="3" :forward-days="3" />
                </div>

                <nav
                    class="flex w-full flex-wrap items-center justify-center gap-2 px-2 md:w-auto md:justify-end md:px-0">
                    <button @click="activeMenu = 'all'" :class="[
                        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                        activeMenu === 'all' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100'
                    ]">
                        ทั้งหมด
                    </button>

                    <button @click="activeMenu = 'live'" :class="[
                        'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                        activeMenu === 'live' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-red-50'
                    ]">
                        <span class="relative flex h-2 w-2">
                            <span
                                class="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping"
                                v-if="activeMenu === 'live'"></span>
                            <span
                                class="absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75 animate-ping"
                                v-else></span>
                            <span class="relative inline-flex h-2 w-2 rounded-full"
                                :class="activeMenu === 'live' ? 'bg-white' : 'bg-red-600'"></span>
                        </span>
                        สด
                    </button>

                    <button @click="activeMenu = 'upcoming'" :class="[
                        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                        activeMenu === 'upcoming' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-blue-50'
                    ]">
                        ยังไม่เตะ
                    </button>

                    <button @click="activeMenu = 'finished'" :class="[
                        'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer',
                        activeMenu === 'finished' ? 'bg-green-600 text-white' : 'text-slate-600 hover:bg-green-50'
                    ]">
                        จบแล้ว
                    </button>
                </nav>

            </div>
        </div>
    </div>
</template>