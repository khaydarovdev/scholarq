import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Target, Info, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScholarshipCard } from '@/components/ScholarshipCard'
import { useAuthStore } from '@/lib/store'
import { fetchScholarships, computeMatchScore, getMatchReasons } from '@/lib/api'
import type { Scholarship } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function RecommendationsPage() {
  const { profile } = useAuthStore()
  const [all, setAll] = useState<Array<Scholarship & { score: number; reasons: string[] }>>([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchScholarships({ sort: 'deadline', limit: 100 }).then(({ data }) => {
      if (data) {
        const scored = (data as Scholarship[])
          .map(s => ({ ...s, score: computeMatchScore(s, profile), reasons: getMatchReasons(s, profile) }))
          .filter(s => s.score > 0)
          .sort((a, b) => b.score - a.score)
        setAll(scored)
      }
      setLoading(false)
    })
  }, [profile?.id])

  const filtered = filter === 'all' ? all : filter === 'high' ? all.filter(s => s.score >= 80) : filter === 'medium' ? all.filter(s => s.score >= 50 && s.score < 80) : all.filter(s => s.score < 50)
  const profileComplete = profile && profile.target_degree && profile.field_of_study && profile.country_preferences?.length > 0

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Sparkles className="size-7 text-emerald" /> Recommendations
          </h1>
          <p className="text-muted-foreground mt-1">Matched to your profile using degree, field, and target countries</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All matches</SelectItem>
            <SelectItem value="high">High (80%+)</SelectItem>
            <SelectItem value="medium">Medium (50-79%)</SelectItem>
            <SelectItem value="low">Low (&lt;50%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!profileComplete && (
        <Card className="border-amber/20 bg-amber/5">
          <CardContent className="p-5 flex items-center gap-4">
            <Info className="size-5 text-amber flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Improve your recommendations</p>
              <p className="text-xs text-muted-foreground">Add your degree level, field of study, and target countries</p>
            </div>
            <Button size="sm" asChild variant="outline">
              <Link to="/profile">Update profile <ArrowRight className="size-4 ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Target className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No matches found</h3>
          <p className="text-muted-foreground mb-4">Complete your profile for better recommendations</p>
          <Button asChild><Link to="/profile">Complete profile</Link></Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{filtered.length} scholarships matched your profile</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filtered.map(s => (
              <ScholarshipCard key={s.id} scholarship={s} matchScore={s.score} matchReasons={s.reasons} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
