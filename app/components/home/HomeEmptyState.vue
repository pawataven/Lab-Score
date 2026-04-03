<script setup lang="ts">
import type { StatusFilter } from '~/types/fixture'

const props = defineProps<{
  statusFilter: StatusFilter
}>()

const emit = defineEmits<{
  'update:statusFilter': [value: StatusFilter]
  'refresh': []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-12 text-center">
    
    <!-- No Live Matches -->
    <div v-if="statusFilter === 'live'" class="space-y-3">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
          <polyline points="17 2 12 7 7 2"></polyline>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">ไม่มีการแข่งขันสดในขณะนี้</h3>
      <button @click="emit('update:statusFilter', 'all')"
        class="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-slate-50 border border-slate-300">
        ดูโปรแกรมทั้งหมด
      </button>
    </div>

    <!-- No Upcoming Matches -->
    <div v-else-if="statusFilter === 'upcoming'" class="space-y-3">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">ไม่มีโปรแกรมที่รอแข่งขัน</h3>
      <button @click="emit('update:statusFilter', 'finished')"
        class="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-slate-50 border border-slate-300">
        ดูโปรแกรมที่จบแล้ว
      </button>
    </div>

    <!-- No Finished Matches -->
    <div v-else-if="statusFilter === 'finished'" class="space-y-3">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 20c0 1.1.9 2 2 2s2-.9 2-2V10H4v6c0 1.1.9 2 2 2h4z" />
          <path d="M14 10V6a2 2 0 0 0-2-2 2 2 0 0 0-2 2v4" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">ยังไม่มีคู่ที่แข่งจบ</h3>
      <button @click="emit('update:statusFilter', 'all')"
        class="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-slate-50 border border-slate-300">
        ดูโปรแกรมทั้งหมด
      </button>
    </div>

    <!-- No Matches at All -->
    <div v-else class="space-y-3">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-slate-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      </div>
      <h2 class="text-lg font-semibold text-gray-900">ไม่พบตารางการแข่งขัน</h2>
      <p class="text-gray-700 px-4">ไม่มีแมตช์ในวันที่เลือก หรืออยู่นอกเหนือระยะเวลาที่ระบบบันทึกข้อมูล</p>
      <button @click="emit('refresh')"
        class="mt-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-slate-50 border border-slate-300">
        รีเฟรชข้อมูล
      </button>
    </div>

  </div>
</template>
