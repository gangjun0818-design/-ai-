"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, UtensilsCrossed, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { VisitRecord } from "@/lib/history"

type SortMode = "date" | "name"

export function HistoryModal({
  open,
  onClose,
  records,
}: {
  open: boolean
  onClose: () => void
  records: VisitRecord[]
}) {
  const [sortMode, setSortMode] = useState<SortMode>("date")

  // `records` is stored newest-first, so its index reflects recency.
  const sortedRecords = useMemo(() => {
    const indexed = records.map((r, index) => ({ r, index }))
    if (sortMode === "date") {
      indexed.sort((a, b) => {
        // newest date first; tie-break by insertion recency
        if (a.r.date !== b.r.date) return a.r.date < b.r.date ? 1 : -1
        return a.index - b.index
      })
    } else {
      indexed.sort((a, b) => {
        // group by restaurant name (ㄱ~ㅎ, a~z)
        const byName = a.r.name.localeCompare(b.r.name, "ko-KR")
        if (byName !== 0) return byName
        // within the same restaurant, newest date first
        if (a.r.date !== b.r.date) return a.r.date < b.r.date ? 1 : -1
        return a.index - b.index
      })
    }
    return indexed.map((item) => item.r)
  }, [records, sortMode])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      <div className="animate-in slide-in-from-bottom-4 sm:zoom-in-95 relative flex max-h-[80dvh] w-full max-w-md flex-col rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2
            id="history-title"
            className="font-display text-2xl text-card-foreground"
          >
            내가 가본 식당
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {records.length > 0 && (
          <div className="flex items-center gap-2 border-b border-border px-6 py-3">
            <span className="text-xs font-medium text-muted-foreground">
              정렬
            </span>
            <div className="flex rounded-full bg-secondary p-0.5">
              {(
                [
                  { key: "date", label: "날짜순" },
                  { key: "name", label: "식당순" },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setSortMode(opt.key)}
                  aria-pressed={sortMode === opt.key}
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    sortMode === opt.key
                      ? "bg-card text-card-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {records.length === 0 ? (
            <div className="py-12 text-center">
              <span className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <UtensilsCrossed className="size-7" aria-hidden="true" />
              </span>
              <p className="text-muted-foreground text-balance">
                아직 확정한 식당이 없어요.
                <br />
                메뉴를 뽑고 확정해보세요!
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {records.map((r, i) => (
                <li
                  key={`${r.date}-${r.name}-${i}`}
                  className="flex items-center gap-4 rounded-2xl border border-border bg-background px-4 py-3"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UtensilsCrossed className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-foreground">
                      {r.name}
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                      <CalendarDays className="size-3.5" aria-hidden="true" />
                      {r.date}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-border p-4">
          <Button
            variant="secondary"
            size="lg"
            onClick={onClose}
            className="h-12 w-full rounded-2xl"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
