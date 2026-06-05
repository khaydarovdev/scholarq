import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Bookmark, Calendar, TrendingUp, ArrowRight, Clock, Target, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScholarshipCard } from '@/components/ScholarshipCard'
import { useAuthStore, useScholarshipStore, useUserDataStore } from '@/lib/store'
import { fetchUserSaved, fetchUserApplications, fetchScholarships, computeMatchScore, getMatchReasons } from '@/lib/api'
import type { Scholarship } from '@/lib/supabase'

const STAGE_COLORS: Record<string, string> = {
  interested: 'bg-muted text-muted-foreground',
  researching: 'bg-cyan/10 text-cyan',
  preparing: 'bg-amber/10 text-amber',
  applied: 'bg-primary/10 text-primary',
  interview: 'bg-rose/10 text-rose',
  accepted: 'bg-emerald/10 text-emerald',
  rejected: 'bg-destructive/10 text-destructive',
}

export function DashboardPage() {
  const { user, profile } = useAuthStore()
  const { savedScholarships, applications, setSaved, setApplications } = useUserDataStore()
  const { setSavedIds } = useScholarshipStore()
  const [recommended, setRecommended] = useState<Scholarship[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      fetchUserSaved(user.id),
      fetchUserApplications(user.id),
      fetchScholarships({ sort: 'deadline', limit: 20 }),
    ]).then(([savedRes, appsRes, scholRes]) => {
      if (savedRes.data) {
        setSaved(savedRes.data as any)
        setSavedIds(savedRes.data.map((s: any) => s.scholarship_id))
      }
      if (appsRes.data) setApplications(appsRes.data as any)
      if (scholRes.data) {
        const sorted = (scholRes.data as Scholarship[])
          .map(s => ({ s, score: computeMatchScore(s, profile) }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map(x => x.s)
        setRecommended(sorted)
      }
      setLoading(false)
    })
  }, [user?.id, profile?.id])

  const profileCompletion = profile ? (() => {
    const fields = [profile.full_name, profile.target_degree, profile.field_of_study, profile.nationality, profile.country_preferences?.length > 0]
    return Math.round((fields.filter(Boolean).length / fields.length) * 100)
  })() : 0

  const upcomingDeadlines = applications
    .filter(a => a.scholarship?.deadline && new Date(a.scholarship.deadline) > new Date() && !['accepted', 'rejected'].includes(a.status))
    .sort((a, b) => new Date(a.scholarship!.deadline!).getTime() - new Date(b.scholarship!.deadline!).getTime())
    .slice(0, 5)

  const stats = [
    { label: 'Saved', value: savedScholarships.length, icon: Bookmark, color: 'text-cyan', href: '/saved' },
    { label: 'Tracking', value: applications.length, icon: Target, color: 'text-amber', href: '/tracker' },
    { label: 'Applied', value: applications.filter(a => a.status === 'applied').length, icon: CheckCircle2, color: 'text-emerald', href: '/tracker' },
    { label: 'Profile', value: `${profileCompletion}%`, icon: TrendingUp, color: 'text-rose', href: '/profile' },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}.
        </h1>
        <p className="text-muted-foreground mt-1">Here's your scholarship overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} to={href}>
            <Card className="hover:border-border/80 transition-colors cursor-pointer group">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                  <Icon className={`size-4 ${color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className={`text-3xl font-black ${color}`}>{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Profile completion */}
      {profileCompletion < 100 && (
        <Card className="border-amber/20 bg-amber/5">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold">Complete your profile</h3>
                <p className="text-sm text-muted-foreground">Better profile = more accurate matches</p>
              </div>
              <Button size="sm" variant="outline" asChild>
                <Link to="/profile">Complete <ArrowRight className="size-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber to-emerald rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
              </div>
              <span className="text-sm font-bold text-amber">{profileCompletion}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top recommendations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="size-5 text-emerald" /> Top Matches</h2>
            <Link to="/recommendations" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">See all <ArrowRight className="size-4" /></Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />)}
            </div>
          ) : recommended.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Sparkles className="size-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <h3 className="font-semibold mb-1">No recommendations yet</h3>
                <p className="text-sm text-muted-foreground mb-4">Complete your profile to get personalized matches</p>
                <Button asChild size="sm"><Link to="/profile">Complete profile</Link></Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recommended.map(s => (
                <ScholarshipCard
                  key={s.id}
                  scholarship={s}
                  matchScore={computeMatchScore(s, profile)}
                  matchReasons={getMatchReasons(s, profile)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming deadlines */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2"><Clock className="size-5 text-cyan" /> Deadlines</h2>
            <Link to="/calendar" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">Calendar <ArrowRight className="size-4" /></Link>
          </div>
          <Card>
            <CardContent className="p-0">
              {upcomingDeadlines.length === 0 ? (
                <div className="p-6 text-center">
                  <Calendar className="size-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
                  <Link to="/scholarships" className="text-xs text-emerald hover:underline mt-1 block">Browse scholarships</Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {upcomingDeadlines.map(app => {
                    const days = Math.ceil((new Date(app.scholarship!.deadline!).getTime() - Date.now()) / 86400000)
                    return (
                      <div key={app.id} className="p-4 flex items-start gap-3">
                        <div className={`mt-0.5 px-2 py-1 rounded-lg text-center min-w-12 ${days <= 7 ? 'bg-rose/10 text-rose' : days <= 30 ? 'bg-amber/10 text-amber' : 'bg-emerald/10 text-emerald'}`}>
                          <div className="text-xs font-bold">{days}d</div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link to={`/scholarships/${app.scholarship_id}`} className="text-sm font-medium hover:text-emerald transition-colors line-clamp-1">{app.scholarship?.title}</Link>
                          <p className="text-xs text-muted-foreground mt-0.5">{app.scholarship?.provider}</p>
                        </div>
                        <Badge className={`text-xs flex-shrink-0 ${STAGE_COLORS[app.status] || ''}`}>{app.status}</Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
