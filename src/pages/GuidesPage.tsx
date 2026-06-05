import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, Clock, ChevronRight, Star, CheckCircle2, Lightbulb, ArrowRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fetchGuides } from '@/lib/api'
import type { Guide } from '@/lib/supabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

const CATEGORIES = ['All', 'Application Writing', 'Research & PhD', 'Interview Prep', 'Planning & Strategy']

const DIFFICULTY_COLORS = {
  beginner: 'bg-emerald/10 text-emerald border-emerald/20',
  intermediate: 'bg-amber/10 text-amber border-amber/20',
  advanced: 'bg-rose/10 text-rose border-rose/20',
}

export function GuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState<Guide | null>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    fetchGuides().then(({ data }) => {
      if (data) setGuides(data as Guide[])
      setLoading(false)
    })
  }, [])

  const filtered = category === 'All' ? guides : guides.filter(g => g.category === category)

  const openGuide = (guide: Guide) => {
    setSelected(guide)
    setActiveStep(0)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div className="hero-orb size-96 bg-cyan top-0 right-0" />
        <div className="hero-orb size-64 bg-emerald bottom-0 left-10" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-cyan border border-cyan/30 bg-cyan/10 px-3 py-1 rounded-full mb-4">
              Application Guides
            </span>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4">
              How to actually<br />
              <span className="gradient-text">win scholarships.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Step-by-step guides written by scholarship winners. No fluff — actionable frameworks from application to award.
            </p>
          </div>
        </div>
      </section>

      {/* Category filter */}
      <section className="sticky top-16 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-thin">
            <Filter className="size-4 text-muted-foreground flex-shrink-0" />
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  category === cat
                    ? 'bg-emerald text-emerald-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Guides grid */}
      <section className="py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((guide, i) => (
                <button
                  key={guide.id}
                  onClick={() => openGuide(guide)}
                  className={`group text-left p-6 rounded-2xl border border-border bg-card hover:border-emerald/40 hover:shadow-lg hover:shadow-emerald/5 transition-all duration-300 card-hover animate-fade-up stagger-item`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${DIFFICULTY_COLORS[guide.difficulty]}`}>
                      {guide.difficulty}
                    </div>
                    {guide.is_featured && (
                      <Star className="size-4 text-amber fill-amber" />
                    )}
                  </div>

                  <h3 className="text-lg font-bold mb-2 group-hover:text-emerald transition-colors leading-snug">{guide.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{guide.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="size-3" /> {guide.duration_minutes} min</span>
                      <span className="flex items-center gap-1"><BookOpen className="size-3" /> {guide.steps.length} steps</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read <ArrowRight className="size-3" />
                    </span>
                  </div>

                  {guide.tags.slice(0, 3).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {guide.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="size-12 text-muted-foreground mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">No guides in this category yet</h3>
              <p className="text-muted-foreground">Check back soon — we add new guides weekly.</p>
            </div>
          )}
        </div>
      </section>

      {/* Guide Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden max-h-[90vh]">
          <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
            {/* Sidebar: steps */}
            <div className="lg:w-64 border-b lg:border-b-0 lg:border-r border-border bg-muted/30 flex-shrink-0">
              <DialogHeader className="p-5 pb-3">
                <DialogTitle className="text-sm font-bold leading-snug">{selected?.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${selected ? DIFFICULTY_COLORS[selected.difficulty] : ''}`}>
                    {selected?.difficulty}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-2.5" /> {selected?.duration_minutes} min
                  </span>
                </div>
              </DialogHeader>
              <nav className="px-3 pb-4 space-y-0.5">
                {selected?.steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all ${
                      activeStep === i
                        ? 'bg-emerald/10 text-emerald font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <span className={`size-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold border ${
                      activeStep === i ? 'bg-emerald text-emerald-foreground border-emerald' : 'border-border'
                    }`}>
                      {step.number}
                    </span>
                    <span className="line-clamp-1">{step.title}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-7 space-y-8">
                {selected && selected.steps[activeStep] && (
                  <div className="animate-fade-up">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="size-8 rounded-xl bg-emerald/10 text-emerald font-black text-sm flex items-center justify-center border border-emerald/20">
                        {selected.steps[activeStep].number}
                      </span>
                      <div>
                        <h2 className="text-xl font-black">{selected.steps[activeStep].title}</h2>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" /> {selected.steps[activeStep].duration}</p>
                      </div>
                    </div>
                    <p className="text-base text-muted-foreground leading-relaxed">{selected.steps[activeStep].description}</p>

                    <div className="flex items-center gap-3 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                        disabled={activeStep === 0}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald text-emerald-foreground hover:bg-emerald/90"
                        onClick={() => setActiveStep(Math.min((selected?.steps.length ?? 1) - 1, activeStep + 1))}
                        disabled={activeStep === (selected?.steps.length ?? 1) - 1}
                      >
                        Next step <ChevronRight className="size-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {selected?.tips && selected.tips.length > 0 && (
                  <div className="p-5 rounded-2xl bg-amber/5 border border-amber/20">
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-amber">
                      <Lightbulb className="size-4" /> Pro Tips
                    </h3>
                    <ul className="space-y-2">
                      {selected.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex gap-2">
                          <span className="text-amber mt-0.5">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Checklist */}
                {selected?.checklist && selected.checklist.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald" /> Checklist
                    </h3>
                    <ul className="space-y-2">
                      {selected.checklist.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                          <div className="size-4 rounded border border-border flex-shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Ready to put this into practice?</p>
                  <Link to="/scholarships" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald hover:underline mt-1">
                    Browse scholarships <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* CTA */}
      <section className="py-16 border-t border-border">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-3xl font-black mb-3">Ready to apply?</h2>
          <p className="text-muted-foreground mb-6">Use these guides, connect with alumni who've been there, and track your applications in one place.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="bg-emerald text-emerald-foreground hover:bg-emerald/90">
              <Link to="/scholarships">Browse Scholarships <ArrowRight className="size-4 ml-1.5" /></Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/alumni">Connect with Alumni</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
