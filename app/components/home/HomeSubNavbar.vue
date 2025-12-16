<script lang="ts" setup>
import DateNavigatorVue from '~/components/ui/DateNavigator.vue';
import { ref, watch } from 'vue';   

const selectedDate = ref(new Date().toISOString().slice(0, 10))

watch(selectedDate, (val) => {
    console.log('วันที่เลือก (สำหรับ API):', val) // 2025-12-11 แบบคริสต์ศักราช
});

const activeMenu = ref<'all' | 'live' | 'upcoming' | 'finished'>('all')
</script>

<template>
    <div
        class="sticky top-0 z-50 w-full border-b border-slate-300 sm:px-5 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80">
        <div
            class="mx-auto flex max-w-full flex-col items-start gap-4 py-3 sm:px-5 md:flex-row md:items-center md:justify-between md:py-4 lg:mx-50">
            <div class="flex w-full items-center justify-center gap-4 md:w-auto md:justify-start">
                <div class="flex h-14 items-center  l-0 r.0">
                    <DateNavigatorVue v-model="selectedDate" />
                </div>
            </div>
            <!-- ซับเมนูด้านขวา -->
            <nav
                class="flex w-full flex-wrap items-center justify-center gap-4 border-t border-slate-200 pt-3 text-sm sm:text-base sm:px-1 md:w-auto md:border-t-0 md:pt-0 md:justify-end">
                <button @click="activeMenu = 'all'" :class="[
                    'rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer',
                    activeMenu === 'all'
                        ? 'bg-menu-background text-white'
                        : 'text-text-primary hover:bg-menu-hover-background hover:text-text-primary transition'
                ]">
                    ทั้งหมด
                </button>

                <button @click="activeMenu = 'live'" :class="[
                    'flex items-center gap-2 rounded-lg px-3 py-1.5 font-medium cursor-pointer transition-colors',
                    activeMenu === 'live'
                        ? 'bg-menu-background text-white'
                        : 'text-text-primary hover:bg-menu-hover-background hover:text-text-primary'
                ]">
                    <!-- จุดกระพริบ -->
                    <span class="relative flex h-2 w-2">
                        <span
                            class="absolute inline-flex h-full w-full rounded-full bg-red-700 opacity-75 animate-ping"></span>
                        <span class="relative inline-flex h-2 w-2 rounded-full bg-red-600"></span>
                    </span>

                    สด
                </button>


                <button @click="activeMenu = 'upcoming'" :class="[
                    'rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer',
                    activeMenu === 'upcoming'
                        ? 'bg-menu-background text-white'
                        : 'text-text-primary hover:bg-menu-hover-background hover:text-text-primary transition'
                ]">
                    ยังไม่เตะ
                </button>

                <button @click="activeMenu = 'finished'" :class="[
                    'rounded-lg px-3 py-1.5 font-medium transition-colors cursor-pointer',
                    activeMenu === 'finished'
                        ? 'bg-menu-background text-white'
                        : 'text-text-primary hover:bg-menu-hover-background hover:text-text-primary transition'
                ]">
                    จบเเล้ว
                </button>
            </nav>
        </div>
    </div>
</template>