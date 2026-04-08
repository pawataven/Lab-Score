<script setup lang="ts">
import { getBusinessDateString } from '~/utils/date'

type ModelValue = string | Date

const props = withDefaults(defineProps<{ modelValue?: ModelValue }>(), {
  modelValue: () => getBusinessDateString(),
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

/** ---------- date utils (timezone-safe) ---------- */
const pad2 = (n: number) => String(n).padStart(2, '0');
const YMD_RE = /^\d{4}-\d{2}-\d{2}$/

function normalize(d: Date) {
  const nd = new Date(d)
  nd.setHours(0, 0, 0, 0)
  return nd
}

function toYmdLocal(date: Date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

function parseYmdLocal(value: string) {
  const parts = value.split('-').map(Number)
  const fallbackParts = getBusinessDateString().split('-').map(Number)
  const y = parts[0] || fallbackParts[0] || new Date().getFullYear()
  const m = parts[1] || fallbackParts[1] || 1
  const d = parts[2] || fallbackParts[2] || 1
  return normalize(new Date(y, m - 1, d))
}

function asDate(val: ModelValue | undefined) {
  if (!val) return parseYmdLocal(getBusinessDateString())
  if (val instanceof Date) return normalize(val)
  if (!YMD_RE.test(val)) return parseYmdLocal(getBusinessDateString())
  return parseYmdLocal(val)
}

function startOfMonth(d: Date) {
  const nd = new Date(d)
  nd.setDate(1)
  nd.setHours(0, 0, 0, 0)
  return nd
}

function daysInMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
}

function isSameDate(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** ---------- state ---------- */
const currentDate = ref(asDate(props.modelValue))
const calendarMonth = ref(startOfMonth(currentDate.value))
const viewMode = ref<'day' | 'month' | 'year'>('day')
const showPicker = ref(false)

watch(
  () => props.modelValue,
  (val) => {
    const d = asDate(val)
    currentDate.value = d
    calendarMonth.value = startOfMonth(d)
  }
)

const thaiMonths = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
] as const

const thaiWeekdaysShort = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'] as const

const displayFormatter = new Intl.DateTimeFormat('th-TH', {
  weekday: 'long',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const formattedDate = computed(() => {
  const d = currentDate.value
  const buddhistYear = d.getFullYear() + 543
  return displayFormatter
    .formatToParts(d)
    .map((p) => (p.type === 'year' ? String(buddhistYear) : p.value))
    .join('')
})

const yearCE = computed(() => calendarMonth.value.getFullYear())
const yearBE = computed(() => yearCE.value + 543)

const yearRange = computed(() => {
  const base = yearCE.value - (yearCE.value % 12)
  return { start: base, end: base + 11 }
})

const headerLabel = computed(() => {
  const m = calendarMonth.value.getMonth()
  if (viewMode.value === 'day') return `${thaiMonths[m]} ${yearBE.value}`
  if (viewMode.value === 'month') return `พ.ศ. ${yearBE.value}`
  return `${yearRange.value.start + 543} - ${yearRange.value.end + 543}`
})

/** ---------- calendar cells ---------- */
type CalendarCell = {
  date: Date | null
  isToday: boolean
  isCurrentMonth: boolean
  isSelected: boolean
}

const weeks = computed<CalendarCell[][]>(() => {
  const monthStart = startOfMonth(calendarMonth.value)
  const firstDay = monthStart.getDay()
  const dim = daysInMonth(monthStart)

  const cells: CalendarCell[] = []
  for (let i = 0; i < firstDay; i++) {
    cells.push({ date: null, isToday: false, isCurrentMonth: false, isSelected: false })
  }

  const today = parseYmdLocal(getBusinessDateString())
  for (let day = 1; day <= dim; day++) {
    const d = new Date(monthStart)
    d.setDate(day)
    cells.push({
      date: d,
      isToday: isSameDate(d, today),
      isCurrentMonth: true,
      isSelected: isSameDate(d, currentDate.value),
    })
  }

  const rows: CalendarCell[][] = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
})

const dayCells = computed(() => weeks.value.flat())

/** ---------- actions ---------- */
function closePicker() {
  showPicker.value = false
  viewMode.value = 'day'
}

function setDate(date: Date) {
  const d = normalize(date)
  currentDate.value = d
  calendarMonth.value = startOfMonth(d)
  emit('update:modelValue', toYmdLocal(d))
}

function changeDay(offset: number) {
  const d = new Date(currentDate.value)
  d.setDate(d.getDate() + offset)
  setDate(d)
}

function openPicker() {
  if (showPicker.value) return closePicker()
  calendarMonth.value = startOfMonth(currentDate.value)
  viewMode.value = 'day'
  showPicker.value = true
}

function changeCalendar(offset: number) {
  const d = new Date(calendarMonth.value)
  if (viewMode.value === 'day') d.setMonth(d.getMonth() + offset)
  else if (viewMode.value === 'month') d.setFullYear(d.getFullYear() + offset)
  else d.setFullYear(d.getFullYear() + offset * 12)
  calendarMonth.value = startOfMonth(d)
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'day' ? 'month' : viewMode.value === 'month' ? 'year' : 'day'
}

function selectDate(cell: CalendarCell) {
  if (!cell.date) return
  setDate(cell.date)
  closePicker()
}

function selectMonth(index: number) {
  const d = new Date(calendarMonth.value)
  d.setMonth(index)
  calendarMonth.value = startOfMonth(d)
  viewMode.value = 'day'
}

function selectYear(year: number) {
  const d = new Date(calendarMonth.value)
  d.setFullYear(year)
  calendarMonth.value = startOfMonth(d)
  viewMode.value = 'month'
}

/** ---------- outside click + ESC ---------- */
const pickerRef = ref<HTMLElement | null>(null)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closePicker()
}

function onPointerDown(e: PointerEvent) {
  if (!showPicker.value) return
  const el = pickerRef.value
  if (!el) return

  // robust check
  const path = typeof e.composedPath === 'function' ? e.composedPath() : []
  const clickedInside = path.length ? path.includes(el) : el.contains(e.target as Node)

  if (!clickedInside) closePicker()
}

watch(showPicker, (open) => {
  if (!import.meta.client) return

  if (open) {
    window.addEventListener('keydown', onKeydown)
    // capture=true กันเคสมี stopPropagation ข้างใน
    window.addEventListener('pointerdown', onPointerDown, true)
  } else {
    window.removeEventListener('keydown', onKeydown)
    window.removeEventListener('pointerdown', onPointerDown, true)
  }
})

onBeforeUnmount(() => {
  if (!import.meta.client) return
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointerdown', onPointerDown, true)
})
</script>

<template>
  <div class="flex w-full">
    <div ref="pickerRef" class="relative">
      <!-- Capsule -->
      <div class="inline-flex items-center gap-3 rounded-full border border-slate-300 bg-white px-3 py-1 shadow-sm">
        <button type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100  hover:text-slate-700 transition"
          @click="changeDay(-1)">
          <Icon name="lucide:chevron-left" class="h-4 w-4" />
        </button>

        <button type="button"
          class="relative flex items-center gap-2 rounded-full w-55 justify-center whitespace-nowrap bg-slate-100 py-2 px-3 hover:bg-slate-200 transition"
          @click="openPicker">
          <Icon name="lucide:calendar-days" class="h-5 w-5 text-menu-background" />
          <span class="text-xs font-medium text-slate-700 tabular-nums">{{ formattedDate }}</span>
        </button>

        <button type="button"
          class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition"
          @click="changeDay(1)">
          <Icon name="lucide:chevron-right" class="h-4 w-4" />
        </button>
      </div>

      <!-- Popup -->
      <div v-if="showPicker" class="absolute left-1/2 top-full z-50 mt-2 -translate-x-1/2">
        <div class="w-80 rounded-lg border border-slate-300 bg-white p-3 shadow-lg">
          <!-- Header -->
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

          <!-- Day -->
          <div v-if="viewMode === 'day'">
            <div class="mb-1 grid grid-cols-7 text-center text-xs text-slate-500">
              <span v-for="d in thaiWeekdaysShort" :key="d">{{ d }}</span>
            </div>

            <div class="grid grid-cols-7 gap-1 text-sm">
              <button v-for="(cell, idx) in dayCells" :key="cell.date ? toYmdLocal(cell.date) : `blank-${idx}`"
                type="button" class="h-8 w-8 rounded-full text-center leading-8 transition" :class="[
                  !cell.date && 'cursor-default',
                  cell.isCurrentMonth ? 'text-slate-800' : 'text-slate-400',
                  cell.isToday && 'ring-1 ring-orange-400',
                  cell.isSelected && 'bg-orange-500 text-white hover:bg-orange-500',
                  cell.date && !cell.isSelected && 'hover:bg-slate-100 hover:text-slate-900'
                ]" :disabled="!cell.date" @click="selectDate(cell)">
                <span v-if="cell.date">{{ cell.date.getDate() }}</span>
              </button>
            </div>
          </div>

          <!-- Month -->
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

          <!-- Year -->
          <div v-else class="grid grid-cols-3 gap-2 text-sm">
            <button v-for="y in Array.from({ length: 12 }, (_, i) => yearRange.start + i)" :key="y" type="button"
              class="rounded-md px-2 py-2 text-center transition" :class="[
                y === yearCE ? 'bg-orange-500 text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
              ]" @click="selectYear(y)">
              {{ y + 543 }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
