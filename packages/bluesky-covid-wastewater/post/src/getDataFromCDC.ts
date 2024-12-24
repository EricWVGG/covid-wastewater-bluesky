import { type CdcDatum } from "./types.js"

const JSON_URL = "https://www.cdc.gov/wcms/vizdata/NCEZID_DIDRI/NWSSStateMap.json"
const MAX_ATTEMPTS = Number(process.env.MAX_ATTEMPTS) || 3
const PAUSE_BETWEEN_ATTEMPTS = Number(process.env.PAUSE_BETWEEN_ATTEMPTS) || 3000
// ^ three seconds (note: serverless functions cost money!)

const sleep = (waitTimeInMs: number) => new Promise((resolve) => setTimeout(resolve, waitTimeInMs))

export const getDataFromCDC = async (attemptsLeft = MAX_ATTEMPTS) => {
  try {
    const dataRaw = await fetch(JSON_URL)
    const dataText = await dataRaw.text()
    const data = JSON.parse(dataText) as Array<CdcDatum>
    // TODO: Waldo checked for existence of NY and CA, was that due to a known issue?
    // TODO: We could use Zod to parse this JSON data.
    return data
  } catch (error) {
    if (attemptsLeft <= 1) {
      throw new Error(`Failed to retrieve data after ${MAX_ATTEMPTS} retries.`, { cause: error })
    }
    await sleep(PAUSE_BETWEEN_ATTEMPTS)
    getDataFromCDC(attemptsLeft - 1)
  }
}
