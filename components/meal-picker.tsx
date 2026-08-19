"use client"

import { useEffect, useRef, useState } from "react"
import { CheckCircle2, PartyPopper, RotateCcw, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ResultCard } from "@/components/result-card"
import { ConfirmModal } from "@/components/confirm-modal"
import {
  FILTER_CATEGORIES,
  type Campus,
  type Category,
  type Restaurant,
} from "@/lib/restaurants"
import { trackEvent } from "@/lib/gtag"
import { cn } from "@/lib/utils"

const SPIN_MS = 2000
const TICK_MS = 80

type Phase = "idle" | "spinning" | "result" | "confirmed"

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function MealPicker({
  pool,
  campus,
  onConfirm,
}: {
  pool: Restaurant[]
  campus: Campus
  onConfirm: (name: string) => void
}) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [drawn, setDrawn] = useState<Set<string>>(new Set())
  const [excluded, setExcluded] = useState<Set<Category>>(new Set())
  const [result, setResult] = useState<Restaurant | null>(null)
  const [reelText, setReelText] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const allowed = pool.filter((r) => !excluded.has(r.category))
  const remaining = allowed.filter((r) => !drawn.has(r.name))
  const allDrawn = remaining.length === 0

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function toggleCategory(category: Category) {
    setExcluded((prev) => {
      const next = new Set(prev)
      const willExclude = !next.has(category)
      if (willExclude) next.add(category)
      else next.delete(category)
      trackEvent("toggle_filter", { category, is_excluded: willExclude })
      return next
    })
  }

  function spin() {
    const candidates = pool.filter(
      (r) => !drawn.has(r.name) && !excluded.has(r.category),
    )
    if (candidates.length === 0) return

    setPhase("spinning")
    setResult(null)

    intervalRef.current = setInterval(() => {
      setReelText(pickRandom(candidates).name)
    }, TICK_MS)

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      const chosen = pickRandom(candidates)
      setResult(chosen)
      setDrawn((prev) => new Set(prev).add(chosen.name))
      setPhase("result")
    }, SPIN_MS)
  }

  function reroll() {
    trackEvent("click_reroll", {
      campus,
      excluded_count: drawn.size,
    })
    spin()
  }

  function confirm() {
    if (!result) return
    trackEvent("click_confirm", {
      campus,
      restaurant_name: result.name,
    })
    onConfirm(result.name)
    setPhase("confirmed")
    setModalOpen(true)
  }

  function resetSession() {
    setDrawn(new Set())
    setResult(null)
    setPhase("idle")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Idle */}
      {phase === "idle" && (
        <div className="rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
          <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="size-8" aria-hidden="true" />
          </span>
          <p className="font-display text-2xl text-foreground text-balance">
            버튼을 눌러 오늘의 메뉴를 뽑아보세요
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            남은 식당 {remaining.length}곳
          </p>
        </div>
      )}

      {/* Spinning */}
      {phase === "spinning" && (
        <div className="overflow-hidden rounded-3xl border border-primary/30 bg-card px-6 py-14 text-center shadow-lg">
          <p className="text-sm font-medium text-primary">두구두구두구...</p>
          <p
            className="mt-4 font-display text-3xl text-foreground blur-[0.4px] transition-none"
            aria-live="polite"
          >
            {reelText}
          </p>
          <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full origin-left animate-pulse bg-primary" />
          </div>
        </div>
      )}

      {/* Result / Confirmed */}
      {(phase === "result" || phase === "confirmed") && result && (
        <div className="flex flex-col gap-5">
          <ResultCard restaurant={result} />

          {phase === "confirmed" && (
            <div className="animate-in fade-in slide-in-from-bottom-2 flex items-center gap-3 rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-md">
              <PartyPopper className="size-6 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-display text-xl">오늘의 식사 확정!</p>
                <p className="text-sm text-primary-foreground/85">
                  {result.name} · 맛있게 드세요 🎉
                </p>
              </div>
            </div>
          )}

          {phase === "result" && (
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={reroll}
                disabled={allDrawn}
                className="h-14 rounded-2xl text-base"
              >
                <RotateCcw className="size-5" aria-hidden="true" />
                다시 돌리기
              </Button>
              <Button
                size="lg"
                onClick={confirm}
                className="h-14 rounded-2xl text-base"
              >
                <CheckCircle2 className="size-5" aria-hidden="true" />
                이 메뉴 확정
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Category exclude filters + Primary spin CTA (idle / after confirm) */}
      {(phase === "idle" || phase === "confirmed") && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              오늘 안 먹고 싶은 종류 제외
            </p>
            <div className="grid grid-cols-4 gap-2">
              {FILTER_CATEGORIES.map((category) => {
                const isExcluded = excluded.has(category)
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleCategory(category)}
                    aria-pressed={isExcluded}
                    className={cn(
                      "rounded-xl border px-2 py-2.5 text-sm font-medium transition-colors",
                      isExcluded
                        ? "border-transparent bg-muted text-muted-foreground line-through"
                        : "border-border bg-card text-foreground hover:border-primary/40",
                    )}
                  >
                    {category}
                  </button>
                )
              })}
            </div>
          </div>

          {allDrawn ? (
            <div className="rounded-2xl border border-border bg-secondary px-5 py-6 text-center">
              <p className="font-medium text-secondary-foreground text-balance">
                {excluded.size > 0
                  ? "제외하지 않은 식당을 모두 뽑았어요!"
                  : "이 캠퍼스의 모든 식당을 다 뽑았어요!"}
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={resetSession}
                className="mt-4 h-12 rounded-2xl"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
                처음부터 다시 뽑기
              </Button>
            </div>
          ) : (
            <Button
              size="lg"
              onClick={spin}
              className="h-16 rounded-2xl font-display text-xl shadow-lg shadow-primary/20"
            >
              <Sparkles className="size-6" aria-hidden="true" />
              {phase === "confirmed" ? "한 번 더 뽑기" : "오늘의 메뉴 뽑기"}
            </Button>
          )}
        </div>
      )}

      {/* All drawn while showing a result */}
      {allDrawn && phase === "result" && (
        <div className="rounded-2xl border border-border bg-secondary px-5 py-6 text-center">
          <p className="font-medium text-secondary-foreground text-balance">
            더 이상 뽑을 식당이 없어요!
          </p>
          <Button
            variant="outline"
            size="lg"
            onClick={resetSession}
            className="mt-4 h-12 rounded-2xl"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            처음부터 다시 뽑기
          </Button>
        </div>
      )}

      <ConfirmModal
        open={modalOpen}
        restaurant={result}
        onClose={() => setModalOpen(false)}
        onNavigate={(r) =>
          trackEvent("navigate_naver_map", { restaurant_name: r.name })
        }
      />
    </div>
  )
}
