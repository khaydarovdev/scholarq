import { MapPin, GraduationCap, Bookmark, BookmarkCheck, Banknote, Clock, ExternalLink, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Scholarship } from '@/lib/supabase'
import { useAuthStore, useScholarshipStore } from '@/lib/store'
import { saveScholarship, unsaveScholarship } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const FUNDING_COLORS: Record<string, string> = {
  'fully-funded': 'bg-emerald/10 text-emerald border-emerald/20',
  'partial': 'bg-amber/10 text-amber border-amber/20',
  'tuition-only': 'bg-cyan/10 text-cyan border-cyan/20',
  'stipend-only': 'bg-primary/10 text-primary border-primary/20',
  'living-allowance': 'bg-rose/10 text-rose border-rose/20',
}

const DEGREE_LABELS: Record<string, string> = {
  bachelor: 'Bachelor',
  masters: 'Masters',
  phd: 'PhD',
  postdoc: 'Postdoc',
  all: 'All levels',
}

function getDeadlineStatus(deadline: string | null): { label: string; color: string; urgent: boolean } {
  if (!deadline) return { label: 'Rolling', color: 'text-muted-foreground', urgent: false }
  const d = new Date(deadline)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: 'Closed', color: 'text-destructive', urgent: false }
  if (diff <= 14) return { label: `${diff}d left`, color: 'text-rose', urgent: true }
  if (diff <= 60) return { label: `${diff}d left`, color: 'text-amber', urgent: false }
  return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }), color: 'text-muted-foreground', urgent: false }
}

interface ScholarshipCardProps {
  scholarship: Scholarship
  matchScore?: number
  matchReasons?: string[]
  className?: string
  onClick?: () => void
}

export function ScholarshipCard({ scholarship, matchScore, matchReasons, className, onClick }: ScholarshipCardProps) {
  const { user } = useAuthStore()
  const { savedIds, toggleSaved } = useScholarshipStore()
  const isSaved = savedIds.has(scholarship.id)
  const deadline = getDeadlineStatus(scholarship.deadline)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Sign in to save scholarships'); return }
    toggleSaved(scholarship.id)
    if (isSaved) {
      await unsaveScholarship(user.id, scholarship.id)
      toast.success('Removed from saved')
    } else {
      await saveScholarship(user.id, scholarship.id)
      toast.success('Saved to your list')
    }
  }

  const handleClick = () => {
    if (onClick) onClick()
  }

  return (
    <Card
      className={cn('border border-border/50 bg-card overflow-hidden group cursor-pointer transition-all duration-300 hover:border-emerald/30 hover:shadow-lg hover:shadow-emerald/5', className)}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0 flex-1">
              {matchScore !== undefined && (
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="h-1.5 flex-1 max-w-20 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald to-cyan rounded-full transition-all"
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-emerald">{matchScore}% match</span>
                </div>
              )}
              <h3 className="font-semibold text-base leading-tight text-foreground group-hover:text-emerald transition-colors line-clamp-2 mb-1">
                {scholarship.title}
              </h3>
              <p className="text-sm text-muted-foreground">{scholarship.provider}</p>
            </div>
            <button
              onClick={handleSave}
              className="flex-shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all z-10"
            >
              {isSaved
                ? <BookmarkCheck className="size-4 text-emerald" />
                : <Bookmark className="size-4" />
              }
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <span className={cn('inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border font-medium', FUNDING_COLORS[scholarship.funding_type] || 'bg-muted text-muted-foreground border-border')}>
              {scholarship.funding_type.replace(/-/g, ' ')}
            </span>
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full border bg-secondary text-secondary-foreground border-border/50 font-medium">
              <GraduationCap className="size-3" />
              {DEGREE_LABELS[scholarship.degree_level] || scholarship.degree_level}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="size-3" />
              <span>{scholarship.country}</span>
            </div>
            <div className={cn('flex items-center gap-1 font-medium', deadline.color)}>
              <Clock className={cn('size-3', deadline.urgent && 'animate-pulse')} />
              {deadline.label}
            </div>
          </div>

          {matchReasons && matchReasons.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/40">
              <div className="flex flex-wrap gap-1.5">
                {matchReasons.slice(0, 2).map((r, i) => (
                  <span key={i} className="text-[10px] text-emerald bg-emerald/5 border border-emerald/15 px-2 py-0.5 rounded-full font-medium">{r}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {scholarship.amount && (
          <div className="px-5 py-2.5 border-t border-border/40 bg-muted/20 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Banknote className="size-3.5" />
              {scholarship.currency !== 'USD' ? '' : '$'}{scholarship.amount.toLocaleString()} {scholarship.currency}/yr
            </span>
            <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:text-emerald transition-all" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Re-export the helper for reuse
export { getDeadlineStatus }
export type { ScholarshipCardProps }
export { FUNDING_COLORS, DEGREE_LABELS }

export function ScholarshipPanelTrigger({ scholarship, matchScore, matchReasons, className, onOpen }: ScholarshipCardProps & { onOpen: () => void }) {
  return (
    <ScholarshipCard
      scholarship={scholarship}
      matchScore={matchScore}
      matchReasons={matchReasons}
      className={className}
      onClick={onOpen}
    />
  )
}

// Quick inline link for external site
export function ExternalLink2({ url }: { url: string }) {
  if (!url) return null
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      className="inline-flex items-center gap-1 text-xs text-emerald hover:underline"
    >
      Official site <ExternalLink className="size-3" />
    </a>
  )
}
