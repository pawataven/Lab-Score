import type { TimeLabel } from '~/types/fixture'
import { BUSINESS_TIME_ZONE } from '~/utils/date'

type ZonedDateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

const formatterCache = new Map<string, Intl.DateTimeFormat>()
const shortDateFormatterCache = new Map<string, Intl.DateTimeFormat>()

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

const getShortDateFormatter = (timeZone: string): Intl.DateTimeFormat => {
  const cached = shortDateFormatterCache.get(timeZone)
  if (cached) return cached

  const formatter = new Intl.DateTimeFormat('th-TH', {
    timeZone,
    day: 'numeric',
    month: 'short',
  })

  shortDateFormatterCache.set(timeZone, formatter)
  return formatter
}

export const getZonedDateParts = (date: Date, timeZone: string = BUSINESS_TIME_ZONE): ZonedDateParts => {
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

export const toIsoDate = (parts: Pick<ZonedDateParts, 'year' | 'month' | 'day'>): string => {
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`
}

export function getTimeLabel(hour: number): TimeLabel {
  if (hour < 5) return 'เช้ามืด'
  if (hour < 12) return 'เช้า'
  if (hour < 18) return 'บ่าย'
  return 'ค่ำ'
}

export function getMatchTimeLabel(matchDate: Date): TimeLabel {
  const parts = getZonedDateParts(matchDate, BUSINESS_TIME_ZONE)
  return getTimeLabel(parts.hour)
}

export function getMatchCalendarDate(matchDate: Date): string {
  return toIsoDate(getZonedDateParts(matchDate, BUSINESS_TIME_ZONE))
}

export function formatSectionDate(date: Date): string {
  return getShortDateFormatter(BUSINESS_TIME_ZONE).format(date)
}
