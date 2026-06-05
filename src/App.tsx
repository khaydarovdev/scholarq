import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/lib/store'

import { Layout } from '@/components/layout/Layout'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'

import { HomePage } from '@/pages/HomePage'
import { ScholarshipsPage } from '@/pages/ScholarshipsPage'
import { ScholarshipDetailPage } from '@/pages/ScholarshipDetailPage'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { GuidesPage } from '@/pages/GuidesPage'
import { AlumniPage } from '@/pages/AlumniPage'

import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { RecommendationsPage } from '@/pages/dashboard/RecommendationsPage'
import { SavedPage } from '@/pages/dashboard/SavedPage'
import { TrackerPage } from '@/pages/dashboard/TrackerPage'
import { ProfilePage } from '@/pages/dashboard/ProfilePage'
import { SettingsPage } from '@/pages/dashboard/SettingsPage'

import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminScholarshipsPage } from '@/pages/admin/AdminScholarshipsPage'
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore()
  if (loading) return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="size-10 rounded-full border-2 border-emerald border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading ScholarQuest...</p>
      </div>
    </div>
  )
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuthStore()
  if (loading) return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="size-10 rounded-full border-2 border-emerald border-t-transparent animate-spin" />
    </div>
  )
  if (!user || !profile?.is_admin) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  const { setUser, setSession, setLoading, fetchProfile } = useAuthStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        (async () => {
          await fetchProfile(session.user.id)
          setLoading(false)
        })()
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="scholarquest-theme">
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/scholarships" element={<ScholarshipsPage />} />
            <Route path="/scholarships/:id" element={<ScholarshipDetailPage />} />
            <Route path="/guides" element={<GuidesPage />} />
            <Route path="/alumni" element={<AlumniPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/tracker" element={<TrackerPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/scholarships" element={<AdminScholarshipsPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  )
}
