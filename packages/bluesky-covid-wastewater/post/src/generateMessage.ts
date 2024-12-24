import { replaceMonths } from "./replaceMonths.js";
import { replaceLabels } from "./replaceLabels.js";
import { type WVAL_Category, type CdcDatum } from "./types.js";

export const generateMessage = (data: Array<CdcDatum>) => {
  const period = data[0].Time_Period;

  const report = data.reduce(
    (acc, datum) => {
      acc[datum.WVAL_Category].push(datum.State_Abbreviation);
      return acc;
    },
    {
      "Very High": [],
      High: [],
      Moderate: [],
      Low: [],
      Minimal: [],
      "No Data": [],
    } as Record<WVAL_Category, Array<string>>
  );

  const parsedResult = Object.keys(report)
    .map((level) => `${replaceLabels[level]} ${report[level].join(", ")}`)
    .join("\n\n");

  return `CDC wastewater reports ${replaceMonths(period)}\n\n${parsedResult}`;
};
