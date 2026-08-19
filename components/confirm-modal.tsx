"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, PartyPopper } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Restaurant } from "@/lib/restaurants"

const COUNTDOWN_SECONDS = 3

export function ConfirmModal({
  open,
  restaurant,
  onClose,
  onNavigate,
}: {
  open: boolean
  restaurant: Restaurant | null
  onClose: () => void
  /** Called right before opening the Naver map link (for GA tracking). */
  onNavigate: (restaurant: Restaurant) => void
}) {
  const [count, setCount] = useState(COUNTDOWN_SECONDS)
  const navigatedRef = useRef(false)

  useEffect(() => {
    if (!open || !restaurant) return

    setCount(COUNTDOWN_SECONDS)
    navigatedRef.current = false

    const go = () => {
      if (navigatedRef.current) return
      navigatedRef.current = true
      onNavigate(restaurant)
      window.open(restaurant.mapUrl, "_blank", "noopener,noreferrer")
    }

    const interval = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          go()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [open, restaurant, onNavigate])

  if (!open || !restaurant) return null

  function goNow() {
    if (!restaurant || navigatedRef.current) return
    navigatedRef.current = true
    onNavigate(restaurant)
    window.open(restaurant.mapUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="animate-in fade-in absolute inset-0 bg-foreground/40 backdrop-blur-sm"
      />

      <div className="animate-in zoom-in-95 fade-in relative w-full max-w-sm rounded-3xl bg-card p-7 text-center shadow-2xl">
        <span className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <PartyPopper className="size-8" aria-hidden="true" />
        </span>

        <h2 id="confirm-title" className="font-display text-2xl text-card-foreground text-balance">
          메뉴가 확정되었습니다!
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">방문 기록에 저장되었어요</p>

        <p className="mt-5 font-bold text-card-foreground">{restaurant.name}</p>

        <div className="mt-5 rounded-2xl bg-secondary px-4 py-4">
          <p className="text-sm text-secondary-foreground">
            잠시 후 네이버 지도로 이동합니다
          </p>
          <p
            className="mt-1 font-display text-4xl tabular-nums text-primary"
            aria-live="polite"
          >
            {count}
          </p>
        </div>

        <Button
          size="lg"
          onClick={goNow}
          className="mt-5 h-14 w-full rounded-2xl text-base"
        >
          <MapPin className="size-5" aria-hidden="true" />
          바로 네이버 지도로 이동
        </Button>
      </div>
    </div>
  )
}
