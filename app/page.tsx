"use client"

import { useEffect, useMemo, useState } from "react"
import { ClipboardList, MapPin, RefreshCw } from "lucide-react"
import { CampusSelect } from "@/components/campus-select"
import { HistoryModal } from "@/components/history-modal"
import { MealPicker } from "@/components/meal-picker"
import {
  CAMPUS_LABELS,
  getByCampus,
  type Campus,
} from "@/lib/restaurants"
import { addVisit, loadHistory, type VisitRecord } from "@/lib/history"

export default function Page() {
  const [campus, setCampus] = useState<Campus | null>(null)
  const [history, setHistory] = useState<VisitRecord[]>([])
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  const pool = useMemo(
    () => (campus ? getByCampus(campus) : []),
    [campus],
  )

  function handleConfirm(name: string) {
    setHistory(addVisit(name))
  }

  if (!campus) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-md">
        <CampusSelect onSelect={setCampus} />
      </main>
    )
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col">
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 px-5 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCampus(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <MapPin className="size-4" aria-hidden="true" />
            {CAMPUS_LABELS[campus]}
            <RefreshCw className="size-3.5 opacity-70" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <ClipboardList className="size-4" aria-hidden="true" />
            내가 가본 식당
            {history.length > 0 && (
              <span className="ml-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                {history.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <section className="flex-1 px-5 py-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl text-foreground text-balance">
            오늘의 메뉴 뽑기
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            혼밥하기 좋은 {CAMPUS_LABELS[campus]} 근처 식당을 랜덤으로 골라드려요.
          </p>
        </div>

        <MealPicker pool={pool} campus={campus} onConfirm={handleConfirm} />
      </section>

      <HistoryModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        records={history}
      />
    </main>
  )
}
