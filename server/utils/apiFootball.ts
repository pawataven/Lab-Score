import { createError } from "h3"

type Provider = "apisports" | "rapidapi"

function getCfg() {
  const cfg = useRuntimeConfig()
  const provider = (cfg.apiFootball?.provider || "apisports") as Provider
  const baseUrl = cfg.apiFootball?.baseUrl as string | undefined
  const key = cfg.apiFootball?.key as string | undefined
  const host = cfg.apiFootball?.host as string | undefined

  if (!baseUrl) throw createError({ statusCode: 500, statusMessage: "Missing API_FOOTBALL_BASE_URL" })
  if (!key) throw createError({ statusCode: 500, statusMessage: "Missing API_FOOTBALL_KEY" })

  return { provider, baseUrl, key, host }
}

export async function apiFootballFetch(path: string, query?: Record<string, any>) {
  const { provider, baseUrl, key, host } = getCfg()

  const headers: Record<string, string> = {}

  if (provider === "rapidapi") {
    headers["x-rapidapi-key"] = key
    headers["x-rapidapi-host"] = host || "v3.football.api-sports.io"
  } else {
    headers["x-apisports-key"] = key
  }

  return await $fetch(`${baseUrl}${path}`, {
    method: "GET",
    headers,
    query,
    timeout: 15_000,
  })
}
