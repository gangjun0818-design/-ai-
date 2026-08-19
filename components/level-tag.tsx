import { Flame, Users, Utensils } from "lucide-react"
import type { Level } from "@/lib/restaurants"
import { cn } from "@/lib/utils"

const CONFIG: Record<
  Level,
  { label: string; className: string; Icon: typeof Flame }
> = {
  쉬움: {
    label: "혼밥 쉬움",
    className: "bg-chart-3/15 text-chart-3 ring-chart-3/30",
    Icon: Utensils,
  },
  보통: {
    label: "혼밥 보통",
    className: "bg-accent/40 text-accent-foreground ring-accent-foreground/20",
    Icon: Flame,
  },
  어려움: {
    label: "혼밥 어려움",
    className: "bg-primary/12 text-primary ring-primary/25",
    Icon: Users,
  },
}

export function LevelTag({ level }: { level: Level }) {
  const { label, className, Icon } = CONFIG[level]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset",
        className,
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </span>
  )
}
