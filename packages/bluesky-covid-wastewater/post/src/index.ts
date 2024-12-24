import { AtpAgent } from "@atproto/api";
import { type CdcDatum } from "./types.js";
import { generateMessage } from "./generateMessage.js";

export const main = async () => {
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

  const text = generateMessage(data);

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
