import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/lib/store'
import { fetchUserApplications } from '@/lib/api'
import type { Application } from '@/lib/supabase'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getDeadlineColor(deadline: string): string {
  const d = new Date(deadline)
  const now = new Date()
  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'bg-destructive/20 text-destructive border-destructive/30'
  if (diff <= 30) return 'bg-amber/20 text-amber border-amber/30'
  return 'bg-emerald/20 text-emerald border-emerald/30'
}

export function CalendarPage() {
  const { user } = useAuthStore()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    if (!user) return
    fetchUserApplications(user.id).then(({ data }) => {
      if (data) setApplications(data as any)
      setLoading(false)
    })
  }, [user?.id])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const deadlinesByDay: Record<number, Application[]> = {}
  applications.forEach(app => {
    if (!app.scholarship?.deadline) return
    const d = new Date(app.scholarship.deadline)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      if (!deadlinesByDay[day]) deadlinesByDay[day] = []
      deadlinesByDay[day].push(app)
    }
  })

  const allDeadlines = applications
    .filter(a => a.scholarship?.deadline)
    .sort((a, b) => new Date(a.scholarship!.deadline!).getTime() - new Date(b.scholarship!.deadline!).getTime())

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-2"><CalendarIcon className="size-7 text-cyan" /> Calendar</h1>
        <p className="text-muted-foreground mt-1">Track your scholarship deadlines</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-bold">{MONTHS[month]} {year}</h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="size-8" onClick={() => setCurrentDate(new Date(year, month - 1))}>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setCurrentDate(new Date())}>Today</Button>
                <Button variant="ghost" size="icon" className="size-8" onClick={() => setCurrentDate(new Date(year, month + 1))}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 border-b border-border">
              {DAYS.map(d => <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">{d}</div>)}
            </div>
            <div className="grid grid-cols-7">
              {[...Array(firstDay)].map((_, i) => <div key={`e-${i}`} className="h-20 border-b border-r border-border/50" />)}
              {[...Array(daysInMonth)].map((_, i) => {
                const day = i + 1
                const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
                const deadlines = deadlinesByDay[day] || []
                return (
                  <div key={day} className={`h-20 border-b border-r border-border/50 p-1.5 ${isToday ? 'bg-emerald/5' : ''}`}>
                    <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-emerald text-emerald-foreground' : 'text-foreground'}`}>{day}</div>
                    <div className="space-y-0.5 overflow-hidden">
                      {deadlines.slice(0, 2).map(app => (
                        <Link key={app.id} to={`/scholarships/${app.scholarship_id}`}>
                          <div className={`text-[10px] px-1 py-0.5 rounded truncate border ${getDeadlineColor(app.scholarship!.deadline!)}`}>
                            {app.scholarship?.title?.split(' ')[0]}
                          </div>
                        </Link>
                      ))}
                      {deadlines.length > 2 && <div className="text-[10px] text-muted-foreground px-1">+{deadlines.length - 2} more</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
            {[['bg-emerald/20 border-emerald/30', 'Open (30+ days)'], ['bg-amber/20 border-amber/30', 'Closing Soon (≤30 days)'], ['bg-destructive/20 border-destructive/30', 'Closed']].map(([cls, label]) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`size-3 rounded border ${cls}`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming list */}
        <div className="space-y-3">
          <h3 className="font-semibold">Upcoming Deadlines</h3>
          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}</div>
          ) : allDeadlines.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No deadlines tracked yet.<br />
              <Link to="/tracker" className="text-emerald hover:underline">Start tracking</Link>
            </div>
          ) : (
            <div className="space-y-2">
              {allDeadlines.slice(0, 10).map(app => {
                if (!app.scholarship?.deadline) return null
                const d = new Date(app.scholarship.deadline)
                const diff = Math.ceil((d.getTime() - Date.now()) / 86400000)
                const color = diff < 0 ? 'text-destructive' : diff <= 30 ? 'text-amber' : 'text-emerald'
                return (
                  <Link key={app.id} to={`/scholarships/${app.scholarship_id}`}>
                    <div className="p-3 rounded-xl border border-border bg-card hover:border-border/80 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{app.scholarship.title}</p>
                          <p className="text-xs text-muted-foreground">{app.scholarship.provider}</p>
                        </div>
                        <div className={`text-xs font-bold ${color} flex-shrink-0`}>
                          {diff < 0 ? 'Closed' : diff === 0 ? 'Today!' : `${diff}d`}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
