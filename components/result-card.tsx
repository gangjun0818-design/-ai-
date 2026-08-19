import { Quote } from "lucide-react"
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

export function ResultCard({ restaurant }: { restaurant: Restaurant }) {
  const items = parseMenu(restaurant.menu)

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 rounded-3xl border border-border bg-card p-6 shadow-lg">
      <p className="text-sm font-medium text-primary">오늘의 추천 식당</p>
      <h2 className="mt-1 font-display text-3xl leading-tight text-balance text-card-foreground">
        {restaurant.name}
      </h2>

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
