import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Sparkles, Bookmark, KanbanSquare,
  User, Settings, Menu, X, LogOut, ChevronRight, Shield
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ModeToggle } from '@/components/mode-toggle'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/recommendations', icon: Sparkles, label: 'Matches' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
  { to: '/tracker', icon: KanbanSquare, label: 'Tracker' },
  { to: '/profile', icon: User, label: 'Profile' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuthStore()

  const isActive = (path: string) => location.pathname === path

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.email?.[0]?.toUpperCase()
    || 'U'

  const currentPage = navItems.find(n => isActive(n.to))?.label ?? 'Dashboard'

  return (
    <div className="flex h-svh bg-background overflow-hidden">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-[240px] bg-sidebar transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-sidebar-border flex-shrink-0">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/Scholar.png" alt="ScholarQuest" className="size-7 object-contain invert" />
            <span className="font-black text-sidebar-foreground tracking-tight text-sm">
              Scholar<span className="text-emerald">Quest</span>
            </span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-sidebar-foreground/50 hover:text-sidebar-foreground p-1 rounded transition-colors">
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto py-4 px-2.5">
          <nav className="space-y-0.5">
            {navItems.map(({ to, icon: Icon, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive(to)
                    ? 'bg-emerald/20 text-emerald shadow-sm'
                    : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }
                `}
              >
                <Icon className="size-4 flex-shrink-0" />
                {label}
                {isActive(to) && <ChevronRight className="size-3 ml-auto opacity-50" />}
              </Link>
            ))}
          </nav>

          {profile?.is_admin && (
            <div className="mt-6 pt-6 border-t border-sidebar-border">
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-sidebar-foreground/30">Admin</p>
              <Link to="/admin" onClick={() => setSidebarOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all">
                <Shield className="size-4" /> Admin Panel
              </Link>
            </div>
          )}
        </div>

        {/* User footer */}
        <div className="p-3 border-t border-sidebar-border flex-shrink-0 space-y-1">
          <button
            onClick={() => { navigate('/profile'); setSidebarOpen(false) }}
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-sidebar-accent transition-colors w-full text-left"
          >
            <Avatar className="size-8 flex-shrink-0">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-emerald/20 text-emerald text-xs font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-sidebar-foreground truncate">{profile?.full_name || 'My Account'}</p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate">{user?.email}</p>
            </div>
          </button>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-all"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-14 border-b border-border/50 flex items-center justify-between px-5 flex-shrink-0 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden lg:block text-sm font-semibold text-foreground">{currentPage}</div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <button
              onClick={() => navigate('/profile')}
              className="group"
            >
              <Avatar className="size-8 ring-2 ring-emerald/20 ring-offset-2 ring-offset-background group-hover:ring-emerald/50 transition-all">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className="bg-emerald/20 text-emerald text-xs font-bold">{initials}</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
