import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, ExternalLink, MessageSquare, GraduationCap, MapPin, Briefcase, Filter, ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchAlumni } from '@/lib/api'
import type { Alumni } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const ALL_FIELDS = ['All', 'Technology', 'Agriculture', 'Healthcare', 'Computer Science', 'Journalism', 'Engineering', 'Economics', 'International Relations', 'Law', 'Public Health', 'Data Science']

const COLORS = [
  'from-emerald/20 to-cyan/20 border-emerald/20',
  'from-cyan/20 to-primary/20 border-cyan/20',
  'from-amber/20 to-rose/20 border-amber/20',
  'from-rose/20 to-cyan/20 border-rose/20',
]

export function AlumniPage() {
  const [alumni, setAlumni] = useState<Alumni[]>([])
  const [loading, setLoading] = useState(true)
  const [field, setField] = useState('All')
  const [selected, setSelected] = useState<Alumni | null>(null)

  useEffect(() => {
    fetchAlumni().then(({ data }) => {
      if (data) setAlumni(data as Alumni[])
      setLoading(false)
    })
  }, [])

  const filtered = field === 'All' ? alumni : alumni.filter(a => a.fields.includes(field))

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="hero-orb size-80 bg-amber top-0 left-20" />
        <div className="hero-orb size-72 bg-rose bottom-0 right-10" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl animate-fade-up">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-amber border border-amber/30 bg-amber/10 px-3 py-1 rounded-full mb-4">
              Alumni Network
            </span>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4">
              Learn from those<br />
              <span className="gradient-text-warm">who've done it.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Connect with scholarship winners who want to pay it forward. Get honest advice, hear real stories, and ask the questions scholarship websites never answer.
            </p>
            <div className="flex flex-wrap gap-4">
              {[
                ['15', 'Active Mentors'],
                ['10', 'Countries'],
                ['Free', 'Mentorship'],
              ].map(([num, label]) => (
                <div key={label} className="px-5 py-3 rounded-2xl border border-border bg-card text-center min-w-[90px]">
                  <div className="text-xl font-black gradient-text">{num}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Filter */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-thin">
            <Filter className="size-4 text-muted-foreground flex-shrink-0" />
            {ALL_FIELDS.map(f => (
              <button
                key={f}
                onClick={() => setField(f)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  field === f
                    ? 'bg-amber text-amber-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni grid */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="h-72 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="size-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No alumni in this field yet</h3>
              <p className="text-muted-foreground">Try a different field or check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((alum, i) => (
                <div
                  key={alum.id}
                  className={`group rounded-2xl border overflow-hidden card-hover animate-fade-up stagger-item bg-gradient-to-br ${COLORS[i % COLORS.length]}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="size-12 rounded-2xl bg-background/60 backdrop-blur-sm border border-white/20 flex items-center justify-center text-lg font-black text-foreground">
                          {alum.avatar_initials}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{alum.name}</p>
                          <p className="text-xs text-muted-foreground">{alum.graduation_year}</p>
                        </div>
                      </div>
                      {alum.is_available && (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald bg-emerald/10 border border-emerald/20 px-2 py-1 rounded-full">
                          <CheckCircle2 className="size-2.5" /> Available
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <GraduationCap className="size-3.5 flex-shrink-0 text-emerald" />
                        <span className="font-medium text-foreground">{alum.scholarship}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="size-3.5 flex-shrink-0" />
                        {alum.university}, {alum.country}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Briefcase className="size-3.5 flex-shrink-0" />
                        {alum.role} at {alum.company}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{alum.bio}</p>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {alum.fields.slice(0, 3).map(f => (
                        <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-background/60 text-foreground font-medium">{f}</span>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="flex-1 h-8 text-xs bg-foreground text-background hover:bg-foreground/90"
                        onClick={() => setSelected(alum)}
                      >
                        <MessageSquare className="size-3 mr-1.5" /> View Profile
                      </Button>
                      {alum.linkedin_url && (
                        <a
                          href={alum.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="size-8 rounded-lg border border-border bg-background/60 flex items-center justify-center hover:bg-accent transition-colors"
                        >
                          <ExternalLink className="size-3 text-muted-foreground" />
                        </a>
                      )}
                    </div>

                    {alum.is_available && (
                      <p className="text-[10px] text-muted-foreground mt-2 text-center">
                        Responds {alum.response_time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Alumni Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-emerald/20 to-cyan/20 border border-emerald/20 flex items-center justify-center text-2xl font-black">
                    {selected.avatar_initials}
                  </div>
                  <div>
                    <DialogTitle className="text-xl">{selected.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground">{selected.role} · {selected.company}</p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Scholarship</p>
                    <p className="text-sm font-semibold">{selected.scholarship}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Degree</p>
                    <p className="text-sm font-semibold">{selected.degree}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">University</p>
                    <p className="text-sm font-semibold">{selected.university}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Graduated</p>
                    <p className="text-sm font-semibold">{selected.graduation_year}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{selected.bio}</p>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Fields of Expertise</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.fields.map(f => (
                      <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-emerald/10 text-emerald border border-emerald/20">{f}</span>
                    ))}
                  </div>
                </div>

                {selected.is_available && (
                  <div className="p-4 rounded-2xl bg-emerald/5 border border-emerald/20">
                    <p className="text-sm font-semibold text-emerald mb-1 flex items-center gap-2">
                      <CheckCircle2 className="size-4" /> Available for mentorship
                    </p>
                    <p className="text-xs text-muted-foreground">Usually responds {selected.response_time}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {selected.linkedin_url && (
                    <Button asChild className="flex-1 bg-[#0A66C2] text-white hover:bg-[#0A66C2]/90">
                      <a href={selected.linkedin_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="size-4 mr-2" /> Connect on LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* How it works */}
      <section className="py-16 border-t border-border bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black mb-2 text-center">How alumni mentorship works</h2>
          <p className="text-muted-foreground text-center mb-10">Connect directly — no middleman, no waiting lists.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', title: 'Browse Profiles', desc: 'Find alumni who won the scholarship you\'re targeting. Filter by field, country, or scholarship name.' },
              { step: '02', title: 'Connect on LinkedIn', desc: 'Reach out directly with a personalized message about your application. Mention how their story resonates.' },
              { step: '03', title: 'Get Real Advice', desc: 'From essay reviews to mock interviews — alumni share what scholarship websites never tell you.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center p-6">
                <span className="text-5xl font-black text-muted-foreground/20">{step}</span>
                <h3 className="text-lg font-bold mt-2 mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button asChild className="bg-emerald text-emerald-foreground hover:bg-emerald/90">
              <Link to="/register">Join ScholarQuest free <ArrowRight className="size-4 ml-1.5" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
