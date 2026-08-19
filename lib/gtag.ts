export const GA_MEASUREMENT_ID = "G-KZSWK7G8CT"

type GtagEventParams = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/** Send a GA4 custom event. No-ops safely if gtag is not loaded yet. */
export function trackEvent(name: string, params: GtagEventParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return
  window.gtag("event", name, params)
}
