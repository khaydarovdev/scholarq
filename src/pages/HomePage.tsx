import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, Globe, TrendingUp, Star, Users, Zap, CheckCircle, GraduationCap, Target, BookOpen, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScholarshipCard } from '@/components/ScholarshipCard'
import { ScholarshipPanel } from '@/components/ScholarshipPanel'
import { fetchFeaturedScholarships, fetchSuccessStories } from '@/lib/api'
import type { Scholarship, SuccessStory } from '@/lib/supabase'

const STATS = [
  { label: 'Active Scholarships', value: '200+', icon: GraduationCap, color: 'text-emerald' },
  { label: 'Partner Countries', value: '30+', icon: Globe, color: 'text-cyan' },
  { label: 'Students Matched', value: '12,000+', icon: Users, color: 'text-amber' },
  { label: 'Success Rate', value: '94%', icon: TrendingUp, color: 'text-rose' },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Create your profile', desc: 'Tell us your degree level, field, countries of interest, and academic background in 2 minutes.' },
  { step: '02', title: 'Get matched', desc: 'Our matching engine cross-references your profile against 200+ scholarships and ranks them by compatibility.' },
  { step: '03', title: 'Track and apply', desc: 'Save scholarships, track deadlines on your Kanban board, and manage your entire application pipeline.' },
]

const FEATURES = [
  { icon: Target, color: 'text-emerald', bg: 'bg-emerald/10', title: 'Smart Matching', desc: 'Profile-based algorithm finds scholarships you actually qualify for — not just broad searches.' },
  { icon: BookOpen, color: 'text-cyan', bg: 'bg-cyan/10', title: 'Application Guides', desc: 'Step-by-step guides written by scholarship winners. Essay frameworks, interview prep, strategy.' },
  { icon: MessageSquare, color: 'text-amber', bg: 'bg-amber/10', title: 'Alumni Network', desc: 'Connect with past scholarship recipients for honest advice, essay reviews, and mock interviews.' },
  { icon: TrendingUp, color: 'text-rose', bg: 'bg-rose/10', title: 'Application Tracker', desc: 'Kanban board + calendar view. Never miss a deadline. Track every stage from interest to award.' },
]

export function HomePage() {
  const [featured, setFeatured] = useState<Scholarship[]>([])
  const [stories, setStories] = useState<SuccessStory[]>([])
  const [search, setSearch] = useState('')
  const [panelScholarship, setPanelScholarship] = useState<Scholarship | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchFeaturedScholarships().then(({ data }) => {
      if (data) setFeatured(data as Scholarship[])
    })
    fetchSuccessStories(true).then(({ data }) => {
      if (data) setStories(data as SuccessStory[])
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    navigate(`/scholarships?search=${encodeURIComponent(search)}`)
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 grid-bg" />
        <div className="hero-orb size-[500px] bg-emerald top-20 left-1/4 opacity-8" />
        <div className="hero-orb size-[400px] bg-cyan bottom-20 right-1/4 opacity-8" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl animate-fade-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald/30 bg-emerald/5 text-emerald text-xs font-semibold mb-6 uppercase tracking-wider">
              <Zap className="size-3" />
              Smart Scholarship Matching
            </div>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-6">
              Your path to <br />
              <span className="gradient-text">global funding.</span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-xl leading-relaxed mb-10">
              Discover and match with 200+ international scholarships across 30+ countries. Guides, alumni mentorship, and application tracking — all in one place.
            </p>

            <form onSubmit={handleSearch} className="flex gap-3 max-w-lg mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search scholarships, countries, providers..."
                  className="pl-10 h-12 bg-card border-border text-base"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 bg-emerald text-emerald-foreground hover:bg-emerald/90 font-semibold">
                Search <ArrowRight className="size-4 ml-2" />
              </Button>
            </form>

            <div className="flex flex-wrap gap-2">
              {['Fully Funded', 'PhD', 'Germany', 'UK', 'USA', 'Japan'].map(tag => (
                <Link key={tag} to={`/scholarships?search=${tag}`}>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent text-xs px-3 py-1">{tag}</Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`rounded-full bg-foreground/30 ${i === 0 ? 'w-6 h-1.5' : 'w-1.5 h-1.5'}`} />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <div className={`text-4xl font-black ${color} mb-1`}>{value}</div>
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
                  <Icon className={`size-4 ${color}`} />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured scholarships */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald mb-2">Spotlight</p>
              <h2 className="text-4xl font-black tracking-tight">Featured scholarships</h2>
              <p className="text-muted-foreground mt-2">Handpicked opportunities with upcoming deadlines</p>
            </div>
            <Link to="/scholarships" className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              View all <ArrowRight className="size-4" />
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 rounded-xl bg-card border border-border animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.slice(0, 6).map(s => (
                <ScholarshipCard key={s.id} scholarship={s} onClick={() => setPanelScholarship(s)} />
              ))}
            </div>
          )}

          <div className="mt-10 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link to="/scholarships">View all scholarships <ArrowRight className="size-4 ml-2" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Scholarship detail panel */}
      <ScholarshipPanel
        scholarship={panelScholarship}
        open={!!panelScholarship}
        onClose={() => setPanelScholarship(null)}
      />

      {/* Features */}
      <section className="py-24 bg-card/20 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald mb-2">Platform</p>
            <h2 className="text-4xl font-black tracking-tight">Everything you need to win</h2>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">From discovery to acceptance — ScholarQuest covers the entire journey.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="p-6 rounded-2xl border border-border bg-card card-hover">
                <div className={`inline-flex size-12 items-center justify-center rounded-xl ${bg} mb-4`}>
                  <Icon className={`size-6 ${color}`} />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald mb-2">Process</p>
            <h2 className="text-4xl font-black tracking-tight">How ScholarQuest works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            {HOW_IT_WORKS.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center">
                <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald/20 to-cyan/20 border border-emerald/20 text-2xl font-black gradient-text mb-4">
                  {step}
                </div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories */}
      {stories.length > 0 && (
        <section className="py-24 bg-card/20 border-y border-border">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber mb-2">Success Stories</p>
                <h2 className="text-4xl font-black tracking-tight">Students who made it</h2>
                <p className="text-muted-foreground mt-2">Real results from ScholarQuest users around the world</p>
              </div>
              <Link to="/alumni" className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Meet alumni <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {stories.slice(0, 3).map((story) => (
                <div key={story.id} className="p-6 rounded-2xl border border-border bg-card card-hover group">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="size-3.5 fill-amber text-amber" />)}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 mb-5">"{story.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-gradient-to-br from-emerald/20 to-cyan/20 border border-emerald/20 flex items-center justify-center text-xs font-bold text-emerald flex-shrink-0">
                      {story.avatar_initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{story.user_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{story.degree} · {story.country}</p>
                    </div>
                    <div className="ml-auto flex-shrink-0">
                      <Badge variant="outline" className="text-[10px] border-emerald/20 text-emerald bg-emerald/5 whitespace-nowrap">{story.scholarship_name}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 border-t border-border relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50" />
        <div className="hero-orb size-96 bg-emerald top-0 right-0" />
        <div className="hero-orb size-64 bg-cyan bottom-0 left-0" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald/30 bg-emerald/5 text-emerald text-xs font-semibold mb-6 uppercase tracking-wider">
            <Target className="size-3" />
            Start Free Today
          </div>
          <h2 className="text-5xl font-black tracking-tighter mb-4">
            Ready to find your <span className="gradient-text">scholarship?</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join 12,000+ students who discovered their funding through ScholarQuest.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="h-12 px-8 bg-emerald text-emerald-foreground hover:bg-emerald/90 font-semibold text-base">
              <Link to="/register">Create free account <ArrowRight className="size-4 ml-2" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 font-semibold text-base">
              <Link to="/scholarships">Browse scholarships</Link>
            </Button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6">
            {['No credit card required', 'Free forever', '2-minute setup'].map(item => (
              <div key={item} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle className="size-4 text-emerald" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
