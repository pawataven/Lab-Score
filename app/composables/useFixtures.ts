import type { FixtureApiResponse, ApiFixture, LeagueGroup, StatusFilter } from '~/types/fixture'
import { toMatchModel, filterMatchesByStatus } from '~/utils/match'

export function useFixtures() {
  const route = useRoute()
  const router = useRouter()

  // Date from URL query or current Bangkok date
  const date = computed({
    get: () => (route.query.date as string) || getBangkokCurrentDate(),
    set: (newDate) => {
      if (newDate !== route.query.date) {
        router.replace({ query: { ...route.query, date: newDate } })
      }
    },
  })

  // Status filter
  const statusFilter = ref<StatusFilter>('all')

  // Selected leagues from composable
  const { selectedLeagueIds } = useLeagueConfig()

  // Debounced fetch query
  const rawFetchQuery = computed(() => ({
    date: date.value,
    leagues: selectedLeagueIds.value.join(','),
    timezone: 'UTC',
  }))

  const debouncedQuery = useDebounce(rawFetchQuery, 500)

  // Nonce for cache invalidation
  const nonce = ref(0)
  const fetchKey = computed(() => `fixtures:${debouncedQuery.value.date}:${debouncedQuery.value.leagues}:UTC:${nonce.value}`)

  // Fetch data
  const { data, pending, error, refresh } = useFetch<FixtureApiResponse>('/api/fixtures', {
    query: debouncedQuery,
    key: fetchKey,
    watch: [debouncedQuery],
    lazy: true,
    server: false,
  })

  // Plan limit error handling
  const planMessage = computed(() => {
    const msg = data.value?.errors?.plan
    if (typeof msg === 'string' && (msg.includes('Free') || msg.includes('access'))) {
      return 'ขออภัยไม่สามารถเรียกดูข้อมูลย้อนหลังหรือล่วงหน้าเกิน 3 วันได้ในขณะนี้'
    }
    return typeof msg === 'string' ? msg : ''
  })

  // Auto-adjust date when plan limit error suggests valid range
  const adjusting = ref(false)

  watchEffect(() => {
    if (adjusting.value || !planMessage.value) return

    const match = planMessage.value.match(/try from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/i)
    if (match?.[1] && match?.[2]) {
      const midDate = getMidDate(match[1], match[2])
      if (date.value !== midDate) {
        adjusting.value = true
        date.value = midDate
        setTimeout(() => (adjusting.value = false), 400)
      }
    }
  })

  function getMidDate(from: string, to: string): string {
    const a = new Date(from + 'T00:00:00').getTime()
    const b = new Date(to + 'T00:00:00').getTime()
    const mid = new Date((a + b) / 2)
    return formatDateToISO(mid)
  }

  // Transform fixtures data into league groups
  const fixturesData = computed<LeagueGroup[]>(() => {
    const arr = Array.isArray(data.value?.response) ? data.value!.response! : []
    const groups = new Map<number, ApiFixture[]>()

    // Group fixtures by league
    for (const fx of arr) {
      const leagueId = fx?.league?.id
      if (typeof leagueId !== 'number') continue
      if (!selectedLeagueIds.value.includes(leagueId as any)) continue
      if (!groups.has(leagueId)) groups.set(leagueId, [])
      groups.get(leagueId)!.push(fx)
    }

    // Transform groups to LeagueGroup[]
    const result: LeagueGroup[] = []

    for (const [leagueId, items] of groups.entries()) {
      const first = items[0]
      let matches = items.map(toMatchModel)

      // Apply status filter
      if (statusFilter.value !== 'all') {
        matches = filterMatchesByStatus(matches, statusFilter.value)
      }

      if (matches.length === 0) continue

      const liveCount = matches.filter(m => m.status === 'LIVE').length

      result.push({
        id: leagueId,
        name: first?.league?.name ?? 'Unknown',
        country: first?.league?.country ?? '',
        season: first?.league?.season ? String(first.league.season) : '-',
        logo: first?.league?.logo ?? '',
        liveCount,
        matches,
      })
    }

    // Sort: live first, then by match count
    return result.sort((a, b) => (b.liveCount - a.liveCount) || (b.matches.length - a.matches.length))
  })

  const liveMatchCount = computed(() =>
    fixturesData.value.reduce((sum, g) => sum + g.liveCount, 0)
  )

  const totalMatchCount = computed(() =>
    fixturesData.value.reduce((sum, league) => sum + league.matches.length, 0)
  )

  function retry() {
    nonce.value++
    refresh()
  }

  return {
    date,
    statusFilter,
    fixturesData,
    pending,
    error,
    planMessage,
    liveMatchCount,
    totalMatchCount,
    retry,
  }
}

// Simple debounce composable
function useDebounce<T>(value: Ref<T>, delay: number): Ref<T> {
  const debounced = ref(value.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout>

  watch(value, (newVal) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = newVal
    }, delay)
  })

  return debounced
}
