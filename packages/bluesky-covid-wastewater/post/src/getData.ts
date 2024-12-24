import { type CdcDatum } from "./types.js";

export const getData = async () => {
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

  return data;
};
