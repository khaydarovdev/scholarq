import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import type { Scholarship } from '@/lib/supabase'
import { useAuthStore, useScholarshipStore, useUserDataStore } from '@/lib/store'
import { saveScholarship, unsaveScholarship, addApplication, fetchUserApplications } from '@/lib/api'
import { toast } from 'sonner'
import {
  MapPin, GraduationCap, Bookmark, BookmarkCheck,
  ExternalLink, CheckCircle2, Globe, Target, ArrowRight, ChevronLeft, Info,
  BookOpen, Award, ListChecks
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FUNDING_COLORS, DEGREE_LABELS } from './ScholarshipCard'

function getDeadlineDays(deadline: string | null): number | null {
  if (!deadline) return null
  const d = new Date(deadline)
  return Math.ceil((d.getTime() - Date.now()) / 86400000)
}

interface ScholarshipPanelProps {
  scholarship: Scholarship | null
  open: boolean
  onClose: () => void
  matchScore?: number
  matchReasons?: string[]
}

export function ScholarshipPanel({ scholarship, open, onClose, matchScore, matchReasons }: ScholarshipPanelProps) {
  const { user } = useAuthStore()
  const { savedIds, toggleSaved } = useScholarshipStore()
  const { applications, setApplications } = useUserDataStore()
  const [tracking, setTracking] = useState(false)
  const [tab, setTab] = useState<'overview' | 'eligibility' | 'apply'>('overview')

  const isSaved = scholarship ? savedIds.has(scholarship.id) : false
  const isTracked = scholarship ? applications.some(a => a.scholarship_id === scholarship.id) : false
  const days = scholarship ? getDeadlineDays(scholarship.deadline) : null

  useEffect(() => {
    if (open) setTab('overview')
  }, [open, scholarship?.id])

  if (!scholarship) return null

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) { toast.error('Sign in to save'); return }
    toggleSaved(scholarship.id)
    if (isSaved) {
      await unsaveScholarship(user.id, scholarship.id)
      toast.success('Removed from saved')
    } else {
      await saveScholarship(user.id, scholarship.id)
      toast.success('Saved!')
    }
  }

  const handleTrack = async () => {
    if (!user) { toast.error('Sign in to track applications'); return }
    if (isTracked) { toast.info('Already in your tracker'); return }
    setTracking(true)
    const { error } = await addApplication(user.id, scholarship.id)
    if (error) {
      toast.error('Failed to add to tracker')
    } else {
      const { data } = await fetchUserApplications(user.id)
      if (data) setApplications(data as any)
      toast.success('Added to tracker!')
    }
    setTracking(false)
  }

  const deadlineColor = days === null ? 'text-muted-foreground'
    : days < 0 ? 'text-destructive'
    : days <= 14 ? 'text-rose'
    : days <= 60 ? 'text-amber'
    : 'text-emerald'

  const deadlineLabel = days === null ? 'Rolling deadline'
    : days < 0 ? 'Deadline passed'
    : days === 0 ? 'Due today!'
    : `${days} days left`

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-4" /> Back to results
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
                  isSaved
                    ? 'bg-emerald/10 text-emerald border-emerald/20'
                    : 'bg-muted text-muted-foreground border-border hover:text-foreground'
                )}
              >
                {isSaved ? <BookmarkCheck className="size-4" /> : <Bookmark className="size-4" />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
              <Button
                size="sm"
                onClick={handleTrack}
                disabled={tracking || isTracked}
                className={isTracked ? 'bg-emerald/10 text-emerald border-emerald/20' : 'bg-emerald text-emerald-foreground hover:bg-emerald/90'}
              >
                {isTracked ? (
                  <><CheckCircle2 className="size-3.5 mr-1.5" /> Tracked</>
                ) : tracking ? (
                  <div className="size-3.5 rounded-full border-2 border-emerald-foreground border-t-transparent animate-spin" />
                ) : (
                  <><Target className="size-3.5 mr-1.5" /> Track</>
                )}
              </Button>
            </div>
          </div>

          {/* Title */}
          <div className="px-6 pb-5 space-y-3">
            <div className="flex flex-wrap gap-2">
              <span className={cn('text-xs px-2.5 py-1 rounded-full border font-semibold', FUNDING_COLORS[scholarship.funding_type] || '')}>
                {scholarship.funding_type.replace(/-/g, ' ')}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full border border-border bg-secondary text-secondary-foreground font-semibold">
                <GraduationCap className="size-3 inline mr-1" />{DEGREE_LABELS[scholarship.degree_level]}
              </span>
            </div>

            <h1 className="text-xl font-black leading-tight">{scholarship.title}</h1>
            <p className="text-sm text-muted-foreground">{scholarship.provider}</p>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                <div className={cn('text-base font-black', deadlineColor)}>{deadlineLabel}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {scholarship.deadline
                    ? new Date(scholarship.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Open'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                <div className="text-base font-black text-cyan flex items-center justify-center gap-1">
                  <MapPin className="size-3.5" />
                  {scholarship.country}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Location</div>
              </div>
              <div className="p-3 rounded-xl bg-muted/50 border border-border text-center">
                <div className="text-base font-black text-amber">
                  {scholarship.amount
                    ? `${scholarship.currency === 'USD' ? '$' : ''}${(scholarship.amount / 1000).toFixed(0)}K`
                    : 'Varies'
                  }
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">Per year</div>
              </div>
            </div>

            {/* Match score */}
            {matchScore !== undefined && matchScore > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald/5 border border-emerald/20">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-emerald">{matchScore}% match</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald to-cyan rounded-full" style={{ width: `${matchScore}%` }} />
                  </div>
                </div>
                {matchReasons && matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {matchReasons.slice(0, 2).map((r, i) => (
                      <span key={i} className="text-[10px] text-emerald bg-emerald/10 border border-emerald/20 px-1.5 py-0.5 rounded-full">{r}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-t border-border">
            {(['overview', 'eligibility', 'apply'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 py-3 text-xs font-semibold capitalize transition-all border-b-2',
                  tab === t
                    ? 'border-emerald text-emerald'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {t === 'overview' && <><Info className="size-3 inline mr-1" />Overview</>}
                {t === 'eligibility' && <><CheckCircle2 className="size-3 inline mr-1" />Eligibility</>}
                {t === 'apply' && <><ListChecks className="size-3 inline mr-1" />How to Apply</>}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-6">
            {tab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <section>
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <BookOpen className="size-4 text-emerald" /> About this scholarship
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{scholarship.description}</p>
                </section>

                {scholarship.benefits && (
                  <section>
                    <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <Award className="size-4 text-amber" /> What you'll receive
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{scholarship.benefits}</p>
                  </section>
                )}

                {scholarship.university && (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/40 border border-border">
                    <Globe className="size-4 text-cyan flex-shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Host University</p>
                      <p className="text-sm font-semibold">{scholarship.university}</p>
                    </div>
                  </div>
                )}

                {scholarship.tags && scholarship.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {scholarship.tags.map(tag => (
                      <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted border border-border text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'eligibility' && (
              <div className="space-y-6 animate-fade-in">
                <section>
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald" /> Eligibility Requirements
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scholarship.eligibility}</p>
                </section>

                {scholarship.requirements && scholarship.requirements.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold mb-3">Specific Requirements</h2>
                    <ul className="space-y-2">
                      {scholarship.requirements.map((req, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <CheckCircle2 className="size-4 text-emerald flex-shrink-0 mt-0.5" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {scholarship.min_gpa > 0 && (
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <p className="text-xs text-muted-foreground mb-1">Minimum GPA</p>
                    <p className="text-2xl font-black">{scholarship.min_gpa.toFixed(1)}</p>
                  </div>
                )}

                {scholarship.field_of_study && scholarship.field_of_study.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold mb-3">Fields of Study</h2>
                    <div className="flex flex-wrap gap-2">
                      {scholarship.field_of_study.map(f => (
                        <span key={f} className="text-xs px-3 py-1.5 rounded-lg bg-cyan/10 border border-cyan/20 text-cyan font-medium">{f}</span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {tab === 'apply' && (
              <div className="space-y-6 animate-fade-in">
                <section>
                  <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
                    <ListChecks className="size-4 text-cyan" /> Application Process
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{scholarship.application_process}</p>
                </section>

                <Separator />

                <div className="space-y-3">
                  <h2 className="text-sm font-bold">Ready to apply?</h2>
                  <div className="space-y-2">
                    {scholarship.website_url && (
                      <a
                        href={scholarship.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl border border-border bg-muted/30 hover:bg-accent hover:border-emerald/30 transition-all group"
                      >
                        <span className="text-sm font-semibold">Official Application Portal</span>
                        <ExternalLink className="size-4 text-muted-foreground group-hover:text-emerald transition-colors" />
                      </a>
                    )}
                    <button
                      onClick={handleTrack}
                      disabled={tracking || isTracked}
                      className={cn(
                        'flex items-center justify-between w-full px-4 py-3 rounded-xl border transition-all',
                        isTracked
                          ? 'border-emerald/20 bg-emerald/5 text-emerald'
                          : 'border-emerald/30 bg-emerald/10 hover:bg-emerald/15 text-emerald'
                      )}
                    >
                      <span className="text-sm font-semibold">
                        {isTracked ? 'Added to your tracker' : 'Add to application tracker'}
                      </span>
                      {isTracked
                        ? <CheckCircle2 className="size-4" />
                        : <ArrowRight className="size-4" />
                      }
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber/5 border border-amber/20">
                  <p className="text-xs font-semibold text-amber mb-1">Pro Tip</p>
                  <p className="text-xs text-muted-foreground">Start with our application guides before submitting. Scholarship winners say preparation is 80% of success.</p>
                  <Link to="/guides" className="text-xs text-amber hover:underline mt-1 flex items-center gap-1">
                    Read the guides <ArrowRight className="size-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
