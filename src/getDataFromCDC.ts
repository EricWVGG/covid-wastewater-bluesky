import { type CdcSiteDatum, type CdcWeekData } from "./types.js"

const PATHOGEN = "SARS-CoV-2"

const getLatestWeekEnd = async (jsonUrl: string) => {
  const params = new URLSearchParams({
    "$select": "max(week_end) as latest",
    "$where": `pathogen_target='${PATHOGEN}'`,
  })
  const response = await fetch(`${jsonUrl}?${params.toString()}`)
  const data = (await response.json()) as Array<{ latest: string | null }>
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
  const response = await fetch(`${jsonUrl}?${params.toString()}`)
  const dataText = await response.text()
  return JSON.parse(dataText) as Array<CdcSiteDatum>
}

export const getDataFromCDC = async (env: Env): Promise<CdcWeekData> => {
  const weekEnd = await getLatestWeekEnd(env.JSON_URL)
  const data = await getSiteDataForWeek(env.JSON_URL, weekEnd)
  return { weekEnd, data }
}
