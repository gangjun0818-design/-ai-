import { CalendarDays, Clock, Quote } from "lucide-react"
import { LevelTag } from "@/components/level-tag"
import type { Restaurant } from "@/lib/restaurants"

type MenuItem = { name: string; price: string }

/**
 * Parse a raw menu string like
 *   "우렁쌈밥 9,000원 / 제육쌈밥 9,000원"
 * into up to 2 { name, price } pairs. If a price can't be found the whole
 * chunk is treated as the name.
 */
function parseMenu(raw: string): MenuItem[] {
  return raw
    .split("/")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => {
      const match = chunk.match(/([\d,]+\s*원[~\s]*)$/)
      if (match) {
        return {
          name: chunk.slice(0, match.index).trim(),
          price: match[1].trim(),
        }
      }
      return { name: chunk, price: "" }
    })
}

/**
 * Split the raw hours string into the main operating hours and an optional
 * note (e.g. "(브레이크타임 15:30-17:00)") so the note can be rendered on the
 * line directly below the hours instead of overflowing on one line.
 */
function parseHours(raw: string): { main: string; note: string } {
  const match = raw.match(/^(.*?)\s*\((.+)\)\s*$/)
  if (match) {
    return { main: match[1].trim(), note: match[2].trim() }
  }
  return { main: raw.trim(), note: "" }
}

/**
 * Scale down the restaurant name for long names so it doesn't collide with the
 * date/time column on the right. Spaces let the name wrap onto the next line.
 */
function nameSizeClass(name: string): string {
  const len = name.replace(/\s/g, "").length
  if (len >= 10) return "text-xl"
  if (len >= 7) return "text-2xl"
  return "text-3xl"
}

export function ResultCard({ restaurant }: { restaurant: Restaurant }) {
  const items = parseMenu(restaurant.menu)
  const { main: hoursMain, note: hoursNote } = parseHours(restaurant.hours)

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 rounded-3xl border border-border bg-card p-6 shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-primary">오늘의 식당</p>
          <h2
            className={`mt-1 font-display ${nameSizeClass(restaurant.name)} leading-tight text-balance text-card-foreground break-keep`}
          >
            {restaurant.name}
          </h2>
        </div>

        <dl className="shrink-0 space-y-1.5 text-right text-xs leading-relaxed text-muted-foreground sm:text-sm">
          <div className="flex items-start justify-end gap-1.5">
            <CalendarDays className="size-3.5 shrink-0 translate-y-0.5 text-primary/70" aria-hidden="true" />
            <dt className="sr-only">영업일</dt>
            <dd className="break-keep">{restaurant.days}</dd>
          </div>
          <div className="flex items-start justify-end gap-1.5">
            <Clock className="size-3.5 shrink-0 translate-y-0.5 text-primary/70" aria-hidden="true" />
            <dt className="sr-only">영업시간</dt>
            <dd className="break-keep">
              {hoursMain}
              {hoursNote ? (
                <span className="mt-0.5 block text-muted-foreground/80">{hoursNote}</span>
              ) : null}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 rounded-2xl bg-secondary px-4 py-3">
        <p className="text-sm font-medium text-muted-foreground">대표 메뉴</p>
        <dl className="mt-2 flex flex-col gap-2">
          {items.map((item, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 border-t border-border/60 pt-2 first:border-t-0 first:pt-0"
            >
              <dt className="min-w-0 break-keep text-[15px] font-bold leading-snug text-secondary-foreground">
                {item.name}
              </dt>
              {item.price ? (
                <dd className="whitespace-nowrap text-[15px] font-semibold tabular-nums text-primary">
                  {item.price}
                </dd>
              ) : null}
            </div>
          ))}
        </dl>
      </div>

      <div className="mt-4">
        <LevelTag level={restaurant.level} />
      </div>

      <div className="mt-4 flex gap-2 rounded-2xl bg-accent/25 p-4">
        <Quote
          className="size-4 shrink-0 translate-y-0.5 text-accent-foreground/70"
          aria-hidden="true"
        />
        <p className="text-[15px] leading-relaxed text-accent-foreground">
          {restaurant.desc}
        </p>
      </div>
    </div>
  )
}
