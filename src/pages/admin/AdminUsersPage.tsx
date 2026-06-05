import { useEffect, useState } from 'react'
import { Users, Shield } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setUsers(data)
      setLoading(false)
    })
  }, [])

  const toggleAdmin = async (id: string, current: boolean) => {
    const { error } = await supabase.from('profiles').update({ is_admin: !current }).eq('id', id)
    if (error) toast.error(error.message)
    else {
      setUsers(u => u.map(u => u.id === id ? { ...u, is_admin: !current } : u))
      toast.success(!current ? 'Admin granted' : 'Admin removed')
    }
  }

  const filtered = users.filter(u => !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><Users className="size-6" /> Users</h1>
          <p className="text-muted-foreground text-sm">{users.length} registered users</p>
        </div>
      </div>

      <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="max-w-sm" />

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Degree</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Field</th>
              <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Joined</th>
              <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><div className="h-4 bg-muted rounded animate-pulse" /></td></tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No users found</td></tr>
            ) : filtered.map(u => (
              <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-gradient-to-br from-emerald/20 to-cyan/20 flex items-center justify-center text-xs font-bold text-emerald">
                      {(u.full_name?.[0] || u.email?.[0] || 'U').toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{u.full_name || 'Anonymous'}</p>
                      <p className="text-xs text-muted-foreground">{u.email || u.id.slice(0, 8) + '...'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground capitalize">{u.target_degree || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{u.field_of_study || '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {u.is_admin && <Badge className="bg-emerald/10 text-emerald border-emerald/20 text-xs"><Shield className="size-3 mr-1" />Admin</Badge>}
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => toggleAdmin(u.id, u.is_admin)}>
                      {u.is_admin ? 'Remove admin' : 'Make admin'}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
