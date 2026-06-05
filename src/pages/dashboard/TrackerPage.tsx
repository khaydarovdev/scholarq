import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { KanbanSquare, Plus, Trash2, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuthStore, useUserDataStore } from '@/lib/store'
import { fetchUserApplications, updateApplicationStatus, deleteApplication } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const STAGES = [
  { id: 'interested', label: 'Interested', color: 'bg-muted/50 border-border/50', headerColor: 'bg-muted/80 text-muted-foreground' },
  { id: 'researching', label: 'Researching', color: 'bg-cyan/5 border-cyan/20', headerColor: 'bg-cyan/10 text-cyan' },
  { id: 'preparing', label: 'Preparing', color: 'bg-amber/5 border-amber/20', headerColor: 'bg-amber/10 text-amber' },
  { id: 'applied', label: 'Applied', color: 'bg-primary/5 border-primary/20', headerColor: 'bg-primary/10 text-primary' },
  { id: 'interview', label: 'Interview', color: 'bg-rose/5 border-rose/20', headerColor: 'bg-rose/10 text-rose' },
  { id: 'accepted', label: 'Accepted', color: 'bg-emerald/5 border-emerald/20', headerColor: 'bg-emerald/15 text-emerald' },
  { id: 'rejected', label: 'Rejected', color: 'bg-destructive/5 border-destructive/20', headerColor: 'bg-destructive/10 text-destructive' },
]

const STAGE_DOT: Record<string, string> = {
  interested: 'bg-muted-foreground',
  researching: 'bg-cyan',
  preparing: 'bg-amber',
  applied: 'bg-primary',
  interview: 'bg-rose',
  accepted: 'bg-emerald',
  rejected: 'bg-destructive',
}

function getDaysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000)
}

export function TrackerPage() {
  const { user } = useAuthStore()
  const { applications, setApplications, updateApplication, removeApplication } = useUserDataStore()
  const [loading, setLoading] = useState(true)
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [view, setView] = useState<'kanban' | 'calendar'>('kanban')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    fetchUserApplications(user.id).then(({ data }) => {
      if (data) setApplications(data as any)
      setLoading(false)
    })
  }, [user?.id])

  const handleMove = async (appId: string, newStage: string) => {
    updateApplication(appId, { status: newStage as any })
    const { error } = await updateApplicationStatus(appId, newStage)
    if (error) toast.error('Failed to update status')
    else toast.success('Status updated')
  }

  const handleDelete = async (appId: string) => {
    removeApplication(appId)
    await deleteApplication(appId)
    toast.success('Removed from tracker')
  }

  const byStage = (stageId: string) => applications.filter(a => a.status === stageId)

  const year = calendarDate.getFullYear()
  const month = calendarDate.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()

  const deadlineMap: Record<number, typeof applications[0][]> = {}
  applications.forEach(app => {
    if (app.scholarship?.deadline) {
      const d = new Date(app.scholarship.deadline)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate()
        if (!deadlineMap[day]) deadlineMap[day] = []
        deadlineMap[day].push(app)
      }
    }
  })

  const upcomingDeadlines = applications
    .filter(a => a.scholarship?.deadline && new Date(a.scholarship.deadline) > new Date() && !['accepted', 'rejected'].includes(a.status))
    .sort((a, b) => new Date(a.scholarship!.deadline!).getTime() - new Date(b.scholarship!.deadline!).getTime())
    .slice(0, 6)

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <KanbanSquare className="size-7 text-amber" /> Tracker
          </h1>
          <p className="text-muted-foreground mt-1">Manage your entire application pipeline</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl border border-border overflow-hidden bg-muted/30">
            <button onClick={() => setView('kanban')} className={cn('px-4 py-1.5 text-xs font-semibold transition-all', view === 'kanban' ? 'bg-emerald text-emerald-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>Kanban</button>
            <button onClick={() => setView('calendar')} className={cn('px-4 py-1.5 text-xs font-semibold transition-all', view === 'calendar' ? 'bg-emerald text-emerald-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>Calendar</button>
          </div>
          <Button asChild size="sm" className="bg-emerald text-emerald-foreground hover:bg-emerald/90">
            <Link to="/scholarships"><Plus className="size-4 mr-1.5" /> Add</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-4 overflow-x-auto pb-4">{STAGES.map(s => <div key={s.id} className="w-64 flex-shrink-0 h-56 rounded-2xl bg-muted animate-pulse" />)}</div>
      ) : applications.length === 0 ? (
        <div className="text-center py-20 animate-fade-up">
          <KanbanSquare className="size-12 text-muted-foreground mx-auto mb-4 opacity-30" />
          <h3 className="text-xl font-semibold mb-2">No applications tracked</h3>
          <p className="text-muted-foreground mb-4">Find a scholarship and click Track Application</p>
          <Button asChild className="bg-emerald text-emerald-foreground hover:bg-emerald/90"><Link to="/scholarships">Browse scholarships</Link></Button>
        </div>
      ) : view === 'kanban' ? (
        <>
          <div className="overflow-x-auto pb-4 scrollbar-thin -mx-2 px-2">
            <div className="flex gap-3 min-w-max">
              {STAGES.map(stage => {
                const items = byStage(stage.id)
                return (
                  <div key={stage.id} className={`w-64 flex-shrink-0 rounded-2xl border ${stage.color} flex flex-col`}>
                    <div className={`px-4 py-2.5 rounded-t-2xl ${stage.headerColor} flex items-center justify-between`}>
                      <span className="text-xs font-bold">{stage.label}</span>
                      <span className="text-xs font-bold opacity-60 tabular-nums">{items.length}</span>
                    </div>
                    <div className="p-2.5 space-y-2 flex-1 min-h-20">
                      {items.map(app => (
                        <div key={app.id} className="p-3 rounded-xl bg-card border border-border shadow-sm group hover:border-emerald/20 transition-colors animate-fade-in">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <Link to={`/scholarships/${app.scholarship_id}`} className="text-xs font-semibold hover:text-emerald transition-colors line-clamp-2 block" onClick={e => e.stopPropagation()}>
                                {app.scholarship?.title || 'Unknown'}
                              </Link>
                              <p className="text-[10px] text-muted-foreground mt-0.5">{app.scholarship?.provider}</p>
                              {app.scholarship?.deadline && (
                                <p className={cn('text-[10px] mt-1 font-medium', getDaysLeft(app.scholarship.deadline) <= 14 ? 'text-rose' : getDaysLeft(app.scholarship.deadline) <= 60 ? 'text-amber' : 'text-muted-foreground')}>
                                  {getDaysLeft(app.scholarship.deadline) < 0 ? 'Closed' : `${getDaysLeft(app.scholarship.deadline)}d left`}
                                </p>
                              )}
                            </div>
                            <button onClick={() => handleDelete(app.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex-shrink-0">
                              <Trash2 className="size-3" />
                            </button>
                          </div>
                          {stage.id !== 'accepted' && stage.id !== 'rejected' && (
                            <div className="mt-2 pt-2 border-t border-border/40">
                              <select value={app.status} onChange={e => handleMove(app.id, e.target.value)} className="w-full text-[10px] bg-transparent text-muted-foreground cursor-pointer rounded border border-border/50 px-1.5 py-0.5 hover:border-border transition-colors">
                                {STAGES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                      ))}
                      {items.length === 0 && <div className="text-center py-5 text-[10px] text-muted-foreground/40">Empty</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: applications.length, color: 'text-foreground', bg: 'bg-card border-border' },
              { label: 'Accepted', value: byStage('accepted').length, color: 'text-emerald', bg: 'bg-emerald/5 border-emerald/20' },
              { label: 'In Review', value: byStage('applied').length + byStage('interview').length, color: 'text-amber', bg: 'bg-amber/5 border-amber/20' },
              { label: 'In Progress', value: byStage('preparing').length + byStage('researching').length, color: 'text-cyan', bg: 'bg-cyan/5 border-cyan/20' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`p-4 rounded-2xl border ${bg} text-center`}>
                <div className={`text-2xl font-black ${color}`}>{value}</div>
                <div className="text-xs text-muted-foreground mt-1">{label}</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-bold flex items-center gap-2"><Calendar className="size-4 text-emerald" />{MONTH_NAMES[month]} {year}</h2>
              <div className="flex items-center gap-1">
                <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"><ChevronLeft className="size-4" /></button>
                <button onClick={() => setCalendarDate(new Date())} className="px-2.5 py-1 rounded-lg text-xs font-medium hover:bg-accent transition-colors text-muted-foreground">Today</button>
                <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"><ChevronRight className="size-4" /></button>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-7 mb-2">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {[...Array(firstDay)].map((_, i) => <div key={`e${i}`} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1
                  const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
                  const apps = deadlineMap[day] || []
                  return (
                    <div key={day} className={cn('min-h-14 p-1.5 rounded-xl border transition-colors', isToday ? 'border-emerald/40 bg-emerald/5' : 'border-transparent hover:border-border hover:bg-muted/30')}>
                      <span className={cn('text-xs font-semibold block text-center w-6 h-6 mx-auto rounded-full flex items-center justify-center', isToday ? 'bg-emerald text-emerald-foreground' : 'text-muted-foreground')}>{day}</span>
                      <div className="space-y-0.5 mt-0.5">
                        {apps.slice(0, 2).map(app => {
                          const d = getDaysLeft(app.scholarship!.deadline!)
                          return (
                            <div key={app.id} className={cn('text-[9px] px-1 py-0.5 rounded font-medium truncate', d <= 7 ? 'bg-rose/15 text-rose' : d <= 30 ? 'bg-amber/15 text-amber' : 'bg-emerald/15 text-emerald')}>
                              {app.scholarship?.title?.split(' ')[0]}
                            </div>
                          )
                        })}
                        {apps.length > 2 && <div className="text-[9px] text-muted-foreground text-center">+{apps.length - 2}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                {[{ label: 'Due soon (<7d)', cls: 'bg-rose' },{ label: 'This month', cls: 'bg-amber' },{ label: 'Later', cls: 'bg-emerald' }].map(({ label, cls }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs text-muted-foreground"><div className={`size-2 rounded-full ${cls}`} />{label}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold flex items-center gap-2"><Calendar className="size-4 text-cyan" /> Upcoming Deadlines</h3>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 rounded-2xl border border-border bg-card">
                <Calendar className="size-8 text-muted-foreground mx-auto mb-2 opacity-40" />
                <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcomingDeadlines.map(app => {
                  const days = getDaysLeft(app.scholarship!.deadline!)
                  return (
                    <div key={app.id} className="p-3 rounded-2xl border border-border bg-card hover:border-emerald/20 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={cn('flex-shrink-0 w-10 text-center py-1 rounded-lg text-xs font-black', days <= 7 ? 'bg-rose/10 text-rose' : days <= 30 ? 'bg-amber/10 text-amber' : 'bg-emerald/10 text-emerald')}>{days}d</div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/scholarships/${app.scholarship_id}`} className="text-xs font-semibold hover:text-emerald transition-colors line-clamp-1 block">{app.scholarship?.title}</Link>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className={cn('size-1.5 rounded-full', STAGE_DOT[app.status])} />
                            <span className="text-[10px] text-muted-foreground capitalize">{app.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="p-4 rounded-2xl border border-border bg-card">
              <p className="text-xs font-bold mb-3 text-muted-foreground uppercase tracking-wider">Pipeline Summary</p>
              <div className="space-y-2">
                {STAGES.filter(s => byStage(s.id).length > 0).map(stage => (
                  <div key={stage.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2"><div className={cn('size-2 rounded-full', STAGE_DOT[stage.id])} /><span className="text-xs text-muted-foreground">{stage.label}</span></div>
                    <Badge variant="secondary" className="text-xs px-2 h-5">{byStage(stage.id).length}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
