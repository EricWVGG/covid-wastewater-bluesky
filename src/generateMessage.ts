import { emojiLabels } from "./emojiLabels.js"
import { stateAbbreviations } from "./stateAbbreviations.js"
import { type WVAL_Category, type CdcWeekData } from "./types.js"

const median = (nums: Array<number>) => {
  const sorted = [...nums].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

const bucket = (value: number | undefined): WVAL_Category => {
  if (value === undefined) return "No Data"
  if (value <= 2) return "Very Low"
  if (value <= 3.4) return "Low"
  if (value <= 5.3) return "Moderate"
  if (value <= 7.8) return "High"
  return "Very High"
}

const formatWeekEnd = (weekEnd: string) =>
  new Date(weekEnd).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })

export const generateMessage = ({ weekEnd, data }: CdcWeekData) => {
  const sitesByState = new Map<string, Map<string, number>>()
  for (const datum of data) {
    if (datum.site_wval == null) continue
    const sites = sitesByState.get(datum.state_territory) ?? new Map<string, number>()
    if (!sites.has(datum.site)) {
      sites.set(datum.site, Number(datum.site_wval))
    }
    sitesByState.set(datum.state_territory, sites)
  }

  const report = Array.from(sitesByState.entries()).reduce(
    (acc, [state, sites]) => {
      const level = bucket(median(Array.from(sites.values())))
      acc[level].push(stateAbbreviations[state] ?? state)
      return acc
    },
    {
      "Very High": [],
      High: [],
      Moderate: [],
      Low: [],
      "Very Low": [],
      "No Data": [],
    } as Record<WVAL_Category, Array<string>>
  )

  const parsedResult = (Object.keys(report) as Array<WVAL_Category>)
    .filter((level) => report[level].length > 0)
    .map((level) => `${emojiLabels[level]} [${level.toLowerCase()}] ${report[level].sort().join(", ")}`)
    .join("\n\n")

  const message = `CDC wastewater reports: ${formatWeekEnd(weekEnd)}\n\n${parsedResult}`

  if (!sitesByState.has("California") || !sitesByState.has("New York")) {
    throw new Error("Formatted output is missing states (at least CA and NY)")
  }

  return message
}
