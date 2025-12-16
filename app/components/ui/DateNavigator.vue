<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string | Date
  }>(),
  {
    modelValue: () => new Date()
  }
)

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const currentDate = ref(
  props.modelValue instanceof Date
    ? props.modelValue
    : new Date(props.modelValue || new Date())
)

// เดือนที่กำลังโชว์ใน popup (fix เป็นวันที่ 1)
const calendarMonth = ref(startOfMonth(currentDate.value))

// โหมดแสดง popup: วัน / เดือน / ปี
const viewMode = ref<'day' | 'month' | 'year'>('day')

const showPicker = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    if (!val) return
    const d = val instanceof Date ? val : new Date(val)
    currentDate.value = d
    calendarMonth.value = startOfMonth(d)
  }
)

// ---------- ข้อมูลภาษาไทย ----------

const thaiMonths = [
  'มกราคม',
  'กุมภาพันธ์',
  'มีนาคม',
  'เมษายน',
  'พฤษภาคม',
  'มิถุนายน',
  'กรกฎาคม',
  'สิงหาคม',
  'กันยายน',
  'ตุลาคม',
  'พฤศจิกายน',
  'ธันวาคม'
]

const thaiWeekdaysShort = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส']

// แสดงวันที่ในแคปซูลกลาง
const displayFormatter = new Intl.DateTimeFormat('th-TH', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  year: 'numeric'
})

const formattedDate = computed(() => {
  const d = currentDate.value
  const buddhistYear = d.getFullYear() + 543
  const parts = displayFormatter.formatToParts(d)
  return parts
    .map((p) => (p.type === 'year' ? buddhistYear.toString() : p.value))
    .join('')
})

// label บนหัว popup (เปลี่ยนตาม viewMode)
const yearCE = computed(() => calendarMonth.value.getFullYear())
const yearBE = computed(() => yearCE.value + 543)

const yearRange = computed(() => {
  // ช่วงละ 12 ปี
  const base = yearCE.value - (yearCE.value % 12)
  const start = base
  const end = base + 11
  return { start, end }
})

const headerLabel = computed(() => {
  const m = calendarMonth.value.getMonth()
  if (viewMode.value === 'day') {
    return `${thaiMonths[m]} ${yearBE.value}`
  }
  if (viewMode.value === 'month') {
    return `พ.ศ. ${yearBE.value}`
  }
  // viewMode === 'year'
  const startBE = yearRange.value.start + 543
  const endBE = yearRange.value.end + 543
  return `${startBE} - ${endBE}`
})

// ---------- grid วัน ----------

type CalendarCell = {
  date: Date | null
  isToday: boolean
  isCurrentMonth: boolean
  isSelected: boolean
}

const weeks = computed<CalendarCell[][]>(() => {
  const start = startOfMonth(calendarMonth.value)
  const firstDay = start.getDay()
  const daysInMonth = getDaysInMonth(start)

  const cells: CalendarCell[] = []

  for (let i = 0; i < firstDay; i++) {
    cells.push({
      date: null,
      isToday: false,
      isCurrentMonth: false,
      isSelected: false
    })
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(start)
    d.setDate(day)
    const today = isSameDate(d, new Date())
    const selected = isSameDate(d, currentDate.value)
    cells.push({
      date: d,
      isToday: today,
      isCurrentMonth: true,
      isSelected: selected
    })
  }

  const rows: CalendarCell[][] = []
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7))
  }
  return rows
})

// ---------- helper ----------

function startOfMonth(d: Date): Date {
  const nd = new Date(d)
  nd.setDate(1)
  nd.setHours(0, 0, 0, 0)
  return nd
}

function getDaysInMonth(d: Date): number {
  const year = d.getFullYear()
  const month = d.getMonth()
  return new Date(year, month + 1, 0).getDate()
}

function isSameDate(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// ---------- action แคปซูลด้านบน ----------

function changeDay(offset: number) {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + offset)
  updateDate(d)
  calendarMonth.value = startOfMonth(d)
}

function updateDate(date: Date) {
  currentDate.value = date
  emit('update:modelValue', date.toISOString().slice(0, 10))
}

function openPicker() {
  calendarMonth.value = startOfMonth(currentDate.value)
  viewMode.value = 'day'
  showPicker.value = !showPicker.value
}

// ---------- action บน popup ----------

// ลูกศรซ้าย/ขวา
function changeCalendar(offset: number) {
  const d = new Date(calendarMonth.value)
  if (viewMode.value === 'day') {
    d.setMonth(d.getMonth() + offset)
  } else if (viewMode.value === 'month') {
    d.setFullYear(d.getFullYear() + offset)
  } else {
    // viewMode === 'year' → กระโดดทีละ 12 ปี
    d.setFullYear(d.getFullYear() + offset * 12)
  }
  calendarMonth.value = startOfMonth(d)
}

// คลิก label เพื่อสลับโหมด Day → Month → Year → Day
function toggleViewMode() {
  if (viewMode.value === 'day') viewMode.value = 'month'
  else if (viewMode.value === 'month') viewMode.value = 'year'
  else viewMode.value = 'day'
}

function selectDate(cell: CalendarCell) {
  if (!cell.date) return
  updateDate(cell.date)
  showPicker.value = false
}

// เลือกเดือนจาก grid เดือน
function selectMonth(index: number) {
  const d = new Date(calendarMonth.value)
  d.setMonth(index)
  calendarMonth.value = startOfMonth(d)
  viewMode.value = 'day'
}

// เลือกปีจาก grid ปี
function selectYear(year: number) {
  const d = new Date(calendarMonth.value)
  d.setFullYear(year)
  calendarMonth.value = startOfMonth(d)
  viewMode.value = 'month'
}
</script>

<template>
  <div class="flex w-full">
    <div class="relative">
      <!-- แคปซูลหลัก -->
      <div class="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white px-3 py-1 shadow-sm">
        <button type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          @click="changeDay(-1)">
          <Icon name="lucide:chevron-left" class="h-4 w-4" />
        </button>

        <button type="button"
          class="relative flex items-center gap-2 rounded-full bg-slate-100 justify-center py-2 px-3 hover:bg-slate-200 transition"
          @click="openPicker">
          <Icon name="lucide:calendar-days" class="h-5 w-5 text-menu-background" />
          <span class="text-xs font-medium text-slate-700">
            {{ formattedDate }}
          </span>
        </button>

        <button type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          @click="changeDay(1)">
          <Icon name="lucide:chevron-right" class="h-4 w-4" />
        </button>
      </div>

      <!-- Popup ปฏิทิน -->
      <div v-if="showPicker" class="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
        <div class="w-80 rounded-lg border border-slate-300 bg-white p-3 shadow-lg">
          <!-- header: ลูกศร + label (คลิกเลือกโหมด) -->
          <div class="mb-2 flex items-center justify-between">
            <button type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              @click="changeCalendar(-1)">
              <Icon name="lucide:chevron-left" class="h-4 w-4" />
            </button>

            <button type="button" class="rounded-full px-3 py-1 text-sm font-medium text-slate-800 hover:bg-slate-100"
              @click="toggleViewMode">
              {{ headerLabel }}
            </button>

            <button type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              @click="changeCalendar(1)">
              <Icon name="lucide:chevron-right" class="h-4 w-4" />
            </button>
          </div>

          <!-- โหมดวัน -->
          <div v-if="viewMode === 'day'">
            <div class="mb-1 grid grid-cols-7 text-center text-xs text-slate-500">
              <span v-for="d in thaiWeekdaysShort" :key="d">{{ d }}</span>
            </div>

            <div class="grid grid-cols-7 gap-1 text-sm">
              <button v-for="(cell, idx) in weeks.flat()" :key="idx" type="button"
                class="h-8 w-8 rounded-full text-center leading-8 transition" :class="[
                  !cell.date && 'cursor-default',
                  cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400',
                  cell.isToday && 'ring-1 ring-orange-400',
                  cell.isSelected &&
                  'bg-orange-500 text-white hover:bg-orange-500',
                  cell.date &&
                  !cell.isSelected &&
                  'hover:bg-slate-100 hover:text-slate-900'
                ]" :disabled="!cell.date" @click="selectDate(cell)">
                <span v-if="cell.date">{{ cell.date.getDate() }}</span>
              </button>
            </div>
          </div>

          <!-- โหมดเดือน -->
          <div v-else-if="viewMode === 'month'" class="grid grid-cols-3 gap-2 text-sm">
            <button v-for="(m, index) in thaiMonths" :key="m" type="button"
              class="rounded-md px-2 py-2 text-center transition" :class="[
                index === calendarMonth.getMonth()
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              ]" @click="selectMonth(index)">
              {{ m }}
            </button>
          </div>

          <!-- โหมดปี -->
          <div v-else class="grid grid-cols-3 gap-2 text-sm">
            <button v-for="y in Array.from({ length: 12 }, (_, i) => yearRange.start + i)" :key="y" type="button"
              class="rounded-md px-2 py-2 text-center transition" :class="[
                y === yearCE
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              ]" @click="selectYear(y)">
              {{ y + 543 }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
