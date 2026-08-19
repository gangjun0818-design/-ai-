export type VisitRecord = {
  date: string // YYYY-MM-DD
  name: string
}

const STORAGE_KEY = "skku-meal-history"

export function todayString(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function loadHistory(): VisitRecord[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (r): r is VisitRecord =>
        r && typeof r.date === "string" && typeof r.name === "string",
    )
  } catch {
    return []
  }
}

export function addVisit(name: string): VisitRecord[] {
  const next: VisitRecord = { date: todayString(), name }
  const history = [next, ...loadHistory()]
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // ignore write errors
  }
  return history
}
