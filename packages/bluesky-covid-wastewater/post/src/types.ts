export type WVAL_Category = "No Data" | "Very Low" | "Low" | "Moderate" | "High" | "Very High"

export type CdcSiteDatum = {
  state_territory: string
  site: string
  site_wval: string | null
}

export type CdcWeekData = {
  weekEnd: string
  data: Array<CdcSiteDatum>
}
