import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, Users, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/scholarships', icon: GraduationCap, label: 'Scholarships' },
  { to: '/admin/users', icon: Users, label: 'Users' },
]

export function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="min-h-svh bg-background">
      <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/Scholar.png" alt="ScholarQuest" className="size-7 object-contain dark:invert" />
            <span className="font-black tracking-tight text-sm">Scholar<span className="gradient-text">Quest</span></span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Admin</span>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
          <ChevronLeft className="size-4 mr-1" /> Dashboard
        </Button>
      </header>
      <div className="flex">
        <aside className="w-52 border-r border-border min-h-[calc(100svh-3.5rem)] p-3">
          <nav className="space-y-0.5">
            {adminNav.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === to
                    ? 'bg-emerald/10 text-emerald'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="size-4" /> {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
