import type { FixtureApiResponse, LeagueGroup, StatusFilter } from '~/types/fixture'
import { buildLeagueGroups } from '~/utils/fixtures'
import { BUSINESS_TIME_ZONE, getBusinessDateString, getMillisecondsUntilNextBusinessDay } from '~/utils/date'

export function useFixtures(selectedLeagueIds: Ref<number[]> | number[]) {
  const route = useRoute()
  const router = useRouter()
  const leagueIdsRef = isRef(selectedLeagueIds) ? selectedLeagueIds : ref(selectedLeagueIds)

  const date = computed({
    get: () => (route.query.date as string) || getBusinessDateString(),
    set: (newDate) => {
      if (newDate !== route.query.date) {
        router.replace({ query: { ...route.query, date: newDate } })
      }
    },
  })

  const statusFilter = ref<StatusFilter>('all')

  const rawFetchQuery = computed(() => ({
    date: date.value,
    leagues: leagueIdsRef.value.join(','),
    timezone: BUSINESS_TIME_ZONE,
  }))

  const debouncedQuery = useDebounce(rawFetchQuery, 300)
  const nonce = ref(0)
  const fetchKey = computed(() => `fixtures:${debouncedQuery.value.date}:${debouncedQuery.value.leagues}:${BUSINESS_TIME_ZONE}:${nonce.value}`)

  const { data, pending, error, refresh } = useFetch<FixtureApiResponse>('/api/fixtures', {
    query: debouncedQuery,
    key: fetchKey,
    watch: [debouncedQuery],
    lazy: true,
    server: false,
  })

  const planMessage = computed(() => {
    const msg = Array.isArray(data.value?.errors) ? '' : data.value?.errors?.plan
    if (typeof msg === 'string' && (msg.includes('Free') || msg.includes('access'))) {
      return 'ขออภัย ไม่สามารถเรียกดูข้อมูลย้อนหลังหรือล่วงหน้าเกินช่วงที่แพ็กเกจรองรับได้ในขณะนี้'
    }
    return typeof msg === 'string' ? msg : ''
  })

  const adjusting = ref(false)

  watchEffect(() => {
    if (adjusting.value || !planMessage.value) return

    const match = planMessage.value.match(/try from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/i)
    if (match?.[1] && match?.[2]) {
      const midDate = getMidDate(match[1], match[2])
      if (date.value !== midDate) {
        adjusting.value = true
        date.value = midDate
        setTimeout(() => {
          adjusting.value = false
        }, 400)
      }
    }
  })

  if (import.meta.client) {
    let rolloverTimer: ReturnType<typeof setTimeout> | undefined

    const scheduleRollover = () => {
      clearTimeout(rolloverTimer)
      rolloverTimer = setTimeout(() => {
        const nextBusinessDate = getBusinessDateString()
        if (date.value !== nextBusinessDate) {
          date.value = nextBusinessDate
        }
        nonce.value++
        refresh()
        scheduleRollover()
      }, getMillisecondsUntilNextBusinessDay())
    }

    onMounted(() => {
      scheduleRollover()
    })

    onBeforeUnmount(() => {
      clearTimeout(rolloverTimer)
    })
  }

  const fixturesData = computed<LeagueGroup[]>(() => {
    return buildLeagueGroups({
      fixtures: data.value?.response,
      leagueIds: leagueIdsRef.value,
      statusFilter: statusFilter.value,
      pageDate: date.value,
    })
  })

  const liveMatchCount = computed(() =>
    fixturesData.value.reduce((sum, group) => sum + group.liveCount, 0)
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

function getMidDate(from: string, to: string): string {
  const start = new Date(`${from}T00:00:00Z`).getTime()
  const end = new Date(`${to}T00:00:00Z`).getTime()
  const mid = new Date((start + end) / 2)
  const year = mid.getUTCFullYear()
  const month = String(mid.getUTCMonth() + 1).padStart(2, '0')
  const day = String(mid.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function useDebounce<T>(value: Ref<T>, delay: number): Ref<T> {
  const debounced = ref(value.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout>

  watch(value, (newVal) => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      debounced.value = newVal
    }, delay)
  })

  onBeforeUnmount(() => {
    clearTimeout(timer)
  })

  return debounced
}
