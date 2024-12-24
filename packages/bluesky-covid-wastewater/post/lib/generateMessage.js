import { replaceMonths } from "./replaceMonths.js";
import { replaceLabels } from "./replaceLabels.js";
export const generateMessage = (data) => {
    const period = data[0].Time_Period;
    const report = data.reduce((acc, datum) => {
        acc[datum.WVAL_Category].push(datum.State_Abbreviation);
        return acc;
    }, {
        "Very High": [],
        High: [],
        Moderate: [],
        Low: [],
        Minimal: [],
        "No Data": [],
    });
    const parsedResult = Object.keys(report)
        .map((level) => `${replaceLabels[level]} ${report[level].join(", ")}`)
        .join("\n\n");
    return `CDC wastewater reports ${replaceMonths(period)}\n\n${parsedResult}`;
};
