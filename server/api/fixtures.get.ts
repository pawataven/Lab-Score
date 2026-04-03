import { defineEventHandler, getQuery, createError } from "h3"
import { apiFootballFetch } from "../../app/utils/apiFootball"

// --------------------------------------------------------
// 1. Type Definitions (กำหนดหน้าตาข้อมูลที่ API ส่งกลับมา)
// --------------------------------------------------------
type QueryParams = {
  date?: string
  leagues?: string
  timezone?: string
}

// กำหนด Type ของ Response ให้ชัดเจน เพื่อให้ TypeScript รู้จัก
type FixtureResponse = {
  get: string
  parameters: Record<string, any>
  errors: any[] | Record<string, any>
  results: number
  response: any[] // ข้อมูลแมตช์จะอยู่ในนี้
}

// --------------------------------------------------------
// 2. Helper Functions
// --------------------------------------------------------
function validateDate(date?: string): string {
  if (!date) {
    throw createError({ statusCode: 400, statusMessage: "Missing 'date' parameter" })
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid date format. Use YYYY-MM-DD" })
  }
  return date
}

function parseLeagueIds(leaguesStr?: string): number[] {
  if (!leaguesStr) return []
  return leaguesStr
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
}

// --------------------------------------------------------
// 3. Main Handler
// --------------------------------------------------------
export default defineEventHandler(async (event) => {
  const query = getQuery(event) as QueryParams

  // 3.1 Validate & Prepare Data
  const date = validateDate(query.date)
  const targetTimezone = query.timezone || "UTC"
  const targetLeagueIds = parseLeagueIds(query.leagues)

  try {
    // 3.2 Call External API (Single Call Policy) 🎯
    // [FIXED]: ใช้ 'as FixtureResponse' เพื่อบังคับบอก Type แทนการส่ง Generic
    // วิธีนี้แก้ปัญหา 'Expected 0 type arguments' ได้ 100%
    const data = (await apiFootballFetch("/fixtures", {
      date: date,
      timezone: targetTimezone,
    })) as FixtureResponse

    // 3.3 Check Errors from Provider
    // ตอนนี้ TypeScript จะรู้จัก data.errors แล้ว ไม่ขึ้นแดง
    const hasErrors = Array.isArray(data.errors)
      ? data.errors.length > 0
      : data.errors && Object.keys(data.errors).length > 0

    if (hasErrors) {
      console.error("[API-Football Error]:", data.errors)
      // กรณีมี error จาก provider ส่ง array ว่างกลับไปก่อน กันเว็บพัง
      return {
        results: 0,
        response: [],
        meta: { date, error: "Provider Error" }
      }
    }

    let matches = data.response || []

    // 3.4 Server-Side Filtering ⚡
    // กรองข้อมูลเฉพาะลีกที่ต้องการ ช่วยลดขนาด JSON
    if (targetLeagueIds.length > 0) {
      matches = matches.filter((match: any) => {
        const leagueId = match.league?.id
        return typeof leagueId === "number" && targetLeagueIds.includes(leagueId)
      })
    }

    // 3.5 Return Optimized Response
    return {
      results: matches.length,
      response: matches,
      meta: {
        date,
        timezone: targetTimezone,
        source: "single-fetch" // flag ไว้เช็กได้ว่ามาจากโค้ดชุดใหม่
      }
    }

  } catch (error: any) {
    console.error("[Server Error] Failed to fetch fixtures:", error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: "Internal Server Error",
      data: error.message
    })
  }
})