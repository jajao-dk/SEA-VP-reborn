export const gtagConfig = { enabled: false }
const GTAG_GA4 = import.meta.env.VITE_GTAG_GA4_MEASUREMENT_ID
const GTAG_UA = import.meta.env.VITE_GTAG_UA_MEASUREMENT_ID
if (GTAG_GA4) {
  gtagConfig.config = { id: GTAG_GA4 }

  if (GTAG_UA) {
    gtagConfig.includes = [{ id: GTAG_UA }]
  }
} else if (GTAG_UA) {
  gtagConfig.config = { id: GTAG_UA }
}