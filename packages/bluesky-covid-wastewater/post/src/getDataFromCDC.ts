import "dotenv/config"
import { type CdcSiteDatum, type CdcWeekData } from "./types.js"

// const JSON_URL = "https://www.cdc.gov/wcms/vizdata/NCEZID_DIDRI/NWSSStateMap.json"
// const JSON_URL = "https://www.cdc.gov/wcms/vizdata/NCEZID_DIDRI/sc2/nwsssc2statemapDL.json"
const JSON_URL = 'https://data.cdc.gov/resource/atcp-73re.json'
const PATHOGEN = "SARS-CoV-2"
const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS) || 3
const PAUSE_BETWEEN_ATTEMPTS = Number(process.env.PAUSE_BETWEEN_ATTEMPTS) || 3000
// ^ three seconds (note: serverless functions cost money!)

const sleep = (waitTimeInMs: number) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs))

const getLatestWeekEnd = async () => {
  const params = new URLSearchParams({
    "$select": "max(week_end) as latest",
    "$where": `pathogen_target='${PATHOGEN}'`,
  })
  const response = await fetch(`${JSON_URL}?${params.toString()}`)
  const data = (await response.json()) as Array<{ latest: string | null }>
  const weekEnd = data[0]?.latest
  if (!weekEnd) {
    throw new Error("Could not determine latest week_end from CDC data.")
  }
  return weekEnd
}

const getSiteDataForWeek = async (weekEnd: string) => {
  const params = new URLSearchParams({
    "$select": "state_territory,site,site_wval",
    "$where": `pathogen_target='${PATHOGEN}' AND week_end='${weekEnd}'`,
    "$limit": "50000",
  })
  const response = await fetch(`${JSON_URL}?${params.toString()}`)
  const dataText = await response.text()
  return JSON.parse(dataText) as Array<CdcSiteDatum>
}

export const getDataFromCDC = async (attemptsLeft = MAX_ATTEMPTS): Promise<CdcWeekData> => {
  try {
    const weekEnd = await getLatestWeekEnd()
    const data = await getSiteDataForWeek(weekEnd)
    return { weekEnd, data }
  } catch (error) {
    if (attemptsLeft <= 1) {
      throw new Error(`Failed to retrieve data after ${MAX_ATTEMPTS} retries.`, { cause: error })
    }
    await sleep(PAUSE_BETWEEN_ATTEMPTS)
    return getDataFromCDC(attemptsLeft - 1)
  }
}
