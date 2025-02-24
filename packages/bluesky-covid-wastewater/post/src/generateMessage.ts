import { abbreviateMonths } from "./abbreviateMonths.js"
import { emojiLabels } from "./emojiLabels.js"
import { type WVAL_Category, type CdcDatum } from "./types.js"

export const generateMessage = (data: Array<CdcDatum>) => {
  const period = data[0].Time_Period
  console.log("data", data)
  const report = data.reduce(
    (acc, datum) => {
      acc[datum.WVAL_Category].push(datum.State_Abbreviation)
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

  const parsedResult = Object.keys(report)
    .map((level) => `${emojiLabels[level]} ${report[level].join(", ")}`)
    .join("\n\n")

  return `CDC wastewater reports: ${abbreviateMonths(period)}\n\n${parsedResult}`
}
