import { BUSINESS_TIME_ZONE } from '~/utils/date'

type ZonedDateParts = {
  year: number
  month: number
  day: number
  hour: number
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
  }
}

const toIsoDate = (parts: Pick<ZonedDateParts, 'year' | 'month' | 'day'>): string => {
  return `${parts.year}-${pad2(parts.month)}-${pad2(parts.day)}`
}

/**
 * UX-only label for duplicated after-midnight fixtures.
 *
 * Case 1: page 2026-04-07 + match 2026-04-08 03:00 => "คืนนี้"
 * Case 2: page 2026-04-08 + match 2026-04-08 03:00 => "เช้ามืด"
 * Case 3: page 2026-04-08 + match 2026-04-08 18:00 => null
 */
export function getMatchTimeLabel(matchDate: Date, pageDate: string): string | null {
  const parts = getZonedDateParts(matchDate, BUSINESS_TIME_ZONE)

  if (parts.hour >= 5) {
    return null
  }

  const matchDateString = toIsoDate(parts)
  return matchDateString !== pageDate ? 'คืนนี้' : 'เช้ามืด'
}
