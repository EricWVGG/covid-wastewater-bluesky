export type WVAL_Category =
  | "No Data"
  | "Minimal"
  | "Low"
  | "Moderate"
  | "High"
  | "Very High";

export type CdcDatum = {
  Coverage: string | null;
  Number_of_Sites: string; // num
  "State/Territory": string; // could be enum
  State_Abbreviation: string; // could be enum
  Time_Period: string;
  WVAL_Category: WVAL_Category;
  activity_level: string; // num
};
