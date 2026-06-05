import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X, LayoutDashboard, GraduationCap, Users, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/lib/store'
import { ModeToggle } from '@/components/mode-toggle'

const navLinks = [
  { to: '/scholarships', label: 'Scholarships' },
  { to: '/guides', label: 'Guides' },
  { to: '/alumni', label: 'Alumni' },
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/')

  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url
  const initials = profile?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.user_metadata?.full_name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    || user?.email?.[0]?.toUpperCase()
    || 'U'

  return (
    <div className="min-h-svh flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group flex-shrink-0">
              <img src="/Scholar.png" alt="ScholarQuest" className="size-8 object-contain dark:invert" />
              <span className="font-black text-base tracking-tight">
                Scholar<span className="gradient-text">Quest</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(to)
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-2.5">
              <ModeToggle />
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-full hover:bg-accent transition-colors"
                  >
                    <Avatar className="size-8 ring-2 ring-emerald/30 ring-offset-2 ring-offset-background transition-all hover:ring-emerald/60">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback className="bg-emerald/20 text-emerald text-xs font-bold">{initials}</AvatarFallback>
                    </Avatar>
                    <ChevronDown className={`size-3.5 text-muted-foreground transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-border bg-popover p-1.5 shadow-xl z-20 animate-scale-in">
                        <div className="px-3 py-2 mb-1">
                          <p className="text-sm font-semibold truncate">{profile?.full_name || user.email}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <div className="border-t border-border my-1" />
                        <button onClick={() => { navigate('/dashboard'); setUserMenuOpen(false) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                          <LayoutDashboard className="size-4 text-muted-foreground" /> Dashboard
                        </button>
                        <button onClick={() => { navigate('/profile'); setUserMenuOpen(false) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors">
                          <Users className="size-4 text-muted-foreground" /> Profile
                        </button>
                        <div className="border-t border-border my-1" />
                        <button onClick={() => { signOut(); setUserMenuOpen(false) }} className="flex items-center gap-2.5 w-full px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors">
                          <X className="size-4" /> Sign out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign in</Button>
                  <Button size="sm" onClick={() => navigate('/register')} className="bg-emerald text-emerald-foreground hover:bg-emerald/90 shadow-sm hover:shadow-emerald/25 hover:shadow-md transition-all">
                    Get started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center gap-2">
              <ModeToggle />
              {user && (
                <Avatar className="size-7 ring-2 ring-emerald/30" onClick={() => navigate('/dashboard')}>
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-emerald/20 text-emerald text-xs font-bold">{initials}</AvatarFallback>
                </Avatar>
              )}
              <button onClick={() => setOpen(!open)} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 py-3 space-y-1 animate-fade-in">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent transition-colors">
                {label}
              </Link>
            ))}
            <div className="border-t border-border my-2" />
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent">
                  <LayoutDashboard className="size-4 text-muted-foreground" /> Dashboard
                </Link>
                <button onClick={() => { signOut(); setOpen(false) }} className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent text-left">
                  <X className="size-4 text-muted-foreground" /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-accent">Sign in</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm font-medium bg-emerald text-white hover:bg-emerald/90">Get started free</Link>
              </>
            )}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <img src="/Scholar.png" alt="ScholarQuest" className="size-7 object-contain dark:invert" />
                <span className="font-black tracking-tight">Scholar<span className="gradient-text">Quest</span></span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                The world's most comprehensive scholarship discovery platform. Step-by-step guides, alumni connections, and AI-powered matching.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
              <div>
                <h4 className="text-sm font-semibold mb-3">Discover</h4>
                <div className="space-y-2.5">
                  <Link to="/scholarships" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Browse All</Link>
                  <Link to="/scholarships?funding=fully-funded" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Fully Funded</Link>
                  <Link to="/scholarships?degree=phd" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">PhD Programs</Link>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3">Learn</h4>
                <div className="space-y-2.5">
                  <Link to="/guides" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Guides</Link>
                  <Link to="/alumni" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Alumni Connect</Link>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold mb-3">Account</h4>
                <div className="space-y-2.5">
                  <Link to="/register" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Sign up free</Link>
                  <Link to="/login" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">Sign in</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2026 ScholarQuest. All rights reserved.</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <GraduationCap className="size-3.5 text-emerald" />
              <span>Helping students fund their futures.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
