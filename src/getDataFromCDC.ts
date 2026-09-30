import { type CdcSiteDatum, type CdcWeekData } from "./types.js"

const PATHOGEN = "SARS-CoV-2"

const fetchRows = async <T>(url: string): Promise<Array<T>> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`CDC request failed: ${response.status} ${response.statusText}`)
  }
  const body = await response.json()
  if (!Array.isArray(body)) {
    throw new Error("CDC response was not an array.")
  }
  return body as Array<T>
}

const getLatestWeekEnd = async (jsonUrl: string) => {
  const params = new URLSearchParams({
    "$select": "max(week_end) as latest",
    "$where": `pathogen_target='${PATHOGEN}'`,
  })
  const data = await fetchRows<{ latest: string | null }>(`${jsonUrl}?${params.toString()}`)
  const weekEnd = data[0]?.latest
  if (!weekEnd) {
    throw new Error("Could not determine latest week_end from CDC data.")
  }
  return weekEnd
}

const getSiteDataForWeek = async (jsonUrl: string, weekEnd: string) => {
  const params = new URLSearchParams({
    "$select": "state_territory,site,site_wval",
    "$where": `pathogen_target='${PATHOGEN}' AND week_end='${weekEnd}'`,
    "$limit": "50000",
  })
  return fetchRows<CdcSiteDatum>(`${jsonUrl}?${params.toString()}`)
}

export const getDataFromCDC = async (env: Env): Promise<CdcWeekData> => {
  const weekEnd = await getLatestWeekEnd(env.JSON_URL)
  const data = await getSiteDataForWeek(env.JSON_URL, weekEnd)
  return { weekEnd, data }
}
