"use client"

import { ChevronRight, MapPin } from "lucide-react"
import type { Campus } from "@/lib/restaurants"
import { trackEvent } from "@/lib/gtag"

const OPTIONS: { value: Campus; label: string; sub: string }[] = [
  { value: "명륜", label: "명륜 캠퍼스", sub: "혜화 · 인문사회과학" },
  { value: "율전", label: "율전 캠퍼스", sub: "수원 · 자연과학" },
]

export function CampusSelect({
  onSelect,
}: {
  onSelect: (campus: Campus) => void
}) {
  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mb-10 text-center">
        <p className="mb-3 text-sm font-medium tracking-wide text-primary">
          성균관대 혼밥 룰렛
        </p>
        <h1 className="font-display text-4xl leading-tight text-balance text-foreground">
          오늘 뭐 먹지?
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground text-balance">
          캠퍼스를 선택하세요.
          <br />
          근처 식당을 룰렛으로 골라드릴게요.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              trackEvent("select_campus", { campus_name: opt.value })
              onSelect(opt.value)
            }}
            className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all active:scale-[0.98] hover:border-primary/40 hover:shadow-md"
          >
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <MapPin className="size-6" aria-hidden="true" />
            </span>
            <span className="flex-1">
              <span className="block font-display text-2xl text-card-foreground">
                {opt.label}
              </span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {opt.sub}
              </span>
            </span>
            <ChevronRight
              className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary"
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
