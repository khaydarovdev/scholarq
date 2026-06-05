import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, GraduationCap, Banknote, Clock, Globe, Bookmark, BookmarkCheck, ExternalLink, CheckCircle, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScholarshipCard } from '@/components/ScholarshipCard'
import { fetchScholarshipById, fetchSimilarScholarships, saveScholarship, unsaveScholarship, addApplication } from '@/lib/api'
import { useAuthStore, useScholarshipStore } from '@/lib/store'
import type { Scholarship } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const FUNDING_COLORS: Record<string, string> = {
  'fully-funded': 'bg-emerald/10 text-emerald border-emerald/20',
  'partial': 'bg-amber/10 text-amber border-amber/20',
  'tuition-only': 'bg-cyan/10 text-cyan border-cyan/20',
  'stipend-only': 'bg-primary/10 text-primary border-primary/20',
  'living-allowance': 'bg-rose/10 text-rose border-rose/20',
}

function DeadlineIndicator({ deadline }: { deadline: string | null }) {
  if (!deadline) return <span className="text-sm text-muted-foreground">Rolling admissions</span>
  const d = new Date(deadline)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return <span className="text-sm text-destructive font-semibold">Closed</span>
  if (diff <= 30) return <span className="text-sm text-amber font-semibold">{diff} days remaining</span>
  return <span className="text-sm text-foreground">{d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
}

export function ScholarshipDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [scholarship, setScholarship] = useState<Scholarship | null>(null)
  const [similar, setSimilar] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const { savedIds, toggleSaved } = useScholarshipStore()
  const isSaved = scholarship ? savedIds.has(scholarship.id) : false

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchScholarshipById(id).then(async ({ data }) => {
      if (data) {
        setScholarship(data as Scholarship)
        // Increment view count
        await supabase.from('scholarships').update({ views_count: (data.views_count || 0) + 1 }).eq('id', id)
        fetchSimilarScholarships(data as Scholarship).then(({ data: sim }) => {
          if (sim) setSimilar(sim as Scholarship[])
        })
      }
      setLoading(false)
    })
  }, [id])

  const handleSave = async () => {
    if (!user || !scholarship) { toast.error('Sign in to save scholarships'); return }
    toggleSaved(scholarship.id)
    if (isSaved) {
      await unsaveScholarship(user.id, scholarship.id)
      toast.success('Removed from saved')
    } else {
      await saveScholarship(user.id, scholarship.id)
      toast.success('Saved to your list')
    }
  }

  const handleTrack = async () => {
    if (!user || !scholarship) { toast.error('Sign in to track applications'); return }
    const { error } = await addApplication(user.id, scholarship.id)
    if (error) toast.error('Already in your tracker')
    else { toast.success('Added to your tracker'); navigate('/tracker') }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="h-8 w-32 bg-muted rounded animate-pulse mb-6" />
        <div className="h-12 w-2/3 bg-muted rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="h-4 bg-muted rounded animate-pulse" />)}
        </div>
      </div>
    )
  }

  if (!scholarship) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Scholarship not found</h2>
        <Button onClick={() => navigate('/scholarships')}>Browse scholarships</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="size-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={cn('inline-flex items-center text-xs px-2.5 py-1 rounded-full border font-semibold', FUNDING_COLORS[scholarship.funding_type] || 'bg-muted text-muted-foreground border-border')}>
                {scholarship.funding_type.replace(/-/g, ' ')}
              </span>
              <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border bg-secondary text-secondary-foreground font-semibold">
                <GraduationCap className="size-3" />
                {scholarship.degree_level.charAt(0).toUpperCase() + scholarship.degree_level.slice(1)}
              </span>
              {scholarship.is_featured && (
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber/10 text-amber border border-amber/20 font-semibold">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2">{scholarship.title}</h1>
            <p className="text-xl text-muted-foreground">{scholarship.provider}</p>
            {scholarship.university && scholarship.university !== scholarship.provider && (
              <p className="text-sm text-muted-foreground mt-1">{scholarship.university}</p>
            )}
          </div>

          <div className="prose prose-sm max-w-none">
            <h2 className="text-xl font-bold mb-3">About this scholarship</h2>
            <p className="text-foreground/80 leading-relaxed">{scholarship.description}</p>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-bold mb-4">Eligibility requirements</h2>
            <p className="text-foreground/80 leading-relaxed mb-4">{scholarship.eligibility}</p>
            {scholarship.requirements?.length > 0 && (
              <div className="space-y-2">
                {scholarship.requirements.map((req, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="size-4 text-emerald mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-foreground/80">{req}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-bold mb-3">Benefits & funding</h2>
            <p className="text-foreground/80 leading-relaxed">{scholarship.benefits}</p>
          </div>

          <Separator />

          <div>
            <h2 className="text-xl font-bold mb-3">Application process</h2>
            <p className="text-foreground/80 leading-relaxed">{scholarship.application_process}</p>
          </div>

          {scholarship.tags?.length > 0 && (
            <>
              <Separator />
              <div>
                <h2 className="text-xl font-bold mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {scholarship.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="sticky top-20 space-y-4">
            {/* Quick info card */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5"><MapPin className="size-3.5" /> Country</span>
                  <span className="text-sm font-medium">{scholarship.country}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5"><GraduationCap className="size-3.5" /> Degree</span>
                  <span className="text-sm font-medium capitalize">{scholarship.degree_level}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Calendar className="size-3.5" /> Deadline</span>
                  <DeadlineIndicator deadline={scholarship.deadline} />
                </div>
                {scholarship.amount && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Banknote className="size-3.5" /> Amount</span>
                    <span className="text-sm font-medium">{scholarship.currency !== 'USD' ? '' : '$'}{scholarship.amount.toLocaleString()} {scholarship.currency}</span>
                  </div>
                )}
                {scholarship.deadline && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5"><Clock className="size-3.5" /> Duration</span>
                    <span className="text-sm font-medium">{scholarship.deadline ? new Date(scholarship.deadline).getFullYear() : 'N/A'}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <Button className="w-full bg-emerald text-emerald-foreground hover:bg-emerald/90 font-semibold" onClick={handleTrack}>
                  <Plus className="size-4 mr-2" /> Track Application
                </Button>
                <Button variant="outline" className="w-full" onClick={handleSave}>
                  {isSaved ? (
                    <><BookmarkCheck className="size-4 mr-2 text-emerald" /> Saved</>
                  ) : (
                    <><Bookmark className="size-4 mr-2" /> Save</>
                  )}
                </Button>
                {scholarship.website_url && (
                  <Button variant="ghost" className="w-full" asChild>
                    <a href={scholarship.website_url} target="_blank" rel="noopener noreferrer">
                      <Globe className="size-4 mr-2" /> Official Website <ExternalLink className="size-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Language requirements */}
            {scholarship.language_requirements && Object.keys(scholarship.language_requirements).length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold mb-3">Language Requirements</h3>
                <div className="space-y-2">
                  {Object.entries(scholarship.language_requirements).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground uppercase text-xs font-semibold">{key}</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Similar scholarships */}
      {similar.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-black tracking-tight mb-6">Similar scholarships</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {similar.map(s => <ScholarshipCard key={s.id} scholarship={s} />)}
          </div>
        </div>
      )}
    </div>
  )
}
