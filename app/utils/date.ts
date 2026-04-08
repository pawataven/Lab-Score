// utils/date.ts

export const BUSINESS_TIME_ZONE = 'Asia/Bangkok'
export const BUSINESS_DAY_CUTOFF_HOUR = 5

type ZonedDateParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

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
    second: '2-digit',
    hourCycle: 'h23',
  })

  formatterCache.set(timeZone, formatter)
  return formatter
}

const getZonedDateParts = (date: Date, timeZone: string = BUSINESS_TIME_ZONE): ZonedDateParts => {
  const formatter = getFormatter(timeZone)
  const parts = formatter.formatToParts(date)
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]))

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
    minute: Number(values.minute),
    second: Number(values.second),
  }
}

const partsToIsoDate = (parts: Pick<ZonedDateParts, 'year' | 'month' | 'day'>): string => {
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`
}

const parseIsoDate = (value: string): { year: number; month: number; day: number } => {
  const [year, month, day] = value.split('-').map(Number)
  return { year: year || 0, month: month || 1, day: day || 1 }
}

/**
 * Returns a Date normalized to the business date in Asia/Bangkok.
 *
 * Notes:
 * - The returned Date is a new instance and never mutates the input.
 * - The timestamp is normalized to 00:00:00 UTC for stable comparisons.
 * - Use getBusinessDateString() for UI, cache keys, and API query dates.
 */
export const getBusinessDate = (date: Date = new Date()): Date => {
  const businessDateString = getBusinessDateString(date)
  const { year, month, day } = parseIsoDate(businessDateString)
  return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Returns YYYY-MM-DD for the current business date in Asia/Bangkok.
 *
 * Rule:
 * - 00:00 -> 04:59 belongs to the previous business day
 * - 05:00 -> 23:59 belongs to the current business day
 */
export const getBusinessDateString = (date: Date = new Date()): string => {
  const parts = getZonedDateParts(date, BUSINESS_TIME_ZONE)
  const businessDay = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))

  if (parts.hour < BUSINESS_DAY_CUTOFF_HOUR) {
    businessDay.setUTCDate(businessDay.getUTCDate() - 1)
  }

  return partsToIsoDate({
    year: businessDay.getUTCFullYear(),
    month: businessDay.getUTCMonth() + 1,
    day: businessDay.getUTCDate(),
  })
}

export const isSameBusinessDate = (a: Date, b: Date): boolean => {
  return getBusinessDateString(a) === getBusinessDateString(b)
}

// Backward-compatible alias for existing app code.
export const getBangkokCurrentDate = (): string => getBusinessDateString()

export const formatDateToISO = (date: Date): string => {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export const addDays = (dateStr: string, days: number): string => {
  const { year, month, day } = parseIsoDate(dateStr)
  const date = new Date(Date.UTC(year, month - 1, day))
  date.setUTCDate(date.getUTCDate() + days)

  return partsToIsoDate({
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  })
}

export const getBusinessDateStringInTimeZone = (
  input: Date | string,
  timeZone: string = BUSINESS_TIME_ZONE,
  cutoffHour: number = BUSINESS_DAY_CUTOFF_HOUR,
): string => {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input)
  const parts = getZonedDateParts(date, timeZone)
  const businessDay = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))

  if (parts.hour < cutoffHour) {
    businessDay.setUTCDate(businessDay.getUTCDate() - 1)
  }

  return partsToIsoDate({
    year: businessDay.getUTCFullYear(),
    month: businessDay.getUTCMonth() + 1,
    day: businessDay.getUTCDate(),
  })
}

export const getMillisecondsUntilNextBusinessDay = (date: Date = new Date()): number => {
  const parts = getZonedDateParts(date, BUSINESS_TIME_ZONE)
  const currentMinutes = (parts.hour * 60) + parts.minute
  const cutoffMinutes = BUSINESS_DAY_CUTOFF_HOUR * 60

  let minutesUntilCutoff = cutoffMinutes - currentMinutes
  if (minutesUntilCutoff <= 0) {
    minutesUntilCutoff += 24 * 60
  }

  const secondsUntilCutoff = (minutesUntilCutoff * 60) - parts.second
  return Math.max(secondsUntilCutoff * 1000, 1000)
}
