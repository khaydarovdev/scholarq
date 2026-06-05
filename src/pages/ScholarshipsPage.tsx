import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScholarshipCard } from '@/components/ScholarshipCard'
import { ScholarshipPanel } from '@/components/ScholarshipPanel'
import { fetchScholarships } from '@/lib/api'
import type { Scholarship } from '@/lib/supabase'

const COUNTRIES = ['United Kingdom', 'Germany', 'United States', 'Australia', 'Canada', 'Japan', 'South Korea', 'Netherlands', 'Sweden', 'Switzerland', 'Singapore', 'France', 'China', 'New Zealand', 'Ireland', 'Austria', 'Turkey', 'Hong Kong', 'Taiwan', 'Malaysia', 'Global']
const DEGREES = [{ value: 'bachelor', label: 'Bachelor' }, { value: 'masters', label: 'Masters' }, { value: 'phd', label: 'PhD' }, { value: 'postdoc', label: 'Postdoc' }]
const FUNDING = [{ value: 'fully-funded', label: 'Fully Funded' }, { value: 'partial', label: 'Partial' }, { value: 'tuition-only', label: 'Tuition Only' }, { value: 'stipend-only', label: 'Stipend Only' }]
const SORT = [{ value: 'deadline', label: 'Deadline (Soonest)' }, { value: 'amount', label: 'Amount (Highest)' }, { value: 'newest', label: 'Newest' }, { value: 'popular', label: 'Most Viewed' }]
const PER_PAGE = 12

export function ScholarshipsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [panelScholarship, setPanelScholarship] = useState<Scholarship | null>(null)

  const search = searchParams.get('search') || ''
  const country = searchParams.get('country') || ''
  const degree = searchParams.get('degree') || ''
  const funding = searchParams.get('funding') || ''
  const sort = searchParams.get('sort') || 'deadline'
  const page = parseInt(searchParams.get('page') || '1', 10)

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value); else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const setPage = (p: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  const clearAll = () => setSearchParams({})

  const activeFilters = [
    country && { key: 'country', label: country },
    degree && { key: 'degree', label: degree },
    funding && { key: 'funding', label: funding.replace(/-/g, ' ') },
  ].filter(Boolean) as { key: string; label: string }[]

  useEffect(() => {
    setLoading(true)
    fetchScholarships({ search, country, degree, funding, sort, page, limit: PER_PAGE }).then(({ data, count }) => {
      setScholarships((data as Scholarship[]) || [])
      setTotal(count || 0)
      setLoading(false)
    })
  }, [search, country, degree, funding, sort, page])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black tracking-tight mb-1">Scholarship Directory</h1>
        <p className="text-muted-foreground">{total.toLocaleString()} scholarships across 30+ countries</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setParam('search', e.target.value)}
              placeholder="Search by name, provider, country..."
              className="pl-10 h-11"
            />
          </div>
          <Select value={sort} onValueChange={v => setParam('sort', v)}>
            <SelectTrigger className="w-44 h-11">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" className="h-11 gap-2" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters.length > 0 && <Badge className="ml-0.5 size-5 p-0 flex items-center justify-center text-xs bg-emerald text-emerald-foreground">{activeFilters.length}</Badge>}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-border bg-card/50">
            <Select value={country || 'all'} onValueChange={v => setParam('country', v === 'all' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="All Countries" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={degree || 'all'} onValueChange={v => setParam('degree', v === 'all' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="All Degrees" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Degrees</SelectItem>
                {DEGREES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={funding || 'all'} onValueChange={v => setParam('funding', v === 'all' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="All Funding Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Funding Types</SelectItem>
                {FUNDING.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground">Filters:</span>
            {activeFilters.map(f => (
              <Badge key={f.key} variant="secondary" className="gap-1.5 cursor-pointer" onClick={() => setParam(f.key, '')}>
                {f.label} <X className="size-3" />
              </Badge>
            ))}
            <button onClick={clearAll} className="text-xs text-muted-foreground hover:text-foreground underline">Clear all</button>
          </div>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : scholarships.length === 0 ? (
        <div className="text-center py-20">
          <Search className="size-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No scholarships found</h3>
          <p className="text-muted-foreground mb-4">Try adjusting your filters or search terms</p>
          <Button variant="outline" onClick={clearAll}>Clear all filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {scholarships.map(s => (
            <ScholarshipCard
              key={s.id}
              scholarship={s}
              onClick={() => setPanelScholarship(s)}
            />
          ))}
        </div>
      )}

      {/* Scholarship detail panel */}
      <ScholarshipPanel
        scholarship={panelScholarship}
        open={!!panelScholarship}
        onClose={() => setPanelScholarship(null)}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="flex gap-1">
            {[...Array(Math.min(totalPages, 7))].map((_, i) => {
              const p = i + 1
              return (
                <Button key={p} variant={page === p ? 'default' : 'ghost'} size="sm" className={`w-9 ${page === p ? 'bg-emerald text-emerald-foreground hover:bg-emerald/90' : ''}`} onClick={() => setPage(p)}>
                  {p}
                </Button>
              )
            })}
          </div>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            <ChevronRight className="size-4" />
          </Button>
          <span className="text-sm text-muted-foreground ml-2">
            {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, total)} of {total}
          </span>
        </div>
      )}
    </div>
  )
}
