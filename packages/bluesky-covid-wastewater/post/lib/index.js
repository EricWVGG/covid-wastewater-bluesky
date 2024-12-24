import { AtpAgent } from "@atproto/api";
export const main = async (args) => {
    const JSON_URL = "https://www.cdc.gov/wcms/vizdata/NCEZID_DIDRI/NWSSStateMap.json";
    const dataRaw = await fetch(JSON_URL);
    if (!dataRaw) {
        throw new Error("Error retrieving data from CDC.");
    }
    const dataText = await dataRaw.text();
    const data = JSON.parse(dataText);
    if (!data) {
        throw new Error("Error parsing data JSON.");
    }
    const period = data[0].Time_Period;
    const replaceLabels = {
        "Very High": "🔥",
        High: "🔴",
        Moderate: "🟠",
        Low: "🟡",
        Minimal: "🟢",
        "No Data": "❔",
    };
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
        .map((level) => `${replaceLabels[level]}: ${report[level].join(", ")}`)
        .join("\n\n");
    const replaceMonths = (input) => input
        .replaceAll("January", "Jan")
        .replaceAll("February", "Feb")
        .replaceAll("March", "Mar")
        .replaceAll("April", "Apr")
        .replaceAll("June", "Jun")
        .replaceAll("July", "Jul")
        .replaceAll("August", "Aug")
        .replaceAll("September", "Sep")
        .replaceAll("October", "Oct")
        .replaceAll("November", "Nov")
        .replaceAll("December", "Dec");
    const text = `CDC wastewater reports ${replaceMonths(period)}\n\n${parsedResult}`;
    const agent = new AtpAgent({
        service: "https://bsky.social",
    });
    await agent.login({
        identifier: process.env.BSKY_ID,
        password: process.env.BSKY_PASSWORD,
    });
    const response = await agent.post({
        text,
        createdAt: new Date().toISOString(),
    });
    return response;
};
