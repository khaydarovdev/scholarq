import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

export function ModeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={cn(
        "relative inline-flex h-8 w-14 items-center rounded-full border border-border transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDark ? "bg-sidebar-accent" : "bg-muted",
        className
      )}
      aria-label="Toggle theme"
    >
      <span
        className={cn(
          "absolute flex size-6 items-center justify-center rounded-full shadow-sm transition-all duration-300",
          isDark
            ? "translate-x-7 bg-emerald"
            : "translate-x-1 bg-background"
        )}
        style={{ color: isDark ? 'oklch(0.095 0.015 260)' : 'oklch(0.80 0.18 75)' }}
      >
        {isDark
          ? <Moon className="size-3.5" />
          : <Sun className="size-3.5" />
        }
      </span>
    </button>
  )
}
