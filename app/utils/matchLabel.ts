import type { TimeLabel } from '~/types/fixture'
import { BUSINESS_TIME_ZONE } from '~/utils/date'

export const labelClassMap: Record<TimeLabel, string> = {
  เช้ามืด: 'bg-slate-700 text-white ring-1 ring-slate-500',
  เช้า: 'bg-sky-400 text-white ring-1 ring-sky-200',
  บ่าย: 'bg-amber-500 text-white ring-1 ring-amber-200',
  ค่ำ: 'bg-orange-700 text-white ring-1 ring-orange-500',
}

type ZonedDateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

export type MatchTimeLabel = {
  label: TimeLabel
  labelWithDate: string
  className: string
}

const THAI_MONTH_ABBREVIATIONS = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']

const formatterCache = new Map<string, Intl.DateTimeFormat>()

const pad2 = (value: number): string => String(value).padStart(2, '0')

const getFormatter = (timeZone: string): Intl.DateTimeFormat => {
  const cached = formatterCache.get(timeZone)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  formatterCache.set(timeZone, formatter)
  return formatter
}

export const getZonedDateParts = (
  date: Date,
  timeZone: string = BUSINESS_TIME_ZONE,
): ZonedDateParts => {
  const formatter = getFormatter(timeZone)
  const parts = formatter.formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
  }
}

export const toIsoDate = (
  parts: Pick<ZonedDateParts, 'year' | 'month' | 'day'>,
): string => `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`

export const getMatchCalendarDate = (matchDate: Date): string =>
  toIsoDate(getZonedDateParts(matchDate, BUSINESS_TIME_ZONE))

const formatThaiShortDate = (
  parts: Pick<ZonedDateParts, 'day' | 'month'>,
): string => `${parts.day} ${THAI_MONTH_ABBREVIATIONS[parts.month - 1] ?? ''}`

export function getTimeLabel(hour: number): TimeLabel {
  if (hour < 5) return 'เช้ามืด'
  if (hour < 12) return 'เช้า'
  if (hour < 17) return 'บ่าย'
  return 'ค่ำ'
}

export function getMatchTimeLabel(
  kickoffISO: string,
  viewingDate?: string,
): MatchTimeLabel {
  const kickoffDate = new Date(kickoffISO)
  const parts = getZonedDateParts(kickoffDate, BUSINESS_TIME_ZONE)
  const label = getTimeLabel(parts.hour)
  const kickoffDateString = toIsoDate(parts)

  const labelWithDate =
    label === 'เช้ามืด' && viewingDate && kickoffDateString !== viewingDate
      ? `${label} (${formatThaiShortDate(parts)})`
      : label

  return {
    label,
    labelWithDate,
    className: labelClassMap[label],
  }
}

export function formatSectionDate(date: Date): string {
  const parts = getZonedDateParts(date, BUSINESS_TIME_ZONE)
  return formatThaiShortDate(parts)
}
