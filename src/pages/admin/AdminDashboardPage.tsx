import { useEffect, useState } from 'react'
import { GraduationCap, Users, TrendingUp, Eye, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export function AdminDashboardPage() {
  const [stats, setStats] = useState({ total: 0, featured: 0, users: 0, views: 0 })
  const [countryData, setCountryData] = useState<any[]>([])
  const [degreeData, setDegreeData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('scholarships').select('*', { count: 'exact', head: true }).eq('is_active', true),
      supabase.from('scholarships').select('*', { count: 'exact', head: true }).eq('is_featured', true),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('scholarships').select('views_count').eq('is_active', true),
      supabase.from('scholarships').select('country').eq('is_active', true).order('country'),
      supabase.from('scholarships').select('degree_level').eq('is_active', true),
    ]).then(([totalRes, featuredRes, usersRes, viewsRes, countryRes, degreeRes]) => {
      const totalViews = viewsRes.data?.reduce((acc: number, s: any) => acc + (s.views_count || 0), 0) || 0
      setStats({
        total: totalRes.count || 0,
        featured: featuredRes.count || 0,
        users: usersRes.count || 0,
        views: totalViews,
      })

      if (countryRes.data) {
        const counts: Record<string, number> = {}
        countryRes.data.forEach((s: any) => { counts[s.country] = (counts[s.country] || 0) + 1 })
        setCountryData(Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([country, count]) => ({ country: country.split(' ')[0], count })))
      }

      if (degreeRes.data) {
        const counts: Record<string, number> = {}
        degreeRes.data.forEach((s: any) => { counts[s.degree_level] = (counts[s.degree_level] || 0) + 1 })
        setDegreeData(Object.entries(counts).map(([degree, count]) => ({ degree, count })))
      }

      setLoading(false)
    })
  }, [])

  const statCards = [
    { label: 'Total Scholarships', value: stats.total, icon: GraduationCap, color: 'text-emerald' },
    { label: 'Featured', value: stats.featured, icon: TrendingUp, color: 'text-amber' },
    { label: 'Registered Users', value: stats.users, icon: Users, color: 'text-cyan' },
    { label: 'Total Views', value: stats.views.toLocaleString(), icon: Eye, color: 'text-rose' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Admin Overview</h1>
        <p className="text-muted-foreground mt-1">Platform statistics and management</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                <Icon className={`size-4 ${color}`} />
              </div>
              <div className={`text-3xl font-black ${color}`}>{loading ? '—' : value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Globe className="size-4" /> Scholarships by Country</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="country" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="var(--chart-1)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><GraduationCap className="size-4" /> By Degree Level</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={degreeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="degree" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} />
                <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="var(--chart-2)" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
