import { AtpAgent } from "@atproto/api";

type Category =
  | "No Data"
  | "Minimal"
  | "Low"
  | "Moderate"
  | "High"
  | "Very High";

type CdcDatum = {
  Coverage: string | null;
  Number_of_Sites: string; // num
  "State/Territory": string;
  State_Abbreviation: string;
  Time_Period: string;
  WVAL_Category: Category;
  activity_level: string;
};

export const main = async (args: {}) => {
  const JSON_URL =
    "https://www.cdc.gov/wcms/vizdata/NCEZID_DIDRI/NWSSStateMap.json";

  const dataRaw = await fetch(JSON_URL);
  if (!dataRaw) {
    throw new Error("Error retrieving data from CDC.");
  }
  const dataText = await dataRaw.text();
  const data = JSON.parse(dataText) as Array<CdcDatum>;
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
    } as Record<Category, Array<string>>
  );

  const parsedResult = Object.keys(report)
    .map((level) => `${replaceLabels[level]}: ${report[level].join(", ")}`)
    .join("\n\n");

  const replaceMonths = (input: string) =>
    input
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

  const text = `CDC wastewater reports ${replaceMonths(
    period
  )}\n\n${parsedResult}`;

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
